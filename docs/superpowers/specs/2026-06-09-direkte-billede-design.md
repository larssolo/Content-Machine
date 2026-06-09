# Design: Direkte billede-generering (uden funnel)

**Dato:** 2026-06-09
**Status:** Godkendt af bruger (afventer spec-review)
**Område:** `src/hooks/useImageGeneration.ts`, ny `src/components/ImagePanel.tsx`, `src/App.tsx`
**Design-system:** `.interface-design/system.md`

## Problem

Billedgenerering er i dag **gated bag funnel'en**: `handleGenerateImage(key, promptText)` kræver
en image-prompt, som kun opstår efter "Generér indhold" (`output.imagePrompts`) eller "Visuel
udvikling" (`concept.imagePrompts`). Der findes ingen vej til "skriv en prompt → få et billede"
uden først at køre et af de trin. Logo-generering er derimod allerede uafhængig (`LogoPanel`
bygger sin egen prompt fra briefet).

Brugeren vil kunne lave et billede direkte, uden at skulle igennem funnel-trinene.

## Mål

En selvstændig billede-indgang: editerbar prompt → vælg format → generér → preview/download.
Helt afkoblet fra funnel-state, brief og de eksisterende hero/detail/abstract-billeder.

## Ikke-mål (YAGNI)

- Ingen prompt-prefill fra brief, ingen AI-promptoptimering (det har logo; tilføjes evt. senere).
- Ingen backend-ændring — `/api/generate-image` tager allerede `{ prompt, aspectRatio }`.
- Ingen ændring af de eksisterende billede-flows (PromptsTab, VisualDevPanel) eller funnel'en.
- Ingen ny hook — genbruger `useImageGeneration`.

## Design

### 1. Hook: nyt `custom`-slot (`src/hooks/useImageGeneration.ts`)

Udvid `GeneratedImageKey` med `'custom'` og tilføj initial-state:

```ts
export type GeneratedImageKey = 'hero' | 'detail' | 'abstract' | 'custom';
// i useState-initialiseringen:
custom: { url: '', loading: false, error: null, aspectRatio: '1:1' },
```

`handleGenerateImage('custom', prompt)` og `handleAspectChange('custom', ratio)` virker allerede
generisk (de slår op pr. key) — ingen ny logik i hook'en udover slot-definitionen.

**Session-gendannelse er sikker by-design:** `useContentMachine.ts:164` gendanner med
`setGeneratedImages(prev => ({ ...prev, ...saved }))`. Da `prev` allerede indeholder `custom` fra
initial-state, overlever `custom` selv når gamle gemte sessioner ikke har nøglen. Ingen migration.

### 2. Ny komponent: `src/components/ImagePanel.tsx`

Modelleret efter `LogoPanel`'s struktur og design-systemet. Ejer kun den lokale prompt-tekst;
billede-state kommer fra hook'en via props.

**Props:**
```ts
interface ImagePanelProps {
  image: GeneratedImageState;              // = generatedImages.custom
  onGenerate: (prompt: string) => void;    // = (p) => handleGenerateImage('custom', p)
  onAspectChange: (ratio: string) => void; // = (r) => handleAspectChange('custom', r)
}
```

Copy-knappen til prompten håndteres **lokalt** i `ImagePanel` (egen `useState` for copied-markør +
`navigator.clipboard.writeText(prompt)`), så vi ikke introducerer en global clipboard-key. Derfor
ingen `copied`/`onCopy` i props.

**Indhold:**
- Panel-container i system-stil: `bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-sm`.
- Editerbar `<textarea>` (lokal `useState`, tom, placeholder "Beskriv billedet du vil generere…"),
  stylet som de øvrige inputs (slate-baggrund, brand-orange focus-ring).
- Genbruger **`ImageGenCard`** til format-vælger (`ratios={['1:1','16:9','9:16','4:3']}`), generér-knap,
  loading/fejl/retry, preview og download. `promptText` = den typede tekst (ImageGenCard viser den
  som citat — bevidst beholdt, bekræfter hvad der sendes). `onGenerate` videresendes så generér-knappen
  i kortet kalder `onGenerate(prompt)`. `downloadBase` = fx `"neura_billede"`. `ImageGenCard`'s
  påkrævede `copied`/`onCopy`-props forsynes fra `ImagePanel`'s lokale copied-state (se copy-afsnit).
- Generér-knappen er deaktiveret når prompten er tom (whitespace-trim).

### 3. `src/App.tsx`: render i højre kolonne under en Assets-overskrift

Lige **over** den eksisterende `<LogoPanel .../>` indsættes en lille eyebrow-label + `ImagePanel`:

```tsx
<div className="space-y-3">
  <span className="block text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">
    Assets · kræver ikke funnel
  </span>
  <ImagePanel
    image={generatedImages.custom}
    onGenerate={(p) => handleGenerateImage('custom', p)}
    onAspectChange={(r) => handleAspectChange('custom', r)}
  />
  {/* eksisterende LogoPanel flyttes ind under samme gruppe */}
</div>
```

`generatedImages`, `handleGenerateImage`, `handleAspectChange` er alle allerede destruktureret i
`App.tsx`. Logo-panelet beholder sine egne props uændret; det flyttes blot ind under den fælles
Assets-overskrift for at danne klyngen.

## Komponent-afgrænsning

- `ImagePanel` — ét klart ansvar: editerbar prompt + udløs billedgenerering på `custom`-slot. Ejer
  kun prompt-tekst (og evt. lokal copied-markør). Afhænger af `ImageGenCard` + de injicerede handlere.
- `useImageGeneration` — uændret kontrakt, blot ét slot mere.
- `ImageGenCard` — genbruges uændret (ingen ændring i den delte komponent).

## Test & verifikation

- Ny `src/components/ImagePanel.test.tsx` (jsdom):
  - Renders prompt-textarea med placeholder.
  - Generér-knap deaktiveret ved tom prompt; aktiv når der er tekst.
  - Klik på generér kalder `onGenerate` med den indtastede tekst.
- `npm run lint` grøn; `npm test` — eksisterende suite + ny test grøn.
- Manuel: skriv en prompt i Billede-panelet uden at have kørt funnel'en → billede genereres og vises;
  download virker; funnel-billederne (hero/detail/abstract) påvirkes ikke.
- Versionsbump: minor → `1.18.0` → `1.19.0` (package.json, AppHeader, App.tsx footer, package-lock).

## Åbne spørgsmål

Ingen. Copy-knap-tilgang (lokal vs. global) afgøres i planen som en intern detalje (default: lokal).
