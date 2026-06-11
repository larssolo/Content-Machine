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
  businessGoal?: string;
  competitors?: string;
  mandatories?: string;
  budget?: string;
  cviManual?: CviManual | null;
};

/**
 * Render de strukturerede intake-felter (forretningsmål/KPI, konkurrenter,
 * mandatories, budget) som en kompakt kontekst-blok. Kun de UDFYLDTE felter tages
 * med, så prompten ikke fyldes med "N/A". Returnerer tom streng hvis intet er sat.
 * Bruges på tværs af strategi, idé, brainstorm, pres-test og effekt-laget.
 */
export function briefIntakeText(brief: Brief): string {
  const lines: string[] = [];
  if (brief.businessGoal && brief.businessGoal.trim())
    lines.push(`- Forretningsmål & KPI: ${brief.businessGoal.trim()}`);
  if (brief.competitors && brief.competitors.trim())
    lines.push(`- Konkurrenter (undgå deres positioner): ${brief.competitors.trim()}`);
  if (brief.mandatories && brief.mandatories.trim())
    lines.push(`- Mandatories (skal med / må ikke bruges): ${brief.mandatories.trim()}`);
  if (brief.budget && brief.budget.trim())
    lines.push(`- Budget-ramme: ${brief.budget.trim()}`);
  if (!lines.length) return '';
  return `STRATEGISK INTAKE (præcis kontekst fra kunden — brug aktivt, overhold mandatories):\n${lines.join('\n')}`;
}

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
// Bureau-rubrik — delt kvalitetsstandard for generering og kritik
// ---------------------------------------------------------------------------

export const BUREAU_RUBRIC = `BUREAU_RUBRIC (gælder for ALT output — overhold alle fire):
1. Skarphed: én tanke pr. sætning. Fjern alt fyld. Hvert ord skal tjene en funktion.
2. Distinktivitet: kunne en konkurrent sætte sit logo på teksten uændret? Forkast den og omskriv.
3. Bevisbyrde: enhver påstand om effekt, kvalitet eller resultat skal følges af et konkret reason-to-believe — et tal, et format, en leverance, en reaktion.
4. Dansk idiomatik: skriv som en dansker tænker, ikke som en oversættelse fra engelsk marketing-speak. Ingen "oplevelse ud over det sædvanlige", "synergier" eller "holistisk tilgang".`;

// ---------------------------------------------------------------------------
// /api/generate
// ---------------------------------------------------------------------------

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

