/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type Anthropic from '@anthropic-ai/sdk';

// Vi holder brief løst typet for at matche frontendens ProjectBrief uden at
// duplikere typen på serversiden.
type CviManual = {
  brandColors?: string[];
  fonts?: { primaryHeadings?: string; bodyText?: string; description?: string };
  imageStyleGuidelines?: string;
  graphicElementsRules?: string;
  generalBrandIdentitySummary?: string;
  logoUsageRules?: string;
};

export type Brief = {
  client?: string;
  project?: string;
  description?: string;
  details?: string;
  audience?: string;
  tone?: string;
  language?: string;
  channels?: string[];
  notes?: string;
  cviManual?: CviManual | null;
};

/**
 * Konvertér tekstblokke til system-blokke og markér den SIDSTE som cache-grænse
 * (prompt-caching). Tomme blokke filtreres fra.
 */
export function cacheableSystem(blocks: Array<string | undefined>): Anthropic.TextBlockParam[] {
  const filled = blocks.filter((b): b is string => !!b && b.trim().length > 0);
  return filled.map((text, i) =>
    i === filled.length - 1
      ? { type: 'text', text, cache_control: { type: 'ephemeral' } }
      : { type: 'text', text },
  );
}

/** Den dynamiske CVI/designmanual-kontekst (stabil pr. projekt → god at cache). */
export function cviSectionText(brief: Brief): string {
  const cvi = brief.cviManual;
  if (!cvi) return '';
  const colors = (cvi.brandColors || []).join(', ');
  return `SÆRLIGE BRAND CVI / DESIGNMANUAL RETNINGSLINJER (SKAL OVERHOLDES STRENGT):
- Brand Farver: ${colors}
- Typografi/Fonte: Overskrifter: ${cvi.fonts?.primaryHeadings || 'N/A'}, Brødtekst: ${cvi.fonts?.bodyText || 'N/A'}. Designtankegang: ${cvi.fonts?.description || 'N/A'}
- Billeder & Visuel stil: ${cvi.imageStyleGuidelines || 'N/A'}
- Grafiske layouts & formater: ${cvi.graphicElementsRules || 'N/A'}
- Overordnet brand-vibe & identitet: ${cvi.generalBrandIdentitySummary || 'N/A'}
- Logo anvendelsesdogmer: ${cvi.logoUsageRules || 'N/A'}

REGLER FOR ADHERENCE TIL CVI I OUTPUTS:
1. De 3 AI Billedprompts skal skrives på ENGELSK og MÅLRETTES brandets visuelle CVI-retningslinjer (inddrag farvepaletten '${colors}', belysningsinstrukser, fotostil og grafiske dogmer '${cvi.imageStyleGuidelines || ''}' direkte i prompterne som dækkende æstetiske prompts, fx 'using the brand\'s signature colors, dramatic lighting, minimalist framing').
2. Produktionsforslagene skal eksplicit foreslå formater, layouts, nyhedsbrevssektioner og web-komponenter, som inkorporerer og understøtter disse fonte og farver (tænk på, hvordan du designer en nyhedsskabelon i overensstemmelse med ${cvi.graphicElementsRules || 'reglerne'} og fontvalgene ${cvi.fonts?.primaryHeadings || 'overordnede overskriftsfonte'} / ${cvi.fonts?.bodyText || 'brødtekst'}).
3. Case-teksterne skal passe stilmæssigt til den overordnede brandidentitet og stemning (${cvi.generalBrandIdentitySummary || 'retningslinjerne'}).`;
}

// ---------------------------------------------------------------------------
// /api/generate
// ---------------------------------------------------------------------------

