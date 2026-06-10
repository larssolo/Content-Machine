# Billede-generator: AI oversæt/forfin + flere modeller — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring `ImagePanel` til niveau med logo-generatoren: AI "Oversæt til engelsk" + "Forfin gennem AI", samt en modelvælger (Flux 1.1 Pro / Nano Banana Pro / GPT Image 2), alt via fal.ai.

**Architecture:** To faser. Fase 1 spejler logo-prompt-mønstret: ny `buildImagePrompt`-builder + `imagePromptTool` + `/api/image-prompt`-route + frontend-handler + to knapper. Fase 2 parameteriserer fal-adapteren med et model-register, tilføjer en `model`-param til `/api/generate-image`, og en modelvælger i UI'en.

**Tech Stack:** Express + `@anthropic-ai/sdk` + `@fal-ai/client`; React 19 + Tailwind 4; Vitest.

**Spec:** `docs/superpowers/specs/2026-06-10-billede-modeller-design.md`. **Design-system:** `.interface-design/system.md`.

### Verificerede fal-schemas (fra fal-docs)
- **flux** `fal-ai/flux-pro/v1.1` — `{ prompt, image_size: <preset>, num_images, output_format:'jpeg', safety_tolerance:'2' }`; url `data.images[0].url`. (uændret)
- **nano-banana-pro** `fal-ai/nano-banana-pro` — `{ prompt, aspect_ratio: <"16:9"|"1:1"|"4:3"|"9:16">, resolution:'1K'|'2K'|'4K', num_images, output_format }`; url `data.images[0].url`.
- **gpt-image-2** `fal-ai/gpt-image-2` — `{ prompt, image_size: <preset>, quality:'low'|'medium'|'high', num_images, output_format }`; url `data.images[0].url`. Presets = samme som Flux (`square_hd`, `landscape_16_9`, `landscape_4_3`, `portrait_16_9`).

---

## File Structure

- **Modify** `server/ai/prompts.ts` — `IMAGE_PROMPT_SYSTEM_ROLE` + `buildImagePrompt()`.
- **Modify** `server/ai/schemas.ts` — `imagePromptTool`.
- **Modify** `server/ai/prompts.test.ts` — test for `buildImagePrompt`.
- **Modify** `server.ts` — `/api/image-prompt` route; `model`-param på `/api/generate-image`.
- **Modify** `server/image/provider.ts` — `ImageModel`-type; `model?` på `ImageRequest`.
- **Modify** `server/image/fal.ts` — model-register + pure `buildFalRequest()` helper.
- **Modify** `server/image/provider.test.ts` — test for `buildFalRequest`-mapping.
- **Modify** `src/hooks/useImageGeneration.ts` — `model`-param på generate; `handleOptimizeImagePrompt` + `isOptimizingImagePrompt`.
- **Modify** `src/components/ImagePanel.tsx` — Oversæt/Forfin-knapper + modelvælger.
- **Modify** `src/components/ImagePanel.test.tsx` — model + optimize tests.
- **Modify** `src/App.tsx` — wiring + WorkingOverlay.
- **Modify** `package.json`, `src/components/AppHeader.tsx`, `src/App.tsx`, `package-lock.json` — version 1.20.0.

---

# FASE 1 — AI Oversæt + Forfin

## Task 1: buildImagePrompt + imagePromptTool (TDD)

**Files:**
- Modify: `server/ai/prompts.ts`, `server/ai/schemas.ts`, `server/ai/prompts.test.ts`

- [ ] **Step 1: Write the failing test**

In `server/ai/prompts.test.ts` add (import `buildImagePrompt` at top alongside existing imports):
```ts
import { buildImagePrompt } from './prompts';

describe('buildImagePrompt', () => {
  const brief: any = { client: 'Modaxo', project: 'Move 2026', description: 'mobility', audience: 'byer', tone: 'modig' };

  it('translate-mode beder om en engelsk billed-prompt og inkluderer brief-kontekst', () => {
    const { system, user } = buildImagePrompt(brief, 'en blå bil i regn', 'translate');
    expect(system.length).toBeGreaterThan(0);
    expect(user).toContain('Modaxo');
    expect(user).toContain('en blå bil i regn');
    expect(user.toLowerCase()).toContain('engelsk');
  });

  it('refine-mode skærper den eksisterende prompt', () => {
    const { user } = buildImagePrompt(brief, 'a blue car', 'refine');
    expect(user).toContain('a blue car');
    expect(user.toLowerCase()).toContain('forfin');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- prompts`
