/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fragment } from 'react';
import { Palette, Sparkles, X, AlertTriangle } from 'lucide-react';
import { ImageGenCard, type ImageGenState } from './ImageGenCard';
import type { VisualDevResult } from '../types';

type ImgKey = 'hero' | 'detail' | 'abstract';

interface Props {
  result: VisualDevResult;
  images: Record<ImgKey, ImageGenState>;
  copiedKey: string | null;
  clientName: string;
  onCopyPrompt: (text: string, key: string) => void;
  onAspectChange: (key: ImgKey, ratio: string) => void;
  onGenerateImage: (key: ImgKey, promptText: string) => void;
  onClose?: () => void;
}

const METRICS: { key: keyof VisualDevResult['critiqueBefore']; label: string }[] = [
  { key: 'onBrandScore', label: 'On-brand' },
  { key: 'specificityScore', label: 'Konkrethed' },
  { key: 'originalityScore', label: 'Originalitet' },
];

const CARDS: { key: ImgKey; label: string; footer: string; ratios: string[] }[] = [
  { key: 'hero', label: 'Hero', footer: 'High production value', ratios: ['16:9', '1:1', '4:3', '9:16'] },
  { key: 'detail', label: 'Detail / close-up', footer: 'Makro / tekstur', ratios: ['1:1', '4:3', '16:9', '9:16'] },
  { key: 'abstract', label: 'Abstract baggrund', footer: 'Atmosfære & tekstur', ratios: ['16:9', '1:1', '4:3', '9:16'] },
];

function scoreColor(v: number): string {
  if (v >= 80) return 'text-emerald-400';
  if (v >= 60) return 'text-amber-400';
  return 'text-red-400';
}

/** Resultatet af den visuelle redaktion: koncept + før/efter-kritik + de tre billed-kort. */
export function VisualDevPanel({
  result,
  images,
  copiedKey,
  clientName,
  onCopyPrompt,
  onAspectChange,
  onGenerateImage,
  onClose,
}: Props) {
  const { concept, critiqueBefore, critiqueAfter, earlyStopped, synthesisTruncated } = result;
  const review = critiqueAfter?.overallReview || critiqueBefore.overallReview;
  const base = clientName.replace(/\s+/g, '_') || 'visual';

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-violet-600/15 border border-violet-500/30 flex items-center justify-center shrink-0">
            <Palette className="w-4 h-4 text-violet-300" />
          </div>
          <div>
            <span className="font-display font-medium text-sm text-white flex items-center gap-1.5">
              Visuel udvikling
              <Sparkles className="w-3 h-3 text-violet-400" />
            </span>
            <span className="block text-[11px] text-slate-400">
              Redaktionen forfinede konceptet og de tre billedprompts
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 transition-colors"
            title="Luk"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="p-5 space-y-5">
        {(synthesisTruncated || earlyStopped) && (
          <div className="flex items-start gap-2 text-[11px] text-amber-400/90 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {synthesisTruncated
                ? 'Syntesen blev afkortet. Det viste er det bedste fuldstændige visuelle udkast.'
                : 'Udkastet scorede allerede højt, så den fulde visuelle redaktion blev sprunget over.'}
            </span>
          </div>
        )}

        {/* Koncept */}
        <div>
          <span className="block text-[11px] font-medium text-slate-400 mb-1.5">Visuelt koncept</span>
          <p className="text-sm text-slate-200 leading-relaxed">{concept.visualConcept}</p>
          {concept.moodKeywords?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {concept.moodKeywords.map((m, i) => (
                <span
                  key={i}
                  className="text-[11px] text-violet-200/90 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md"
                >
                  {m}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Før/efter-kritik */}
        <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-3.5 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {METRICS.map((m) => {
              const before = critiqueBefore[m.key] as number;
              const after = critiqueAfter ? (critiqueAfter[m.key] as number) : undefined;
              const shown = after ?? before;
              return (
                <div key={m.key as string}>
                  <span className="block text-[11px] text-slate-400">{m.label}</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    {after !== undefined && after !== before && (
                      <span className="text-[11px] text-slate-500">{before}→</span>
                    )}
                    <span className={`text-lg font-bold ${scoreColor(shown)}`}>{shown}</span>
                    <span className="text-[11px] text-slate-500">/100</span>
                  </div>
                </div>
              );
            })}
          </div>
          {review && (
            <p className="text-xs italic text-slate-300 leading-relaxed border-t border-slate-800/60 pt-2.5">
              "{review}"
            </p>
          )}
        </div>

        {/* Billed-kort */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CARDS.map((c) => (
            <Fragment key={c.key}>
              <ImageGenCard
                label={c.label}
                footer={c.footer}
                alt={`AI ${c.key} concept`}
                ratios={c.ratios}
                promptText={concept.imagePrompts[c.key]}
                image={images[c.key]}
                downloadBase={`${base}_${c.key}`}
                copied={copiedKey === `vprompt_${c.key}`}
                onCopy={() => onCopyPrompt(concept.imagePrompts[c.key], `vprompt_${c.key}`)}
                onAspectChange={(r) => onAspectChange(c.key, r)}
                onGenerate={() => onGenerateImage(c.key, concept.imagePrompts[c.key])}
              />
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