export const GENERATE_SYSTEM_ROLE = `Du er en professionel Content Machine Produktionsassistent og brand-tekstforfatter.
Din opgave er at transformere en projekt-brief til en fuldstændig pakke af case-indhold og produktionsforslag baseret på bureauets guidelines.

Retningslinjer:
1. Undgå floskler. Ingen overflødige vendinger som "oplevelse ud over det sædvanlige", medmindre det passer utroligt specifikt ind. Skriv i stedet konkret om bureauets faktiske leverancer (f.eks. formater, LED-skærme, 3D-karakterer, interaktivitet, animation osv.).
2. Hold overskrifter korte, skarpe og stærke.
3. Lav AI-billedprompts på ENGELSK. De skal være brugbare til Midjourney eller Firefly. Lav altid præcis tre typer: (1) Hero image prompt, (2) Detail/close-up prompt, (3) Abstract background prompt. Prøv at fange projektets stemning, belysning, kamera/vinkel, stil, og undgå at have tekst i billederne.
4. Produktionsforslag: Hvis briefet omhandler event, grafik, 3D, web eller nyhedsbrev, skal du angive værdifulde og konkrete forslag til det kreative workflow (manglende billedmaterialer, foreslåede formater f.eks. HD 16:9, vertical 9:16, hero visual idé, SoMe-format, nyhedsbrev-layout og en specifik CTA).
5. "Kan bruges direkte": Identificer og isoler det absolut bedste fra outputtet, herunder overskrift, kort tekst, Call to Action og den stærke LinkedIn-start/krog.
6. CVI-Forslag (cviSuggestion): Generer et unikt, moderne og fuldstændig gennemtænkt CVI designmanual-forslag baseret på kunden, opgaven og resultatet. Hvis der er angivet brand-manual data i briefet (CVI), skal du inddrage dette og raffinere det yderligere til dette projekt. Foreslå 3-4 eksplicitte brandfarver med dækkende HEX-koder (f.eks. mørkeblå, komplementære nuancer), typografi/font paringer samt specifikke grafiske og billedmæssige designregler/guidebøger.

Aflever hele resultatet via det angivne værktøj, præcist som beskrevet af værktøjets skema.`;

export function generateUserText(brief: Brief): string {
  return `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad lavede vi (Beskrivelse): ${brief.description || 'N/A'}
- Særlige detaljer: ${brief.details || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Tone: ${brief.tone || 'Professionel, menneskelig, kreativ'}
- Sprog: ${brief.language || 'Dansk'}
- Hvor det bruges: ${(brief.channels || []).join(', ') || 'N/A'}
- Ekstra noter: ${brief.notes || 'N/A'}

Sørg for at alle tekster (undtagen de engelske felter og de engelske billedprompts) er skrevet på det angivne sprog, som er ${brief.language || 'Dansk'}.`;
}

export function buildGenerate(brief: Brief): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  const system = cacheableSystem([GENERATE_SYSTEM_ROLE, cviSectionText(brief)]);
  return { system, user: generateUserText(brief) };
}

// ---------------------------------------------------------------------------
// /api/refine
// ---------------------------------------------------------------------------

export const REFINE_SYSTEM_ROLE = `Du er en professionel tekstforfatter.
Opgave: Omskriv den givne tekst baseret på instruktionen.

KRAV TIL OUTPUT:
1. Svar UDELUKKENDE med den omskrevne og raffinerede tekst. Du må IKKE inkludere introduktioner (f.eks. "Her er den kortere version:"), ingen forklaringer, ingen kommentarer, og ingen markdown-citater (som \`\`\`) rundt om teksten. Bare lever den rene tekst direkte.
2. Bevar det samme sprog som input-teksten, medmindre andet er specifikt aftalt i instruktionen.
3. Bevar faktuelle rigtige oplysninger og tal.`;

