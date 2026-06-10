# Design: Avatar-generator med indbygget TTS (VEED Fabric 1.0 + Gemini TTS)

**Dato:** 2026-06-10
**Status:** Godkendt af bruger (afventer spec-review)
**Branch:** `claude/avatar-generator` (baseret på `claude/video-generator`, så Image → Video → Avatar stacker)
**Område:** ny `server/audio/tts.ts`, ny `server/video/fabric.ts`, `server.ts`, ny `src/hooks/useAvatarGeneration.ts`, ny `src/components/AvatarPanel.tsx`, `src/hooks/useContentMachine.ts`, `src/App.tsx`
**Design-system:** `.interface-design/system.md`

## Problem / mål

Neura Studio har billede- og video-generatorer. Brugeren vil have en **avatar-generator** (talking-head)
under video-panelet: et billede gøres til en talende video. Modellen `veed/fabric-1.0` kræver et billede
+ en lydfil. Lyden skal **genereres i Neura Studio via TTS** (`fal-ai/gemini-3.1-flash-tts`) — ikke uploades.
Derfor bliver avatar-boksen et **to-trins flow**: (1) lav tale, (2) lav avatar.

## Beslutninger (godkendt)

- **Lyd = TTS** via `fal-ai/gemini-3.1-flash-tts` (ingen upload).
- **Billede = som video-panelet:** genereret billede (`generatedImages.custom.url`) default + indsæt-URL.
- **Alle 30 TTS-stemmer** vælgbare (default Kore).
- **Opløsning** 720p/480p (default 480p).
- **Ingen upload-infrastruktur** (alt bliver fal-hostede URL'er).

## Verificerede fal-schemas

**TTS — `fal-ai/gemini-3.1-flash-tts`** input:
| Felt | Type | Påkrævet | Default |
|---|---|---|---|
| `prompt` | string | ✓ | — |
| `voice` | enum (30 stemmer) | nej | `"Kore"` |
| `style_instructions` | string | nej | — |
| `temperature` | float 0–1 | nej | `1` |
| `output_format` | enum | nej | `"mp3"` |
Output: `result.data.audio.url`.
**30 stemmer:** Achernar, Achird, Algenib, Algieba, Alnilam, Aoede, Autonoe, Callirrhoe, Charon, Despina, Enceladus, Erinome, Fenrir, Gacrux, Iapetus, Kore, Laomedeia, Leda, Orus, Pulcherrima, Puck, Rasalgethi, Sadachbia, Sadaltager, Schedar, Sulafat, Umbriel, Vindemiatrix, Zephyr, Zubenelgenubi.

**Avatar — `veed/fabric-1.0`** input: `image_url` (✓), `audio_url` (✓), `resolution` `"720p"`|`"480p"` (✓). Output: `result.data.video.url`.

## Ikke-mål (YAGNI)

- Ingen multi-speaker TTS; `output_format` låst til `mp3` (fabric skal bruge en lyd-URL). Ingen upload.
- Ingen ændring af billede-/video-/logo-/funnel-flows.
- Avatar er sidste feature i køen.

## Arkitektur

### Backend

**1. TTS-adapter `server/audio/tts.ts`** (mirror af kling/fal-mønstret — ren input-builder + generate):
```ts
export const TTS_VOICES = ['Achernar','Achird','Algenib','Algieba','Alnilam','Aoede','Autonoe','Callirrhoe','Charon','Despina','Enceladus','Erinome','Fenrir','Gacrux','Iapetus','Kore','Laomedeia','Leda','Orus','Pulcherrima','Puck','Rasalgethi','Sadachbia','Sadaltager','Schedar','Sulafat','Umbriel','Vindemiatrix','Zephyr','Zubenelgenubi'] as const;
export type TtsVoice = typeof TTS_VOICES[number];

export interface SpeechRequest { prompt: string; voice?: string; styleInstructions?: string; temperature?: number; }

export function buildTtsInput(req: SpeechRequest): Record<string, unknown> {
  const voice = TTS_VOICES.includes(req.voice as TtsVoice) ? req.voice : 'Kore';
  const input: Record<string, unknown> = { prompt: req.prompt, voice, output_format: 'mp3' };
  if (typeof req.temperature === 'number') input.temperature = Math.min(1, Math.max(0, req.temperature));
  if (req.styleInstructions?.trim()) input.style_instructions = req.styleInstructions;
  return input;
}

export async function generateSpeech(req: SpeechRequest): Promise<{ audioUrl: string }> { … } // fal.subscribe('fal-ai/gemini-3.1-flash-tts'), data.audio.url, FAL_KEY-guard
```

**2. Avatar-adapter `server/video/fabric.ts`:**
```ts
export interface AvatarRequest { imageUrl: string; audioUrl: string; resolution?: '720p' | '480p'; }
export function buildFabricInput(req: AvatarRequest): Record<string, unknown> {
  return { image_url: req.imageUrl, audio_url: req.audioUrl, resolution: req.resolution === '720p' ? '720p' : '480p' };
}
export async function generateAvatar(req: AvatarRequest): Promise<{ videoUrl: string }> { … } // fal.subscribe('veed/fabric-1.0'), data.video.url, FAL_KEY-guard
```

**3. Routes (`server.ts`):**
- `POST /api/generate-speech` — validér `prompt`; kald `generateSpeech`; returnér `{ audioUrl }`.
- `POST /api/generate-avatar` — validér `imageUrl` + `audioUrl`; kald `generateAvatar`; returnér `{ videoUrl }`.
Begge: 400 ved manglende felter; 500 med dansk fejlbesked i catch (samme mønster som `/api/generate-video`).

### Frontend

**4. `src/hooks/useAvatarGeneration.ts`** (selvstændigt domæne):
```ts
export type SpeechState = { url: string; loading: boolean; error: string | null };
export type AvatarState = { url: string; loading: boolean; error: string | null };
export interface SpeechParams { prompt: string; voice?: string; styleInstructions?: string; temperature?: number; }
export interface AvatarParams { imageUrl: string; audioUrl: string; resolution?: '720p' | '480p'; }
```
- `speechResult: SpeechState`, `avatarResult: AvatarState`.
- `handleGenerateSpeech(params: SpeechParams)` → POST `/api/generate-speech`; sætter speechResult.
- `handleGenerateAvatar(params: AvatarParams)` → POST `/api/generate-avatar`; sætter avatarResult.
- Bruger `httpErrorMessage`. Surfaced via `useContentMachine`.

**5. `src/components/AvatarPanel.tsx`** (slate + brand-orange). Props:
```ts
interface AvatarPanelProps {
  generatedImageUrl: string;     // = generatedImages.custom.url
  speech: SpeechState;
  avatar: AvatarState;
  onGenerateSpeech: (p: SpeechParams) => void;
  onGenerateAvatar: (p: AvatarParams) => void;
}
```
- **Trin 1 — Tale:** tekst-textarea (placeholder nævner udtryks-tags), stemme-dropdown (`<select>` med alle 30 stemmer, default Kore), stil-instruktion (valgfri input), temperatur-slider (0–1, default 1), "Generér tale"-knap (deaktiveret uden tekst / mens `speech.loading`), `<audio controls>` når `speech.url`.
- **Trin 2 — Avatar:** billede-kilde-toggle (Genereret / Indsæt URL — som VideoPanel), opløsnings-toggle (720p/480p, default 480p), "Generér avatar"-knap (deaktiveret indtil der er et billede OG `speech.url` OG ikke `avatar.loading`), `<video controls>` + download når `avatar.url`. Lyd-status viser "✓ tale klar" når `speech.url` findes, ellers hint "Generér tale først".
- Fejl/loading vises pr. trin (mirror af VideoPanel-mønstret).

**6. `src/hooks/useContentMachine.ts`** komposer `useAvatarGeneration()` og surfacer `speechResult`, `avatarResult`, `handleGenerateSpeech`, `handleGenerateAvatar`.

**7. `src/App.tsx`** rendrer `<AvatarPanel … />` i Assets-klyngen **under `VideoPanel`**, med `generatedImageUrl={generatedImages.custom.url}`. Tilføj `speechResult.loading` og `avatarResult.loading` til `WorkingOverlay`s `show` + title-grene ("Genererer tale" / "Genererer avatar").

## Datastrøm

Trin 1: tekst+stemme+params → `handleGenerateSpeech` → `/api/generate-speech` → `generateSpeech` → `data.audio.url` → `speechResult.url` (audio-preview).
Trin 2: effektiv imageUrl + `speechResult.url` + resolution → `handleGenerateAvatar` → `/api/generate-avatar` → `generateAvatar` → `data.video.url` → `avatarResult.url` (video).

## Fejlhåndtering

- Manglende felter → 400. Manglende FAL_KEY → klar fejl. Ingen URL → fejl. Fejl vises pr. trin i panelet; knapper re-aktiveres. Fabric/TTS kan tage tid → loading-spinner + tekst.

## Test

- `server/audio/tts.test.ts`: `buildTtsInput` (default voice Kore, ugyldig voice → Kore, output_format mp3, temperatur-clamp, style kun når sat); `generateSpeech` fejler klart uden FAL_KEY.
- `server/video/fabric.test.ts`: `buildFabricInput` (image_url/audio_url/resolution mapping, default 480p, 720p respekteret); `generateAvatar` fejler klart uden FAL_KEY.
- `src/components/AvatarPanel.test.tsx`: stemme-dropdown indeholder alle 30 stemmer; "Generér tale" kalder `onGenerateSpeech` med tekst+voice; "Generér avatar" deaktiveret uden `speech.url`; aktiv når billede+tale findes og kalder `onGenerateAvatar` med korrekt payload.
- `npm run lint` + `npm test` grønne.
- Manuel: generér billede → skriv tekst, vælg stemme, generér tale (hør preview) → generér avatar (se talende video).

## Versionsbump

Minor → `1.21.0` → `1.22.0` (package.json, AppHeader, App.tsx footer, package-lock).

## Åbne spørgsmål

Ingen blokerende. Eksakte fal output-stier bekræftet (`data.audio.url`, `data.video.url`). `temperature`
og `resolution` valideres server-side (clamp/whitelist).
