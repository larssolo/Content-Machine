/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  AlertCircle,
  ArrowRight,
  Binoculars,
  Check,
  Copy,
  Globe,
  HelpCircle,
  Newspaper,
  Radio,
  TrendingUp,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { CulturalScanResult } from '../types';

interface CulturalAntennaPanelProps {
  intel: CulturalScanResult;
  onClose: () => void;
  onGenerateStrategy: () => void;
  isGeneratingStrategy: boolean;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('da-DK', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function CulturalAntennaPanel({
  intel,
  onClose,
  onGenerateStrategy,
  isGeneratingStrategy,
  copiedKey,
  onCopy,
}: CulturalAntennaPanelProps) {
  const allText = [
    intel.groundingNarrative,
    ...(intel.trends || []).map((t) => `${t.trend}\n${t.relevance}\n${t.actionableAngle}`),
    ...(intel.competitorSignals || []).map((c) => `${c.brand}: ${c.signal}\n${c.takeaway}`),
    ...(intel.culturalMoments || []).map((m) => `${m.moment}\n${m.opportunity}`),
    intel.timingContext,
    intel.openingQuestion,
  ]
    .filter(Boolean)
    .join('\n\n');

  return (
    <div className="bg-slate-950 border border-amber-500/25 rounded-xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-600/5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-amber-500/15 flex items-center justify-center">
            <Radio className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Kulturel Antenne
              </span>
              <span className="inline-flex items-center space-x-1 text-[10px] font-mono bg-amber-500/15 border border-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded">
                <Globe className="w-2.5 h-2.5" />
                <span>Live scanning</span>
              </span>
            </div>
            {intel.searchedAt && (
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Scannet {formatDate(intel.searchedAt)}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onCopy(allText, 'cultural_scan_all')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            title="Kopiér hele scanningen"
          >
            {copiedKey === 'cultural_scan_all'
              ? <Check className="w-4 h-4 text-emerald-400" />
              : <Copy className="w-4 h-4" />
            }
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            title="Luk"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* GROUNDING NARRATIVE */}
        <div className="p-4 bg-amber-500/6 border border-amber-500/20 rounded-xl space-y-1.5">
          <div className="flex items-center space-x-1.5">
            <Binoculars className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider">Kulturelt billede</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">{intel.groundingNarrative}</p>
        </div>

        {/* OPENING QUESTION */}
        {intel.openingQuestion && (
          <div className="p-3.5 bg-slate-900 border-l-2 border-amber-400 rounded-r-xl">
            <div className="flex items-center space-x-1.5 mb-1">
              <HelpCircle className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">Strategisk åbningsspørgsmål</span>
            </div>
            <p className="text-sm font-semibold text-white italic leading-relaxed">"{intel.openingQuestion}"</p>
          </div>
        )}

        {/* TRENDS */}
        {intel.trends?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Aktuelle trends · {intel.trends.length}</span>
            </div>
            <div className="space-y-2">
              {intel.trends.map((t, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-white leading-snug">{t.trend}</p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{t.relevance}</p>
                  <div className="flex items-start space-x-1.5 pt-0.5">
                    <ArrowRight className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200 leading-relaxed">{t.actionableAngle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COMPETITOR SIGNALS */}
        {intel.competitorSignals?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Konkurrent-signaler · {intel.competitorSignals.length}</span>
            </div>
            <div className="space-y-2">
              {intel.competitorSignals.map((c, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider">{c.brand}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">{c.signal}</p>
                  <div className="flex items-start space-x-1.5 border-t border-slate-800 pt-1.5">
                    <AlertCircle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200 leading-relaxed">{c.takeaway}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CULTURAL MOMENTS */}
        {intel.culturalMoments?.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1.5">
              <Newspaper className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Kulturelle øjeblikke · {intel.culturalMoments.length}</span>
            </div>
            <div className="space-y-2">
              {intel.culturalMoments.map((m, i) => (
                <div key={i} className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-white leading-snug">{m.moment}</p>
                  <div className="flex items-start space-x-1.5">
                    <ArrowRight className="w-3 h-3 text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-violet-200 leading-relaxed">{m.opportunity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TIMING CONTEXT */}
        {intel.timingContext && (
          <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1">
            <div className="flex items-center space-x-1.5">
              <Zap className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Timing</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">{intel.timingContext}</p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={onGenerateStrategy}
          disabled={isGeneratingStrategy}
          className="w-full py-2.5 px-4 rounded-lg bg-gradient-to-r from-sky-600/20 to-cyan-600/10 border border-sky-500/40 hover:border-sky-400/60 hover:from-sky-600/30 text-sky-100 hover:text-white font-display font-semibold text-xs flex items-center justify-center space-x-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          title="Byg strategi-fundament med dette kulturelle afsæt som virkelighedsgrundlag"
        >
          <ArrowRight className="w-4 h-4 text-sky-300 shrink-0" />
          <span>Byg strategi på dette fundament</span>
        </button>

      </div>
    </div>
  );
}