Expected: FAIL — `buildImagePrompt is not a function` / import unresolved.

- [ ] **Step 3: Implement the builder + system role**

In `server/ai/prompts.ts`, add near `buildLogoPrompt` (it already imports `Brief`, `cacheableSystem`):
```ts
export const IMAGE_PROMPT_SYSTEM_ROLE = `Du er en erfaren art director og prompt-ingeniør for Neura Studio.
Du skriver skarpe, konkrete billed-prompts på ENGELSK til tekst-til-billede-modeller (Flux, Nano Banana, GPT Image).
Beskriv motiv, komposition, lys, stemning, kamera/linse og stil. Vær konkret og visuel. Ingen tekst/bogstaver i billedet medmindre brugeren beder om det. Returnér kun selve prompten via værktøjet.`;

export function buildImagePrompt(
  brief: Brief,
  currentPrompt: string,
  mode: 'translate' | 'refine',
): { system: Anthropic.TextBlockParam[]; user: string } {
  const task =
    mode === 'translate'
      ? `Konvertér nedenstående input til én skarp, engelsk billed-prompt. Inddrag relevant kontekst fra briefet hvor det giver mening.`
      : `Forfin og skærp nedenstående eksisterende billed-prompt: gør komposition, lys og stil mere konkret — bevar den oprindelige idé, men løft kvaliteten.`;

  const user = `PROJEKT KONTEKST:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad handler det om: ${brief.description || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Tone/stemning: ${brief.tone || 'N/A'}

INPUT (${mode === 'translate' ? 'rå beskrivelse der skal oversættes' : 'eksisterende prompt der skal forfines'}):
"""
${currentPrompt || '(tom — byg en passende billed-prompt ud fra konteksten ovenfor)'}
"""

OPGAVE:
${task}
Aflever den færdige engelske billed-prompt via værktøjet.`;

  return { system: cacheableSystem([IMAGE_PROMPT_SYSTEM_ROLE]), user };
}
```
In `server/ai/schemas.ts`, add near `logoPromptTool`:
```ts
export const imagePromptTool: Anthropic.Tool = {
  name: 'submit_image_prompt',
  description: 'Aflever den optimerede engelske billed-prompt som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description: 'Den færdige, optimerede billed-prompt på ENGELSK. Konkret om motiv, komposition, lys, stemning og stil.',
      },
    },
    required: ['prompt'],
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- prompts`
Expected: PASS.

- [ ] **Step 5: Run lint + full suite**

Run: `npm run lint && npm test`
Expected: clean; all tests pass.

- [ ] **Step 6: Commit**

```bash
git add server/ai/prompts.ts server/ai/schemas.ts server/ai/prompts.test.ts
git commit -m "feat: buildImagePrompt + imagePromptTool (AI oversæt/forfin af billed-prompt)"
```

---

## Task 2: /api/image-prompt route

**Files:**
- Modify: `server.ts`

- [ ] **Step 1: Add the route (mirror /api/logo-prompt)**

In `server.ts`, ensure `buildImagePrompt` and `imagePromptTool` are imported (add them to the existing imports from `./server/ai/prompts` and `./server/ai/schemas`). Add this route right after the `/api/logo-prompt` route:
```ts
  // Optimér/oversæt en billed-prompt via AI (oversæt til engelsk / forfin)
  app.post('/api/image-prompt', async (req, res) => {
    try {
      const { brief, currentPrompt, mode } = req.body;
      const safeMode = mode === 'refine' ? 'refine' : 'translate';
      if (safeMode === 'refine' && !currentPrompt?.trim()) {
        return res.status(400).json({ error: 'En eksisterende prompt er påkrævet for forfining.' });
      }

      const { system, user } = buildImagePrompt(brief || {}, currentPrompt || '', safeMode);
      const parsed = await generateStructured<{ prompt: string }>({
        system,
        userContent: [{ type: 'text', text: user }],
        tool: imagePromptTool,
        model: config.fastModel,
        maxTokens: 1024,
      });

      res.json({ prompt: (parsed.prompt || '').trim() });
    } catch (error: any) {
      console.error('Fejl under billed-prompt optimering:', error);
      res.status(500).json({ error: error.message || 'Kunne ikke optimere billed-prompten.' });
    }
  });
```

- [ ] **Step 2: Verify**

Run: `npm run lint && npm test`
Expected: clean; all tests pass (routes aren't unit-tested; lint confirms imports/types).

- [ ] **Step 3: Commit**

```bash
git add server.ts
git commit -m "feat: /api/image-prompt — AI oversæt/forfin af billed-prompt"
```

---

## Task 3: handleOptimizeImagePrompt i useImageGeneration

**Files:**
- Modify: `src/hooks/useImageGeneration.ts`

- [ ] **Step 1: Add state + handler**

In `src/hooks/useImageGeneration.ts`: add a `useState` for `isOptimizingImagePrompt` (default `false`) near the existing state, and this handler inside the hook (before the `return`):
```ts
  const [isOptimizingImagePrompt, setIsOptimizingImagePrompt] = useState(false);

  const handleOptimizeImagePrompt = async (
    brief: unknown,
    currentPrompt: string,
    mode: 'translate' | 'refine',
  ): Promise<string | null> => {
    setIsOptimizingImagePrompt(true);
    try {
      const response = await fetch('/api/image-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, currentPrompt, mode }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const data = await response.json();
      return (data.prompt as string) || null;
    } catch (err) {
      console.error('Fejl i handleOptimizeImagePrompt:', err);
      return null;
    } finally {
      setIsOptimizingImagePrompt(false);
    }
  };
```
Add `isOptimizingImagePrompt` and `handleOptimizeImagePrompt` to the hook's `return { … }` object.

- [ ] **Step 2: Verify**

Run: `npm run lint && npm test`
Expected: clean; all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useImageGeneration.ts
git commit -m "feat: handleOptimizeImagePrompt-handler i billede-hook"
```

---

## Task 4: Oversæt/Forfin-knapper i ImagePanel + wiring (TDD)

**Files:**
- Modify: `src/components/ImagePanel.tsx`, `src/components/ImagePanel.test.tsx`, `src/App.tsx`

- [ ] **Step 1: Update the test**

In `src/components/ImagePanel.test.tsx`: add `onOptimize` + `isOptimizing` to a `baseProps`-helper (or each render) and a test. Replace the existing three `render(<ImagePanel image={baseImage} onGenerate={…} onAspectChange={…} />)` calls to also pass `onOptimize={() => Promise.resolve(null)} isOptimizing={false}`. Add:
```tsx
  it('kalder onOptimize med translate-mode når Oversæt klikkes', async () => {
    const onOptimize = vi.fn().mockResolvedValue('a translated prompt');
    render(<ImagePanel image={baseImage} onGenerate={() => {}} onAspectChange={() => {}} onOptimize={onOptimize} isOptimizing={false} />);
    fireEvent.change(screen.getByPlaceholderText('Beskriv billedet du vil generere…'), { target: { value: 'en blå bil' } });
    fireEvent.click(screen.getByText('Oversæt til engelsk'));
    expect(onOptimize).toHaveBeenCalledWith('en blå bil', 'translate');
  });
```
(Keep the existing 3 tests; just add `onOptimize`/`isOptimizing` props to their renders.)

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- ImagePanel`
Expected: FAIL — `Oversæt til engelsk` not found / prop type errors.

- [ ] **Step 3: Implement the buttons in ImagePanel**

In `src/components/ImagePanel.tsx`: extend the props and add the two buttons between the textarea and the `ImageGenCard`. Update the interface:
```tsx
interface ImagePanelProps {
  image: ImageGenState;
  onGenerate: (prompt: string) => void;
  onAspectChange: (ratio: string) => void;
  onOptimize: (prompt: string, mode: 'translate' | 'refine') => Promise<string | null>;
  isOptimizing: boolean;
}
```
Destructure `onOptimize, isOptimizing`. Add an optimize handler inside the component:
```tsx
  const runOptimize = async (mode: 'translate' | 'refine') => {
    if (!trimmed) return;
    const result = await onOptimize(prompt, mode);
    if (result) setPrompt(result);
  };
```
Insert this block directly under the `<textarea …/>` (uses `Languages` + `Wand2` from lucide-react — add them to the file's lucide import):
```tsx
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => runOptimize('translate')}
          disabled={!trimmed || isOptimizing}
          className="flex-1 py-2 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Oversæt og omdan dit input til en optimeret engelsk billed-prompt"
        >
          <Languages className="w-3.5 h-3.5 text-brand-orange-400 shrink-0" />
          <span>Oversæt til engelsk</span>
        </button>
        <button
          type="button"
          onClick={() => runOptimize('refine')}
          disabled={!trimmed || isOptimizing}
          className="flex-1 py-2 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Forfin den eksisterende prompt gennem AI"
        >
          <Wand2 className="w-3.5 h-3.5 text-brand-orange-400 shrink-0" />
          <span>Forfin gennem AI</span>
        </button>
      </div>
```
Add the import: `import { Languages, Wand2 } from 'lucide-react';` (or merge into an existing lucide import line if present).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ImagePanel`
Expected: PASS (4/4).

- [ ] **Step 5: Wire in App.tsx**

In `src/App.tsx`, update the `<ImagePanel … />` usage (inside the Assets group) to pass the new props:
```tsx
              <ImagePanel
                image={generatedImages.custom}
                onGenerate={(p) => handleGenerateImage('custom', p)}
                onAspectChange={(r) => handleAspectChange('custom', r)}
                onOptimize={(p, mode) => handleOptimizeImagePrompt(brief, p, mode)}
                isOptimizing={isOptimizingImagePrompt}
              />
```
Destructure `handleOptimizeImagePrompt, isOptimizingImagePrompt` from `useContentMachine()` (they propagate from `useImageGeneration` via the central hook — confirm they're re-exported; if `useContentMachine` spreads `useImageGeneration()`'s return, they appear automatically. If not, add them to that hook's returned object). Add `isOptimizingImagePrompt` to the `WorkingOverlay` `show` condition and a title branch `isOptimizingImagePrompt ? 'Optimerer billed-prompt' :` near the logo-prompt branch.

- [ ] **Step 6: Run lint + full suite**

Run: `npm run lint && npm test`
Expected: clean; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/ImagePanel.tsx src/components/ImagePanel.test.tsx src/App.tsx
git commit -m "feat: Oversæt/Forfin-knapper i billede-panelet"
```

> **Note (re-export):** check `src/hooks/useContentMachine.ts` — it composes `useImageGeneration()`. Ensure `handleOptimizeImagePrompt` and `isOptimizingImagePrompt` are included in what `useContentMachine` returns (follow how `handleGenerateImage`/`generatedImages` are already surfaced). If they aren't surfaced automatically, add them to `useContentMachine`'s return alongside the existing image fields.

---

# FASE 2 — Flere modeller

## Task 5: ImageModel-type + fal model-register (TDD)

**Files:**
- Modify: `server/image/provider.ts`, `server/image/fal.ts`, `server/image/provider.test.ts`

- [ ] **Step 1: Write the failing test**

In `server/image/provider.test.ts` add:
```ts
describe('buildFalRequest', () => {
  it('mapper flux til flux-pro med image_size-preset', async () => {
    const { buildFalRequest } = await import('./fal');
    const r = buildFalRequest('flux', 'a cat', '1:1');
    expect(r.id).toBe('fal-ai/flux-pro/v1.1');
    expect(r.input.image_size).toBe('square_hd');
  });
  it('mapper nano-banana-pro med aspect_ratio + resolution', async () => {
    const { buildFalRequest } = await import('./fal');
    const r = buildFalRequest('nano-banana-pro', 'a cat', '16:9');
    expect(r.id).toBe('fal-ai/nano-banana-pro');
    expect(r.input.aspect_ratio).toBe('16:9');
    expect(r.input.resolution).toBe('2K');
  });
  it('mapper gpt-image-2 med image_size-preset + quality', async () => {
    const { buildFalRequest } = await import('./fal');
    const r = buildFalRequest('gpt-image-2', 'a cat', '4:3');
    expect(r.id).toBe('fal-ai/gpt-image-2');
    expect(r.input.image_size).toBe('landscape_4_3');
    expect(r.input.quality).toBe('high');
  });
  it('falder tilbage til flux ved ukendt model', async () => {
    const { buildFalRequest } = await import('./fal');
    const r = buildFalRequest('ukendt' as any, 'a cat', '1:1');
    expect(r.id).toBe('fal-ai/flux-pro/v1.1');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- provider`
Expected: FAIL — `buildFalRequest` not exported.

- [ ] **Step 3: Add ImageModel type + model? on ImageRequest**

In `server/image/provider.ts`:
```ts
export type ImageModel = 'flux' | 'nano-banana-pro' | 'gpt-image-2';

export interface ImageRequest {
  prompt: string;
  aspectRatio: string;
  model?: ImageModel;
}
```

- [ ] **Step 4: Implement the register + helper in fal.ts**

Rewrite `server/image/fal.ts`'s body to add the register and a pure `buildFalRequest`, and use it in `generate`:
```ts
import { fal } from '@fal-ai/client';
import type { ImageProvider, ImageModel } from './provider';

const SIZE_MAP: Record<string, string> = {
  '16:9': 'landscape_16_9',
  '1:1': 'square_hd',
  '4:3': 'landscape_4_3',
  '9:16': 'portrait_16_9',
};

interface FalRequest { id: string; input: Record<string, unknown>; }

/** Ren mapping: model + format → fal model-id og input-objekt. Ukendt model → flux. */
export function buildFalRequest(model: ImageModel, prompt: string, aspectRatio: string): FalRequest {
  const size = SIZE_MAP[aspectRatio] ?? 'landscape_16_9';
  switch (model) {
    case 'nano-banana-pro':
      return {
        id: 'fal-ai/nano-banana-pro',
        input: { prompt, aspect_ratio: aspectRatio, resolution: '2K', num_images: 1, output_format: 'jpeg' },
      };
    case 'gpt-image-2':
      return {
        id: 'fal-ai/gpt-image-2',
        input: { prompt, image_size: size, quality: 'high', num_images: 1, output_format: 'jpeg' },
      };
    case 'flux':
    default:
      return {
        id: 'fal-ai/flux-pro/v1.1',
        input: { prompt, image_size: size, num_images: 1, output_format: 'jpeg', safety_tolerance: '2' },
      };
  }
}

let configured = false;
function ensureConfigured() {
  if (!configured && process.env.FAL_KEY) {
    fal.config({ credentials: process.env.FAL_KEY });
    configured = true;
  }
}

/** Billedgenerering via fal.ai. Vælger model ud fra request (default flux). */
export const falProvider: ImageProvider = {
  async generate({ prompt, aspectRatio, model }) {
    if (!process.env.FAL_KEY) {
      throw new Error('FAL_KEY er ikke sat i miljøet. Tilføj din fal.ai API-nøgle for at generere billeder.');
    }
    ensureConfigured();

    const { id, input } = buildFalRequest(model ?? 'flux', prompt, aspectRatio);
    const result: any = await fal.subscribe(id, { input });

    const url: string | undefined = result?.data?.images?.[0]?.url ?? result?.images?.[0]?.url;
    if (!url) {
      throw new Error('Ingen billeder blev returneret fra fal.ai.');
    }
    return { imageUrl: url };
  },
};
```

- [ ] **Step 5: Run tests + lint**

Run: `npm test -- provider` → PASS. Then `npm run lint && npm test` → clean; all pass.

- [ ] **Step 6: Commit**

```bash
git add server/image/provider.ts server/image/fal.ts server/image/provider.test.ts
git commit -m "feat: fal model-register (flux / nano-banana-pro / gpt-image-2)"
```

---

## Task 6: model-param på /api/generate-image

**Files:**
- Modify: `server.ts`

- [ ] **Step 1: Accept + forward the model**

Replace the `/api/generate-image` handler body's destructure + call:
```ts
      const { prompt, aspectRatio, model } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt er påkrævet.' });
      }
      const allowed = ['flux', 'nano-banana-pro', 'gpt-image-2'];
      const safeModel = allowed.includes(model) ? model : 'flux';

      const { imageUrl } = await getImageProvider().generate({
        prompt,
        aspectRatio: aspectRatio || '16:9',
        model: safeModel,
      });
```
(Ukendt/manglende model → fallback til `flux`.)

- [ ] **Step 2: Verify**

Run: `npm run lint && npm test`
Expected: clean; all pass.

- [ ] **Step 3: Commit**

```bash
git add server.ts
git commit -m "feat: model-param på /api/generate-image (fallback flux)"
```

---

## Task 7: Modelvælger i ImagePanel + wiring (TDD)

**Files:**
- Modify: `src/hooks/useImageGeneration.ts`, `src/components/ImagePanel.tsx`, `src/components/ImagePanel.test.tsx`, `src/App.tsx`

- [ ] **Step 1: Extend handleGenerateImage with model (hook)**

In `src/hooks/useImageGeneration.ts`, change `handleGenerateImage`'s signature to accept an optional model and send it:
```ts
  const handleGenerateImage = async (key: GeneratedImageKey, promptText: string, model?: string) => {
    setGeneratedImages(prev => ({ ...prev, [key]: { ...prev[key], loading: true, error: null } }));
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, aspectRatio: generatedImages[key]?.aspectRatio || '16:9', model: model || 'flux' })
      });
```
(Rest of the function unchanged. Existing callers that omit `model` now send `'flux'` — unchanged behavior.)

- [ ] **Step 2: Update the test**

In `src/components/ImagePanel.test.tsx`, add a model type to baseProps renders (no change needed if `onGenerate` stays `(prompt) => void`... but signature changes — see Step 3). Update the happy-path test to expect the model arg, and add a selector test:
```tsx
  it('genererer med den valgte model', () => {
    const onGenerate = vi.fn();
    render(<ImagePanel image={baseImage} onGenerate={onGenerate} onAspectChange={() => {}} onOptimize={() => Promise.resolve(null)} isOptimizing={false} />);
    fireEvent.change(screen.getByPlaceholderText('Beskriv billedet du vil generere…'), { target: { value: 'a cat' } });
    fireEvent.click(screen.getByText('Nano Banana Pro'));
    fireEvent.click(screen.getByText('Generer billede'));
    expect(onGenerate).toHaveBeenCalledWith('a cat', 'nano-banana-pro');
  });
```
Also update the earlier `'calls onGenerate with the typed prompt'` test to `expect(onGenerate).toHaveBeenCalledWith('en rød kat', 'flux')` (default model).

- [ ] **Step 3: Implement the model selector**

In `src/components/ImagePanel.tsx`: change `onGenerate` prop to `(prompt: string, model: string) => void`. Add model state + selector. Near the top of the component:
```tsx
  const MODELS: Array<{ id: string; label: string }> = [
    { id: 'flux', label: 'Flux 1.1 Pro' },
    { id: 'nano-banana-pro', label: 'Nano Banana Pro' },
    { id: 'gpt-image-2', label: 'GPT Image 2' },
  ];
  const [model, setModel] = useState('flux');
```
Add the selector between the optimize buttons and the `ImageGenCard` (system-stil segmented control):
```tsx
      <div className="space-y-1.5">
        <span className="block text-[11px] font-mono text-slate-400">Model</span>
        <div className="flex gap-1.5">
          {MODELS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModel(m.id)}
              className={`flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-mono transition-all ${
                model === m.id
                  ? 'border-brand-orange-500/50 bg-brand-orange-600/10 text-brand-orange-300'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
```
Change the `ImageGenCard`'s `onGenerate` to pass the model:
```tsx
        onGenerate={() => { if (trimmed) onGenerate(trimmed, model); }}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- ImagePanel`
Expected: PASS.

- [ ] **Step 5: Wire App.tsx**

In `src/App.tsx`, update the `ImagePanel` `onGenerate` to forward the model:
```tsx
                onGenerate={(p, model) => handleGenerateImage('custom', p, model)}
```

- [ ] **Step 6: Run lint + full suite**

Run: `npm run lint && npm test`
Expected: clean; all pass.

- [ ] **Step 7: Commit**

```bash
git add src/hooks/useImageGeneration.ts src/components/ImagePanel.tsx src/components/ImagePanel.test.tsx src/App.tsx
git commit -m "feat: modelvælger i billede-panelet (Flux / Nano Banana Pro / GPT Image 2)"
```

---

## Task 8: Versionsbump 1.19.0 → 1.20.0

**Files:** `package.json`, `src/components/AppHeader.tsx`, `src/App.tsx`, `package-lock.json`

- [ ] **Step 1:** `grep -rn "1\.19\.0" package.json src/App.tsx src/components/AppHeader.tsx` → tre hits.
- [ ] **Step 2:** Ret de tre til `1.20.0` (package.json version, AppHeader `v1.20.0`, App.tsx footer `· v1.20.0`).
- [ ] **Step 3:** `npm install --package-lock-only` → bekræft `grep -m1 '"version"' package-lock.json` = `1.20.0`.
- [ ] **Step 4:** `grep -rn "1\.\(19\|20\)\.0" package.json src/App.tsx src/components/AppHeader.tsx` → alle `1.20.0`.
- [ ] **Step 5:** Commit:
```bash
git add package.json src/App.tsx src/components/AppHeader.tsx package-lock.json
git commit -m "chore: bump version til 1.20.0"
```

---

## Task 9: Verifikation (lint, test, manuelt)

**Files:** ingen ændringer.

- [ ] **Step 1:** `npm run lint && npm test` → begge grønne.
- [ ] **Step 2:** `npm run dev` (http://localhost:3000).
- [ ] **Step 3: Manuelt** i billede-panelet:
  1. Skriv en dansk beskrivelse → klik **Oversæt til engelsk** → textarea opdateres med engelsk prompt.
  2. Klik **Forfin gennem AI** → prompten skærpes.
  3. Vælg **Nano Banana Pro**, generér → billede vises. Gentag for **GPT Image 2** og **Flux 1.1 Pro**.
  4. Bekræft funnel-billederne (hero/detail/abstract) stadig genererer (de bruger default flux).
- [ ] **Step 4:** `pkill -f "tsx server.ts"`.

---

## Self-Review (udført ved skrivning)

- **Spec coverage:** buildImagePrompt/imagePromptTool (T1), /api/image-prompt (T2), hook-handler (T3), Oversæt/Forfin-knapper + wiring + overlay (T4), ImageModel+fal-register (T5), generate-image model-param (T6), modelvælger+wiring (T7), version (T8), verifikation (T9). Alle spec-punkter dækket.
- **Type-konsistens:** `ImageModel` defineret i T5 (provider.ts), brugt i fal.ts (T5) og som streng i frontend (T7). `handleGenerateImage(key, prompt, model?)` ændret i T7; `onGenerate`-signatur `(prompt, model)` konsistent mellem ImagePanel (T7) og App (T7). `handleOptimizeImagePrompt(brief, currentPrompt, mode)` konsistent mellem hook (T3), ImagePanel-prop `onOptimize(prompt, mode)` (T4) og App's pre-binding af `brief` (T4).
- **Ingen placeholders:** alle steps har konkret kode/kommandoer; fal-schemas verificeret mod docs.
- **YAGNI:** ingen stil-presets, ingen opløsningsvælger, ingen direkte provider-API'er.
- **Rækkefølge-afhængighed:** T4 afhænger af T2/T3; T7 afhænger af T5/T6. Fase 1 (T1–T4) er selvstændig fungerende software; Fase 2 (T5–T7) tilføjer modeller.