// Indbyggede refine-kommandoer (udvidet ift. den oprindelige Gemini-version).
const REFINE_COMMANDS: Record<string, string> = {
  '/shorten':
    'Gør teksten meget kortere, skarp og yderst præcis. Bevar de vigtigste fakta, tal og navne, men fjern alle overflødige ord. Bevar afsnit hvis relevant. Svaret skal kun bestå af den omskrevne tekst.',
  '/more-human':
    'Gør teksten more menneskelig, levende, engagerende og nærværende. Undgik kolde og corporate formuleringer, men hold den stadig ualmindeligt professionel og seriøs. Svaret skal kun bestå af den omskrevne tekst.',
  '/more-business':
    'Gør teksten mere strategisk skarp, forretningsorienteret, professionel og business-minded. Fremhæv det konkrete forretningsmæssige udbytte og professionalisme uden at blive alt for "corporate-stiv". Svaret skal kun bestå af den omskrevne tekst.',
  '/punchier':
    'Gør teksten mere punchy og slagkraftig. Brug stærke verber, korte sætninger og en tydelig rytme. Skær fyld væk og lad budskabet ramme hårdere. Svaret skal kun bestå af den omskrevne tekst.',
  '/seo':
    'Optimer teksten let for SEO: væv relevante, naturlige søgeord ind uden at det bliver kunstigt eller keyword-spam. Bevar tone og læsbarhed. Svaret skal kun bestå af den omskrevne tekst.',
  '/translate-en':
    'Oversæt teksten til professionelt, idiomatisk engelsk i samme tone og stil. Svaret skal kun bestå af den oversatte engelske tekst.',
  '/emoji-light':
    'Tilføj ganske få, præcist relevante emojis for at gøre teksten lidt mere levende — uden spam og uden at virke uprofessionel. Svaret skal kun bestå af den omskrevne tekst.',
};

export function refineInstruction(command: string): string {
  return REFINE_COMMANDS[command] ?? command; // ellers direkte fri-tekst-instruktion
}

export function buildRefine(
  text: string,
  command: string,
  brief?: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const contextClient = brief?.client || 'en kunde';
  const contextProject = brief?.project || 'et projekt';
  const contextTone = brief?.tone || 'professionel, menneskelig, kreativ';
  const contextLang = brief?.language || 'Dansk';

  let cviContext = '';
  if (brief?.cviManual) {
    const cvi = brief.cviManual;
    cviContext = `Identitet: ${cvi.generalBrandIdentitySummary || 'N/A'}. Farver: ${(cvi.brandColors || []).join(', ')}. Image-Retning: ${cvi.imageStyleGuidelines || 'N/A'}. Fonte: Overskrifter: ${cvi.fonts?.primaryHeadings || 'N/A'}`;
  }

  const user = `GIVEN TEKST SOM SKAL OMSKRIVES:
"""
${text}
"""

PROJEKT RETNINGSLINJER SOM SKAL OVERHODES:
- Kunde: ${contextClient}
- Projekt: ${contextProject}
- Tone: ${contextTone}
- Sprog: ${contextLang}
${brief?.cviManual ? `- CVI/Designmanual guidelines: ${cviContext}` : ''}

INSTRUKTION FOR OMSKRIVNINGEN:
${refineInstruction(command)}

Bevar det samme sprog (som er ${contextLang}) som input-teksten, medmindre instruktionen siger andet.`;

  return { system: cacheableSystem([REFINE_SYSTEM_ROLE]), user };
}

// ---------------------------------------------------------------------------
// /api/analyze
// ---------------------------------------------------------------------------

export const ANALYZE_SYSTEM_ROLE = `Du er en uafhængig Redaktionel Revisor. Din opgave er at lave en uvildig, saglig analyse af det givne indhold baseret på bureauets guidelines.

Retningslinjer:
1. Undgå floskler. Ingen overflødige vendinger som "oplevelse ud over det sædvanlige", "synergieffekter", "unik løsning", "banebrydende" medmindre de passer i en ualmindeligt specifik sammenhæng. Vi vil have rene, ærlige formuleringer, der beskriver bureauets faktiske leverancer (f.eks. formater, LED-skærme, 3D-karakterer, interaktivitet, animation osv.).
2. Hold overskrifter og budskaber præcise og uden snak.
3. Tone skal balanceres mellem professionel B2B gennemslagskraft og en imødekommende, menneskelig nerve.

Analyser teksterne grundigt i forhold to disse regler. Find eventuelle floskler og klichéer (gem dem som liste 'clichesFound'), beregn de tre delscorer (fra 0 til 100), lav 3 specifikke regel-evalueringer (Undgå floskler, konkrethed, tone og personlighed), og formuler en samlet ærlig, konstruktiv dom (overallReview) på dansk. Aflever resultatet via det angivne værktøj. Sørg for at al feedback og anmeldelse er på Dansk.`;