export function generateUserText(brief: Brief): string {
  const intake = briefIntakeText(brief);
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
${intake ? `\n${intake}\n` : ''}
Sørg for at alle tekster (undtagen de engelske felter og de engelske billedprompts) er skrevet på det angivne sprog, som er ${brief.language || 'Dansk'}.`;
}

export function buildGenerate(brief: Brief, chosenIdea?: ChosenIdea | null): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  const system = cacheableSystem([GENERATE_SYSTEM_ROLE, cviSectionText(brief)]);
  const campaign = chosenIdea ? campaignContextText(chosenIdea) : '';
  const user = campaign ? `${generateUserText(brief)}\n\n${campaign}` : generateUserText(brief);
  return { system, user };
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
// /api/regenerate-section — frisk enkelt-sektion fra bunden
// ---------------------------------------------------------------------------

const SECTION_LABELS: Record<string, string> = {
  shortCaseText: 'kort case-tekst (ca. 100-150 ord, konkret og fængende om de faktiske leverancer)',
  longCaseText: 'lang case-tekst til hjemmeside (ca. 250-400 ord med konkrete detaljer, milepæle og resultater)',
  linkedinPost: 'LinkedIn opslag (professionelt og levende, med krog i første linje, klare afsnit og en CTA)',
  creativeNewsletterSection: 'nyhedsbrev-sektion med kreativt layout-forslag og konkret indhold',
};

export function buildRegenerate(
  brief: Brief,
  sectionKey: string,
  currentText: string,
): { system: string; user: string } {
  const label = SECTION_LABELS[sectionKey] ?? sectionKey;
  const system = `Du er en professionel Neura Studio Produktionsassistent og brand-tekstforfatter.

Opgave: Generer en FRISK, ORIGINAL ny version af: ${label}

KRAV:
1. Find en ny indgang og vinkel — ignorer den eksisterende teksts konkrete formuleringer
2. Bevar faktuelle oplysninger fra briefet (klient, projekt, leverancer, tal, navne)
3. Vær modig og konkret — undgå floskler og generiske marketingvendinger
4. Svar UDELUKKENDE med den nye tekst — ingen forklaringer, overskrifter eller kommentarer
5. Skriv på ${brief.language || 'Dansk'}`;

  const user = `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad lavede vi: ${brief.description || 'N/A'}
- Særlige detaljer: ${brief.details || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Tone: ${brief.tone || 'Professionel, menneskelig, kreativ'}

EKSISTERENDE VERSION (kun til reference — skriv NOGET ANDERLEDES):
${currentText}

Skriv nu en frisk ${label}:`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// /api/strategy — Strategi-fundament: indsigt der fodrer Den Store Idé
// ---------------------------------------------------------------------------

export const STRATEGY_SYSTEM_ROLE = `Du er Chefstrateg (Head of Strategy) i et prisvindende reklamebureau.

Din opgave er at destillere et projekt-brief til ÉT skarpt strategisk fundament — den indsigt og retning som en stor kreativ idé kan stå på. Du leverer IKKE kreative idéer eller copy; du leverer det strategiske grundlag, der gør idéerne uundgåelige.

Et stærkt strategisk fundament:
1. Bygger på en reel menneskelig indsigt om målgruppen — ikke en demografisk beskrivelse, men hvad de faktisk tænker, føler og kæmper med.
2. Navngiver den centrale spænding eller barriere, kampagnen skal løse.
3. Forstår kategorien: hvordan konkurrenterne taler, og hvilket ledigt territorium dette brand kan eje.
4. Koger budskabet ned til ÉT enkelt-mindet løfte (single-minded proposition) — det ene, vi vil have målgruppen til at tage med sig.
5. Underbygger løftet med konkrete reasons-to-believe forankret i de faktiske leverancer.
6. Peger på 2-3 strategiske afsæt (springboards), som en kreativ idé-motor kan springe fra.

Vær skarp og konkret. Ingen floskler, ingen tom marketing-luft. Aflever hele fundamentet via det angivne værktøj, præcist som skemaet kræver.`;

export function buildStrategy(
  brief: Brief,
  culturalIntel?: import('./culturalScan').CulturalScanResult | null,
): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  const system = cacheableSystem([STRATEGY_SYSTEM_ROLE, cviSectionText(brief)]);
  const culturalBlock = culturalIntel
    ? (() => {
        // Inline serialisation (same structure as culturalContextText but avoids circular dep)
        const trends = (culturalIntel.trends || [])
          .map((t: any) => `  · ${t.trend} → ${t.actionableAngle}`)
          .join('\n');
        const competitors = (culturalIntel.competitorSignals || [])
          .map((c: any) => `  · ${c.brand}: ${c.signal} (${c.takeaway})`)
          .join('\n');
        const moments = (culturalIntel.culturalMoments || [])
          .map((m: any) => `  · ${m.moment} → ${m.opportunity}`)
          .join('\n');
        return `\nKULTUREL EFTERRETNING (brug som virkelighedsgrundlag — strategien SKAL besvare åbningsspørgsmålet):
Landskab: ${culturalIntel.groundingNarrative || 'N/A'}
Trends:\n${trends || '  · N/A'}
Konkurrenter:\n${competitors || '  · N/A'}
Kulturelle øjeblikke:\n${moments || '  · N/A'}
Timing: ${culturalIntel.timingContext || 'N/A'}
Åbningsspørgsmål: ${culturalIntel.openingQuestion || 'N/A'}\n`;
      })()
    : '';
  const intake = briefIntakeText(brief);
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
${intake ? `\n${intake}\n` : ''}${culturalBlock}
Udvikl nu det strategiske fundament for dette projekt: målgruppe-indsigt, central spænding, konkurrence-kontekst, det enkelt-mindede løfte, reasons-to-believe, ønsket respons og 2-3 strategiske afsæt. Aflever via værktøjet. Skriv på ${brief.language || 'Dansk'}.`;

  return { system, user };
}

/** Et strategisk afsæt (springboard) — delmængde af StrategyFoundation. */
export type StrategySpringboard = { title?: string; insight?: string };

/** Det strategiske fundament der kan fodre Den Store Idé-motor. */
export type StrategyFoundation = {
  audienceTruth?: string;
  tension?: string;
  competitiveContext?: string;
  singleMindedProposition?: string;
  reasonsToBelieve?: string[];
  desiredResponse?: string;
  springboards?: StrategySpringboard[];
  strategicSummary?: string;
};

/**
 * Render et strategisk fundament som en kompakt kontekst-blok, der kan injiceres i
 * Den Store Idé-motor, så de kreative ruter står på reel strategi frem for det blå.
 */
export function strategyContextText(strategy: StrategyFoundation): string {
  if (!strategy || (!strategy.singleMindedProposition && !strategy.audienceTruth)) return '';
  const rtb = (Array.isArray(strategy.reasonsToBelieve) ? strategy.reasonsToBelieve : []).join('; ');
  const springs = (Array.isArray(strategy.springboards) ? strategy.springboards : [])
    .map((s) => `${s?.title || 'Afsæt'} — ${s?.insight || ''}`)
    .join(' | ');
  return `STRATEGISK FUNDAMENT (idéerne SKAL stå på denne indsigt):
- Målgruppe-indsigt: ${strategy.audienceTruth || 'N/A'}
- Central spænding: ${strategy.tension || 'N/A'}
- Konkurrence-kontekst: ${strategy.competitiveContext || 'N/A'}
- Single-minded proposition: ${strategy.singleMindedProposition || 'N/A'}
- Reasons to believe: ${rtb || 'N/A'}
- Ønsket respons: ${strategy.desiredResponse || 'N/A'}
- Strategiske afsæt: ${springs || 'N/A'}
${strategy.strategicSummary ? `- Sammenfatning: ${strategy.strategicSummary}` : ''}

Brug dette fundament som afsæt: hver kreativ rute skal forløse spændingen og bære det enkelt-mindede løfte.`;
}

// ---------------------------------------------------------------------------
// /api/big-idea — Den Store Idé: konkurrerende kampagne-platforme
// ---------------------------------------------------------------------------

export const BIG_IDEA_SYSTEM_ROLE = `Du er Executive Creative Director i et prisvindende reklamebureau i verdensklasse.

Din opgave er at omsætte et projekt-brief til TRE konkurrerende kreative ruter (kampagne-platforme) — som et topbureau der præsenterer flere veje for kunden. Hver rute bygger på ÉN stor idé: kampagnens hjerte, der kan bære indhold på tværs af alle kanaler.

Hvad gør en stor idé stor:
1. Den er distinkt og uventet — ikke den oplagte, sikre eller generiske vinkel. Tag kreative chancer.
2. Den udspringer af en reel strategisk indsigt eller kulturel spænding — ikke ud af det blå.
3. Den er elastisk: den kan udtrykkes konkret på social, OOH, film, aktivering og PR — og stadig føles som samme idé.
4. Den er mindeværdig og menneskelig, med en klar tone og et levende billedsprog.

Krav til de tre ruter:
- De skal være MARKANT forskellige fra hinanden — tre ægte alternativer, ikke tre variationer af samme.
- Ingen floskler, ingen tom marketing-luft. Vær konkret om bureauets faktiske leverancer.
- Kanal-udtrykkene skal være konkrete og brugbare, ikke abstrakte hensigtserklæringer.

Aflever alle tre ruter via det angivne værktøj, præcist som skemaet kræver.`;

export function buildBigIdea(brief: Brief, strategy?: StrategyFoundation | null): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  const system = cacheableSystem([BIG_IDEA_SYSTEM_ROLE, cviSectionText(brief)]);
  const foundation = strategy ? strategyContextText(strategy) : '';
  const intake = briefIntakeText(brief);
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
${intake ? `\n${intake}\n` : ''}${foundation ? `\n${foundation}\n` : ''}
Udvikl nu TRE konkurrerende kreative ruter (kampagne-platforme) for dette projekt. Aflever via værktøjet. Skriv på ${brief.language || 'Dansk'} (kanal-navne må gerne være på engelsk hvis det er mest naturligt).`;

  return { system, user };
}

/** En valgt kampagne-platform (delmængde af et CampaignTerritory) til kontekst-injektion. */
export type ChosenIdea = {
  name?: string;
  bigIdea?: string;
  tagline?: string;
  manifesto?: string;
  strategicRoot?: string;
  toneDescriptor?: string;
  channelExpressions?: Array<{ channel?: string; idea?: string }>;
};

/**
 * Render en valgt kampagne-platform (rute) som en kompakt kontekst-blok, der kan
 * injiceres i downstream-generering, så alt content bygger på samme store idé.
 */
export function campaignContextText(idea: ChosenIdea): string {
  if (!idea || (!idea.bigIdea && !idea.tagline)) return '';
  return `VALGT KAMPAGNE-PLATFORM (SKAL GENNEMSYRE ALT INDHOLD):
- Rute: ${idea.name || 'N/A'}
- Den store idé: ${idea.bigIdea || 'N/A'}
- Tagline: ${idea.tagline || 'N/A'}
- Strategisk rod: ${idea.strategicRoot || 'N/A'}
- Tone for ruten: ${idea.toneDescriptor || 'N/A'}
${idea.manifesto ? `- Manifest: ${idea.manifesto}` : ''}

Alt indhold (case-tekster, LinkedIn, nyhedsbrev, overskrifter, CTA m.m.) skal være en tydelig forlængelse af denne store idé og tagline — samme verden, samme tone, samme løfte.`;
}

// ---------------------------------------------------------------------------
// /api/sharpen-idea — ECD pres-test: strategisk kritik + skærpning af én rute
// ---------------------------------------------------------------------------

/** En fuld kreativ rute der skal pres-testes/skærpes. */
export type Territory = ChosenIdea & {
  rationale?: string;
};

/** Render en fuld kreativ rute (alle felter) til pres-test/skærpning. */
export function territoryFullText(t: Territory): string {
  const channels = (Array.isArray(t?.channelExpressions) ? t.channelExpressions : [])
    .map((c) => `  - ${c?.channel || 'Kanal'}: ${c?.idea || ''}`)
    .join('\n');
  return `KREATIV RUTE TIL VURDERING:
- Navn: ${t.name || 'N/A'}
- Den store idé: ${t.bigIdea || 'N/A'}
- Tagline: ${t.tagline || 'N/A'}
- Manifest: ${t.manifesto || 'N/A'}
- Strategisk rod: ${t.strategicRoot || 'N/A'}
- Tone: ${t.toneDescriptor || 'N/A'}
- Kanal-udtryk:
${channels || '  - N/A'}
- Selvforklaring (hvorfor den vinder): ${t.rationale || 'N/A'}`;
}

export const TERRITORY_CRITIQUE_SYSTEM_ROLE = `Du er Chief Strategy Officer i et prisvindende reklamebureau i verdensklasse, og du leder den interne pres-test FØR idéen præsenteres for kunden.

Din opgave er at pres-teste ÉN kreativ rute brutalt ærligt — som den skarpeste strateg i rummet der vil have idéen til at vinde awards og virke i markedet, ikke bare lyde godt i et mødelokale.

Vurdér på fire akser (0-100):
1. Distinkthed: er idéen uventet og umulig at forveksle med konkurrenten — eller er det en sikker kategori-kliché?
2. Sandhed: står den på en reel strategisk indsigt eller kulturel spænding — eller er den ud af det blå?
3. Elasticitet: kan den bære indhold på tværs af kanaler og over tid — eller er det en engangs-eksekvering forklædt som platform?
4. Mindeværdighed: er den menneskelig, delbar og mindeværdig — eller glemt i morgen?

Vær konkret og kompromisløs:
- Peg på de PRÆCISE svagheder — hvor er den generisk, derivativ, uklar eller risikabel?
- Stil de skarpe spørgsmål den kreative direktør SKAL svare på.
- Identificér det ene kill-kriterium: den største risiko der kan dræbe idéen.
- Undgå høflig ros. En pres-test der kun roser er værdiløs.

Aflever via det angivne værktøj.`;

export function buildTerritoryCritique(
  brief: Brief,
  territory: Territory,
  strategy?: StrategyFoundation | null,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const system = cacheableSystem([TERRITORY_CRITIQUE_SYSTEM_ROLE, cviSectionText(brief)]);
  const foundation = strategy ? strategyContextText(strategy) : '';
  const intake = briefIntakeText(brief);
  const user = `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad lavede vi (Beskrivelse): ${brief.description || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Sprog: ${brief.language || 'Dansk'}
${intake ? `\n${intake}\n` : ''}${foundation ? `\n${foundation}\n` : ''}
${territoryFullText(territory)}

Pres-test nu denne rute brutalt ærligt på de fire akser, og lever konkrete svagheder, provokationer og kill-kriteriet. Aflever via værktøjet. Skriv på ${brief.language || 'Dansk'}.`;
  return { system, user };
}

export const TERRITORY_SHARPEN_SYSTEM_ROLE = `Du er Executive Creative Director i et reklamebureau i verdensklasse, og du har lige fået din strategs brutale pres-test af din egen rute.

Din opgave er at SKÆRPE ruten — ikke kassere den, ikke lave en ny. Det er samme idé, hævet et niveau: mere distinkt, mere sand, mere elastisk og mere mindeværdig, og den skal svare direkte på pres-testens kritik.

Principper:
1. Behold rutens DNA — navn, strategisk kerne og verden. Skift ikke spor; skærp det eksisterende.
2. Svar på provokationerne og lukket kill-kriteriet konkret i den skærpede idé.
3. Gør den store idé skarpere og mere uventet — fjern det generiske, tilføj det specifikke og menneskelige.
4. Hæv kanal-udtrykkene fra hensigtserklæringer til konkrete, modige eksekveringer.
5. Ingen floskler. Hvert skærpet element skal være mærkbart bedre end før.

Forklar til sidst præcist hvad du skærpede og hvordan det svarer på kritikken. Aflever via det angivne værktøj.`;

export function buildTerritorySharpen(
  brief: Brief,
  territory: Territory,
  critique: {
    distinctivenessScore?: number;
    truthScore?: number;
    elasticityScore?: number;
    memorabilityScore?: number;
    weaknesses?: string[];
    provocations?: string[];
    killCriterion?: string;
    verdict?: string;
  },
  strategy?: StrategyFoundation | null,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const system = cacheableSystem([TERRITORY_SHARPEN_SYSTEM_ROLE, cviSectionText(brief)]);
  const foundation = strategy ? strategyContextText(strategy) : '';
  const weaknesses = (critique.weaknesses || []).map((w) => `  - ${w}`).join('\n');
  const provocations = (critique.provocations || []).map((p) => `  - ${p}`).join('\n');
  const critiqueText = `STRATEGENS PRES-TEST (skal besvares i skærpningen):
- Scorer: Distinkthed ${critique.distinctivenessScore ?? '?'}/100, Sandhed ${critique.truthScore ?? '?'}/100, Elasticitet ${critique.elasticityScore ?? '?'}/100, Mindeværdighed ${critique.memorabilityScore ?? '?'}/100
- Svagheder:
${weaknesses || '  - N/A'}
- Provokationer at svare på:
${provocations || '  - N/A'}
- Kill-kriterium: ${critique.killCriterion || 'N/A'}
- Dom: ${critique.verdict || 'N/A'}`;

  const user = `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Sprog: ${brief.language || 'Dansk'}
${foundation ? `\n${foundation}\n` : ''}
${territoryFullText(territory)}

${critiqueText}

Skærp nu ruten så den svarer på pres-testen — samme rute, hævet et niveau. Aflever den skærpede rute (alle felter) + hvad du ændrede, via værktøjet. Skriv på ${brief.language || 'Dansk'}.`;
  return { system, user };
}

// ---------------------------------------------------------------------------
// /api/channel-matrix — Omni-channel: skalér den valgte idé til alle kanaler
// ---------------------------------------------------------------------------

export const CHANNEL_MATRIX_SYSTEM_ROLE = `Du er Omni-channel Creative Director og integreret producer i et reklamebureau i verdensklasse.

Du modtager ÉN valgt kampagne-platform (en stor idé med tagline, manifest og kanal-frø). Din opgave er at skalere den til en komplet omni-channel matrix: en færdig, produktionsklar eksekvering for hver kanal — samme store idé, men eksekveret native til hver kanals styrker.

Principper:
1. Trofast mod idéen: hver eksekvering skal umiskendeligt være SAMME kampagne — samme verden, tone, løfte og tagline. Ingen kanal må drive sin egen vej.
2. Native eksekvering: et filmmanus skal være et rigtigt manus (scener, voiceover, super, lyd); et radiospot skal have SFX, VO og timing; OOH skal være ÉN knivskarp visuel idé med få ord; social skal have krog, caption, hashtags og format; aktivering skal beskrive den fysiske/digitale oplevelse trin for trin; PR skal have en nyhedsvinkel og en pitch.
3. Konkret og produktionsklar: angiv varighed, format/ratio, antal scener, talent, lyd/musik og en tydelig CTA. Ingen floskler, ingen tom marketing-luft.
4. script-feltet er en sekvens af navngivne blokke (label + indhold). Brug labels der passer kanalen (fx "Scene 1", "VO", "Super", "SFX", "Caption", "Hashtags", "Headline", "Subline", "Oplevelse", "Pitch", "CTA").

Udvikl en eksekvering for hver kanal i platformens kanal-frø (og briefets kanaler). Aflever hele matrixen via det angivne værktøj, præcist som skemaet kræver.`;

/** Render den valgte rutes kanal-frø som seed-liste til omni-channel-skaleringen. */
function channelSeedsText(idea: ChosenIdea): string {
  const seeds = (Array.isArray(idea?.channelExpressions) ? idea.channelExpressions : [])
    .map((c) => `- ${c?.channel || 'Kanal'}: ${c?.idea || ''}`)
    .join('\n');
  return seeds ? `KANAL-FRØ FRA DEN VALGTE RUTE (skal foldes ud til fulde eksekveringer):\n${seeds}` : '';
}

/**
 * Skalér den valgte kampagne-platform til en produktionsklar omni-channel matrix.
 * Trådes med både den store idé (kohærens) og det strategiske fundament (forankring).
 */
export function buildChannelMatrix(
  brief: Brief,
  chosenIdea: ChosenIdea,
  strategy?: StrategyFoundation | null,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const system = cacheableSystem([CHANNEL_MATRIX_SYSTEM_ROLE, cviSectionText(brief)]);
  const platform = campaignContextText(chosenIdea);
  const seeds = channelSeedsText(chosenIdea);
  const foundation = strategy ? strategyContextText(strategy) : '';
  const intake = briefIntakeText(brief);

  const user = `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad lavede vi (Beskrivelse): ${brief.description || 'N/A'}
- Særlige detaljer: ${brief.details || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Tone: ${brief.tone || 'Professionel, menneskelig, kreativ'}
- Sprog: ${brief.language || 'Dansk'}
- Briefets kanaler: ${(brief.channels || []).join(', ') || 'N/A'}
${intake ? `\n${intake}\n` : ''}
${platform || 'INGEN valgt platform — vælg en kreativ rute først.'}
${seeds ? `\n${seeds}\n` : ''}${foundation ? `\n${foundation}\n` : ''}
Skalér nu den valgte store idé til en komplet omni-channel matrix — én produktionsklar eksekvering pr. kanal (fold kanal-frøene ud, og dæk briefets kanaler). Aflever via værktøjet. Skriv på ${brief.language || 'Dansk'} (kanal-/format-navne må gerne være engelske hvor det er mest naturligt).`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// /api/effectiveness — Effekt-lag: mål-hierarki, KPI'er og måleplan
// ---------------------------------------------------------------------------

export const EFFECTIVENESS_SYSTEM_ROLE = `Du er Head of Effectiveness (Effektivitetsdirektør) i et reklamebureau i verdensklasse — skolet i IPA's effektivitets-tænkning og Les Binet & Peter Fields arbejde om kort- vs. langsigtet effekt.

Din opgave er at omsætte ÉN valgt kampagne-platform til et stringent, troværdigt effekt-lag, så kampagnen kan sælges — og bevises — på effekt, ikke kun på kreativitet.

Principper:
1. Mål-hierarki: byg en klar ladder fra forretningsmål → adfærdsmål → kommunikationsmål. Hvert niveau skal have en målbar KPI, et realistisk måltal og et benchmark.
2. Realisme over fantasi: måltal skal være ambitiøse men troværdige og forankret i branche-benchmarks — ikke ønsketænkning. Vær konkret om enheder og procenter.
3. Ingen vanity metrics: prioritér metrikker der knytter sig til reel forretningsværdi (ikke bare likes/visninger uden kontekst).
4. Balancér kort og lang: anvend Binet & Field — adskil kortsigtet aktivering (salg nu) fra langsigtet brand-opbygning (fremtidig efterspørgsel), og anbefal et split.
5. Leading vs. lagging: angiv tidlige signaler (måles hurtigt) OG outcome-metrikker (bekræfter effekt senere).
6. Måleplan: konkret kadence (baseline, løbende, post-kampagne) og værktøjer pr. kanal.
7. Vær ærlig om risici og antagelser der kan underminere effekten.

Aflever hele effekt-laget via det angivne værktøj, præcist som skemaet kræver.`;

/**
 * Byg effekt-laget for en valgt kampagne-platform. Trådes med både den store idé
 * (hvad måler vi på), strategi-fundamentet (ønsket respons/forretningskontekst) og
 * de faktiske kanaler (måleplan pr. kanal).
 */
export function buildEffectiveness(
  brief: Brief,
  chosenIdea: ChosenIdea,
  strategy?: StrategyFoundation | null,
  channels?: string[],
): { system: Anthropic.TextBlockParam[]; user: string } {
  const system = cacheableSystem([EFFECTIVENESS_SYSTEM_ROLE, cviSectionText(brief)]);
  const platform = campaignContextText(chosenIdea);
  const foundation = strategy ? strategyContextText(strategy) : '';
  const channelList =
    (Array.isArray(channels) && channels.length ? channels : brief.channels || []).join(', ') ||
    'N/A';

  const intake = briefIntakeText(brief);
  const user = `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad lavede vi (Beskrivelse): ${brief.description || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Sprog: ${brief.language || 'Dansk'}
${intake ? `\n${intake}\n` : ''}
${platform || 'INGEN valgt platform — vælg en kreativ rute først.'}
${foundation ? `\n${foundation}\n` : ''}
KANALER AT MÅLE: ${channelList}

Byg nu effekt-laget for denne kampagne: et mål-hierarki (forretning → adfærd → kommunikation) med målbare KPI'er, benchmarks og realistiske måltal; en KPI pr. kanal; kort- vs. langsigtet balance (Binet & Field) med anbefalet split; leading- og lagging-indikatorer; et realistisk succes-scenarie; risici; og en måle-kadence. Aflever via værktøjet. Skriv på ${brief.language || 'Dansk'} (metrik-navne må gerne være engelske hvor det er mest naturligt).`;

  return { system, user };
}

// ---------------------------------------------------------------------------
// /api/logo-prompt — optimér/oversæt logo-prompt til Recraft text-to-vector
// ---------------------------------------------------------------------------

export const LOGO_PROMPT_SYSTEM_ROLE = `Du er ekspert i at skrive prompts til AI vektor-logo-generatoren Recraft V4 (text-to-vector).

Du producerer ÉN færdig logo-prompt på ENGELSK, optimeret til at generere et skarpt, skalerbart SVG-vektorlogo.

REGLER FOR EN GOD RECRAFT LOGO-PROMPT:
1. Skriv på engelsk — Recraft fungerer markant bedre på engelsk.
2. Vær konkret om: hovedsymbol/motiv, geometrisk form, komposition og stiludtryk.
3. Beskriv et ENKELT, rent ikon/symbol — ikke en scene eller et fotografi.
4. Bed ALDRIG om tekst, bogstaver, ord eller typografi i logoet (vektor-loget skal være et rent grafisk mærke).
5. Brug vektorvenlige termer: "flat vector logo", "minimal geometric icon", "clean lines", "scalable", "solid shapes", "negative space".
6. Undgå floskler, fotorealisme, gradients-tunge beskrivelser og overflødige ord.
7. Hold den fokuseret — typisk 1-3 sætninger. Ingen forklaringer rundt om.

Aflever KUN den færdige prompt via det angivne værktøj.`;

export function buildLogoPrompt(
  brief: Brief,
  currentPrompt: string,
  mode: 'translate' | 'refine',
): { system: Anthropic.TextBlockParam[]; user: string } {
  const colors = (brief.cviManual?.brandColors || []).join(', ');
  const cviLine = colors ? `\n- Brand-farver (CVI): ${colors}` : '';
  const styleLine = brief.cviManual?.imageStyleGuidelines
    ? `\n- Visuel stil (CVI): ${brief.cviManual.imageStyleGuidelines}`
    : '';

  const task =
    mode === 'translate'
      ? `Konvertér nedenstående input til én optimeret, engelsk Recraft logo-prompt. Inddrag relevant kontekst fra briefet, så logoet matcher kunden og projektet.`
      : `Forfin og skærp nedenstående eksisterende logo-prompt: gør den mere konkret, vektorvenlig og fokuseret — bevar den oprindelige idé og retning, men løft kvaliteten.`;

  const user = `PROJEKT KONTEKST:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad handler det om: ${brief.description || 'N/A'}
- Branche/målgruppe: ${brief.audience || 'N/A'}
- Tone/stemning: ${brief.tone || 'N/A'}${cviLine}${styleLine}

INPUT (${mode === 'translate' ? 'rå beskrivelse der skal oversættes' : 'eksisterende prompt der skal forfines'}):
"""
${currentPrompt || '(tom — byg en passende logo-prompt ud fra konteksten ovenfor)'}
"""

OPGAVE:
${task}
Aflever den færdige engelske logo-prompt via værktøjet.`;

  return { system: cacheableSystem([LOGO_PROMPT_SYSTEM_ROLE]), user };
}

// ---------------------------------------------------------------------------
// /api/image-prompt — AI-optimeret billed-prompt (oversæt / forfin)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// /api/brainstorm — kreativ idé-eksplosion før produktionsstart
// ---------------------------------------------------------------------------

export const BRAINSTORM_SYSTEM_ROLE = `Du er en prisvindende Kreativ Strateg og Idéudvikler for Neura Studio.

Din opgave er at analysere et projekt-brief og generere en bred vifte af kreative muligheder — INDEN den egentlige indholdsproduktion begynder.

Formål:
1. Afdæk den VIRKELIGE kernehistorie (hvad er det egentlig interessante her?)
2. Foreslå 4 distinkte, dristige kreative retninger — inkl. dem ingen normalt ville overveje
3. Identificer hvad der gør NETOP dette projekt unikt og mindeværdigt
4. Stil de skarpe spørgsmål der afslører hvad briefet ikke fortæller

Regler:
- Vær modig og konkret. Undgå de oplagte, forudsigelige og generiske vinkler.
- Tænk i kontraster, overraskende åbninger og distinkte stemmer.
- Fokusér på det SENSORISKE og KONKRETE — hvad ser/føler/oplever målgruppen præcis?
- Ingen floskler. Ingen svulstige marketingsprog. Kun skarpe, specifikke idéer.
- Aflever alt via det angivne værktøj.`;

export function buildBrainstorm(brief: Brief): {
  system: Anthropic.TextBlockParam[];
  user: string;
} {
  const intake = briefIntakeText(brief);
  const user = `PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad lavede vi: ${brief.description || 'N/A'}
- Særlige detaljer: ${brief.details || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Tone: ${brief.tone || 'Professionel, menneskelig, kreativ'}
- Sprog: ${brief.language || 'Dansk'}
- Kanaler: ${(brief.channels || []).join(', ') || 'N/A'}
- Ekstra noter: ${brief.notes || 'N/A'}
${intake ? `\n${intake}\n` : ''}
Lav nu en kreativ brainstorm: identificér kernehistorien, foreslå 4 distinkte kreative retninger (med overskrift og LinkedIn-krog for hver), nøgle-differentiatorerne, målgruppeinsigter, et skærpende spørgsmål og brief-mangler. Aflever via værktøjet. Skriv på ${brief.language || 'Dansk'}.`;

  return { system: cacheableSystem([BRAINSTORM_SYSTEM_ROLE]), user };
}

// ---------------------------------------------------------------------------
// Deliberation (redaktionsmøde): Kreativ Direktør + Chefredaktør
// ---------------------------------------------------------------------------

export const CREATIVE_PUSH_SYSTEM_ROLE = `Du er en prisvindende Kreativ Direktør, kendt for idéer der får folk til at stoppe op midt i scrollet.
Din opgave er at sprænge rammerne kreativt: foreslå vildt dristige, uventede og gerne provokerende vinkler, kroge og overskrifter — det der tør skille sig ud — uden at miste det konkrete eller opfinde fakta.
Tænk i overraskende kontraster, stærke billeder, uventede åbninger og en distinkt stemme. INGEN sikre, forudsigelige, generiske eller "corporate-pæne" forslag — dem ryger direkte i skraldespanden. Hver idé skal kunne forsvare hvorfor den er modigere end det oplagte. Du leverer IKKE den færdige tekst; du leverer skarpe, vovede alternativer som chefredaktøren kan vælge fra. Aflever via det angivne værktøj.`;

/** Sikrer en liste, selv hvis modellen returnerer et felt i forkert form (robusthed). */
function arr(x: any): any[] {
  return Array.isArray(x) ? x : [];
}

/** Kreativ Direktør: foreslår dristigere overskrifter/kroge/vinkler ud fra udkast + kritik. */
export function buildCreativePush(
  draft: any,
  critique: any,
  brief?: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const lang = brief?.language || 'Dansk';
  const tone = brief?.tone || 'professionel, menneskelig, kreativ';
  const headlines = arr(draft?.headlines).slice(0, 5).map((h: string) => `- ${h}`).join('\n');
  const hook = (draft?.linkedinPost || '').split('\n')[0] || '';
  const cliches = arr(critique?.clichesFound).join(', ') || 'ingen registreret';

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

export const SYNTHESIZE_SYSTEM_ROLE = `Du er Chefredaktør for Neura Studio — du har skarp smag og masser af mod.
Du modtager (1) et førsteudkast, (2) en uvildig redaktionel kritik med floskel-liste og scorer, og (3) kreative alternativer fra en kreativ direktør.
Din opgave er at producere en FORBEDRET, samlet udgave af hele content-pakken, der er BÅDE markant mere kreativ OG mere konkret. Vælg de modigste, mest originale elementer — aldrig det sikre kompromis — og slib IKKE kanterne af. Resultatet skal have en distinkt stemme, en overraskende vinkel og et levende billedsprog, så det skiller sig ud fra alt det generiske derude. Fjern hver flosket/kliché fra kritikkens liste, indarbejd de stærkeste vovede kroge, og hæv konkretheden med specifikke leverancer, tal og formater.
Bevar alle fakta og tal fra udkastet. Følg de samme regler som for normal generering (billedprompts på engelsk, alle felter udfyldt). Aflever HELE pakken via det angivne værktøj, præcis som skemaet kræver.`;

/** Chefredaktør: syntetiserer udkast + kritik + kreative alternativer til forbedret fuld pakke. */
export function buildSynthesize(
  draft: any,
  critique: any,
  creative: any,
  brief: Brief,
  chosenIdea?: ChosenIdea | null,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const cliches = arr(critique?.clichesFound).join(', ') || 'ingen';
  const evalNotes = arr(critique?.evaluations)
    .map((e: any) => `- ${e.ruleName}: ${e.status} (${e.score}/100) — ${e.feedback}`)
    .join('\n');
  const boldHeadlines = arr(creative?.boldHeadlines).map((h: string) => `- ${h}`).join('\n');
  const boldHooks = arr(creative?.boldHooks).map((h: string) => `- ${h}`).join('\n');
  const angles = arr(creative?.angles).map((a: string) => `- ${a}`).join('\n');
  const campaign = chosenIdea ? campaignContextText(chosenIdea) : '';

  const user = `${generateUserText(brief)}
${campaign ? `\n${campaign}\n` : ''}
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
OVERSKRIFTER: ${arr(draft?.headlines).join(' | ')}
CTA: ${arr(draft?.cta).join(' | ')}
NYHEDSBREV-EMNER: ${arr(draft?.mailchimpSubjects).join(' | ')}

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
  const mood = arr(c?.moodKeywords).join(', ');
  return `VISUELT KONCEPT:
${c?.visualConcept || ''}

BILLEDPROMPTS:
- Hero: ${c?.imagePrompts?.hero || ''}
- Detail: ${c?.imagePrompts?.detail || ''}
- Abstract: ${c?.imagePrompts?.abstract || ''}

MOOD/STIKORD: ${mood || 'N/A'}`;
}

export const VISUAL_DRAFT_SYSTEM_ROLE = `Du er en prisvindende Art Director og visuel konceptudvikler for Neura Studio.
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
  const weaknesses = arr(critique?.weaknesses).join(', ') || 'ingen registreret';
  const user = `NUVÆRENDE VISUELLE UDKAST:
${visualConceptAsText(concept)}

KRITIKKENS SVAGHEDER (skal løftes):
${weaknesses}
Samlet dom: ${critique?.overallReview || 'N/A'}

Tone/stemning: ${brief?.tone || 'N/A'}. Foreslå markant dristigere visuelle retninger via værktøjet.`;
  return { system: cacheableSystem([VISUAL_PUSH_SYSTEM_ROLE]), user };
}

export const VISUAL_SYNTHESIZE_SYSTEM_ROLE = `Du er Chefdesigner / ledende Art Director for Neura Studio.
Du modtager (1) et visuelt udkast, (2) en uvildig visuel kritik, og (3) dristige alternative retninger fra en kreativ direktør.
Din opgave er at producere ÉT FORBEDRET visuelt koncept og TRE forfinede billedprompts (hero, detail, abstract): fjern klichéerne fra kritikken, indarbejd de stærkeste dristige retninger, og hæv konkretheden (lys, komposition, linse, farve, materiale, motiv). Hold dig on-brand ift. CVI. Aflever HELE pakken via det angivne værktøj, præcis som skemaet kræver.`;

/** Chefdesigner: syntetiserer udkast + kritik + dristige retninger til forfinet visuel pakke. */
export function buildVisualSynthesize(
  concept: any,
  critique: any,
  directions: any,
  brief: Brief,
): { system: Anthropic.TextBlockParam[]; user: string } {
  const weaknesses = arr(critique?.weaknesses).join(', ') || 'ingen';
  const boldVisuals = arr(directions?.boldVisuals).map((d: string) => `- ${d}`).join('\n');
  const lightingAndColor = arr(directions?.lightingAndColor).map((d: string) => `- ${d}`).join('\n');
  const compositions = arr(directions?.compositions).map((d: string) => `- ${d}`).join('\n');

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
