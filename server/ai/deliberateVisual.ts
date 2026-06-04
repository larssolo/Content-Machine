/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { generateStructured } from './structured';
import { config } from './config';
import {
  buildVisualDraft,
  buildVisualCritique,
  buildVisualPush,
  buildVisualSynthesize,
  type Brief,
} from './prompts';
import { visualConceptTool, visualCritiqueTool, visualDirectionsTool } from './schemas';
import type { DeliberateEvent } from './deliberate';

/**
 * "Visuel redaktion" — samme redaktionsmøde-idé som runDeliberation, men hvor
 * AI-rollerne kun taler om det VISUELLE: ét koncept + tre billedprompts der
 * kritiseres og forbedres, før de vises og kan genereres som billeder.
 *
 * Udkast (Opus) → Kritik (Haiku) → Kreativ push (Haiku) → Syntese (Opus) → Verificér (Haiku).
 */

export interface VisualConcept {
  visualConcept: string;
  imagePrompts: { hero: string; detail: string; abstract: string };
  moodKeywords: string[];
}

export interface VisualCritique {
  onBrandScore: number;
  specificityScore: number;
  originalityScore: number;
  weaknesses: string[];
  overallReview: string;
}

export interface VisualDirections {
  boldVisuals: string[];
  lightingAndColor: string[];
  compositions: string[];
}

export interface VisualDeliberateOptions {
  brief: Brief;
  maxIterations?: number;
  goodEnoughThreshold?: number;
  verify?: boolean;
  signal?: AbortSignal;
}

export interface VisualDeliberateResult {
  output: VisualConcept;
  draft: VisualConcept;
  critiqueBefore: VisualCritique;
  critiqueAfter?: VisualCritique;
  earlyStopped: boolean;
  synthesisTruncated?: boolean;
}

const HARD_MAX_ITERATIONS = 2;
const DEFAULT_THRESHOLD = 85;

function scoreOf(c: VisualCritique): number {
  return (c.onBrandScore + c.specificityScore + c.originalityScore) / 3;
}

function ensureNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) throw new Error('Forespørgslen blev afbrudt.');
}

async function runVisualCritique(concept: VisualConcept, brief: Brief): Promise<VisualCritique> {
  const c = buildVisualCritique(concept, brief);
  return generateStructured<VisualCritique>({
    system: c.system,
    userContent: [{ type: 'text', text: c.user }],
    tool: visualCritiqueTool,
    model: config.fastModel,
    maxTokens: 2048,
  });
}

export async function runVisualDeliberation(
  opts: VisualDeliberateOptions,
  emit: (e: DeliberateEvent) => void,
): Promise<VisualDeliberateResult> {
  const { brief, signal } = opts;
  const threshold = opts.goodEnoughThreshold ?? DEFAULT_THRESHOLD;
  const maxIterations = Math.min(Math.max(opts.maxIterations ?? 1, 1), HARD_MAX_ITERATIONS);
  const verify = opts.verify ?? true;

  ensureNotAborted(signal);

  // 1. Visuelt udkast (Opus)
  emit({ phase: 'udkast', label: 'Art director skitserer det visuelle koncept …' });
  const d = buildVisualDraft(brief);
  const draft = await generateStructured<VisualConcept>({
    system: d.system,
    userContent: [{ type: 'text', text: d.user }],
    tool: visualConceptTool,
    model: config.model,
    maxTokens: 3072,
  });

  // 2. Kritik (Haiku)
  ensureNotAborted(signal);
  emit({ phase: 'kritik', label: 'Den visuelle kritiker vurderer udkastet …' });
  const critiqueBefore = await runVisualCritique(draft, brief);

  // Early-stop: udkastet er allerede stærkt nok.
  if (scoreOf(critiqueBefore) >= threshold) {
    emit({ phase: 'springer-over', label: 'Det visuelle udkast er allerede stærkt — springer videre.' });
    emit({ phase: 'faerdig', label: 'Færdig.' });
    return { output: draft, draft, critiqueBefore, earlyStopped: true };
  }

  let current = draft;
  let currentCritique = critiqueBefore;
  let critiqueAfter: VisualCritique | undefined;

  for (let iteration = 1; iteration <= maxIterations; iteration++) {
    // 3. Kreativ push (Haiku)
    ensureNotAborted(signal);
    emit({ phase: 'kreativ', label: 'Kreativ direktør foreslår dristigere visuelle retninger …', iteration });
    const p = buildVisualPush(current, currentCritique, brief);
    const directions = await generateStructured<VisualDirections>({
      system: p.system,
      userContent: [{ type: 'text', text: p.user }],
      tool: visualDirectionsTool,
      model: config.fastModel,
      maxTokens: 2048,
    });

    // 4. Syntese (Opus) — med max_tokens-recovery.
    ensureNotAborted(signal);
    emit({ phase: 'syntese', label: 'Chefdesigneren forfiner koncept og prompts …', iteration });
    const s = buildVisualSynthesize(current, currentCritique, directions, brief);
    let synthesized: VisualConcept;
    try {
      synthesized = await generateStructured<VisualConcept>({
        system: s.system,
        userContent: [{ type: 'text', text: s.user }],
        tool: visualConceptTool,
        model: config.model,
        maxTokens: 3072,
      });
    } catch (err: any) {
      if (/afkortet/i.test(err?.message || '')) {
        emit({ phase: 'faerdig', label: 'Kunne ikke fuldføre — viser bedste visuelle udkast.' });
        return { output: current, draft, critiqueBefore, critiqueAfter, earlyStopped: false, synthesisTruncated: true };
      }
      throw err;
    }

    current = synthesized;

    if (!verify) break;

    // 5. Verificér (Haiku)
    ensureNotAborted(signal);
    emit({ phase: 'verificerer', label: 'Måler den visuelle forbedring (før/efter) …', iteration });
    critiqueAfter = await runVisualCritique(synthesized, brief);

    if (scoreOf(critiqueAfter) >= threshold || iteration >= maxIterations) break;
    currentCritique = critiqueAfter;
  }

  emit({ phase: 'faerdig', label: 'Færdig.' });
  return { output: current, draft, critiqueBefore, critiqueAfter, earlyStopped: false };
}
