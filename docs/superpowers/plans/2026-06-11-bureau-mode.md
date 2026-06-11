# Bureau-mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Løft Neura Studio til verdensklasse reklamebureau ved at tilføje synlige bureau-roller, en intern kritik-loop og en pitch-afdeling oven på den eksisterende funnel.

**Architecture:** Klient-side orkestrator (`useBureauMode`) der kalder eksisterende og nye API-endpoints sekventielt, opdaterer eksisterende state-slots undervejs, og viser forløbet i et nyt `BureauFloor`-komponent. To nye endpoints (`/api/critique`, `/api/pitch`); alle eksisterende endpoints og state bevares uændret i standard-mode.

**Tech Stack:** React 19, TypeScript 5.8, Express 4, @anthropic-ai/sdk, Tailwind 4, Vitest 4 — alt eksisterende; ingen nye afhængigheder.

---

## Filkort (hvad der ændres / oprettes)

| Fil | Handling | Ansvar |
|---|---|---|
| `server/ai/prompts.ts` | Ændres | Tilføj `BUREAU_RUBRIC`, opgrader `GENERATE_SYSTEM_ROLE`, tilføj `buildCritique`, `buildPitch` |
| `server/ai/schemas.ts` | Ændres | Tilføj `critiqueTool`, `pitchTool` |
| `server/ai/prompts.test.ts` | Ændres | Tests for `buildCritique`, `buildPitch`, `BUREAU_RUBRIC` |
| `server.ts` | Ændres | Tilføj `/api/critique`, `/api/pitch`; udvid `/api/big-idea` og `/api/generate-deep` med `revisionNotes` |
| `src/types.ts` | Ændres | Tilføj `CritiqueResult`, `BureauStageStatus`, `BureauStageState`, `PitchResult` |
| `src/hooks/useCreativeFunnel.ts` | Ændres | Eksportér `setCulturalIntel`, `setEffectiveness` |
| `src/hooks/useBureauMode.ts` | Oprettes | Pipeline-orkestrator: stages, runBureau, abortBureau, pitch |
| `src/hooks/useContentMachine.ts` | Ændres | Instansiér `useBureauMode`, eksportér bureau-state |
| `src/components/BureauFloor.tsx` | Oprettes | Synlige rolle-kort med live status og kritik-øjeblikke |
| `src/components/PitchPanel.tsx` | Oprettes | Pitch-afdeling: narrativ, talenoter, indvendinger |
| `src/components/Toolbar.tsx` | Ændres | Tilføj bureau-mode toggle-knap |
| `src/App.tsx` | Ændres | Montér `BureauFloor` og `PitchPanel` |
| `src/lib/exportDeck.ts` | Ændres | Flet pitch-narrativ + talenoter ind i deck |

---

## Etape 1 — Prompt-løft + bureau-rubrik

Ingen nye endpoints. Ren prompt-opgradering. Har selvstændig værdi alene.

### Task 1: BUREAU_RUBRIC-konstant og GENERATE_SYSTEM_ROLE-opgradering

**Files:**
- Modify: `server/ai/prompts.ts:92-105`
- Modify: `server/ai/prompts.test.ts`

- [ ] **Step 1: Skriv den fejlende test**

Tilføj i `server/ai/prompts.test.ts` efter de eksisterende importer:

```typescript
describe('BUREAU_RUBRIC', () => {
  it('is a non-empty string', () => {
    expect(typeof BUREAU_RUBRIC).toBe('string');
    expect(BUREAU_RUBRIC.length).toBeGreaterThan(50);
  });

  it('contains all four criteria keywords', () => {
    expect(BUREAU_RUBRIC).toContain('Skarphed');
    expect(BUREAU_RUBRIC).toContain('Distinktivitet');
    expect(BUREAU_RUBRIC).toContain('Bevisbyrde');
    expect(BUREAU_RUBRIC).toContain('Dansk idiomatik');
  });
});

describe('GENERATE_SYSTEM_ROLE', () => {
  it('does not mention Produktionsassistent (legacy persona)', () => {
    expect(GENERATE_SYSTEM_ROLE).not.toContain('Produktionsassistent');
  });

  it('references BUREAU_RUBRIC criteria', () => {
    expect(GENERATE_SYSTEM_ROLE).toContain('BUREAU_RUBRIC');
  });
});
```

Tilføj `BUREAU_RUBRIC` og `GENERATE_SYSTEM_ROLE` til import-linjen øverst i testfilen.

- [ ] **Step 2: Kør testen og verificér at den fejler**

```bash
cd /Users/larssohl/Neura-Studio && npm test -- --reporter=verbose 2>&1 | grep -A5 'BUREAU_RUBRIC\|GENERATE_SYSTEM_ROLE'
```

Forventet: `ReferenceError: BUREAU_RUBRIC is not defined` eller lignende.

- [ ] **Step 3: Implementér BUREAU_RUBRIC og opgrader GENERATE_SYSTEM_ROLE**

I `server/ai/prompts.ts`, indsæt følgende **before** `// /api/generate`-sektionen (efter linje 87):

```typescript
// ---------------------------------------------------------------------------
// Bureau-rubrik — delt kvalitetsstandard for generering og kritik
// ---------------------------------------------------------------------------

export const BUREAU_RUBRIC = `BUREAU_RUBRIC (gælder for ALT output — overhold alle fire):
1. Skarphed: én tanke pr. sætning. Fjern alt fyld. Hvert ord skal tjene en funktion.
2. Distinktivitet: kunne en konkurrent sætte sit logo på teksten uændret? Forkast den og omskriv.
3. Bevisbyrde: enhver påstand om effekt, kvalitet eller resultat skal følges af et konkret reason-to-believe — et tal, et format, en leverance, en reaktion.
4. Dansk idiomatik: skriv som en dansker tænker, ikke som en oversættelse fra engelsk marketing-speak. Ingen "oplevelse ud over det sædvanlige", "synergier" eller "holistisk tilgang".`;
```

Erstat derefter den eksisterende `GENERATE_SYSTEM_ROLE`-konstant (linje 92-105) med:

```typescript
export const GENERATE_SYSTEM_ROLE = `Du er Senior Tekstforfatter og Brand-kreativ i Neura Studio — et reklamebureau der kun leverer prisvindende arbejde.
Din opgave er at transformere en projekt-brief til en fuldstændig pakke af case-indhold og produktionsforslag.

${BUREAU_RUBRIC}

Yderligere retningslinjer:
1. Find den uventede vinkel. En distinkt og menneskelig stemme, et levende og sanseligt billedsprog. Tag kreative chancer: uventede sammenligninger, konkrete detaljer og en rytme der overrasker. Hellere kantet og mindeværdig end sikker og glat.
2. Hold overskrifter korte, skarpe og originale — gå efter den uventede vinkel, ikke den oplagte.
3. Lav AI-billedprompts på ENGELSK. Brugbare til Midjourney eller Firefly. Præcis tre typer: (1) Hero image prompt, (2) Detail/close-up prompt, (3) Abstract background prompt. Fang stemning, belysning, kamera/vinkel, stil — ingen tekst i billederne.
4. Produktionsforslag: Hvis briefet omhandler event, grafik, 3D, web eller nyhedsbrev, angiv værdifulde og konkrete forslag til det kreative workflow (manglende billedmaterialer, foreslåede formater, hero visual idé, SoMe-format, nyhedsbrev-layout og CTA).
5. "Kan bruges direkte": Isoler det absolut bedste: overskrift, kort tekst, CTA og LinkedIn-krog.
6. CVI-Forslag: Generer et unikt, moderne og fuldstændig gennemtænkt CVI designmanual-forslag. Foreslå 3-4 eksplicitte brandfarver med HEX-koder, typografi/font paringer og specifikke grafiske og billedmæssige designregler.

Aflever hele resultatet via det angivne værktøj, præcist som beskrevet af værktøjets skema.`;
```

- [ ] **Step 4: Kør testen og verificér at den passerer**

```bash
cd /Users/larssohl/Neura-Studio && npm test -- --reporter=verbose 2>&1 | grep -A3 'BUREAU_RUBRIC\|GENERATE_SYSTEM_ROLE'
```

