# Neura Studio — Development Rules

## Version number

The app version lives in **three places** that must always be in sync:

1. `package.json` → `"version"` field
2. `src/components/AppHeader.tsx` → the header subtitle span (`v1.0.0`)
3. `src/App.tsx` → the footer tagline (`· v1.0.0`)

**Rule: bump the patch version (e.g. 1.0.0 → 1.0.1) on every commit that changes visible behaviour or content.** Use minor bumps (1.0.x → 1.1.0) for new features, major bumps (1.x → 2.0.0) for breaking/architectural changes.

## Branding

The product is called **Neura Studio**. Never use "Content Machine", "Brand Surface" or "Brandsurface" anywhere in user-visible text, UI labels, export files, or AI prompts.

## Branch

All work lands on `main` via short-lived feature branches (`claude/<topic>`). Commit per logical change; bump the version per the rule above; open a PR into `main` when a unit of work is done.

---

## Project Overview

Content Machine is a Danish-language AI-powered marketing content generator. It takes a project brief as input and produces multi-channel marketing copy (case texts, LinkedIn posts, newsletters, headlines, keywords, image prompts) plus brand identity suggestions, and scales a chosen idea across a full creative funnel (strategy → big idea → pressure-test → omni-channel matrix → effectiveness layer → pitch deck).

Architecture: React 19 SPA (frontend) + Express 4 API server (backend) served as a single Node.js process. The Claude API (Anthropic) drives all text generation; FAL.ai (Flux 1.1 Pro) handles image generation. Exports to HTML, Markdown, DOCX, and a self-contained pitch-deck.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, TypeScript 5.8, Vite 6, Tailwind CSS 4 (via `@tailwindcss/vite`), Motion, Lucide React |
| Backend | Express 4, `@anthropic-ai/sdk`, `@fal-ai/client`, `docx` |
| Tests | Vitest 4, Testing Library (React + Jest DOM), jsdom |
| Build | Vite (frontend bundle), esbuild (server → `dist/server.cjs`) |
| Runtime | Node.js ≥ 20, `tsx` for dev, `dotenv` for config |

## Directory Layout

```
server/                   Express API + AI prompt logic + image providers
  ai/
    anthropic.ts          Anthropic client singleton
    config.ts             Model/provider config from env vars
    prompts.ts            All Claude prompt builders (buildGenerate, buildRefine, …)
    schemas.ts            Anthropic tool definitions (generateTool, analyzeTool, …)
    structured.ts         Wrapper for structured/tool-use Claude calls
    deliberate.ts         Editorial deliberation mode (deep generate)
    deliberateVisual.ts   Visual art direction deliberation
    deliberateIdea.ts     ECD pressure-test + sharpening of a creative territory
    culturalScan.ts       Real-time cultural/market scan (Anthropic web search)
    cvi.ts                Brand identity (CVI) analysis
    *.test.ts             Co-located unit tests
  image/
    provider.ts           Image provider factory
    fal.ts                FAL.ai adapter (Flux 1.1 Pro)
    openai.ts             OpenAI image adapter
    stability.ts          Stability AI adapter
    recraftVector.ts      Recraft SVG/logo adapter

server.ts                 Express entry point — all /api/* routes defined here

src/
  App.tsx                 Main shell; composes section components, passes hook state down
  main.tsx                React DOM bootstrap (StrictMode + ErrorBoundary)
  types.ts                All shared TypeScript interfaces (ProjectBrief, BrandSurfaceOutput, …)
  index.css               Global styles + Tailwind theme overrides
  hooks/
    useContentMachine.ts  Central hook; composes the domain hooks below and owns the
                          generate/refine/regenerate/variants/export/preset logic
    useCreativeFunnel.ts  Funnel domain: cultural scan → strategy → big idea →
                          pressure-test → channel matrix → effectiveness
    useTheme.ts           Dark/light theme + localStorage persistence
    useClipboard.ts       Copy-to-clipboard with a transient "copied" marker
    useImageGeneration.ts Hero/detail/abstract image generation
    useHumanizer.ts       AI-detector bypass humanizer
    useLogo.ts            Recraft logo generation + prompt optimisation
    httpError.ts          Shared API error-message helper
  components/             React UI components (panels, menus, sections)
    tabs/                 Content output tabs (CaseTab, LinkedinTab, …)
  lib/
    exportDocx.ts         Word export
    exportHtml.ts         HTML export
    exportMarkdown.ts     Markdown export
    exportDeck.ts         Self-contained pitch-deck (.html) export
    session.ts            localStorage session persistence
    history.ts            localStorage generation history

index.html                Vite HTML entry point
vite.config.ts            Vite config (Tailwind plugin, `@/` alias, HMR toggle)
vitest.config.ts          Test runner config
render.yaml               Render.com deployment blueprint
.env.example              Environment variable reference
```

