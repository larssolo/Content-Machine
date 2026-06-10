# Design: Billede-generator på niveau med logo-generatoren

**Dato:** 2026-06-10
**Status:** Godkendt af bruger (afventer spec-review)
**Område:** `server/image/fal.ts`, `server/image/provider.ts`, `server.ts`, `server/ai/prompts.ts`, `server/ai/schemas.ts`, `src/hooks/useImageGeneration.ts`, `src/components/ImagePanel.tsx`, `src/App.tsx`
**Design-system:** `.interface-design/system.md`

## Problem

Billede-panelet (`ImagePanel`) kan i dag kun skrive en prompt og generere via én fast model
(Flux 1.1 Pro). Logo-generatoren har derimod **AI-oversættelse** ("Oversæt til Recraft") og
**AI-promptforfining** ("Forfin gennem AI"). Brugeren vil have de samme funktioner på billed-panelet,
plus flere modeller: **Nano Banana Pro** og **GPT Image 2** (ud over Flux).

## Mål

ImagePanel skal have: (1) "Oversæt til engelsk"-knap, (2) "Forfin gennem AI"-knap, (3) en
modelvælger (Flux 1.1 Pro / Nano Banana Pro / GPT Image 2). Alt kører via fal.ai på den eksisterende
`FAL_KEY`.

## Beslutninger (valgt med brugerens godkendelse)

- **Model-adgang:** alle tre modeller via fal.ai, én `FAL_KEY`, én parameteriseret adapter.
- **Omfang:** Oversæt + Forfin + modelvælger. **Ingen** stil-presets eller opløsningsvælger nu (YAGNI).
- **Standardmodel:** Flux 1.1 Pro forbliver default (bagudkompatibelt; de nye modeller er valgbare).

## Ikke-mål (YAGNI)

- Ingen stil-presets, ingen 4K/opløsningsvælger, ingen billede-til-billede/redigering.
- Ingen direkte Google/OpenAI-API'er — alt gennem fal.
- Ingen ændring af funnel-billederne (hero/detail/abstract) eller logo-panelet.

## Arkitektur

### Datamodel
Ny type (i `server/image/provider.ts` og genbrugt i frontend via en lille delt streng-union):
```ts
export type ImageModel = 'flux' | 'nano-banana-pro' | 'gpt-image-2';
```
`ImageRequest` udvides med `model?: ImageModel` (default `'flux'`).

### Backend

**1. Model-register i fal-adapteren (`server/image/fal.ts`).**
I dag hardcoder `falProvider.generate` `fal-ai/flux-pro/v1.1`. Indfør et register der pr. model
holder: fal model-id, en funktion der bygger `input` (hver model har forskellige parameternavne for
format/størrelse), og en funktion der udtrækker URL'en fra svaret (forskellige output-felter):

```ts
interface FalModelDef {
  id: string;                                   // fal model-id
  buildInput: (prompt: string, aspectRatio: string) => Record<string, unknown>;
  extractUrl: (result: any) => string | undefined;
}
const FAL_MODELS: Record<ImageModel, FalModelDef> = { … };
```

- `flux` → `fal-ai/flux-pro/v1.1`, input som i dag (`image_size` via `SIZE_MAP`, `num_images`,
  `output_format`, `safety_tolerance`), url `result.data.images[0].url`. **Uændret adfærd.**
- `nano-banana-pro` → `fal-ai/nano-banana-pro`.
- `gpt-image-2` → fal-id verificeres mod fal-docs under implementering (søgning peger på
  `fal-ai/gpt-image-2` / `openai/gpt-image-2`).

> **De eksakte input-felter og output-stier for nano-banana-pro og gpt-image-2 slås op i fal's
> API-docs i implementeringsfasen** (de afviger fra Flux — fx aspect-ratio som streng-enum vs.
> bredde/højde). `extractUrl` falder tilbage til de kendte stier (`data.images[0].url` /
> `images[0].url`).

`falProvider.generate({ prompt, aspectRatio, model })` slår modellen op (default `flux`), bygger
input, kalder `fal.subscribe(def.id, { input })`, og udtrækker URL'en. Ukendt model → fejl med en
klar besked.

**2. `/api/generate-image` (`server.ts`).**
Tag `{ prompt, aspectRatio, model }`. Valider `model` mod de tilladte værdier (ukendt → 400 eller
fald tilbage til `flux`). Videregiv `model` til `getImageProvider().generate(...)`. Default `flux`
hvis udeladt → eksisterende kald (funnel-billeder) er upåvirkede.

