/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Rocket, Check, Copy } from 'lucide-react';
import type { DirectUsable } from '../types';

interface Props {
  directUsable: DirectUsable;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

/** "Kan bruges direkte" — de bedst nominerede elementer (read-only). */
export function DirectUsableBar({ directUsable, copiedKey, onCopy }: Props) {
  return (
    <div
      id="dir_usable_panel"
      className="bg-slate-950 border border-slate-800 rounded-xl p-7 shadow-sm relative overflow-hidden transition-all duration-300"
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-7">
        <div className="flex items-center space-x-2">
          <span className="font-display font-medium text-sm text-slate-100 flex items-center space-x-2">
            <Rocket className="w-4 h-4 text-brand-orange-500 shrink-0" />
            <span>Kan bruges direkte</span>
          </span>
        </div>
        <span className="text-[11px] text-slate-400 bg-slate-800/60 py-0.5 px-2.5 rounded-md">Bedst nominerede elementer</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bedste overskrift */}
        <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-805/50 relative hover:bg-slate-900/60 transition-colors duration-250">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-3">
            <span>Bedste overskrift</span>
            <button
              onClick={() => onCopy(directUsable.bestHeadline, 'bestHeadline')}
              className="text-slate-500 hover:text-white transition-colors"
              title="Kopier"
            >
              {copiedKey === 'bestHeadline' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-white text-xs font-bold leading-relaxed font-display font-medium tracking-tight pr-5">
            "{directUsable.bestHeadline}"
          </div>
        </div>

        {/* Bedste CTA */}
        <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-805/50 relative hover:bg-slate-900/60 transition-colors duration-250">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-3">
            <span>Bedste Call to Action</span>
            <button
              onClick={() => onCopy(directUsable.bestCta, 'bestCta')}
              className="text-slate-500 hover:text-white transition-colors"
              title="Kopier"
            >
              {copiedKey === 'bestCta' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-orange-400 text-xs font-semibold pr-5">
            {directUsable.bestCta}
          </div>
        </div>

        {/* Bedste korte tekst */}
        <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-805/50 md:col-span-2 space-y-3 hover:bg-slate-900/60 transition-colors duration-250">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
            <span>Bedste korte pitch / case-introduktion</span>
            <button
              onClick={() => onCopy(directUsable.bestShortText, 'bestShortText')}
              className="text-slate-500 hover:text-white transition-colors"
              title="Kopier"
            >
              {copiedKey === 'bestShortText' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed pr-6">
            {directUsable.bestShortText}
          </p>
        </div>

        {/* Bedste linkedin start */}
        <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-805/50 md:col-span-2 space-y-3 hover:bg-slate-900/60 transition-colors duration-250">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-2">
            <span>Bedste LinkedIn Hook (Krog)</span>
            <button
              onClick={() => onCopy(directUsable.bestLinkedinStart, 'bestLinkedinStart')}
              className="text-slate-500 hover:text-white transition-colors"
              title="Kopier"
            >
              {copiedKey === 'bestLinkedinStart' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <div className="text-xs text-white leading-relaxed font-medium italic border-l-2 border-brand-orange-500 pl-2.5">
            "{directUsable.bestLinkedinStart}"
          </div>
        </div>
      </div>
    </div>
  );
}
