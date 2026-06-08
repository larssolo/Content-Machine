/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { anthropic } from './anthropic';
import { config } from './config';
import { generateStructured } from './structured';
import { cacheableSystem } from './prompts';
import type Anthropic from '@anthropic-ai/sdk';

// ---------------------------------------------------------------------------
// Typer
// ---------------------------------------------------------------------------

export type CulturalTrend = {
  trend: string;
  relevance: string;
  actionableAngle: string;
};

export type CompetitorSignal = {
  brand: string;
  signal: string;
  takeaway: string;
};

export type CulturalMoment = {
  moment: string;
  opportunity: string;
};

export type CulturalScanResult = {
  trends: CulturalTrend[];
  competitorSignals: CompetitorSignal[];
  culturalMoments: CulturalMoment[];
  timingContext: string;
  openingQuestion: string;
  groundingNarrative: string;
  searchedAt: string;
};

// ---------------------------------------------------------------------------
// Schemas (lokale for dette modul)
// ---------------------------------------------------------------------------

const culturalScanTool: Anthropic.Tool = {
  name: 'submit_cultural_scan',
  description: 'Aflever den kulturelle efterretningsanalyse som strukturerede fund baseret på websøgning.',
  input_schema: {
    type: 'object',
    properties: {
      trends: {
        type: 'array',
        description: '3-5 aktuelle trends direkte relevante for dette projekt og denne branche.',
        items: {
          type: 'object',
          properties: {
            trend: { type: 'string', description: 'Trendens navn og beskrivelse (1-2 sætninger).' },
            relevance: { type: 'string', description: 'Hvorfor er det relevant for NETOP dette projekt?' },
            actionableAngle: { type: 'string', description: 'Den konkrete kreative mulighed det åbner.' },
          },
          required: ['trend', 'relevance', 'actionableAngle'],
        },
      },
      competitorSignals: {
        type: 'array',
        description: '2-4 konkurrenter eller nærliggende aktørers nylige kampagner, moves eller kommunikation.',
        items: {
          type: 'object',
          properties: {
            brand: { type: 'string', description: 'Brandets/aktørens navn.' },
            signal: { type: 'string', description: 'Hvad har de konkret gjort (kampagne, positionering, kommunikation)?' },
            takeaway: { type: 'string', description: 'Hvad er konsekvensen for vores positionering og mulighed for differentiering?' },
          },
          required: ['brand', 'signal', 'takeaway'],
        },
      },
      culturalMoments: {
        type: 'array',
        description: '2-3 kulturelle øjeblikke, samfundsdebatter eller spændinger der kan skabe kreativt afsæt.',
        items: {
          type: 'object',
          properties: {
            moment: { type: 'string', description: 'Det kulturelle øjeblik eller den samfundsmæssige spænding.' },
            opportunity: { type: 'string', description: 'Den kreative mulighed det åbner for dette projekt.' },
          },
          required: ['moment', 'opportunity'],
        },
      },
      timingContext: {
        type: 'string',
        description: 'Hvad gør NETOP NU til det rette tidspunkt for dette projekt? Timing-indsigt i 2-3 sætninger.',
      },
      openingQuestion: {
        type: 'string',
        description: 'Den ene provocerende strategiske spørgsmål som disse fund åbner — det der skal besvares kreativt.',
      },
      groundingNarrative: {
        type: 'string',
        description: 'En syntese-paragraf (4-6 sætninger) der binder alle fund sammen til ét nuanceret kulturelt billede af det landskab projektet befinder sig i.',
      },
      searchedAt: {
        type: 'string',
        description: 'ISO 8601-tidsstempel for scanningen (brug aktuel dato/tid).',
      },
    },
    required: [
      'trends',
      'competitorSignals',
      'culturalMoments',
      'timingContext',
      'openingQuestion',
      'groundingNarrative',
      'searchedAt',
    ],
  },
};

// ---------------------------------------------------------------------------
// System-rolle
// ---------------------------------------------------------------------------

const CULTURAL_SCAN_SYSTEM = `Du er Kulturel Efterretningsanalytiker og Research Director i et verdensklasse-reklamebureau.

Din opgave er at scanne det kulturelle og kommercielle landskab for ét specifikt projekt vha. websøgning:
1. Aktuelle trends i branchen/kategorien (seneste 6-12 måneder)
2. Konkurrenters nylige kampagner og kommunikation
3. Kulturelle øjeblikke, samfundsspændinger og debatter der kan skabe kreativt afsæt
4. Timing-indsigt: hvad gør NETOP NU interessant for dette projekt?

Principper:
- Brug web_search til at finde konkrete, aktuelle eksempler — ikke generelle betragtninger fra din træningsdata alene
- Vær specifik på branche og kategori, ikke generelle marketing-trends
- Prioritér nyheder, kampagner og kulturelle øjeblikke fra de seneste 6-12 måneder
- Identificér mønsterbrud og hvad der er UVENTET — ikke det oplagte
- Vær konstruktivt kritisk: hvad virker IKKE i kategorien, og hvad er tomrummet?

Søgning:
- Søg på dansk og/eller engelsk alt efter hvad der giver bedst resultat
- Kombiner branche-søgninger med kulturelle søgninger
- Verificér at fund er aktuelle og relevante

Afslut ved at kalde submit_cultural_scan med dine strukturerede fund.`;

// ---------------------------------------------------------------------------
// Serialisering til prompt-injection
// ---------------------------------------------------------------------------

