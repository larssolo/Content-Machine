/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Users, ChevronDown, ChevronRight, TrendingUp, AlertTriangle, Sparkles } from 'lucide-react';
import type { ToneAnalysis } from '../types';

interface Props {
  critiqueBefore: ToneAnalysis;
  critiqueAfter?: ToneAnalysis | null;
  earlyStopped?: boolean;
  synthesisTruncated?: boolean;
}

type MetricKey = 'clicheScore' | 'concretenessScore' | 'humanScore';

const METRICS: { key: MetricKey; label: string }[] = [
  { key: 'clicheScore', label: 'Floskel-frihed' },
  { key: 'concretenessScore', label: 'Konkrethed' },
  { key: 'humanScore', label: 'Menneskelighed' },
];

function barColor(v: number): string {
  if (v >= 80) return 'bg-emerald-500';
  if (v >= 60) return 'bg-amber-500';
  return 'bg-red-500';
}

/** Sammenffoldet "Se redaktionsmødet"-panel: viser før/efter-scorer fra deliberation-sløjfen. */
export function DeliberationTimeline({ critiqueBefore, critiqueAfter, earlyStopped, synthesisTruncated }: Props) {
  const [open, setOpen] = useState(false);

  // Find den største score-forbedring til den altid-synlige overskrift.
  let bestLift: { label: string; before: number; after: number } | null = null;
  if (critiqueAfter) {
    for (const m of METRICS) {
      const before = critiqueBefore[m.key];
      const after = critiqueAfter[m.key];
      if (bestLift === null || after - before > bestLift.after - bestLift.before) {
        bestLift = { label: m.label, before, after };
      }
    }
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-slate-900/40 transition-colors cursor-pointer"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-orange-600/15 border border-brand-orange-500/30 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-brand-orange-500" />
          </div>
          <div>
            <span className="font-display font-medium text-sm text-white flex items-center gap-1.5">
              Redaktionsmøde
              <Sparkles className="w-3 h-3 text-amber-400" />
            </span>
            <span className="block text-[11px] text-slate-400">
              {synthesisTruncated
                ? 'Afbrudt — viser bedste udkast'
                : earlyStopped
                  ? 'Udkastet var allerede stærkt'
                  : bestLift
                    ? `${bestLift.label} ${bestLift.before} → ${bestLift.after} (+${bestLift.after - bestLift.before})`
                    : 'Tre AI-roller forbedrede udkastet'}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {bestLift && bestLift.after > bestLift.before && (
            <span className="hidden sm:flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
              <TrendingUp className="w-3 h-3" />
              forbedret
            </span>
          )}
          {open ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/60">
          {(synthesisTruncated || earlyStopped) && (
            <div className="flex items-start gap-2 text-[11px] text-amber-400/90 bg-amber-500/5 border border-amber-500/20 rounded-lg p-2.5 mt-3">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {synthesisTruncated
                  ? 'Syntese-runden blev afkortet. Det viste resultat er det bedste fuldstændige udkast.'
                  : 'Udkastet scorede allerede højt, så det fulde redaktionsmøde blev sprunget over for at spare tid.'}
              </span>
            </div>
          )}

          <div className="space-y-2.5 mt-3">
            {METRICS.map((m) => {
              const before = critiqueBefore[m.key];
              const after = critiqueAfter ? critiqueAfter[m.key] : undefined;
              return (
                <div key={m.key} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium text-slate-400">
                    <span>{m.label}</span>
                    <span className="text-slate-300">
                      {after !== undefined && after !== before ? (
                        <>
                          <span className="text-slate-500">{before}</span>
                          <span className="text-slate-600"> → </span>
                          <span className={after >= before ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{after}</span>
                        </>
                      ) : (
                        <span className="text-slate-300 font-bold">{after ?? before}</span>
                      )}
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor(after ?? before)}`}
                      style={{ width: `${after ?? before}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {(critiqueAfter?.overallReview || critiqueBefore.overallReview) && (
            <div className="bg-slate-900/40 border border-slate-850 rounded-lg p-3">
              <span className="block text-[11px] font-semibold text-slate-400 mb-1">
                Chefredaktørens dom
              </span>
              <p className="text-xs italic text-slate-300 leading-relaxed">
                "{critiqueAfter?.overallReview || critiqueBefore.overallReview}"
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
