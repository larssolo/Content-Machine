/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Lightbulb,
  Megaphone,
  Presentation,
  Quote,
  Radar,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { CampaignPlatform, CampaignTerritory } from '../types';

interface CampaignPanelProps {
  platform: CampaignPlatform;
  selectedTerritory: CampaignTerritory | null;
  onSelectTerritory: (territory: CampaignTerritory) => void;
  onClearTerritory: () => void;
  onExportDeck?: () => void;
  onClose: () => void;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export function CampaignPanel({
  platform,
  selectedTerritory,
  onSelectTerritory,
  onClearTerritory,
  onExportDeck,
  onClose,
  copiedKey,
  onCopy,
}: CampaignPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  const isSelected = (t: CampaignTerritory) =>
    selectedTerritory != null && selectedTerritory.name === t.name && selectedTerritory.bigIdea === t.bigIdea;

  return (
    <div className="bg-slate-950 border border-violet-500/25 rounded-xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-violet-500/10 to-brand-orange-600/5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-violet-500/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-300" />
          </div>
          <div>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Den Store Idé · Kampagne-platform
            </span>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Vælg én rute — alt nyt indhold bygger på den
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
          title="Luk kampagne-platform"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ACTIVE PLATFORM BANNER */}
      {selectedTerritory && (
        <div className="px-5 py-2.5 bg-violet-500/10 border-b border-violet-500/20 flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2 min-w-0">
            <Check className="w-3.5 h-3.5 text-violet-300 shrink-0" />
            <span className="text-[11px] text-violet-100 font-mono truncate">
              Aktiv platform: <span className="font-bold">{selectedTerritory.name}</span> — alt nyt indhold bygger på denne idé
            </span>
          </div>
          <div className="flex items-center space-x-3 shrink-0">
            {onExportDeck && (
              <button
                onClick={onExportDeck}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-[11px] font-semibold transition-all active:scale-95"
                title="Saml strategi, idé og kanaler til én klient-klar pitch-deck (.html)"
              >
                <Presentation className="w-3.5 h-3.5" />
                <span>Eksportér pitch-deck</span>
              </button>
            )}
            <button
              onClick={onClearTerritory}
              className="text-[11px] font-mono text-slate-400 hover:text-white transition-colors"
            >
              Ryd
            </button>
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {platform.territories.map((t, i) => {
          const isOpen = expanded === i;
          const selected = isSelected(t);
          return (
            <div
              key={i}
              className={`border rounded-xl overflow-hidden transition-all ${
                selected
                  ? 'border-violet-500/60 bg-violet-500/5'
                  : isOpen
                    ? 'border-slate-700 bg-slate-900'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              {/* Card header */}
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className={`text-[11px] font-mono font-bold shrink-0 w-5 h-5 rounded flex items-center justify-center ${
                    selected ? 'bg-violet-500 text-white' : isOpen ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <span className={`text-xs font-bold block truncate ${selected || isOpen ? 'text-violet-200' : 'text-slate-200'}`}>
                      {t.name}
                      {selected && <span className="ml-2 text-[10px] font-mono text-violet-400 uppercase tracking-wider">· aktiv</span>}
                    </span>
                    {!isOpen && (
                      <span className="text-[11px] text-slate-500 truncate block">{t.tagline}</span>
                    )}
                  </div>
                </div>
                {isOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                }
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div className="px-4 pb-4 space-y-3 border-t border-slate-800">

                  {/* Big idea — hero */}
                  <div className="pt-3 bg-violet-500/8 border border-violet-500/20 rounded-xl p-3.5 space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-violet-300 shrink-0" />
                      <span className="text-[10px] font-mono font-bold text-violet-300 uppercase tracking-wider">Den store idé</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed font-semibold">{t.bigIdea}</p>
                    <button
                      onClick={() => onCopy(t.bigIdea, `campaign_idea_${i}`)}
                      className="flex items-center space-x-1 text-[11px] font-mono text-slate-500 hover:text-violet-300 transition-colors pt-0.5"
                    >
                      {copiedKey === `campaign_idea_${i}`
                        ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Kopieret</span></>
                        : <><Copy className="w-3 h-3" /><span>Kopiér</span></>
                      }
                    </button>
                  </div>

                  {/* Tagline */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Tagline</span>
                    <p className="text-sm font-bold text-brand-orange-400 leading-snug">{t.tagline}</p>
                  </div>

                  {/* Manifesto */}
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Quote className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Manifest</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">{t.manifesto}</p>
                  </div>

                  {/* Strategic root */}
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Radar className="w-3 h-3 text-sky-400 shrink-0" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Strategisk rod</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{t.strategicRoot}</p>
                  </div>

                  {/* Channel expressions */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Megaphone className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Kanal-udtryk</span>
                    </div>
                    <ul className="space-y-1.5">
                      {t.channelExpressions.map((c, ci) => (
                        <li key={ci} className="text-[11px] leading-relaxed flex items-start space-x-2">
                          <span className="font-mono font-bold text-emerald-400/80 shrink-0 min-w-[64px]">{c.channel}</span>
                          <span className="text-slate-300">{c.idea}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Tone + rationale */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Tone</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{t.toneDescriptor}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Hvorfor den vinder</span>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{t.rationale}</p>
                    </div>
                  </div>

                  {/* Select button */}
                  <button
                    onClick={() => (selected ? onClearTerritory() : onSelectTerritory(t))}
                    className={`w-full mt-1 py-2.5 px-4 rounded-lg font-display font-semibold text-xs flex items-center justify-center space-x-2 transition-all ${
                      selected
                        ? 'bg-violet-500/15 border border-violet-500/40 text-violet-200 hover:bg-violet-500/25'
                        : 'bg-violet-600 hover:bg-violet-500 text-white active:scale-[0.99]'
                    }`}
                  >
                    {selected ? (
                      <><Check className="w-4 h-4" /><span>Valgt — fravælg denne rute</span></>
                    ) : (
                      <><Target className="w-4 h-4" /><span>Vælg denne rute</span></>
                    )}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
