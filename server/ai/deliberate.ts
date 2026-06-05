/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateStructured } from './structured';
import { config } from './config';
import { buildGenerate, buildAnalyze, buildCreativePush, buildSynthesize, type Brief } from './prompts';
import { generateTool, analyzeTool, creativeTool } from './schemas';

/**
 * "Redaktionsmøde" — en server-side deliberation-sløjfe hvor flere AI-roller
 * kritiserer og forbedrer hinandens arbejde for at levere et mere kreativt og
 * bedre gennemarbejdet output end et enkelt generate-kald.
 *
 * Udkast (Opus) → Kritik (Haiku) → Kreativ push (Haiku) → Syntese (Opus) → Verificér (Haiku).
 */

export type DeliberatePhase =
  | 'udkast'
  | 'kritik'
  | 'kreativ'
  | 'syntese'
  | 'verificerer'
  | 'springer-over'
  | 'faerdig';

export interface DeliberateEvent {
  phase: DeliberatePhase;
  label: string;
  iteration?: number;
}

/** Hele content-pakken (samme form som generateTool / BrandSurfaceOutput). */
export type GeneratedOutput = Record<string, any>;

export interface Critique {
  clichesFound: string[];
  clicheScore: number;
  concretenessScore: number;
  humanScore: number;
  evaluations: any[];
  overallReview: string;
}

export interface CreativeDirections {
  boldHeadlines: string[];
  boldHooks: string[];
  angles: string[];
}

export interface DeliberateOptions {
  brief: Brief;
  /** Antal forbedrings-runder (hard-cappet til 2). Standard 1. */
  maxIterations?: number;
  /** Gennemsnitlig score (0-100) hvor udkastet anses for stærkt nok. Standard 85. */
  goodEnoughThreshold?: number;
  /** Kør en afsluttende kritik for før/efter-scorer. Standard true. */
  verify?: boolean;
  signal?: AbortSignal;
}

export interface DeliberateResult {
  output: GeneratedOutput;
  draft: GeneratedOutput;
  critiqueBefore: Critique;
  critiqueAfter?: Critique;
  earlyStopped: boolean;
  synthesisTruncated?: boolean;
}

const HARD_MAX_ITERATIONS = 2;
const DEFAULT_THRESHOLD = 85;

function scoreOf(t: Critique): number {
  return (t.clicheScore + t.concretenessScore + t.humanScore) / 3;
}

function coreTexts(o: GeneratedOutput) {
  return {
    shortCaseText: o.shortCaseText,
    longCaseText: o.longCaseText,
    linkedinPost: o.linkedinPost,
  };
}

function ensureNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error('Forespørgslen blev afbrudt.');
}

async function runCritique(output: GeneratedOutput, brief: Brief): Promise<Critique> {
  const a = buildAnalyze(coreTexts(output), brief);
  return generateStructured<Critique>({
    system: a.system,
    userContent: [{ type: 'text', text: a.user }],
    tool: analyzeTool,
    model: config.fastModel,
    maxTokens: 4096,
  });
}

export async function runDeliberation(
  opts: DeliberateOptions,
  emit: (e: DeliberateEvent) => void,
): Promise<DeliberateResult> {
  const { brief, signal } = opts;
  const threshold = opts.goodEnoughThreshold ?? DEFAULT_THRESHOLD;
  const maxIterations = Math.min(Math.max(opts.maxIterations ?? 1, 1), HARD_MAX_ITERATIONS);
  const verify = opts.verify ?? true;

  ensureNotAborted(signal);

  // 1. Udkast (Opus)
  emit({ phase: 'udkast', label: 'Skriver første udkast …' });
  const gen = buildGenerate(brief);
  const draft = await generateStructured<GeneratedOutput>({
    system: gen.system,
    userContent: [{ type: 'text', text: gen.user }],
    tool: generateTool,
    model: config.model,
    maxTokens: config.maxTokens,
    signal,
  });

  // 2. Kritik (Haiku)
  ensureNotAborted(signal);
  emit({ phase: 'kritik', label: 'Redaktøren kritiserer udkastet …' });
  const critiqueBefore = await runCritique(draft, brief);

  // Early-stop: udkastet er allerede stærkt nok.
  if (scoreOf(critiqueBefore) >= threshold) {
    emit({ phase: 'springer-over', label: 'Udkastet er allerede stærkt — springer redaktionsmødet over.' });
    emit({ phase: 'faerdig', label: 'Færdig.' });
    return { output: draft, draft, critiqueBefore, earlyStopped: true };
  }

  let current = draft;
  let currentCritique = critiqueBefore;
  let critiqueAfter: Critique | undefined;

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    // 3. Kreativ push (Haiku)
    ensureNotAborted(signal);
    emit({ phase: 'kreativ', label: 'Kreativ direktør foreslår dristigere vinkler …', iteration });
    const cp = buildCreativePush(current, currentCritique, brief);
    const creative = await generateStructured<CreativeDirections>({
      system: cp.system,
      userContent: [{ type: 'text', text: cp.user }],
      tool: creativeTool,
      model: config.fastModel,
      maxTokens: 4096,
    });

    // 4. Syntese (Opus) — med max_tokens-recovery.
    ensureNotAborted(signal);
    emit({ phase: 'syntese', label: 'Chefredaktøren forener kritik og kreativitet …', iteration });
    const syn = buildSynthesize(current, currentCritique, creative, brief);
    let synthesized: GeneratedOutput;
    try {
      synthesized = await generateStructured<GeneratedOutput>({
        system: syn.system,
        userContent: [{ type: 'text', text: syn.user }],
        tool: generateTool,
        model: config.model,
        maxTokens: config.maxTokens,
        signal,
      });
    } catch (err: any) {
      if (/afkortet/i.test(err?.message || '')) {
        // Mist aldrig det gode udkast pga. en trunkeret syntese — returnér seneste version.
        emit({ phase: 'faerdig', label: 'Kunne ikke fuldføre redaktionsmødet — viser bedste udkast.' });
        return { output: current, draft, critiqueBefore, critiqueAfter, earlyStopped: false, synthesisTruncated: true };
      }
      throw err;
    }

    current = synthesized;

    if (!verify) break;

    // 5. Verificér (Haiku)
    ensureNotAborted(signal);
    emit({ phase: 'verificerer', label: 'Måler forbedringen (før/efter) …', iteration });
    critiqueAfter = await runCritique(synthesized, brief);

    // Stop hvis godt nok, eller hvis vi har brugt alle tilladte runder.
    if (scoreOf(critiqueAfter) >= threshold || iteration >= maxIterations) break;
    // Ellers: kør endnu en runde med den syntetiserede version som nyt udkast.
    currentCritique = critiqueAfter;
  }

  emit({ phase: 'faerdig', label: 'Færdig.' });
  return { output: current, draft, critiqueBefore, critiqueAfter, earlyStopped: false };
}