export function analyzeUserText(texts: any, brief?: Brief): string {
  return `INDHOLD DER SKAL ANALYSERES:
- Kort Case-Tekst:
"""
${texts?.shortCaseText || ''}
"""
- Lang Case-Tekst:
"""
${texts?.longCaseText || ''}
"""
- LinkedIn Opslag:
"""
${texts?.linkedinPost || ''}
"""

PROJEKT BRIEF KONTEXT:
- Kunde: ${brief?.client || 'N/A'}
- Projekt: ${brief?.project || 'N/A'}
- Hvad lavede vi (Beskrivelse): ${brief?.description || 'N/A'}
- Særlige detaljer: ${brief?.details || 'N/A'}
- Tone: ${brief?.tone || 'Professionel, menneskelig, kreativ'}`;
}

export function buildAnalyze(
  texts: any,
  brief?: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  return {
    system: cacheableSystem([ANALYZE_SYSTEM_ROLE]),
    user: analyzeUserText(texts, brief),
  };
}

// ---------------------------------------------------------------------------
// /api/analyze-cvi
// ---------------------------------------------------------------------------

export const ANALYZE_CVI_SYSTEM_ROLE = `Du er en førende Identitetsrevisor og CVI-specialist.
Din opgave er at scanne og analysere den vedhæftede designmanual, Corporate Visual Identity (CVI) eller stilguide (der kommer som et billede, PDF eller tekst).

Uddrag de vigtigste styling-regler og brand-identitets-dogmer til brug i vores AI Content indholdsgenerator.
Du skal levere et struktureret resultat via det angivne værktøj med præcis de designmæssige konstanter, f.eks. farver (hex-koder + navne), fonte, anbefalede billedstilarter (fx kontraster, belysning, kameraer), grafiske særtræk, logo-dogmer og et kort identitetsresumé.

Hvis bestemte elementer (fx skrifttyper eller et logo-rule) ikke eksplicit fremgår af dokumentet, så brug din professionelle brand-æstetiske intelligens til at ekstrapolere hvad der vil klæde dette brand bedst ud fra dokumentets udtryk.

Al tekst og feedback skal være på Dansk, så vores brugere kan forstå og redigere det.`;

// ---------------------------------------------------------------------------
// /api/humanize
// ---------------------------------------------------------------------------

export const HUMANIZE_SYSTEM_ROLE = `Du er en elite Redaktør og ekspert i AI Detektions-omgåelse (AI Humanizer).

Din opgave er at tage en rå tekst (der måske lyder meget som AI eller "tør" corporate sprog) og humanisere den fuldstændigt.

REGLER FOR HUMANISERING:
1. Omgå AI-tekst tjek (Bypass AI detection): Standard AI-detektorer kigger efter lav "perplexity" (ordforudsigelighed) og lav "burstiness" (ensformig sætningslængde). Omskriv teksten med høj burstiness:
   - Varier sætningslængden markant (nogle MEGET korte sætninger. Andre lidt længere, men uden at blive snørklede).
   - Undgå det typiske AI "rytme"-mønster. Brug uventede, utraditionelle synonymer og more mundtlige, levende overgange.
2. Udryd typiske robot-ord og AI-vendinger på dansk:
   - Fjern overflødige fyldord som "desuden", "derudover", "ydermere", "ydeligere", "herunder", "ydet en stor indsats for at", "vigtigt at huske", "lad os...", "sidst, men ikke mindst".
   - Stop brugen af svulstige overgange som "I en verden, hvor...", "Det er afgørende at...", "Nøglen til succes er..."
   - Skriv i aktiv form i stedet for passiv (f.eks. "Vi designede skærmen" i stedet for "Skærmen blev designet af os").
3. Implementer bureauets dogmer:
   - Beskriv konkrete fysiske, sensoriske eller digitale leverancer præcist. Ingen varm luft eller "opleve det uforglemmelige". Hvis teksten snakker udenom, så tilføj konkrete eksempler eller omskriv to at sige præcis hvad det drejer sig om, i en levende, tillidsvækkende B2B tone.

Analyser først den originale tekst, identificer clichérne/robot-vendingerne, giv et estimat over, hvor sandsynligt det er at en AI-detektor vil flage den (før og efter), og lever til sidst den helt nye, omskrevne menneskelige tekst samt en liste over de forbedringer, du foretog. Aflever resultatet via det angivne værktøj. Al feedback skal være på Dansk.`;