## Development Workflow

### Setup

```bash
cp .env.example .env   # then fill in ANTHROPIC_API_KEY (required)
npm install
npm run dev            # starts Express dev server on port 3000
```

### Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server (`tsx server.ts`, port 3000) |
| `npm run lint` | TypeScript type-check (`tsc --noEmit`) — the only linting step |
| `npm test` | Run all Vitest tests once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run build` | Vite (frontend) + esbuild (server → `dist/server.cjs`) |
| `npm start` | Run production bundle |

### Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | — | Claude API key |
| `ANTHROPIC_MODEL` | No | `claude-sonnet-4-6` | Default generation model |
| `ANTHROPIC_CREATIVE_MODEL` | No | `claude-sonnet-4-6` | Model for deep/editorial synthesis |
| `ANTHROPIC_FAST_MODEL` | No | `claude-haiku-4-5` | Cheap model for `/api/refine` |
| `ANTHROPIC_MAX_TOKENS` | No | `8000` | Max output tokens for `/api/generate` |
| `IMAGE_PROVIDER` | No | `fal` | `fal` \| `openai` \| `stability` |
| `FAL_KEY` | When `IMAGE_PROVIDER=fal` | — | FAL.ai API key |
| `APP_URL` | No | — | Public URL (self-referencing links) |

## Architecture: State Management

There is no Redux or Zustand. Frontend state is centralised in the `useContentMachine()` hook (`src/hooks/useContentMachine.ts`), which **composes several focused domain hooks** — `useCreativeFunnel`, `useLogo`, `useImageGeneration`, `useHumanizer`, `useTheme`, `useClipboard` — and itself owns the core generate / refine / regenerate / variants / export / preset logic plus the session-persistence effects.

`App.tsx` destructures the hook's return and composes presentational section components (`FunnelPanels`, `OutputWorkspace`, `BlankState`, `BriefForm`, …), passing slices down as props. Each section may further compose smaller pieces (`ExportMenu`, `HistoryMenu`, `RefinementBar`, the tab router).

**localStorage persistence** — four keys, all prefixed `brand_surface_` (legacy identifier kept for backward-compatible saved sessions; not user-visible):
- `brand_surface_session` — current brief + all generated output (saved on every significant state change)
- `brand_surface_history` — last 20 generation runs
- `brand_surface_presets` — user-pinned briefs
- `brand_surface_theme` — `'dark'` or `'light'`

## Architecture: Backend API

All routes are defined in `server.ts`. Prompt builders live in `server/ai/prompts.ts`; Anthropic tool schemas in `server/ai/schemas.ts`.

| Endpoint | Streaming? | Purpose |
|---|---|---|
| `POST /api/generate` | No | Main content batch generation |
| `POST /api/generate-deep` | Yes (SSE) | Editorial deliberation (deep mode) |
| `POST /api/refine` | Yes (SSE) | Text refinement with custom prompt |
| `POST /api/regenerate-section` | Yes (SSE) | Regenerate one locked section |
| `POST /api/variants` | No | Generate 2 text variants |
| `POST /api/analyze` | No | Tone & cliché analysis |
| `POST /api/analyze-cvi` | No | Brand identity (CVI) analysis |
| `POST /api/humanize` | No | AI-detector bypass humanizer |
| `POST /api/brainstorm` | No | Creative brainstorm angles |
| `POST /api/cultural-scan` | No | Real-time cultural/market scan (web search) |
| `POST /api/strategy` | No | Strategic foundation |
| `POST /api/big-idea` | No | Campaign platform + territories |
| `POST /api/sharpen-idea` | No | ECD pressure-test + sharpening of a territory |
| `POST /api/channel-matrix` | No | Omni-channel asset matrix |
| `POST /api/effectiveness` | No | IPA/Binet & Field KPI & measurement framework |
| `POST /api/visual-deep` | Yes (SSE) | Visual art direction deliberation |
| `POST /api/generate-logo` | No | Logo (SVG + raster via Recraft) |
| `POST /api/logo-prompt` | No | Logo prompt optimisation |
| `POST /api/generate-image` | No | Hero/detail/abstract/custom image gen (Flux / Nano Banana Pro / GPT Image 2) |
| `POST /api/image-prompt` | No | Image prompt optimisation (translate/refine) |
| `POST /api/generate-video` | No | Video (Kling 2.5 Turbo Pro image-to-video) |
| `GET  /api/health` | No | Health check |

**SSE streaming format** for streaming endpoints:
```
data: {"delta": "text chunk"}\n\n
data: {"done": true, "refinedText": "complete text"}\n\n
data: [DONE]\n\n
```

The client reads chunks via `ReadableStream` / `TextDecoder`, accumulating `delta` values until `done: true`, then applies the final text field (`refinedText` / `regeneratedText` / `output`, depending on the endpoint).

## Adding New Features

| What | Where |
|---|---|
| New API endpoint | Add route in `server.ts`; add prompt builder in `server/ai/prompts.ts`; add tool schema in `server/ai/schemas.ts` if structured output is needed |
| New funnel stage | Add state + handler to `src/hooks/useCreativeFunnel.ts`; render a panel via `FunnelPanels` |
| New UI panel | Create component in `src/components/`; add state + handler to the relevant hook (`useContentMachine` or a domain hook); render via `App.tsx` / a section component |
| New output tab | Create in `src/components/tabs/`; add tab key to `activeTab` handling; add tab button in `OutputWorkspace` |
| New shared type | Add to `src/types.ts` |

There is no client-side router. Tab navigation is driven by the `activeTab` state string.

## Coding Conventions

- TypeScript strict mode throughout; avoid `any` except where the Anthropic SDK forces it
- No ESLint or Prettier configured — `tsc --noEmit` is the only automated quality gate
- Tailwind CSS 4 utility classes everywhere; custom theme (fonts, brand-orange palette, light-mode overrides) defined in `src/index.css` — there is no `tailwind.config.js`
- Path alias `@/` resolves to project root (configured in both `tsconfig.json` and `vite.config.ts`)
- Write no comments unless the *why* is non-obvious (a hidden constraint, a workaround, a subtle invariant)
- Prefer editing existing files to creating new ones; don't add abstractions beyond what the task requires

## Testing

- Test files are co-located with source files (e.g., `server/ai/prompts.test.ts` next to `prompts.ts`)
- Server tests cover prompt builders, schema validation, and image provider logic
- Frontend tests cover React components (`ErrorBoundary`) and export utilities (`exportHtml`, `exportDocx`, `exportMarkdown`, `exportDeck`)
- Run with `npm test` (single pass) or `npm run test:watch` (watch mode)
- Test environment is `node` (set in `vitest.config.ts`); jsdom is available for component tests

## Deployment

### Render.com

Configured via `render.yaml` — a single Node.js web service serving both frontend and API.

- **Build:** `npm install && npm run build`
- **Start:** `npm start` (runs `dist/server.cjs`)
- **Health check:** `GET /api/health`
- **Region:** frankfurt (configurable)
- **Auto-deploy:** enabled on push to the configured branch
- **Secrets:** `ANTHROPIC_API_KEY` and `FAL_KEY` set in the Render dashboard — never committed
