# Bureau-mode — Design-spec

**Dato:** 2026-06-11
**Status:** Godkendt af Lars
**Mål-version:** 1.23.0 (minor)

## Formål

Løfte Neura Studio til verdensklasse reklamebureau-niveau ad tre veje:

1. **Bureau-mode** — et opt-in orkestreringslag der kører den eksisterende kreative funnel som et synligt bureau med navngivne roller, der kritiserer hinandens arbejde.
2. **Pitch-afdeling** — ny disciplin: anbefalings-narrativ, talenoter og indvendingshåndtering, flettet ind i pitch-deck-eksporten.
3. **Prompt-kvalitetsløft** — alle prompt builders gennemgås mod én fælles bureau-rubrik.

Standard-mode forbliver uændret, hurtigt og billigt. Bureau-mode er en dirigent oven på eksisterende endpoints — ikke en ny motor.

## 1. Arkitektur: klient-side orkestrering

Ny hook `src/hooks/useBureauMode.ts` kører eksisterende funnel-stadier i sekvens og mapper dem til roller:

| Rolle | Drives af | Eksisterende? |
|---|---|---|
| Analysechef | `/api/cultural-scan` | Ja |
| Chefstrateg | `/api/strategy` | Ja |
| Kreativ Direktør | `/api/big-idea` + `/api/sharpen-idea` | Ja |
| Konceptudvikler | `/api/channel-matrix` | Ja |
| Tekstforfatter | `/api/generate-deep` | Ja |
| Art Director | `/api/visual-deep` | Ja |
| Effekt-chef | `/api/effectiveness` | Ja |
| Pitch-producent | `/api/pitch` | **Ny** |

**Begrundelse for klient-side:** hvert stadie lander i de eksisterende state-slots i `useCreativeFunnel`/`useContentMachine`, så alle nuværende paneler, eksporter og session-persistens virker uændret.

**Afhængighedsgraf:** strategi kræver intet; big idea kræver strategi; copy, koncept og pitch kræver big idea. Cultural scan, visual og effekt kan springes over uden at blokere efterfølgende stadier.

## 2. Kritik-loop

Nyt endpoint `POST /api/critique` (prompt builder i `server/ai/prompts.ts`, tool-schema i `server/ai/schemas.ts`):

- **Input:** `{ role, artifact, context }`
- **Output (struktureret):** dom (`approved` | `revise`), begrundelse, konkrete revisionspunkter

Orkestratoren indsætter **maks én revisionsrunde** ved to overleveringer:

1. **Chefstrateg kritiserer Den Store Idé** — står idéen på strategien?
2. **Kreativ Direktør kritiserer copy** — mod bureau-rubrikken (se §5).

Ved `revise` kalder orkestratoren det oprindelige endpoint igen med revisionspunkterne vedhæftet som ekstra kontekst i request-body (endpoints udvides med et valgfrit `revisionNotes`-felt). Kritik kører på `ANTHROPIC_CREATIVE_MODEL`. Merpris pr. bureau-kørsel: ~2 ekstra Opus-kald (plus evt. revisionskald).

## 3. UI: BureauFloor

Ny komponent `src/components/BureauFloor.tsx`, vist øverst når Bureau-mode er aktiv (toggle i `Toolbar`):

- Rollekort i pipeline-rækkefølge: navn, titel, status (*venter → arbejder → kritiserer → reviderer → færdig → fejlet*), live-streamet uddrag (SSE-mønster som `DeliberationTimeline`).
- Kritik-øjeblikke vises eksplicit: dommen + revisionen er synlige for brugeren.
- Afbryd hele pipelinen eller spring enkelt-stadier over.
- Fejlet stadie får retry-knap; pipelinen fortsætter med uafhængige stadier.
- Resultater lander i de eksisterende paneler nedenunder som normalt.

## 4. Pitch-afdeling

Nyt endpoint `POST /api/pitch` + `PitchPanel`-komponent. Pitch-producenten modtager hele kørslens output og leverer:

- **Anbefalings-narrativ:** situation → spænding → indsigt → idéen → beviset → planen → the ask. En salgsfortælling, ikke en opsummering.
- **Talenoter pr. slide** inkl. retorisk formål.
- **Indvendingshåndtering:** 3-4 kritiske kundespørgsmål med svar.

`src/lib/exportDeck.ts` opgraderes til at flette narrativ + talenoter ind i det eksporterede deck. Pitch kan også køres manuelt uden Bureau-mode, når funnel-output findes.

## 5. Bureau-rubrik og prompt-løft

Fælles rubrik defineret ét sted i `prompts.ts` og genbrugt af både genererings- og kritik-prompts:

- **Skarphed:** én tanke pr. sætning; intet fyld.
- **Distinktivitet:** kunne en konkurrent sætte sit logo på? Forkastet.
- **Bevisbyrde:** enhver påstand følges af reason-to-believe.
- **Dansk idiomatik:** skrevet på dansk, ikke oversat til dansk.

Alle eksisterende prompt builders gennemgås mod rubrikken. Konkret kendt fund: `GENERATE_SYSTEM_ROLE` ("Produktionsassistent") opgraderes til senior tekstforfatter-persona.

## 6. Fejlhåndtering og omkostning

- Stadie-fejl stopper ikke pipelinen; kun afhængige stadier blokeres.
- Ingen nye env-variabler; eksisterende modelkonfiguration genbruges.
- Session-persistens uændret (eksisterende localStorage-nøgler).
- Fuld bureau-kørsel: ~8–10 API-kald.

## 7. Test og etaper

**Tests** (husets mønster, co-located): prompt builders + schemas for `pitch` og `critique`; `useBureauMode`-orkestratorlogik (afhængigheder, fejl-fortsættelse, revisionsrunde); `tsc --noEmit` som gate.

**Etaper** — hver er en selvstændig `claude/<topic>`-PR med værdi alene:

1. Prompt-løft + bureau-rubrik
2. Critique-endpoint + `useBureauMode`-orkestrator
3. BureauFloor-UI
4. Pitch-afdeling + deck-opgradering

**Version:** 1.23.0, bumpet i `package.json`, `AppHeader.tsx`, `App.tsx`.

## Afgrænsning (ikke med)

- Ingen ægte multi-agent-arkitektur (agenter med hukommelse/beskeder) — fravalgt som tilgang C.
- Ingen nye discipliner ud over pitch (personas, konkurrentanalyse, medieplan er bevidst udskudt).
- Ingen ændringer af standard-mode-flowet.