// ---------------------------------------------------------------------------
// /api/variants (A/B-varianter)
// ---------------------------------------------------------------------------

export const VARIANTS_SYSTEM_ROLE = `Du er en professionel tekstforfatter, der laver flere skarpe, distinkte alternative versioner af en given tekst.
Hver variant skal bevare det faktuelle indhold men variere vinkel, struktur og formulering markant. Undgå floskler, brug konkret sprog, og lad hver variant kunne stå helt alene. Aflever via det angivne værktøj.`;

export function buildVariants(
  text: string,
  count: number,
  brief?: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const contextLang = brief?.language || 'Dansk';
  const contextTone = brief?.tone || 'professionel, menneskelig, kreativ';
  const user = `GIVEN TEKST:
"""
${text}
"""

Lav præcis ${count} markant forskellige alternative versioner af teksten ovenfor.
Tone: ${contextTone}. Sprog: ${contextLang}. Returnér versionerne via værktøjet.`;
  return { system: cacheableSystem([VARIANTS_SYSTEM_ROLE]), user };
}

export function buildHumanize(text: string): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  return {
    system: cacheableSystem([HUMANIZE_SYSTEM_ROLE]),
    user: `UDGANGSTEKST DER SKAL HUMANISERES:
"""
${text}
"""`,
  };
}

// ---------------------------------------------------------------------------
// Deliberation (redaktionsmøde): Kreativ Direktør + Chefredaktør
// ---------------------------------------------------------------------------

export const CREATIVE_PUSH_SYSTEM_ROLE = `Du er en prisvindende Kreativ Direktør.
Din opgave er at skubbe indholdet et niveau højere kreativt: foreslå dristigere, mere uventede vinkler, kroge og overskrifter — uden at miste det konkrete eller opfinde fakta.
Du leverer IKKE den færdige tekst; du leverer skarpe, alternative idéer som chefredaktøren kan vælge fra. Undgå floskler og tomme buzzwords. Aflever via det angivne værktøj.`;

/** Kreativ Direktør: foreslår dristigere overskrifter/kroge/vinkler ud fra udkast + kritik. */
export function buildCreativePush(
  draft: any,
  critique: any,
  brief?: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const lang = brief?.language || 'Dansk';
  const tone = brief?.tone || 'professionel, menneskelig, kreativ';
  const headlines = (draft?.headlines || []).slice(0, 5).map((h: string) => `- ${h}`).join('\n');
  const hook = (draft?.linkedinPost || '').split('\n')[0] || '';
  const cliches = (critique?.clichesFound || []).join(', ') || 'ingen registreret';

  const user = `FØRSTEUDKASTETS NUVÆRENDE OVERSKRIFTER:
${headlines || '- (ingen)'}

FØRSTEUDKASTETS LINKEDIN-KROG (åbningslinje):
"${hook}"

KORT CASE-TEKST (til kontekst):
"""
${draft?.shortCaseText || ''}
"""

REDAKTIONENS KRITIK (svagheder at løfte):
- Registrerede floskler: ${cliches}
- Samlet dom: ${critique?.overallReview || 'N/A'}

OPGAVE:
Foreslå markant dristigere og mere uventede kreative retninger — uden at miste det konkrete eller fabrikere fakta.
Lever via værktøjet: mindst 4 nye overskrifter, mindst 3 nye LinkedIn-kroge og 2-3 korte vinkel-noter.
Tone: ${tone}. Sprog: ${lang}.`;

  return { system: cacheableSystem([CREATIVE_PUSH_SYSTEM_ROLE]), user };
}