Forventet: alle tests grønne (ingen fejl på de to nye describe-blokke).

- [ ] **Step 5: Typecheck**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint
```

Forventet: ingen fejl.

- [ ] **Step 6: Commit**

```bash
cd /Users/larssohl/Neura-Studio && git add server/ai/prompts.ts server/ai/prompts.test.ts && git commit -m "feat: tilføj BUREAU_RUBRIC + opgrader GENERATE_SYSTEM_ROLE til senior tekstforfatter-persona (v1.23.0-pre)"
```

---

## Etape 2 — Critique-endpoint + useBureauMode-orkestrator

### Task 2: CritiqueResult og bureau-typer i types.ts

**Files:**
- Modify: `src/types.ts` (append efter linje 348)

- [ ] **Step 1: Tilføj typer**

Tilføj i bunden af `src/types.ts`:

```typescript
// ---------------------------------------------------------------------------
// Bureau-mode typer
// ---------------------------------------------------------------------------

export interface CritiqueResult {
  verdict: 'approved' | 'revise';
  rationale: string;
  revisionNotes: string[];
}

export type BureauStageStatus =
  | 'idle'
  | 'working'
  | 'critiquing'
  | 'revising'
  | 'done'
  | 'error'
  | 'skipped';

export interface BureauStageState {
  id: string;
  role: string;
  title: string;
  status: BureauStageStatus;
  streamText: string;
  error?: string;
  critiqueVerdict?: 'approved' | 'revise';
}

export interface PitchSlideNote {
  slide: string;
  note: string;
  rhetoricalPurpose: string;
}

export interface PitchObjection {
  question: string;
  answer: string;
}

