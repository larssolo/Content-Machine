/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, FileText, Zap } from 'lucide-react';
import { PRESETS } from '../hooks/useContentMachine';
import { PresetBrief } from '../types';

/**
 * Tom-tilstand: instruktioner og hurtig-start-knapper der vises før det første
 * indhold er genereret. Udtrukket fra App.tsx.
 */
interface BlankStateProps {
  onLoadPreset: (preset: PresetBrief) => void;
  onGenerateAll: () => void;
}

export function BlankState({ onLoadPreset, onGenerateAll }: BlankStateProps) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800">
        <FileText className="w-8 h-8 text-brand-orange-500" />
      </div>

      <div className="max-w-md space-y-2">
        <h3 className="font-display font-medium text-lg text-white">Content Machine klar</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Indlæs et test-brief fra listen til venstre (Modaxo Move 2026 er klar som standard), redigér eventuelt værdierne, og tryk derefter på
          <span className="font-bold text-orange-400"> "Generér indhold" </span>
          for at generere brandindhold, SoMe og produktionsstrategier på ét sekund.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => onLoadPreset(PRESETS[0])}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-850 rounded-lg text-xs font-mono text-slate-350 border border-slate-800 flex items-center space-x-1.5 transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Genindlæs Modaxo Test</span>
        </button>
        <button
          onClick={onGenerateAll}
          id="btn_blank_generate"
          className="px-4 py-2 bg-brand-orange-600 hover:bg-brand-orange-500 rounded-lg text-xs font-semibold text-white flex items-center space-x-1.5 transition-colors"
        >
          <span>Generér indhold</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
