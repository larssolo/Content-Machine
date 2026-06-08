/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, SetStateAction } from 'react';
import { Wand2, Scissors, Sprout, Briefcase } from 'lucide-react';

/**
 * Hurtig-raffinering af den valgte tekst-blok: indbyggede kommandoer
 * (/shorten, /more-human, /more-business) + fri-tekst-instruktion.
 * Udtrukket fra App.tsx's output-workspace.
 */
interface RefinementBarProps {
  selectedTextKey: string;
  customRefinementPrompt: string;
  setCustomRefinementPrompt: Dispatch<SetStateAction<string>>;
  isRefining: boolean;
  isGenerating: boolean;
  onRefine: (command: string, key: string) => void;
}

export function RefinementBar({
  selectedTextKey, customRefinementPrompt, setCustomRefinementPrompt,
  isRefining, isGenerating, onRefine,
}: RefinementBarProps) {
  return (
    <div className="p-4 bg-slate-950/90 border-t border-slate-850 text-slate-400 font-sans text-xs space-y-3.5">

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-850 pb-3">
        <div className="space-y-1 text-left">
          <span className="text-[11px] font-mono font-bold tracking-wider text-slate-200 flex items-center space-x-1.5 uppercase">
            <Wand2 className="w-3.5 h-3.5 text-orange-500" />
            <span>Hurtig-Raffinering af valgt blok</span>
          </span>
          <div className="text-[11px] text-slate-400 font-mono">
            Valgt felt: <span className="text-orange-400 font-bold">{selectedTextKey}</span>
          </div>
        </div>

        {/* Commands panel */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onRefine('/shorten', selectedTextKey)}
            disabled={isRefining || isGenerating}
            id="refine_shorten_cli_active"
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg border border-slate-800 text-[11px] flex items-center space-x-1.5 transition-all"
            title="Forkort den valgte tekst"
          >
            <Scissors className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>/shorten</span>
          </button>
          <button
            onClick={() => onRefine('/more-human', selectedTextKey)}
            disabled={isRefining || isGenerating}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg border border-slate-800 text-[11px] flex items-center space-x-1.5 transition-all"
            title="Gør den mere levende og menneskelig"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>/more-human</span>
          </button>
          <button
            onClick={() => onRefine('/more-business', selectedTextKey)}
            disabled={isRefining || isGenerating}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-lg border border-slate-800 text-[11px] flex items-center space-x-1.5 transition-all"
            title="Gør den mere erhvervsmæssig og skarp"
          >
            <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>/more-business</span>
          </button>
        </div>
      </div>

      {/* Custom text refine prompt entry */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          id="custom_refine_input"
          value={customRefinementPrompt}
          onChange={(e) => setCustomRefinementPrompt(e.target.value)}
          placeholder="Eller skriv din egen instruktion her... (f.eks. 'skriv på fynsk' eller 'fokusér mere på maskotten')"
          className="flex-1 bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && customRefinementPrompt.trim()) {
              onRefine(customRefinementPrompt, selectedTextKey);
            }
          }}
        />
        <button
          onClick={() => onRefine(customRefinementPrompt, selectedTextKey)}
          disabled={isRefining || !customRefinementPrompt.trim()}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:bg-slate-900 disabled:text-slate-600 disabled:active:scale-100 disabled:border-slate-850 text-orange-400 hover:text-orange-300 font-semibold text-xs rounded-lg transition-all border border-slate-700"
        >
          {isRefining ? 'Raffinerer...' : 'Kør omskrivning'}
        </button>
      </div>

    </div>
  );
}