export function culturalContextText(intel: CulturalScanResult): string {
  if (!intel || !intel.groundingNarrative) return '';

  const trends = (intel.trends || [])
    .map((t) => `  · ${t.trend} → ${t.actionableAngle}`)
    .join('\n');

  const competitors = (intel.competitorSignals || [])
    .map((c) => `  · ${c.brand}: ${c.signal} (Takeaway: ${c.takeaway})`)
    .join('\n');

  const moments = (intel.culturalMoments || [])
    .map((m) => `  · ${m.moment} → ${m.opportunity}`)
    .join('\n');

  return `KULTUREL EFTERRETNING (scannet ${intel.searchedAt ? new Date(intel.searchedAt).toLocaleDateString('da-DK') : 'for nylig'} — brug som virkelighedsgrundlag for strategien):

Kulturelt billede: ${intel.groundingNarrative}

Aktuelle branche-trends:
${trends || '  · Ingen fundet'}

Konkurrent-signaler:
${competitors || '  · Ingen fundet'}

Kulturelle øjeblikke:
${moments || '  · Ingen fundet'}

Timing: ${intel.timingContext || 'N/A'}
Strategisk åbningsspørgsmål: ${intel.openingQuestion || 'N/A'}

Strategien SKAL forholde sig til dette landskab og svare på åbningsspørgsmålet.`;
}

// ---------------------------------------------------------------------------
// Hoved-funktion: multi-turn web-search loop
// ---------------------------------------------------------------------------

const WEB_SEARCH_BETA = 'web-search-2025-03-05';

export async function runCulturalScan(
  brief: any,
  signal?: AbortSignal,
): Promise<CulturalScanResult> {
  const initialPrompt = `Skan det kulturelle og kommercielle landskab for dette projekt via websøgning:

PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Beskrivelse: ${brief.description || 'N/A'}
- Detaljer: ${brief.details || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Kanaler: ${(brief.channels || []).join(', ') || 'N/A'}
- Ekstra noter: ${brief.notes || 'N/A'}

Søg aktivt efter:
1. Nylige kampagner og trends i denne branche/kategori
2. Konkurrenters kommunikation og positionering
3. Relevante kulturelle debatter og øjeblikke

Brug web_search til at finde konkrete, aktuelle eksempler. Afslut med submit_cultural_scan.`;

  const systemBlocks = cacheableSystem([CULTURAL_SCAN_SYSTEM]);

  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: [{ type: 'text', text: initialPrompt }] },
  ];

  const webSearchTool = { type: 'web_search_20250305', name: 'web_search' };
  const tools = [webSearchTool, culturalScanTool] as Anthropic.Tool[];

  let lastTextContent = '';
  let maxTurns = 10;

  while (maxTurns-- > 0) {
    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create(
        {
          model: config.model,
          max_tokens: 5000,
          system: systemBlocks,
          tools,
          messages,
        },
        {
          signal,
          headers: { 'anthropic-beta': WEB_SEARCH_BETA },
        } as any,
      );
    } catch (err: any) {
      // If web search isn't available (tier/region), fall through to structured-only
      if (err?.status === 400 && err?.message?.includes('web_search')) {
        console.warn('[cultural-scan] Web search unavailable — faldback til videnbaseret scanning');
        break;
      }
      throw err;
    }

    // Check for our structured output tool
    const outputBlock = response.content.find(
      (b): b is Anthropic.ToolUseBlock =>
        b.type === 'tool_use' && b.name === 'submit_cultural_scan',
    );
    if (outputBlock) {
      const result = outputBlock.input as CulturalScanResult;
      result.searchedAt = result.searchedAt || new Date().toISOString();
      return result;
    }

    // Collect any text generated so far (for fallback phase)
    const textBlocks = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text);
    if (textBlocks.length) lastTextContent = textBlocks.join('\n');

    messages.push({ role: 'assistant', content: response.content });

    if (response.stop_reason === 'end_turn') {
      // Claude stopped without calling our tool — nudge it
      messages.push({
        role: 'user',
        content: [{ type: 'text', text: 'Tak. Aflever nu dine fund struktureret via submit_cultural_scan.' }],
      });
      continue;
    }

    if (response.stop_reason === 'tool_use') {
      // Web-search tool calls: provide acknowledgement tool_results so Claude can continue
      const toolCalls = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name !== 'submit_cultural_scan',
      );
      if (toolCalls.length > 0) {
        messages.push({
          role: 'user',
          content: toolCalls.map((b) => ({
            type: 'tool_result' as const,
            tool_use_id: b.id,
            content: '',
          })),
        });
      } else {
        messages.push({
          role: 'user',
          content: [{ type: 'text', text: 'Aflever nu via submit_cultural_scan.' }],
        });
      }
    }
  }

  // Fallback: force structured output using generateStructured with any gathered text
  console.warn('[cultural-scan] Loop udtømt — kald struktureret output uden websøgning');
  return await generateStructured<CulturalScanResult>({
    system: systemBlocks,
    userContent: [
      {
        type: 'text',
        text: `${initialPrompt}${lastTextContent ? `\n\nDin tidligere analyse:\n${lastTextContent}` : ''}\n\nBaser din scanning på din videnbase (ingen websøgning tilgængelig). Aflever via submit_cultural_scan.`,
      },
    ],
    tool: culturalScanTool,
    model: config.model,
    maxTokens: 3000,
    signal,
    onUsage: () => {},
  });
}