**3. Nyt `/api/image-prompt` (`server.ts`) — spejler `/api/logo-prompt`.**
Tag `{ brief, currentPrompt, mode }` (`mode: 'translate' | 'refine'`). Ny prompt-builder
`buildImagePrompt(brief, currentPrompt, mode)` i `server/ai/prompts.ts` + et tool `imagePromptTool`
i `server/ai/schemas.ts` (samme `{ prompt: string }`-form som `logoPromptTool`). Bruger
`generateStructured` med `config.fastModel`. `translate` = oversæt brugerens danske input til en
skarp **engelsk** billed-prompt; `refine` = forbedre den eksisterende prompt (komposition, lys,
stil-ord) uden at opfinde nyt indhold. Returnerer `{ prompt }`. Model-agnostisk (en god engelsk
prompt virker på alle tre modeller).

### Frontend

**4. `src/hooks/useImageGeneration.ts`.**
- `handleGenerateImage(key, promptText, model?)` — udvid signaturen med valgfri `model`; send
  `model` i POST-body til `/api/generate-image` (default `'flux'`).
- Ny `handleOptimizeImagePrompt(currentPrompt, mode): Promise<string | null>` — POST `/api/image-prompt`
  med `{ brief, currentPrompt, mode }`; returnér den optimerede prompt (eller `null` ved fejl).
- Ny `isOptimizingImagePrompt`-state (til knap-spinner + WorkingOverlay).
- `brief` er ikke i hook'en i dag; `handleOptimizeImagePrompt` tager `brief` som argument fra
  kald-stedet, eller App-laget pre-binder det (afgøres i planen — sandsynligvis pre-bind i App, så
  hook'en forbliver brief-uvidende).

**5. `src/components/ImagePanel.tsx`.**
- **Modelvælger:** segmenteret kontrol (3 chips: "Flux 1.1 Pro" / "Nano Banana Pro" / "GPT Image 2"),
  lokal `model`-state (default `'flux'`), system-stil (slate + brand-orange, som format-vælgeren).
- **Oversæt + Forfin:** to knapper som logo-panelet, der kalder `onOptimize(prompt, mode)` og
  skriver resultatet tilbage i textarea'en; spinner via `isOptimizing`. Deaktiveret ved tom prompt.
- `onGenerate(prompt, model)` videregiver den valgte model.
- Nye props: `onOptimize: (prompt, mode) => Promise<string | null>`, `isOptimizing: boolean`.
  `onGenerate` ændres til `(prompt: string, model: ImageModel) => void`.

**6. `src/App.tsx`.**
- Wire `onOptimize={(p, m) => handleOptimizeImagePrompt(p, m)}` (pre-bundet med `brief`),
  `isOptimizing={isOptimizingImagePrompt}`, og `onGenerate={(p, model) => handleGenerateImage('custom', p, model)}`.
- Tilføj `isOptimizingImagePrompt` til `WorkingOverlay`'s `show`/`title` (som logo).

## Fasedeling (én spec, to implementeringsfaser)

- **Fase 1 — Prompt-værktøjer:** `/api/image-prompt` + `buildImagePrompt` + `imagePromptTool` +
  `handleOptimizeImagePrompt` + Oversæt/Forfin-knapper i ImagePanel. Genbruger logo-prompt-mønstret.
  Producerer fungerende software (oversæt/forfin virker; stadig kun Flux).
- **Fase 2 — Modeller:** `ImageModel`-type + fal-model-register + `model`-param i `/api/generate-image`
  + modelvælger i ImagePanel + wiring. Hver ny models schema verificeres mod fal-docs.

## Fejlhåndtering

- Ukendt/ugyldig `model` på backend → fald tilbage til `flux` (eller 400 — afgøres i planen; default:
  fald tilbage til `flux` for robusthed).
- fal-fejl → eksisterende `ImageGenCard`-fejlboks med "Prøv igen".
- `/api/image-prompt`-fejl → returnér `null`, vis fejl via eksisterende fejl-helper; textarea uændret.

## Test

- `server/image/provider.test.ts` (findes): udvid med model-mapping — at `flux`/`nano-banana-pro`/
  `gpt-image-2` slår korrekt fal-id op, og at ukendt model falder tilbage/fejler som besluttet.
- Ny prompt-builder-test: `buildImagePrompt` for `translate` og `refine` (form/indhold), som de
  eksisterende prompt-builder-tests.
- `ImagePanel.test.tsx` (findes): tilføj at modelvælgeren skifter valgt model, og at Oversæt/Forfin
  kalder `onOptimize` med korrekt mode; at `onGenerate` kaldes med den valgte model.
- `npm run lint` + `npm test` grønne.
- Manuel: generér med hver af de tre modeller; Oversæt dansk → engelsk prompt; Forfin en prompt.

## Versionsbump

Minor → `1.19.0` → `1.20.0` (package.json, AppHeader, App.tsx footer, package-lock).

## Åbne spørgsmål

Ingen blokerende. To implementerings-detaljer afgøres i planen: (a) ugyldig-model = fallback vs. 400
(default: fallback til flux); (b) hvor `brief` pre-bindes til `handleOptimizeImagePrompt` (default: i App).
Eksakte fal-schema-felter for nano-banana-pro/gpt-image-2 slås op under implementering.