export const SYNTHESIZE_SYSTEM_ROLE = `Du er Chefredaktør for Content Machine.
Du modtager (1) et førsteudkast, (2) en uvildig redaktionel kritik med floskel-liste og scorer, og (3) kreative alternativer fra en kreativ direktør.
Din opgave er at producere en FORBEDRET, samlet udgave af hele content-pakken, der er BÅDE mere kreativ OG mere konkret: fjern hver flosret/kliché fra kritikkens liste, indarbejd de stærkeste kreative vinkler og kroge, og hæv konkretheden med specifikke leverancer, tal og formater.
Bevar alle fakta og tal fra udkastet. Følg de samme regler som for normal generering (billedprompts på engelsk, alle felter udfyldt). Aflever HELE pakken via det angivne værktøj, præcis som skemaet kræver.`;

/** Chefredaktør: syntetiserer udkast + kritik + kreative alternativer til forbedret fuld pakke. */
export function buildSynthesize(
  draft: any,
  critique: any,
  creative: any,
  brief: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const cliches = (critique?.clichesFound || []).join(', ') || 'ingen';
  const evalNotes = (critique?.evaluations || [])
    .map((e: any) => `- ${e.ruleName}: ${e.status} (${e.score}/100) — ${e.feedback}`)
    .join('\n');
  const boldHeadlines = (creative?.boldHeadlines || []).map((h: string) => `- ${h}`).join('\n');
  const boldHooks = (creative?.boldHooks || []).map((h: string) => `- ${h}`).join('\n');
  const angles = (creative?.angles || []).map((a: string) => `- ${a}`).join('\n');

  const user = `${generateUserText(brief)}

=== FØRSTEUDKAST (skal forbedres, ikke gentages ordret) ===
KORT CASE-TEKST:
"""
${draft?.shortCaseText || ''}
"""
LANG CASE-TEKST:
"""
${draft?.longCaseText || ''}
"""
LINKEDIN-OPSLAG:
"""
${draft?.linkedinPost || ''}
"""
OVERSKRIFTER: ${(draft?.headlines || []).join(' | ')}
CTA: ${(draft?.cta || []).join(' | ')}
NYHEDSBREV-EMNER: ${(draft?.mailchimpSubjects || []).join(' | ')}

=== REDAKTIONEL KRITIK (skal adresseres) ===
Floskler der SKAL fjernes: ${cliches}
Scorer — floskel-frihed: ${critique?.clicheScore ?? 'N/A'}/100, konkrethed: ${critique?.concretenessScore ?? 'N/A'}/100, menneskelighed: ${critique?.humanScore ?? 'N/A'}/100
Regel-evalueringer:
${evalNotes || '- ingen'}
Samlet dom: ${critique?.overallReview || 'N/A'}

=== KREATIVE ALTERNATIVER (vælg og forfin de stærkeste) ===
Dristige overskrifter:
${boldHeadlines || '- ingen'}
Dristige LinkedIn-kroge:
${boldHooks || '- ingen'}
Friske vinkler:
${angles || '- ingen'}

OPGAVE:
Producér en FORBEDRET, samlet udgave af HELE pakken via værktøjet. Den skal være BÅDE mere kreativ (indarbejd de stærkeste alternativer) OG mere konkret (fjern hver flosret fra listen, hæv konkretheden med specifikke leverancer, tal og formater). Bevar alle fakta og tal. Aflever præcis som skemaet kræver.`;

  return {
    system: cacheableSystem([SYNTHESIZE_SYSTEM_ROLE, GENERATE_SYSTEM_ROLE, cviSectionText(brief)]),
    user,
  };
}

