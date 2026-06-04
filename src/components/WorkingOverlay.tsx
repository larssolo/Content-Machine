/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Loader2 } from 'lucide-react';

interface Props {
  show: boolean;
  /** Hvad der arbejdes på, fx "Redaktionsmøde" eller "Visuel udvikling". */
  title?: string;
  /** Live fase-/trin-tekst der opdateres undervejs. */
  step?: string;
}

/**
 * Lilla "appen arbejder/tænker"-overlay. Vises under tunge AI-kald og fanger
 * museklik (så intet trykkes dobbelt), med live fase-tekst.
 */
export function WorkingOverlay({ show, title = 'Arbejder', step }: Props) {
  if (!show) return null;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl border border-violet-500/30 bg-slate-950/90 px-6 py-7 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-14 w-14 rounded-full bg-violet-500/20 blur-md" />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-violet-500/40 bg-violet-600/15">
              <Loader2 className="h-6 w-6 text-violet-300 animate-spin" />
            </div>
          </div>
          <div className="space-y-1">
            <p className="font-display text-sm font-semibold text-violet-100">{title} …</p>
            <p className="min-h-[1.25rem] text-[13px] leading-relaxed text-slate-300">
              {step || 'Tænker …'}
            </p>
          </div>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400/80 animate-pulse" />
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400/60 animate-pulse [animation-delay:150ms]" />
            <span className="h-1.5 w-1.5 rounded-full bg-violet-400/40 animate-pulse [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
