# Content Machine

AI-drevet content-værktøj, der genererer marketing-indhold (case-tekster, LinkedIn,
nyhedsbrev, overskrifter, keywords, CVI-analyse, AI-humanizer og billeder) ud fra en
projekt-brief.

Tekst og analyse kører på **Anthropic Claude** (standardmodel Sonnet 4.6 — sæt
`ANTHROPIC_MODEL=claude-opus-4-8` for højeste kvalitet), og billeder
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

## Deploy (Render)

Appen er **én kørende Node-server** (Express i `server.ts`), der serverer både
frontend og `/api/*`. Den kan derfor **ikke** deployes som et rent statisk site
(fx Vercel uden serverless-funktioner) — så ville alle `/api/*`-kald give **404**.
Brug en vært, der kører en vedvarende Node-proces. Repoet indeholder en
`render.yaml` (Blueprint) til [Render](https://render.com):

1. Push repoet til GitHub (allerede på Git).
2. Render Dashboard → **New → Blueprint** → vælg dette repo + branch. Render
   læser `render.yaml` automatisk.
3. Udfyld de hemmelige nøgler når du bliver bedt om det:
   - `ANTHROPIC_API_KEY`
   - `FAL_KEY` (kun nødvendig for billeder)
4. Klik **Apply** → Render kører `npm run build` og derefter `npm start`.
   Health-check rammer `/api/health`.

**Uden Blueprint:** New → **Web Service** → vælg repo → Build:
`npm install && npm run build`, Start: `npm start`, og sæt `NODE_ENV=production`
plus de to nøgler.

> **Gratis-plan:** servicen "sover" efter 15 min inaktivitet; første kald derefter
> tager ~½–1 min at vække. Vil du undgå det, så skift `plan: free` → `starter`
> (~$7/md) i `render.yaml` eller i service-indstillingerne.