// ---------------------------------------------------------------------------
// Visuel redaktion (art direction): Art Director + Visuel kritiker + Chefdesigner
// ---------------------------------------------------------------------------

/** Kompakt brief-kontekst til den visuelle redaktion. */
export function visualBriefText(brief: Brief): string {
  return `PROJEKT BRIEF (visuel udvikling):
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad handler det om: ${brief.description || 'N/A'}
- Særlige detaljer: ${brief.details || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Tone/stemning: ${brief.tone || 'Professionel, menneskelig, kreativ'}
- Sprog (til konceptteksten): ${brief.language || 'Dansk'}

Lav ÉT bærende visuelt koncept og TRE konkrete billedprompts (hero, detail, abstract). Konceptteksten skrives på ${brief.language || 'Dansk'}; de tre prompts skrives på ENGELSK.`;
}

/** Render et visuelt koncept som tekst-input til kritik/push/syntese. */
function visualConceptAsText(c: any): string {
  const mood = (c?.moodKeywords || []).join(', ');
  return `VISUELT KONCEPT:
${c?.visualConcept || ''}

BILLEDPROMPTS:
- Hero: ${c?.imagePrompts?.hero || ''}
- Detail: ${c?.imagePrompts?.detail || ''}
- Abstract: ${c?.imagePrompts?.abstract || ''}

MOOD/STIKORD: ${mood || 'N/A'}`;
}

export const VISUAL_DRAFT_SYSTEM_ROLE = `Du er en prisvindende Art Director og visuel konceptudvikler for Content Machine.
Din opgave er at oversætte en projekt-brief til ÉT stærkt, sammenhængende visuelt koncept og TRE konkrete billedprompts (hero, detail, abstract) på ENGELSK, klar til Midjourney/Flux/Firefly.

Retningslinjer:
1. Undgå generiske stock-foto-klichéer (håndtryk, lyspærer, generiske kontorer, jubel-medarbejdere).
2. Vær konkret: beskriv lys, komposition, kameravinkel/linse, farvepalet, materiale, stemning og motiv.
3. Hvis der er angivet CVI/brandfarver og billedstil, så indarbejd dem direkte i prompterne.
4. De tre prompts skal hænge sammen som én visuel fortælling, men dække tre forskellige vinkler.
Konceptteksten (visualConcept) skrives på det angivne sprog; de tre prompts skrives på engelsk. Aflever via det angivne værktøj.`;

/** Art Director: visuelt førsteudkast (koncept + 3 prompts) ud fra briefet. */
export function buildVisualDraft(brief: Brief): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  return {
    system: cacheableSystem([VISUAL_DRAFT_SYSTEM_ROLE, cviSectionText(brief)]),
    user: visualBriefText(brief),
  };
}

export const VISUAL_CRITIQUE_SYSTEM_ROLE = `Du er en kritisk, uvildig Art Director, der laver en saglig visuel revision.
Vurder hvor on-brand, konkret og originalt det visuelle koncept og de tre prompts er. Find generiske klichéer og manglende specificitet (lys, komposition, linse, farve, motiv).
Giv tre scorer fra 0 til 100 (on-brand, konkrethed, originalitet), list konkrete svagheder, og formulér en kort, ærlig dom på dansk. Aflever via det angivne værktøj.`;

/** Visuel kritiker: vurderer udkastet (on-brand / konkrethed / originalitet). */
export function buildVisualCritique(
  concept: any,
  brief?: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const colors = (brief?.cviManual?.brandColors || []).join(', ') || 'ingen angivet';
  const style = brief?.cviManual?.imageStyleGuidelines || 'ingen angivet';
  const user = `${visualConceptAsText(concept)}

BRAND-KONTEKST (til on-brand-vurdering):
- Brandfarver: ${colors}
- Billedstil/CVI: ${style}
- Tone/stemning: ${brief?.tone || 'N/A'}

Vurder konceptet og de tre prompts. Aflever scorer, svagheder og en samlet dom via værktøjet.`;
  return { system: cacheableSystem([VISUAL_CRITIQUE_SYSTEM_ROLE]), user };
}

