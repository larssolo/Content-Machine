# Content Machine

AI-drevet content-værktøj, der genererer marketing-indhold (case-tekster, LinkedIn,
nyhedsbrev, overskrifter, keywords, CVI-analyse, AI-humanizer og billeder) ud fra en
projekt-brief.

Tekst og analyse kører på **Anthropic Claude** (standardmodel Opus 4.8), og billeder
genereres via **Flux 1.1 Pro (fal.ai)**.

## Stack

- Frontend: React 19 + Vite 6 + Tailwind 4 + Motion
- Backend: Express 4 + TypeScript (`server.ts` + `server/` AI-lag)
- AI: `@anthropic-ai/sdk` (struktureret output via tool use, prompt-caching, streaming refine)
- Billeder: `@fal-ai/client` (pluggbart udbyder-lag i `server/image/`)

## Kør lokalt

**Forudsætninger:** Node.js 20+

1. Installer afhængigheder:
   `npm install`
2. Opret `.env.local` (se `.env.example`) og sæt mindst:
   - `ANTHROPIC_API_KEY` — API-nøgle fra https://console.anthropic.com (forbrugs-faktureret;
     ikke det samme som et Claude Pro/Max-abonnement)
   - `FAL_KEY` — fal.ai-nøgle fra https://fal.ai/dashboard/keys (kun nødvendig for billedgenerering)
3. Kør appen:
   `npm run dev` → http://localhost:3000

## Kommandoer

- `npm run dev` — udviklingsserver (Vite + Express)
- `npm run build` — byg frontend + backend til `dist/`
- `npm start` — kør produktionsbygget
- `npm run lint` — TypeScript type-check
- `npm test` — kør testsuiten (Vitest)

## Konfiguration

Se `.env.example` for alle variabler (`ANTHROPIC_MODEL`, `ANTHROPIC_FAST_MODEL`,
`ANTHROPIC_MAX_TOKENS`, `IMAGE_PROVIDER`, `FAL_KEY`). Billed-udbyderen vælges med
`IMAGE_PROVIDER` (`fal` som standard; `openai`/`stability` er forberedte stubs).
