/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Check,
  Compass,
  Copy,
  Lightbulb,
  Loader2,
  Quote,
  Radar,
  Rocket,
  ShieldCheck,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { StrategyFoundation } from '../types';

interface StrategyPanelProps {
  strategy: StrategyFoundation;
  onClose: () => void;
  onGenerateBigIdea: () => void;
  isGeneratingCampaign: boolean;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export function StrategyPanel({
  strategy,
  onClose,
  onGenerateBigIdea,
  isGeneratingCampaign,
  copiedKey,
  onCopy,
}: StrategyPanelProps) {
  return (
    <div className="bg-slate-950 border border-sky-500/25 rounded-xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-sky-500/10 to-cyan-600/5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-sky-500/15 flex items-center justify-center">
            <Compass className="w-4 h-4 text-sky-300" />
          </div>
          <div>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Strategi-fundament
            </span>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Indsigten som Den Store Idé bygger på
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
          title="Luk strategi-fundament"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-3">

        {/* Single-minded proposition — hero */}
        <div className="bg-sky-500/8 border border-sky-500/20 rounded-xl p-3.5 space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <Target className="w-3.5 h-3.5 text-sky-300 shrink-0" />
            <span className="text-[10px] font-mono font-bold text-sky-300 uppercase tracking-wider">
              Single-minded proposition
            </span>
          </div>
          <p className="text-sm text-white leading-relaxed font-semibold">{strategy.singleMindedProposition}</p>
          <button
            onClick={() => onCopy(strategy.singleMindedProposition, 'strategy_smp')}
            className="flex items-center space-x-1 text-[11px] font-mono text-slate-500 hover:text-sky-300 transition-colors pt-0.5"
          >
            {copiedKey === 'strategy_smp'
              ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Kopieret</span></>
              : <><Copy className="w-3 h-3" /><span>Kopiér</span></>
            }
          </button>
        </div>

        {/* Audience truth + tension */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1 bg-slate-900/40 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3 h-3 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Målgruppe-indsigt</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{strategy.audienceTruth}</p>
          </div>
          <div className="space-y-1 bg-slate-900/40 border border-slate-800 rounded-lg p-3">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Central spænding</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{strategy.tension}</p>
          </div>
        </div>

        {/* Competitive context */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center space-x-1.5">
            <Radar className="w-3 h-3 text-sky-400 shrink-0" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Konkurrence-kontekst</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">{strategy.competitiveContext}</p>
        </div>

        {/* Reasons to believe */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Reasons to believe</span>
          </div>
          <ul className="space-y-1.5">
            {strategy.reasonsToBelieve.map((r, ri) => (
              <li key={ri} className="text-[11px] leading-relaxed flex items-start space-x-2">
                <Check className="w-3 h-3 text-emerald-400/80 shrink-0 mt-0.5" />
                <span className="text-slate-300">{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Desired response */}
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Ønsket respons</span>
          <p className="text-[11px] text-slate-400 leading-relaxed">{strategy.desiredResponse}</p>
        </div>

        {/* Strategic springboards */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-1.5">
            <Lightbulb className="w-3 h-3 text-violet-300 shrink-0" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Strategiske afsæt</span>
          </div>
          <ul className="space-y-2">
            {strategy.springboards.map((s, si) => (
              <li key={si} className="bg-slate-900/40 border border-slate-800 rounded-lg p-2.5">
                <span className="text-[11px] font-bold text-violet-200 block">{s.title}</span>
                <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">{s.insight}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary */}
        {strategy.strategicSummary && (
          <div className="space-y-1 pt-2 border-t border-slate-800">
            <div className="flex items-center space-x-1.5">
              <Quote className="w-3 h-3 text-slate-500 shrink-0" />
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Sammenfatning</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">{strategy.strategicSummary}</p>
          </div>
        )}

        {/* CTA: feed the idea engine */}
        <button
          onClick={onGenerateBigIdea}
          disabled={isGeneratingCampaign}
          className="w-full mt-1 py-2.5 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-display font-semibold text-xs flex items-center justify-center space-x-2 transition-all active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
          title="Udvikl tre konkurrerende kampagne-platforme oven på dette strategiske fundament"
        >
          {isGeneratingCampaign ? (
            <><Loader2 className="w-4 h-4 animate-spin shrink-0" /><span>Udvikler idéer på fundamentet...</span></>
          ) : (
            <><Rocket className="w-4 h-4 shrink-0" /><span>Find Den Store Idé på dette fundament</span></>
          )}
        </button>
      </div>
    </div>
  );
}