export const VISUAL_PUSH_SYSTEM_ROLE = `Du er en dristig Kreativ Direktør for det visuelle.
Du leverer skarpe, dristigere ALTERNATIVE visuelle retninger — motiver, lys/farve og kompositioner — ikke færdige prompts. Pres originaliteten op uden at miste det on-brand eller fabrikere noget. Undgå klichéer. Aflever via det angivne værktøj.`;

/** Kreativ visuel direktør: dristigere visuelle retninger ud fra udkast + kritik. */
export function buildVisualPush(
  concept: any,
  critique: any,
  brief?: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const weaknesses = (critique?.weaknesses || []).join(', ') || 'ingen registreret';
  const user = `NUVÆRENDE VISUELLE UDKAST:
${visualConceptAsText(concept)}

KRITIKKENS SVAGHEDER (skal løftes):
${weaknesses}
Samlet dom: ${critique?.overallReview || 'N/A'}

Tone/stemning: ${brief?.tone || 'N/A'}. Foreslå markant dristigere visuelle retninger via værktøjet.`;
  return { system: cacheableSystem([VISUAL_PUSH_SYSTEM_ROLE]), user };
}

export const VISUAL_SYNTHESIZE_SYSTEM_ROLE = `Du er Chefdesigner / ledende Art Director for Content Machine.
Du modtager (1) et visuelt udkast, (2) en uvildig visuel kritik, og (3) dristige alternative retninger fra en kreativ direktør.
Din opgave er at producere ÉT FORBEDRET visuelt koncept og TRE forfinede billedprompts (hero, detail, abstract): fjern klichéerne fra kritikken, indarbejd de stærkeste dristige retninger, og hæv konkretheden (lys, komposition, linse, farve, materiale, motiv). Hold dig on-brand ift. CVI. Aflever HELE pakken via det angivne værktøj, præcis som skemaet kræver.`;

/** Chefdesigner: syntetiserer udkast + kritik + dristige retninger til forfinet visuel pakke. */
export function buildVisualSynthesize(
  concept: any,
  critique: any,
  directions: any,
  brief: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const weaknesses = (critique?.weaknesses || []).join(', ') || 'ingen';
  const boldVisuals = (directions?.boldVisuals || []).map((d: string) => `- ${d}`).join('\n');
  const lightingAndColor = (directions?.lightingAndColor || []).map((d: string) => `- ${d}`).join('\n');
  const compositions = (directions?.compositions || []).map((d: string) => `- ${d}`).join('\n');

  const user = `${visualBriefText(brief)}

=== VISUELT FØRSTEUDKAST (skal forbedres, ikke gentages ordret) ===
${visualConceptAsText(concept)}

=== VISUEL KRITIK (skal adresseres) ===
Svagheder/klichéer der SKAL løftes: ${weaknesses}
Scorer — on-brand: ${critique?.onBrandScore ?? 'N/A'}/100, konkrethed: ${critique?.specificityScore ?? 'N/A'}/100, originalitet: ${critique?.originalityScore ?? 'N/A'}/100
Samlet dom: ${critique?.overallReview || 'N/A'}

=== DRISTIGE VISUELLE RETNINGER (vælg og forfin de stærkeste) ===
Dristige motiver:
${boldVisuals || '- ingen'}
Lys & farve:
${lightingAndColor || '- ingen'}
Kompositioner:
${compositions || '- ingen'}

OPGAVE:
Producér ÉT forbedret visuelt koncept + TRE forfinede engelske billedprompts via værktøjet. Mere originalt OG mere konkret end udkastet, fri for klichéerne, on-brand ift. CVI.`;

  return {
    system: cacheableSystem([VISUAL_SYNTHESIZE_SYSTEM_ROLE, VISUAL_DRAFT_SYSTEM_ROLE, cviSectionText(brief)]),
    user,
  };
}