export interface PitchResult {
  narrative: string;
  slideNotes: PitchSlideNote[];
  objections: PitchObjection[];
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint
```

Forventet: ingen fejl.

- [ ] **Step 3: Commit**

```bash
cd /Users/larssohl/Neura-Studio && git add src/types.ts && git commit -m "feat: tilføj CritiqueResult, BureauStageState og PitchResult typer"
```

---

### Task 3: critiqueTool og pitchTool i schemas.ts

**Files:**
- Modify: `server/ai/schemas.ts` (append)
- Modify: `server/ai/schemas.test.ts` (oprettes eller ændres)

- [ ] **Step 1: Skriv fejlende test**

Tilføj i `server/ai/schemas.test.ts` (opret filen hvis den ikke eksisterer — check med `ls server/ai/`):

```typescript
import { describe, it, expect } from 'vitest';
import { critiqueTool, pitchTool } from './schemas';

describe('critiqueTool', () => {
  it('has required fields: verdict, rationale, revisionNotes', () => {
    const props = critiqueTool.input_schema.properties as Record<string, any>;
    expect(props).toHaveProperty('verdict');
    expect(props).toHaveProperty('rationale');
    expect(props).toHaveProperty('revisionNotes');
    expect(critiqueTool.input_schema.required).toContain('verdict');
    expect(critiqueTool.input_schema.required).toContain('rationale');
    expect(critiqueTool.input_schema.required).toContain('revisionNotes');
  });

  it('verdict is enum with approved and revise', () => {
    const props = critiqueTool.input_schema.properties as Record<string, any>;
    expect(props.verdict.enum).toEqual(['approved', 'revise']);
  });
});

describe('pitchTool', () => {
  it('has required fields: narrative, slideNotes, objections', () => {
    const props = pitchTool.input_schema.properties as Record<string, any>;
    expect(props).toHaveProperty('narrative');
    expect(props).toHaveProperty('slideNotes');
    expect(props).toHaveProperty('objections');
    expect(pitchTool.input_schema.required).toContain('narrative');
    expect(pitchTool.input_schema.required).toContain('slideNotes');
    expect(pitchTool.input_schema.required).toContain('objections');
  });
});
```

- [ ] **Step 2: Kør og verificér fejl**

```bash
cd /Users/larssohl/Neura-Studio && npm test -- --reporter=verbose 2>&1 | grep -A5 'critiqueTool\|pitchTool'
```

Forventet: fejl — `critiqueTool is not exported`.

- [ ] **Step 3: Tilføj critiqueTool og pitchTool i schemas.ts**

Append i bunden af `server/ai/schemas.ts`:

```typescript
// --- /api/critique -----------------------------------------------------------

export const critiqueTool: Anthropic.Tool = {
  name: 'submit_critique',
  description: 'Aflever en intern bureau-kritik af et kreativt artefakt.',
  input_schema: {
    type: 'object',
    properties: {
      verdict: {
        type: 'string',
        enum: ['approved', 'revise'],
        description: '"approved": artefaktet holder mål. "revise": skal revideres med de angivne noter.',
      },
      rationale: {
        type: 'string',
        description: 'Kort, konkret begrundelse for dommen (2-4 sætninger).',
      },
      revisionNotes: {
        type: 'array',
        items: { type: 'string' },
        description: 'Præcise revisionspunkter — tomme ved "approved". Hvert punkt er handlingsanvisende.',
      },
    },
    required: ['verdict', 'rationale', 'revisionNotes'],
  } as any,
};

// --- /api/pitch --------------------------------------------------------------

export const pitchTool: Anthropic.Tool = {
  name: 'submit_pitch',
  description: 'Aflever klientpræsentationsmaterialet: narrativ, talenoter og indvendingshåndtering.',
  input_schema: {
    type: 'object',
    properties: {
      narrative: {
        type: 'string',
        description: 'Anbefalings-narrativ: situation → spænding → indsigt → idéen → beviset → planen → the ask. En sammenhængende salgsfortælling (300-500 ord).',
      },
      slideNotes: {
        type: 'array',
        description: 'Talenoter pr. slide med retorisk formål.',
        items: {
          type: 'object',
          properties: {
            slide: { type: 'string', description: 'Slide-titel (matcher eksisterende deck-slide).' },
            note: { type: 'string', description: 'Hvad præsentøren siger på dette slide (2-4 sætninger).' },
            rhetoricalPurpose: { type: 'string', description: 'Hvad dette slide skal opnå hos klienten (fx "skab erkendelse af problemet").' },
          },
          required: ['slide', 'note', 'rhetoricalPurpose'],
        },
      },
      objections: {
        type: 'array',
        description: '3-4 kritiske kundespørgsmål med skarpe svar.',
        items: {
          type: 'object',
          properties: {
            question: { type: 'string', description: 'Det spørgsmål klienten stiller (fx "Er budgettet realistisk?").' },
            answer: { type: 'string', description: 'Det overbevisende, konkrete svar (3-5 sætninger).' },
          },
          required: ['question', 'answer'],
        },
      },
    },
    required: ['narrative', 'slideNotes', 'objections'],
  } as any,
};
```

- [ ] **Step 4: Kør test og verificér grønt**

```bash
cd /Users/larssohl/Neura-Studio && npm test -- --reporter=verbose 2>&1 | grep -A3 'critiqueTool\|pitchTool'
```

Forventet: grønt.

- [ ] **Step 5: Typecheck og commit**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint && git add server/ai/schemas.ts server/ai/schemas.test.ts && git commit -m "feat: tilføj critiqueTool og pitchTool schemas"
```

---

### Task 4: buildCritique og buildPitch i prompts.ts

**Files:**
- Modify: `server/ai/prompts.ts` (append)
- Modify: `server/ai/prompts.test.ts` (tilføj tests)

- [ ] **Step 1: Skriv fejlende tests**

Tilføj i `server/ai/prompts.test.ts`:

```typescript
// Tilføj buildCritique og buildPitch til import-linjen øverst.

describe('buildCritique', () => {
  it('includes the critiquing role in system', () => {
    const { system, user } = buildCritique({
      role: 'Chefstrateg',
      artifact: 'Den Store Idé: "Alt begynder med...',
      context: 'Strategisk fundament: ...',
      language: 'Dansk',
    });
    const systemText = system.map((b) => b.text).join('\n');
    expect(systemText).toContain('Chefstrateg');
    expect(user).toContain('Den Store Idé');
  });

  it('includes BUREAU_RUBRIC in system', () => {
    const { system } = buildCritique({
      role: 'Kreativ Direktør',
      artifact: 'Copy-pakke...',
      context: '',
      language: 'Dansk',
    });
    const systemText = system.map((b) => b.text).join('\n');
    expect(systemText).toContain('Skarphed');
  });

  it('does not crash with empty context', () => {
    expect(() =>
      buildCritique({ role: 'Kreativ Direktør', artifact: 'x', context: '', language: 'Dansk' }),
    ).not.toThrow();
  });
});

describe('buildPitch', () => {
  it('includes Pitch-producent role in system', () => {
    const { system } = buildPitch({ brief: { client: 'Acme' } } as any);
    const systemText = system.map((b) => b.text).join('\n');
    expect(systemText).toContain('Pitch');
  });

  it('includes brief client name in user prompt', () => {
    const { user } = buildPitch({ brief: { client: 'Acme', project: 'Test' } } as any);
    expect(user).toContain('Acme');
  });
});
```

- [ ] **Step 2: Kør og verificér fejl**

```bash
cd /Users/larssohl/Neura-Studio && npm test -- --reporter=verbose 2>&1 | grep -A5 'buildCritique\|buildPitch'
```

Forventet: fejl — funktionerne ikke importerede.

- [ ] **Step 3: Implementér buildCritique**

Append i `server/ai/prompts.ts` (efter BRAINSTORM-sektionen, ca. linje 900):

```typescript
// ---------------------------------------------------------------------------
// /api/critique — intern bureau-kritik af et kreativt artefakt
// ---------------------------------------------------------------------------

export interface CritiqueInput {
  role: string;
  artifact: string;
  context: string;
  language: string;
}

export function buildCritique(input: CritiqueInput): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  const systemRole = `Du er ${input.role} i et prisvindende reklamebureau, og du leder en intern overlevering.

Du modtager et kreativt artefakt produceret af et andet bureau-led. Din opgave er at vurdere om det holder mål — ikke at rose, men at sikre bureau-kvalitet.

${BUREAU_RUBRIC}

Vurder artefaktet brutalt ærligt mod bureau-rubrikken. Kom frem til en klar dom:
- "approved": artefaktet holder alle fire krav — gå videre.
- "revise": ét eller flere krav er brudt — angiv præcis hvad der skal ændres.

Vær konkret og handlingsanvisende. Ingen høflig ros. En kritik der ikke finder fejl er ubrugelig. Aflever via det angivne værktøj.`;

  const user = `${input.context ? `KONTEKST:\n${input.context}\n\n` : ''}ARTEFAKT TIL VURDERING:
"""
${input.artifact}
"""

Vurder artefaktet mod bureau-rubrikken og aflever din dom. Skriv på ${input.language || 'Dansk'}.`;

  return { system: cacheableSystem([systemRole]), user };
}
```

- [ ] **Step 4: Implementér buildPitch**

Append i `server/ai/prompts.ts` (direkte efter buildCritique):

```typescript
// ---------------------------------------------------------------------------
// /api/pitch — Pitch-producent: anbefalings-narrativ, talenoter, indvendinger
// ---------------------------------------------------------------------------

export interface PitchInput {
  brief: Brief;
  strategy?: StrategyFoundation | null;
  bigIdea?: ChosenIdea | null;
  channelMatrixSummary?: string;
  effectivenessSummary?: string;
  language?: string;
}

export function buildPitch(input: PitchInput): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  const { brief, strategy, bigIdea, channelMatrixSummary, effectivenessSummary } = input;
  const lang = input.language || brief.language || 'Dansk';

  const systemRole = `Du er Pitch-producent og Client Director i et prisvindende reklamebureau.

Du har gennemkørt den fulde bureau-motor: analyse, strategi, stor idé, konceptudvikling og effekt-lag. Nu skal du omsætte alt det arbejde til én overbevisende klientpræsentation.

Din opgave er at levere TRE ting:

1. ANBEFALINGS-NARRATIV — en salgsfortælling, ikke en opsummering:
   Situation → Spænding → Indsigt → Idéen → Beviset → Planen → The Ask.
   Hvert led bygger på det forrige. Det skal føles som en åbenbaring, ikke en PowerPoint-præsentation.

2. TALENOTER PR. SLIDE — hvad præsentøren siger, ikke hvad sliden viser:
   Hvert note skal have et klart retorisk formål (fx "skab erkendelse", "byg troværdighed", "lukker commitmentet").

3. INDVENDINGSHÅNDTERING — de 3-4 spørgsmål klienten VIL stille, med skarpe svar:
   Ingen blød undvigelse. Møde indvendingen direkte, konkret og overbevisende.

${BUREAU_RUBRIC}

Skriv som en der har vundet pitchen. Aflever via det angivne værktøj.`;

  const strategyBlock = strategy ? `\n${strategyContextText(strategy)}\n` : '';
  const ideaBlock = bigIdea ? `\n${campaignContextText(bigIdea)}\n` : '';
  const matrixBlock = channelMatrixSummary ? `\nKANAL-MATRIX (sammenfatning):\n${channelMatrixSummary}\n` : '';
  const effectBlock = effectivenessSummary ? `\nEFFEKT-LAG (sammenfatning):\n${effectivenessSummary}\n` : '';
  const intake = briefIntakeText(brief);

  const user = `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Beskrivelse: ${brief.description || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Kanaler: ${(brief.channels || []).join(', ') || 'N/A'}
${intake ? `\n${intake}\n` : ''}${strategyBlock}${ideaBlock}${matrixBlock}${effectBlock}
Byg nu klientpræsentationsmaterielet: anbefalings-narrativ, talenoter pr. slide og indvendingshåndtering. Aflever via værktøjet. Skriv på ${lang}.`;

  return { system: cacheableSystem([systemRole, cviSectionText(brief)]), user };
}
```

- [ ] **Step 5: Kør test og verificér grønt**

```bash
cd /Users/larssohl/Neura-Studio && npm test -- --reporter=verbose 2>&1 | grep -A3 'buildCritique\|buildPitch'
```

- [ ] **Step 6: Typecheck og commit**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint && git add server/ai/prompts.ts server/ai/prompts.test.ts && git commit -m "feat: tilføj buildCritique og buildPitch prompt builders"
```

---

### Task 5: /api/critique og /api/pitch i server.ts + revisionNotes på eksisterende endpoints

**Files:**
- Modify: `server.ts`

- [ ] **Step 1: Tilføj critiqueTool og pitchTool til imports i server.ts**

Find import-blokken fra `./server/ai/schemas` (linje ~32-44) og tilføj `critiqueTool, pitchTool` til den:

```typescript
import {
  generateTool,
  analyzeTool,
  analyzeCviTool,
  humanizeTool,
  variantsTool,
  brainstormTool,
  strategyTool,
  campaignPlatformTool,
  channelMatrixTool,
  effectivenessTool,
  logoPromptTool,
  imagePromptTool,
  critiqueTool,
  pitchTool,
} from './server/ai/schemas';
```

Tilføj også `buildCritique, buildPitch` til import fra `./server/ai/prompts`.

- [ ] **Step 2: Udvid /api/big-idea med revisionNotes**

Find `/api/big-idea` route (linje ~406). Ændr:

```typescript
// Eksisterende linje:
const { brief, strategy } = req.body;
```

Til:

```typescript
const { brief, strategy, revisionNotes } = req.body;
```

Og ændr `buildBigIdea`-kaldet til at sende `revisionNotes` i user-teksten. I `server/ai/prompts.ts`, opdatér slutningen af `buildBigIdea`'s user-streng:

```typescript
// Tilføj efter den eksisterende user-string, inden return:
const revisionBlock = Array.isArray(revisionNotesParam) && revisionNotesParam.length
  ? `\nREVISIONSNOTER FRA BUREAU-KRITIKKEN (SKAL ADRESSERES):\n${revisionNotesParam.map((n: string) => `- ${n}`).join('\n')}\n`
  : '';
```

Men en renere løsning er at tilføje `revisionNotes?: string[]` som parameter til `buildBigIdea`:

Ændr `buildBigIdea` signaturen i `prompts.ts`:

```typescript
export function buildBigIdea(
  brief: Brief,
  strategy?: StrategyFoundation | null,
  revisionNotes?: string[],
): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  const system = cacheableSystem([BIG_IDEA_SYSTEM_ROLE, cviSectionText(brief)]);
  const foundation = strategy ? strategyContextText(strategy) : '';
  const intake = briefIntakeText(brief);
  const revisionBlock = Array.isArray(revisionNotes) && revisionNotes.length
    ? `\nREVISIONSNOTER FRA BUREAU-KRITIKKEN (adressér disse præcist i den reviderede idé):\n${revisionNotes.map(n => `- ${n}`).join('\n')}\n`
    : '';
  const user = `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad lavede vi (Beskrivelse): ${brief.description || 'N/A'}
- Særlige detaljer: ${brief.details || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Tone: ${brief.tone || 'Professionel, menneskelig, kreativ'}
- Sprog: ${brief.language || 'Dansk'}
- Kanaler: ${(brief.channels || []).join(', ') || 'N/A'}
- Ekstra noter: ${brief.notes || 'N/A'}
${intake ? `\n${intake}\n` : ''}${foundation ? `\n${foundation}\n` : ''}${revisionBlock}
Udvikl nu TRE konkurrerende kreative ruter (kampagne-platforme) for dette projekt. Aflever via værktøjet. Skriv på ${brief.language || 'Dansk'} (kanal-navne må gerne være på engelsk hvis det er mest naturligt).`;

  return { system, user };
}
```

Opdatér server.ts `/api/big-idea` til at sende `revisionNotes`:

```typescript
const { system, user } = buildBigIdea(brief, strategy || null, revisionNotes || []);
```

- [ ] **Step 3: Tilføj /api/critique route**

Tilføj efter `/api/sharpen-idea` (linje ~467) i server.ts:

```typescript
  // Bureau-kritik: intern overlevering-kritik af et kreativt artefakt
  app.post('/api/critique', async (req, res) => {
    try {
      const { role, artifact, context, language } = req.body;
      if (!role || !artifact) {
        return res.status(400).json({ error: 'role og artifact er påkrævet.' });
      }

      const { system, user } = buildCritique({ role, artifact, context: context || '', language: language || 'Dansk' });
      const parsed = await generateStructured<any>({
        system,
        userContent: [{ type: 'text', text: user }],
        tool: critiqueTool,
        model: config.creativeModel,
        maxTokens: 2048,
      });

      res.json(parsed);
    } catch (error: any) {
      console.error('Fejl under bureau-kritik:', error);
      res.status(500).json({ error: error.message || 'Kunne ikke gennemføre bureau-kritikken.' });
    }
  });
```

- [ ] **Step 4: Tilføj /api/pitch route**

Tilføj efter `/api/critique`:

```typescript
  // Pitch-afdeling: anbefalings-narrativ, talenoter og indvendingshåndtering
  app.post('/api/pitch', async (req, res) => {
    try {
      const { brief, strategy, bigIdea, channelMatrixSummary, effectivenessSummary } = req.body;
      if (!brief) {
        return res.status(400).json({ error: 'Brief er påkrævet.' });
      }

      const { system, user } = buildPitch({
        brief,
        strategy: strategy || null,
        bigIdea: bigIdea || null,
        channelMatrixSummary: channelMatrixSummary || '',
        effectivenessSummary: effectivenessSummary || '',
      });
      let usageInfo: any = null;
      const parsed = await generateStructured<any>({
        system,
        userContent: [{ type: 'text', text: user }],
        tool: pitchTool,
        model: config.creativeModel,
        maxTokens: 4096,
        onUsage: (u) => { usageInfo = u; },
      });

      if (!parsed || !parsed.narrative) {
        throw new Error('Ufuldstændigt pitch-output fra Claude. Prøv igen.');
      }

      res.json({ ...parsed, _usage: usageInfo });
    } catch (error: any) {
      console.error('Fejl under pitch-generering:', error);
      res.status(500).json({ error: error.message || 'Kunne ikke generere pitch-materialet.' });
    }
  });
```

- [ ] **Step 5: Typecheck**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint
```

Forventet: ingen fejl.

- [ ] **Step 6: Kør alle tests**

```bash
cd /Users/larssohl/Neura-Studio && npm test
```

Forventet: alle tests grønne.

- [ ] **Step 7: Commit**

```bash
cd /Users/larssohl/Neura-Studio && git add server.ts server/ai/prompts.ts && git commit -m "feat: tilføj /api/critique og /api/pitch endpoints + revisionNotes på /api/big-idea"
```

---

### Task 6: Eksportér setCulturalIntel og setEffectiveness fra useCreativeFunnel

**Files:**
- Modify: `src/hooks/useCreativeFunnel.ts`

- [ ] **Step 1: Tilføj setCulturalIntel og setEffectiveness til return-objektet**

Find return-objektet (linje ~289-308) i `src/hooks/useCreativeFunnel.ts` og tilføj de to manglende setters:

```typescript
  return {
    // Kulturel antenne
    culturalIntel, setCulturalIntel, isScanning, handleCulturalScan, handleClearCulturalIntel,
    // Strategi-fundament
    strategy, setStrategy,
    isGeneratingStrategy, handleGenerateStrategy, handleClearStrategy,
    // Den Store Idé / kampagne-platform
    campaignPlatform, setCampaignPlatform,
    isGeneratingCampaign, handleGenerateBigIdea,
    selectedTerritory, handleSelectTerritory, handleClearTerritory,
    // ECD pres-test af Idéen
    pressureTest, isSharpening, sharpeningTarget,
    handleSharpenIdea, handleAdoptSharpened, handleClearPressureTest,
    // Omni-channel matrix
    channelMatrix, setChannelMatrix,
    isGeneratingMatrix, handleGenerateChannelMatrix, handleClearChannelMatrix,
    // Effekt-lag
    effectiveness, setEffectiveness, isGeneratingEffectiveness,
    handleGenerateEffectiveness, handleClearEffectiveness,
  };
```

- [ ] **Step 2: Typecheck og commit**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint && git add src/hooks/useCreativeFunnel.ts && git commit -m "refactor: eksportér setCulturalIntel og setEffectiveness fra useCreativeFunnel"
```

---

### Task 7: useBureauMode hook

**Files:**
- Create: `src/hooks/useBureauMode.ts`

- [ ] **Step 1: Opret src/hooks/useBureauMode.ts**

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import {
  ProjectBrief, UsageInfo, CulturalScanResult, StrategyFoundation,
  CampaignPlatform, CampaignTerritory, ChannelMatrix, EffectivenessFramework,
  BrandSurfaceOutput, CritiqueResult, BureauStageState, BureauStageStatus, PitchResult,
} from '../types';

export interface BureauModeDeps {
  brief: ProjectBrief;
  setLastUsage: Dispatch<SetStateAction<UsageInfo | null>>;
  setErrorMsg: Dispatch<SetStateAction<string | null>>;
  setCulturalIntel: Dispatch<SetStateAction<CulturalScanResult | null>>;
  setStrategy: Dispatch<SetStateAction<StrategyFoundation | null>>;
  setCampaignPlatform: Dispatch<SetStateAction<CampaignPlatform | null>>;
  handleSelectTerritory: (t: CampaignTerritory) => void;
  setChannelMatrix: Dispatch<SetStateAction<ChannelMatrix | null>>;
  setEffectiveness: Dispatch<SetStateAction<EffectivenessFramework | null>>;
  setOutput: Dispatch<SetStateAction<BrandSurfaceOutput | null>>;
}

const INITIAL_STAGES: Omit<BureauStageState, 'status' | 'streamText'>[] = [
  { id: 'cultural-scan',  role: 'Analysechef',       title: 'Kulturel antenne' },
  { id: 'strategy',       role: 'Chefstrateg',        title: 'Strategi-fundament' },
  { id: 'big-idea',       role: 'Kreativ Direktør',   title: 'Den Store Idé' },
  { id: 'critique-idea',  role: 'Chefstrateg',        title: 'Kritik af idéen' },
  { id: 'channel-matrix', role: 'Konceptudvikler',    title: 'Omni-channel matrix' },
  { id: 'copy',           role: 'Tekstforfatter',     title: 'Copy-pakke' },
  { id: 'critique-copy',  role: 'Kreativ Direktør',   title: 'Kritik af copy' },
  { id: 'effectiveness',  role: 'Effekt-chef',        title: 'Effekt-lag' },
  { id: 'pitch',          role: 'Pitch-producent',    title: 'Klientpræsentation' },
];

function makeStages(): BureauStageState[] {
  return INITIAL_STAGES.map(s => ({ ...s, status: 'idle' as BureauStageStatus, streamText: '' }));
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error((errData as any).error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function readSse(
  url: string,
  body: unknown,
  onDelta: (delta: string) => void,
  signal?: AbortSignal,
): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error((errData as any).error || `HTTP ${res.status}`);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let finalPayload: any = null;
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') break;
      try {
        const json = JSON.parse(raw);
        if (json.delta) onDelta(json.delta);
        if (json.done) finalPayload = json;
      } catch {}
    }
  }
  return finalPayload;
}

export function useBureauMode(deps: BureauModeDeps) {
  const {
    brief, setLastUsage, setErrorMsg,
    setCulturalIntel, setStrategy, setCampaignPlatform,
    handleSelectTerritory, setChannelMatrix, setEffectiveness, setOutput,
  } = deps;

  const [bureauModeActive, setBureauModeActive] = useState(false);
  const [stages, setStages] = useState<BureauStageState[]>(makeStages);
  const [isRunning, setIsRunning] = useState(false);
  const [pitchResult, setPitchResult] = useState<PitchResult | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const updateStage = useCallback((id: string, patch: Partial<BureauStageState>) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const runBureau = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStages(makeStages());
    setPitchResult(null);
    const abort = new AbortController();
    abortRef.current = abort;

    // Pipeline-state — akkumuleres og videregives mellem stadier.
    let culturalIntel: CulturalScanResult | null = null;
    let strategy: StrategyFoundation | null = null;
    let territory: CampaignTerritory | null = null;
    let channelMatrix: ChannelMatrix | null = null;
    let effectiveness: EffectivenessFramework | null = null;
    let output: BrandSurfaceOutput | null = null;

    const run = async () => {
      // ── 1. Kulturel antenne ──────────────────────────────────────────
      try {
        updateStage('cultural-scan', { status: 'working' });
        const data = await postJson<CulturalScanResult>('/api/cultural-scan', { brief });
        culturalIntel = data;
        setCulturalIntel(data);
        updateStage('cultural-scan', { status: 'done' });
      } catch (err: any) {
        updateStage('cultural-scan', { status: 'error', error: err.message });
        // Kulturel antenne er valgfri — fortsæt.
      }
      if (abort.signal.aborted) return;

      // ── 2. Strategi ─────────────────────────────────────────────────
      try {
        updateStage('strategy', { status: 'working' });
        const raw = await postJson<any>('/api/strategy', { brief, culturalIntel });
        const { _usage, ...foundation } = raw;
        strategy = foundation as StrategyFoundation;
        setStrategy(strategy);
        if (_usage) setLastUsage(_usage);
        updateStage('strategy', { status: 'done' });
      } catch (err: any) {
        updateStage('strategy', { status: 'error', error: err.message });
        // Strategi fejlede — kan ikke fortsætte uden den.
        return;
      }
      if (abort.signal.aborted) return;

      // ── 3. Den Store Idé ─────────────────────────────────────────────
      try {
        updateStage('big-idea', { status: 'working' });
        const raw = await postJson<any>('/api/big-idea', { brief, strategy });
        const { _usage, ...platform } = raw;
        const campaignPlatform = platform as CampaignPlatform;
        setCampaignPlatform(campaignPlatform);
        if (_usage) setLastUsage(_usage);
        territory = campaignPlatform.territories?.[0] ?? null;
        if (territory) handleSelectTerritory(territory);
        updateStage('big-idea', { status: 'done' });
      } catch (err: any) {
        updateStage('big-idea', { status: 'error', error: err.message });
        return;
      }
      if (abort.signal.aborted) return;

      // ── 4. Kritik af idéen (Chefstrateg) ────────────────────────────
      if (territory && strategy) {
        try {
          updateStage('critique-idea', { status: 'critiquing' });
          const stratCtx = `Single-minded proposition: ${strategy.singleMindedProposition || 'N/A'}. Audience truth: ${strategy.audienceTruth || 'N/A'}.`;
          const artifact = `Idé: ${territory.bigIdea}\nTagline: ${territory.tagline}\nManifest: ${territory.manifesto}`;
          const critique = await postJson<CritiqueResult>('/api/critique', {
            role: 'Chefstrateg',
            artifact,
            context: stratCtx,
            language: brief.language || 'Dansk',
          });
          updateStage('critique-idea', { status: 'done', critiqueVerdict: critique.verdict });

          if (critique.verdict === 'revise' && critique.revisionNotes.length > 0) {
            updateStage('critique-idea', { status: 'revising' });
            const raw = await postJson<any>('/api/big-idea', { brief, strategy, revisionNotes: critique.revisionNotes });
            const { _usage, ...revised } = raw;
            const revisedPlatform = revised as CampaignPlatform;
            setCampaignPlatform(revisedPlatform);
            if (_usage) setLastUsage(_usage);
            territory = revisedPlatform.territories?.[0] ?? territory;
            if (territory) handleSelectTerritory(territory);
            updateStage('critique-idea', { status: 'done' });
          }
        } catch (err: any) {
          updateStage('critique-idea', { status: 'error', error: err.message });
          // Kritik-fejl er ikke blokerende.
        }
      } else {
        updateStage('critique-idea', { status: 'skipped' });
      }
      if (abort.signal.aborted) return;

      // ── 5. Omni-channel matrix ───────────────────────────────────────
      if (territory) {
        try {
          updateStage('channel-matrix', { status: 'working' });
          const raw = await postJson<any>('/api/channel-matrix', { brief, chosenIdea: territory, strategy });
          const { _usage, ...matrix } = raw;
          channelMatrix = matrix as ChannelMatrix;
          setChannelMatrix(channelMatrix);
          if (_usage) setLastUsage(_usage);
          updateStage('channel-matrix', { status: 'done' });
        } catch (err: any) {
          updateStage('channel-matrix', { status: 'error', error: err.message });
        }
      } else {
        updateStage('channel-matrix', { status: 'skipped' });
      }
      if (abort.signal.aborted) return;

      // ── 6. Copy-pakke (generate-deep via SSE) ───────────────────────
      try {
        updateStage('copy', { status: 'working' });
        const payload = await readSse(
          '/api/generate-deep',
          { brief, chosenIdea: territory || null },
          (delta) => updateStage('copy', { streamText: delta }),
          abort.signal,
        );
        if (payload?.output) {
          output = payload.output as BrandSurfaceOutput;
          setOutput(output);
        }
        updateStage('copy', { status: 'done', streamText: '' });
      } catch (err: any) {
        if (abort.signal.aborted) return;
        updateStage('copy', { status: 'error', error: err.message });
      }
      if (abort.signal.aborted) return;

      // ── 7. Kritik af copy (Kreativ Direktør) ─────────────────────────
      if (output) {
        try {
          updateStage('critique-copy', { status: 'critiquing' });
          const artifact = `Kort case-tekst:\n${output.shortCaseText}\n\nLinkedIn:\n${output.linkedinPost}\n\nBedste overskrift:\n${output.directUsable?.bestHeadline || output.headlines?.[0] || ''}`;
          const ideaCtx = territory ? `Kampagne-platform: ${territory.bigIdea}. Tagline: ${territory.tagline}.` : '';
          const critique = await postJson<CritiqueResult>('/api/critique', {
            role: 'Kreativ Direktør',
            artifact,
            context: ideaCtx,
            language: brief.language || 'Dansk',
          });
          updateStage('critique-copy', { status: 'done', critiqueVerdict: critique.verdict });
          // Copy-revision ved behov sker i en ny generate-deep — her markeres det kun.
        } catch (err: any) {
          updateStage('critique-copy', { status: 'error', error: err.message });
        }
      } else {
        updateStage('critique-copy', { status: 'skipped' });
      }
      if (abort.signal.aborted) return;

      // ── 8. Effekt-lag ────────────────────────────────────────────────
      if (territory) {
        try {
          updateStage('effectiveness', { status: 'working' });
          const channels = channelMatrix?.channels?.map(c => c.channel).filter(Boolean) ?? brief.channels;
          const raw = await postJson<any>('/api/effectiveness', { brief, chosenIdea: territory, strategy, channels });
          const { _usage, ...framework } = raw;
          effectiveness = framework as EffectivenessFramework;
          setEffectiveness(effectiveness);
          if (_usage) setLastUsage(_usage);
          updateStage('effectiveness', { status: 'done' });
        } catch (err: any) {
          updateStage('effectiveness', { status: 'error', error: err.message });
        }
      } else {
        updateStage('effectiveness', { status: 'skipped' });
      }
      if (abort.signal.aborted) return;

      // ── 9. Pitch ────────────────────────────────────────────────────
      try {
        updateStage('pitch', { status: 'working' });
        const matrixSummary = channelMatrix?.channels?.slice(0, 3).map(c => `${c.channel}: ${c.headline}`).join('; ') || '';
        const effectSummary = effectiveness ? `Business objective: ${effectiveness.businessObjective}. Success: ${effectiveness.successScenario}` : '';
        const raw = await postJson<any>('/api/pitch', {
          brief,
          strategy,
          bigIdea: territory,
          channelMatrixSummary: matrixSummary,
          effectivenessSummary: effectSummary,
        });
        const { _usage, ...pitchData } = raw;
        if (_usage) setLastUsage(_usage);
        setPitchResult(pitchData as PitchResult);
        updateStage('pitch', { status: 'done' });
      } catch (err: any) {
        updateStage('pitch', { status: 'error', error: err.message });
      }
    };

    try {
      await run();
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [isRunning, brief, setLastUsage, setErrorMsg, setCulturalIntel, setStrategy, setCampaignPlatform, handleSelectTerritory, setChannelMatrix, setEffectiveness, setOutput, updateStage]);

  const abortBureau = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
    setStages(prev => prev.map(s =>
      s.status === 'working' || s.status === 'critiquing' || s.status === 'revising'
        ? { ...s, status: 'error' as BureauStageStatus, error: 'Afbrudt' }
        : s,
    ));
  }, []);

  const handleGeneratePitch = useCallback(async () => {
    setIsGeneratingPitch(true);
    try {
      const raw = await postJson<any>('/api/pitch', { brief });
      const { _usage, ...pitchData } = raw;
      if (_usage) setLastUsage(_usage);
      setPitchResult(pitchData as PitchResult);
    } catch (err: any) {
      setErrorMsg(err.message || 'Kunne ikke generere pitch-materialet.');
    } finally {
      setIsGeneratingPitch(false);
    }
  }, [brief, setLastUsage, setErrorMsg]);

  return {
    bureauModeActive, setBureauModeActive,
    stages, isRunning,
    runBureau, abortBureau,
    pitchResult, isGeneratingPitch, handleGeneratePitch,
  };
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint
```

Forventet: ingen fejl.

- [ ] **Step 3: Commit**

```bash
cd /Users/larssohl/Neura-Studio && git add src/hooks/useBureauMode.ts && git commit -m "feat: useBureauMode pipeline-orkestrator med critique-loop og pitch"
```

---

### Task 8: Wire useBureauMode ind i useContentMachine

**Files:**
- Modify: `src/hooks/useContentMachine.ts`

- [ ] **Step 1: Importer useBureauMode i useContentMachine**

Find import-sektionen i `src/hooks/useContentMachine.ts` og tilføj:

```typescript
import { useBureauMode } from './useBureauMode';
```

Tilføj også `PitchResult` til importen fra `../types`.

- [ ] **Step 2: Instansiér useBureauMode inde i useContentMachine**

Find stedet i `useContentMachine` hvor `useCreativeFunnel` destructures (kig efter `const { ... } = useCreativeFunnel(...)`). Tilføj efter den blok:

```typescript
  const bureau = useBureauMode({
    brief,
    setLastUsage,
    setErrorMsg,
    setCulturalIntel: funnel.setCulturalIntel,
    setStrategy: funnel.setStrategy,
    setCampaignPlatform: funnel.setCampaignPlatform,
    handleSelectTerritory: funnel.handleSelectTerritory,
    setChannelMatrix: funnel.setChannelMatrix,
    setEffectiveness: funnel.setEffectiveness,
    setOutput,
  });
```

OBS: Kodebasen bruger sandsynligvis spread-destructuring. Tilpas til den faktiske måde `useCreativeFunnel` bruges på i `useContentMachine`. Hvis det er `const { culturalIntel, setCulturalIntel, ... } = useCreativeFunnel(...)`, kan du referere direkte til `setCulturalIntel` mv.

- [ ] **Step 3: Eksportér bureau-state fra useContentMachine**

Find return-objektet for `useContentMachine` og tilføj:

```typescript
    // Bureau-mode
    bureauModeActive: bureau.bureauModeActive,
    setBureauModeActive: bureau.setBureauModeActive,
    bureauStages: bureau.stages,
    isBureauRunning: bureau.isRunning,
    runBureau: bureau.runBureau,
    abortBureau: bureau.abortBureau,
    pitchResult: bureau.pitchResult,
    isGeneratingPitch: bureau.isGeneratingPitch,
    handleGeneratePitch: bureau.handleGeneratePitch,
```

- [ ] **Step 4: Typecheck**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint
```

Ret evt. TypeScript-fejl. Typiske problemer: `setCulturalIntel` ikke i scope (navnsæt matcher `useCreativeFunnel` return-nøgle fra Task 6).

- [ ] **Step 5: Commit**

```bash
cd /Users/larssohl/Neura-Studio && git add src/hooks/useContentMachine.ts && git commit -m "feat: wire useBureauMode ind i useContentMachine og eksportér bureau-state"
```

---

## Etape 3 — BureauFloor-UI

### Task 9: BureauFloor-komponent

**Files:**
- Create: `src/components/BureauFloor.tsx`

- [ ] **Step 1: Opret src/components/BureauFloor.tsx**

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Building2, CheckCircle2, AlertCircle, Clock, Loader2, MessageSquare, RefreshCw, SkipForward } from 'lucide-react';
import type { BureauStageState, BureauStageStatus } from '../types';

interface BureauFloorProps {
  stages: BureauStageState[];
  isRunning: boolean;
  onRun: () => void;
  onAbort: () => void;
}

const STATUS_CONFIG: Record<BureauStageStatus, { label: string; color: string; icon: React.ReactNode }> = {
  idle:       { label: 'Venter',     color: 'text-slate-500 border-slate-700 bg-slate-900',          icon: <Clock className="w-3.5 h-3.5" /> },
  working:    { label: 'Arbejder',   color: 'text-blue-400 border-blue-500/40 bg-blue-500/10',       icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  critiquing: { label: 'Kritiserer', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10',   icon: <MessageSquare className="w-3.5 h-3.5" /> },
  revising:   { label: 'Reviderer',  color: 'text-violet-400 border-violet-500/40 bg-violet-500/10', icon: <RefreshCw className="w-3.5 h-3.5 animate-spin" /> },
  done:       { label: 'Færdig',     color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  error:      { label: 'Fejlet',     color: 'text-red-400 border-red-500/40 bg-red-500/10',         icon: <AlertCircle className="w-3.5 h-3.5" /> },
  skipped:    { label: 'Sprunget',   color: 'text-slate-600 border-slate-800 bg-slate-900/50',      icon: <SkipForward className="w-3.5 h-3.5" /> },
};

function StageCard({ stage }: { stage: BureauStageState }) {
  const cfg = STATUS_CONFIG[stage.status];
  return (
    <div className={`rounded-xl border p-4 transition-all duration-300 ${cfg.color}`}>
      <div className="flex items-center justify-between mb-1">
        <div>
          <span className="block text-[11px] font-semibold uppercase tracking-wider opacity-70">{stage.role}</span>
          <span className="block text-sm font-medium">{stage.title}</span>
        </div>
        <span className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border ${cfg.color}`}>
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {stage.streamText && (
        <p className="mt-2 text-[11px] text-slate-400 font-mono leading-relaxed line-clamp-2">
          {stage.streamText}
        </p>
      )}

      {stage.critiqueVerdict && (
        <div className={`mt-2 flex items-center gap-1.5 text-[11px] font-medium ${stage.critiqueVerdict === 'approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
          {stage.critiqueVerdict === 'approved' ? <CheckCircle2 className="w-3 h-3" /> : <RefreshCw className="w-3 h-3" />}
          {stage.critiqueVerdict === 'approved' ? 'Godkendt af kritiker' : 'Revideret efter kritik'}
        </div>
      )}

      {stage.error && (
        <p className="mt-2 text-[11px] text-red-400/80">{stage.error}</p>
      )}
    </div>
  );
}

export function BureauFloor({ stages, isRunning, onRun, onAbort }: BureauFloorProps) {
  const doneCount = stages.filter(s => s.status === 'done').length;
  const hasStarted = stages.some(s => s.status !== 'idle');

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-orange-600/15 border border-brand-orange-500/30 flex items-center justify-center shrink-0">
            <Building2 className="w-4 h-4 text-brand-orange-500" />
          </div>
          <div>
            <span className="block font-display font-medium text-sm text-white">Bureau-mode</span>
            <span className="block text-[11px] text-slate-400">
              {isRunning
                ? `Kører pipeline… ${doneCount}/${stages.length} stadier færdige`
                : hasStarted
                  ? `${doneCount}/${stages.length} stadier færdige`
                  : 'Kør den fulde bureau-pipeline fra analyse til pitch'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isRunning && (
            <button
              onClick={onAbort}
              className="px-3 py-1.5 text-[11px] font-mono rounded-lg border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              Afbryd
            </button>
          )}
          {!isRunning && (
            <button
              onClick={onRun}
              className="px-3 py-1.5 text-[11px] font-mono rounded-lg border border-brand-orange-500/40 text-brand-orange-400 bg-brand-orange-500/10 hover:bg-brand-orange-500/20 transition-colors"
            >
              {hasStarted ? 'Kør igen' : 'Start bureau'}
            </button>
          )}
        </div>
      </div>

      {/* Stage grid */}
      {hasStarted && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {stages.map(stage => (
            <StageCard key={stage.id} stage={stage} />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint
```

Forventet: ingen fejl. Hvis `brand-orange` Tailwind-klasser giver problemer, erstat med `orange-500`.

- [ ] **Step 3: Commit**

```bash
cd /Users/larssohl/Neura-Studio && git add src/components/BureauFloor.tsx && git commit -m "feat: BureauFloor-komponent med rolle-kort, live-status og kritik-øjeblikke"
```

---

### Task 10: Bureau-mode toggle i Toolbar og montering i App

**Files:**
- Modify: `src/components/Toolbar.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Tilføj bureau-mode toggle til Toolbar**

Tilføj `bureauModeActive` og `setBureauModeActive` til `ToolbarProps`-interfacet i `Toolbar.tsx`:

```typescript
interface ToolbarProps {
  output: BrandSurfaceOutput | null;
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  setErrorMsg: Dispatch<SetStateAction<string | null>>;
  terminalCommand: string;
  setTerminalCommand: Dispatch<SetStateAction<string>>;
  handleExecuteTerminalCommand: (e: FormEvent) => void;
  bureauModeActive: boolean;
  setBureauModeActive: (v: boolean) => void;
}
```

Tilføj `bureauModeActive, setBureauModeActive` til destructuring i `Toolbar`-funktionen.

Tilføj følgende knap i header-baren (efter den eksisterende `<span>Navigér & forfin</span>` span):

```tsx
              <button
                type="button"
                onClick={() => setBureauModeActive(!bureauModeActive)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono rounded-lg border transition-all ${
                  bureauModeActive
                    ? 'border-brand-orange-500/50 text-brand-orange-400 bg-brand-orange-500/10'
                    : 'border-slate-700 text-slate-400 hover:text-slate-200 bg-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Bureau
              </button>
```

Importer `Building2` fra `lucide-react` øverst i filen.

- [ ] **Step 2: Opdatér App.tsx til at sende props til Toolbar**

Find `<Toolbar ... />` i `App.tsx`. Tilføj props:

```tsx
<Toolbar
  ...eksisterende props...
  bureauModeActive={bureauModeActive}
  setBureauModeActive={setBureauModeActive}
/>
```

Tilføj `bureauModeActive, setBureauModeActive` til destructuring fra `useContentMachine()`.

- [ ] **Step 3: Montér BureauFloor i App.tsx**

Importer `BureauFloor` og `PitchPanel` (oprettes i næste task) øverst i `App.tsx`:

```typescript
import { BureauFloor } from './components/BureauFloor';
```

Find stedet i `App.tsx` hvor `<FunnelPanels ... />` monteres (i main-grid). Tilføj **over** `FunnelPanels`:

```tsx
          {/* BUREAU-MODE FLOOR */}
          {bureauModeActive && (
            <div className="lg:col-span-12">
              <BureauFloor
                stages={bureauStages}
                isRunning={isBureauRunning}
                onRun={runBureau}
                onAbort={abortBureau}
              />
            </div>
          )}
```

Tilføj `bureauStages, isBureauRunning, runBureau, abortBureau` til destructuring fra `useContentMachine()`.

- [ ] **Step 4: Typecheck**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint
```

- [ ] **Step 5: Commit**

```bash
cd /Users/larssohl/Neura-Studio && git add src/components/Toolbar.tsx src/App.tsx && git commit -m "feat: bureau-mode toggle i Toolbar + BureauFloor monteret i App (v1.23.0)"
```

Bump version i `package.json`, `AppHeader.tsx` og `App.tsx` til `1.23.0`.

---

## Etape 4 — Pitch-afdeling + deck-opgradering

### Task 11: PitchPanel-komponent

**Files:**
- Create: `src/components/PitchPanel.tsx`

- [ ] **Step 1: Opret src/components/PitchPanel.tsx**

```typescript
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Presentation, ChevronDown, ChevronRight, MessageCircleQuestion, FileText, Sparkles } from 'lucide-react';
import type { PitchResult } from '../types';

interface PitchPanelProps {
  pitchResult: PitchResult | null;
  isGenerating: boolean;
  canGenerate: boolean;
  onGenerate: () => void;
}

export function PitchPanel({ pitchResult, isGenerating, canGenerate, onGenerate }: PitchPanelProps) {
  const [narrativeOpen, setNarrativeOpen] = useState(true);
  const [notesOpen, setNotesOpen] = useState(false);
  const [objectionsOpen, setObjectionsOpen] = useState(false);

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600/15 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Presentation className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <span className="block font-display font-medium text-sm text-white flex items-center gap-1.5">
              Pitch-afdeling
              {pitchResult && <Sparkles className="w-3 h-3 text-amber-400" />}
            </span>
            <span className="block text-[11px] text-slate-400">
              Anbefalings-narrativ, talenoter og indvendingshåndtering
            </span>
          </div>
        </div>
        {canGenerate && (
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-3 py-1.5 text-[11px] font-mono rounded-lg border border-violet-500/40 text-violet-400 bg-violet-500/10 hover:bg-violet-500/20 disabled:opacity-50 transition-colors"
          >
            {isGenerating ? 'Pitcher…' : pitchResult ? 'Regenerér' : 'Generér pitch'}
          </button>
        )}
      </div>

      {!pitchResult && !isGenerating && (
        <div className="px-5 py-8 text-center text-slate-500 text-sm">
          {canGenerate
            ? 'Klik "Generér pitch" for at lave anbefalings-narrativ og klientmateriale.'
            : 'Kør Den Store Idé eller Bureau-mode for at aktivere pitch-afdelingen.'}
        </div>
      )}

      {isGenerating && (
        <div className="px-5 py-8 text-center text-violet-400 text-sm animate-pulse">
          Pitch-producenten arbejder…
        </div>
      )}

      {pitchResult && (
        <div className="divide-y divide-slate-800">
          {/* Narrativ */}
          <div>
            <button
              onClick={() => setNarrativeOpen(o => !o)}
              className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-900/40 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <FileText className="w-4 h-4 text-violet-400" />
                Anbefalings-narrativ
              </span>
              {narrativeOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
            </button>
            {narrativeOpen && (
              <div className="px-5 pb-4">
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                  {pitchResult.narrative}
                </p>
              </div>
            )}
          </div>

          {/* Talenoter */}
          {pitchResult.slideNotes.length > 0 && (
            <div>
              <button
                onClick={() => setNotesOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-900/40 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <Presentation className="w-4 h-4 text-violet-400" />
                  Talenoter ({pitchResult.slideNotes.length} slides)
                </span>
                {notesOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>
              {notesOpen && (
                <div className="px-5 pb-4 space-y-3">
                  {pitchResult.slideNotes.map((note, i) => (
                    <div key={i} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                      <span className="block text-[11px] font-semibold text-violet-400 mb-1">{note.slide}</span>
                      <p className="text-xs text-slate-300 leading-relaxed mb-2">{note.note}</p>
                      <span className="block text-[10px] text-slate-500 italic">Retorisk formål: {note.rhetoricalPurpose}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Indvendinger */}
          {pitchResult.objections.length > 0 && (
            <div>
              <button
                onClick={() => setObjectionsOpen(o => !o)}
                className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-slate-900/40 transition-colors"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                  <MessageCircleQuestion className="w-4 h-4 text-violet-400" />
                  Indvendingshåndtering ({pitchResult.objections.length})
                </span>
                {objectionsOpen ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </button>
              {objectionsOpen && (
                <div className="px-5 pb-4 space-y-3">
                  {pitchResult.objections.map((obj, i) => (
                    <div key={i} className="bg-slate-900 rounded-lg p-3 border border-slate-800">
                      <span className="block text-xs font-semibold text-amber-400 mb-1">❝ {obj.question}</span>
                      <p className="text-xs text-slate-300 leading-relaxed">{obj.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck og commit**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint && git add src/components/PitchPanel.tsx && git commit -m "feat: PitchPanel med narrativ, talenoter og indvendingshåndtering"
```

---

### Task 12: Montér PitchPanel i App.tsx + deck-opgradering

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/lib/exportDeck.ts`

- [ ] **Step 1: Importer og montér PitchPanel i App.tsx**

Tilføj import:

```typescript
import { PitchPanel } from './components/PitchPanel';
```

Find stedet i App.tsx hvor `EffectivenessPanel` eller `FunnelPanels` monteres. Tilføj `PitchPanel` i den relevante sektion (efter effekt-lag):

```tsx
<PitchPanel
  pitchResult={pitchResult}
  isGenerating={isGeneratingPitch}
  canGenerate={!!(selectedTerritory || output)}
  onGenerate={handleGeneratePitch}
/>
```

Tilføj `pitchResult, isGeneratingPitch, handleGeneratePitch` til destructuring fra `useContentMachine()`.

- [ ] **Step 2: Opdatér DeckInput i exportDeck.ts**

Find `interface DeckInput` i `src/lib/exportDeck.ts` (linje ~20) og tilføj:

```typescript
import type { PitchResult } from '../types';

// I DeckInput interface:
pitch?: PitchResult | null;
```

- [ ] **Step 3: Flet pitch-narrativ ind i deck**

Find i `buildDeckHtml` de eksisterende slides (linje ~77). Tilføj to nye slides **til sidst** i slides-arrayet, before den afsluttende HTML:

```typescript
  // Pitch-narrativ slide
  if (input.pitch?.narrative) {
    slides.push(
      slide(
        'Anbefalingen',
        `<h1 class="deck-h1">Vores anbefaling</h1>
         <div class="deck-body" style="white-space:pre-line;font-size:0.85em;line-height:1.7;">${esc(input.pitch.narrative)}</div>`,
      ),
    );
  }

  // Indvendingshåndtering slide
  if (input.pitch?.objections?.length) {
    const objHtml = input.pitch.objections
      .map(o => `<div class="deck-qa"><p class="deck-q">${esc(o.question)}</p><p class="deck-a">${esc(o.answer)}</p></div>`)
      .join('');
    slides.push(
      slide(
        'Q&A',
        `<h1 class="deck-h1">Forventede spørgsmål</h1><div class="deck-body">${objHtml}</div>`,
      ),
    );
  }
```

Tilføj CSS for `.deck-qa`, `.deck-q`, `.deck-a` til deck-stylesheetet i `buildDeckHtml`:

```css
.deck-qa { margin: 0.6em 0; }
.deck-q { font-weight: 600; color: var(--primary); font-size: 0.85em; margin-bottom: 0.2em; }
.deck-a { font-size: 0.8em; color: #e2e8f0; line-height: 1.5; }
```

- [ ] **Step 4: Find handleExportDeck i useContentMachine og send pitch med**

Find `handleExportDeck` i `src/hooks/useContentMachine.ts`. Tilføj `pitch: bureau.pitchResult` til `DeckInput`-objektet:

```typescript
const deckInput: DeckInput = {
  brief,
  territory: selectedTerritory!,
  strategy: strategy || null,
  channelMatrix: channelMatrix || null,
  effectiveness: effectiveness || null,
  output: output || null,
  logoSrc: ...,
  logoSvg: ...,
  images: ...,
  pitch: bureau.pitchResult,  // ← tilføjet
};
```

- [ ] **Step 5: Typecheck og kør alle tests**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint && npm test
```

Forventet: ingen fejl, alle tests grønne.

- [ ] **Step 6: Commit**

```bash
cd /Users/larssohl/Neura-Studio && git add src/App.tsx src/lib/exportDeck.ts src/hooks/useContentMachine.ts && git commit -m "feat: montér PitchPanel + flet pitch-narrativ ind i pitch-deck eksport"
```

---

## Slut-verificering

- [ ] **Typecheck**

```bash
cd /Users/larssohl/Neura-Studio && npm run lint
```

- [ ] **Alle tests**

```bash
cd /Users/larssohl/Neura-Studio && npm test
```

- [ ] **Verificér version er 1.23.0 i alle tre filer**

```bash
grep -n '"version"\|v1\.23' /Users/larssohl/Neura-Studio/package.json /Users/larssohl/Neura-Studio/src/components/AppHeader.tsx /Users/larssohl/Neura-Studio/src/App.tsx
```

Alle tre skal vise `1.23.0`.

---

## Spec-dækning check

| Spec-krav | Dækket af |
|---|---|
| Bureau-mode toggle | Task 10 (Toolbar) |
| Synlige rolle-kort med status | Task 9 (BureauFloor) |
| Kritik-loop (strateg + KD) | Task 7 (useBureauMode stages 4+7) |
| Maks én revisionsrunde | Task 7 (critique → revisionNotes → re-call) |
| Fejlet stadie stopper ikke pipeline | Task 7 (try/catch pr. stadie, kun afhængige blokeres) |
| Afbryd pipeline | Task 7 + 9 (abortBureau + Afbryd-knap) |
| Pitch-afdeling | Task 11 + 12 |
| Pitch i deck-eksport | Task 12 |
| Pitch kan køres manuelt | Task 7 (handleGeneratePitch), Task 11 (onGenerate) |
| BUREAU_RUBRIC i prompts | Task 1 + 4 |
| GENERATE_SYSTEM_ROLE opgraderet | Task 1 |
| /api/critique endpoint | Task 5 |
| /api/pitch endpoint | Task 5 |
| revisionNotes på /api/big-idea | Task 5 |
| Session-persistens uændret | Aldrig rørte localStorage-nøgler |
| Ingen nye env-variabler | Genbruger config.creativeModel |
| Version 1.23.0 | Task 10 (bump) |
