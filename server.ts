/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';

import { config } from './server/ai/config';
import { anthropic } from './server/ai/anthropic';
import { generateStructured } from './server/ai/structured';
import { buildCviUserContent } from './server/ai/cvi';
import {
  buildGenerate,
  buildAnalyze,
  buildHumanize,
  buildRefine,
  buildVariants,
  ANALYZE_CVI_SYSTEM_ROLE,
  cacheableSystem,
} from './server/ai/prompts';
import {
  generateTool,
  analyzeTool,
  analyzeCviTool,
  humanizeTool,
  variantsTool,
} from './server/ai/schemas';
import { runDeliberation } from './server/ai/deliberate';
import { runVisualDeliberation } from './server/ai/deliberateVisual';
import { getImageProvider } from './server/image/provider';

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const PORT = Number(process.env.PORT) || 3000;

  // API health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      model: config.model,
      imageProvider: config.imageProvider,
      time: new Date().toISOString(),
    });
  });

  // Main generator endpoint
  app.post('/api/generate', async (req, res) => {
    try {
      const { brief } = req.body;
      if (!brief) {
        return res.status(400).json({ error: 'Brief er påkrævet.' });
      }

      const { system, user } = buildGenerate(brief);
      const parsed = await generateStructured<any>({
        system,
        userContent: [{ type: 'text', text: user }],
        tool: generateTool,
        maxTokens: config.maxTokens,
      });

      // Let runtime-shape-tjek så vi fejler tydeligt frem for at sende et halvt objekt.
      if (!parsed || !parsed.shortCaseText || !parsed.longCaseText) {
        throw new Error('Ufuldstændigt output fra Claude. Prøv igen.');
      }

      res.json(parsed);
    } catch (error: any) {
      console.error('Fejl under generering:', error);
      res.status(500).json({ error: error.message || 'Internt server fejl under generering.' });
    }
  });

  // Refine text endpoint (streaming via SSE)
  app.post('/api/refine', async (req, res) => {
    try {
      const { text, command, brief } = req.body;
      if (!text || !command) {
        return res.status(400).json({ error: 'Text og command er påkrævet.' });
      }

      const { system, user } = buildRefine(text, command, brief);

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no'); // deaktivér proxy-buffering (Render/nginx) så SSE flyder
      res.flushHeaders?.();

      const stream = anthropic.messages.stream({
        model: config.fastModel,
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: user }],
      });

      let full = '';
      stream.on('text', (delta) => {
        full += delta;
        res.write(`data: ${JSON.stringify({ delta })}\n\n`);
      });

      await stream.finalMessage();

      res.write(`data: ${JSON.stringify({ done: true, refinedText: full.trim() })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      console.error('Fejl under raffinering:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Kunne ikke raffinere teksten.' });
      } else {
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
        res.end();
      }
    }
  });

  // Deep "redaktionsmøde" generation: multi-AI deliberation loop (streaming via SSE)
  app.post('/api/generate-deep', async (req, res) => {
    const { brief } = req.body;
    if (!brief) {
      return res.status(400).json({ error: 'Brief er påkrævet.' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // deaktivér proxy-buffering (Render/nginx) så SSE flyder
    res.flushHeaders?.();
    res.write(': connected\n\n'); // åbn streamen straks, så proxyen ikke buffer-venter på første byte

    // Afbryd igangværende kald hvis klienten lukker forbindelsen.
    const ac = new AbortController();
    req.on('close', () => ac.abort());

    // Heartbeat-kommentarer holder forbindelsen i live under de lange (55-110s) kald.
    const heartbeat = setInterval(() => {
      if (!res.writableEnded) res.write(': keep-alive\n\n');
    }, 15000);

    try {
      const result = await runDeliberation({ brief, signal: ac.signal }, (e) => {
        if (!res.writableEnded) res.write(`data: ${JSON.stringify(e)}\n\n`);
      });

      res.write(
        `data: ${JSON.stringify({
          done: true,
          output: result.output,
          draft: result.draft,
          critiqueBefore: result.critiqueBefore,
          critiqueAfter: result.critiqueAfter,
          earlyStopped: result.earlyStopped,
          synthesisTruncated: result.synthesisTruncated,
        })}\n\n`,
      );
      res.write('data: [DONE]\n\n');
    } catch (error: any) {
      console.error('Fejl under dyb generering:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Kunne ikke gennemføre redaktionsmødet.' });
      } else if (!res.writableEnded) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
      }
    } finally {
      clearInterval(heartbeat);
      if (!res.writableEnded) res.end();
    }
  });

  // Visuel redaktion: art direction-deliberation (streaming via SSE)
  app.post('/api/visual-deep', async (req, res) => {
    const { brief } = req.body;
    if (!brief) {
      return res.status(400).json({ error: 'Brief er påkrævet.' });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // deaktivér proxy-buffering (Render/nginx) så SSE flyder
    res.flushHeaders?.();
    res.write(': connected\n\n'); // åbn streamen straks, så proxyen ikke buffer-venter på første byte

    const ac = new AbortController();
    req.on('close', () => ac.abort());

    const heartbeat = setInterval(() => {
      if (!res.writableEnded) res.write(': keep-alive\n\n');
    }, 15000);

    try {
      const result = await runVisualDeliberation({ brief, signal: ac.signal }, (e) => {
        if (!res.writableEnded) res.write(`data: ${JSON.stringify(e)}\n\n`);
      });

      res.write(
        `data: ${JSON.stringify({
          done: true,
          output: result.output,
          draft: result.draft,
          critiqueBefore: result.critiqueBefore,
          critiqueAfter: result.critiqueAfter,
          earlyStopped: result.earlyStopped,
          synthesisTruncated: result.synthesisTruncated,
        })}\n\n`,
      );
      res.write('data: [DONE]\n\n');
    } catch (error: any) {
      console.error('Fejl under visuel redaktion:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: error.message || 'Kunne ikke gennemføre den visuelle redaktion.' });
      } else if (!res.writableEnded) {
        res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
      }
    } finally {
      clearInterval(heartbeat);
      if (!res.writableEnded) res.end();
    }
  });

  // A/B variants endpoint
  app.post('/api/variants', async (req, res) => {
    try {
      const { text, count, brief } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text er påkrævet.' });
      }
      const n = Math.min(Math.max(Number(count) || 2, 2), 4);
      const { system, user } = buildVariants(text, n, brief);
      const parsed = await generateStructured<{ variants: string[] }>({
        system,
        userContent: [{ type: 'text', text: user }],
        tool: variantsTool,
        model: config.fastModel,
        maxTokens: 4096,
      });
      res.json({ variants: (parsed.variants || []).slice(0, n) });
    } catch (error: any) {
      console.error('Fejl under variant-generering:', error);
      res.status(500).json({ error: error.message || 'Kunne ikke generere varianter.' });
    }
  });

  // Analyze text endpoint (tone analysis)
  app.post('/api/analyze', async (req, res) => {
    try {
      const { texts, brief } = req.body;
      if (!texts) {
        return res.status(400).json({ error: 'Tekster er påkrævet for analyse.' });
      }

      const { system, user } = buildAnalyze(texts, brief);
      const parsed = await generateStructured<any>({
        system,
        userContent: [{ type: 'text', text: user }],
        tool: analyzeTool,
        model: config.fastModel,
        maxTokens: 4096,
      });

      res.json(parsed);
    } catch (error: any) {
      console.error('Fejl under toneanalyse:', error);
      res.status(500).json({ error: error.message || 'Kunne ikke udføre toneanalyse.' });
    }
  });

  // CVI / Designmanual analysis engine (multimodal)
  app.post('/api/analyze-cvi', async (req, res) => {
    try {
      const { fileType, fileContent } = req.body;
      if (!fileContent) {
        return res.status(400).json({ error: 'Filindhold (base64 eller tekst) er påkrævet.' });
      }

      const userContent = buildCviUserContent(fileContent, fileType);
      const parsed = await generateStructured<any>({
        system: cacheableSystem([ANALYZE_CVI_SYSTEM_ROLE]),
        userContent,
        tool: analyzeCviTool,
        model: config.fastModel,
        maxTokens: 4096,
      });

      res.json(parsed);
    } catch (error: any) {
      console.error('Fejl under CVI analyse:', error);
      res.status(500).json({ error: error.message || 'Kunne ikke fuldføre scanningen af designmanualen.' });
    }
  });

  // Humanize & bypass AI detection endpoint
  app.post('/api/humanize', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Tekst er påkrævet.' });
      }

      const { system, user } = buildHumanize(text);
      const parsed = await generateStructured<any>({
        system,
        userContent: [{ type: 'text', text: user }],
        tool: humanizeTool,
        model: config.fastModel,
        maxTokens: 4096,
      });

      res.json(parsed);
    } catch (error: any) {
      console.error('Fejl under humanisering:', error);
      res.status(500).json({ error: error.message || 'Kunne ikke fuldføre humanisering af teksten.' });
    }
  });

  // Generate image from prompt via the configured image provider (default: Flux/fal.ai)
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt er påkrævet.' });
      }

      const { imageUrl } = await getImageProvider().generate({
        prompt,
        aspectRatio: aspectRatio || '16:9',
      });

      res.json({ imageUrl });
    } catch (error: any) {
      console.error('Fejl under billedgenerering:', error);
      res
        .status(500)
        .json({ error: error.message || 'Kunne ikke generere billede. Kontroller din API konfiguration.' });
    }
  });

  // Serve static assets
  if (process.env.NODE_ENV !== 'production') {
    // Vite indlæses kun i udvikling (holdes helt ude af produktions-bundtet).
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server lytter på port ${PORT}`);
  });
}

startServer();
