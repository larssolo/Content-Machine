/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clapperboard,
  Copy,
  Image as ImageIcon,
  Layers,
  Loader2,
  Megaphone,
  Newspaper,
  Radio,
  RefreshCw,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { ChannelAsset, ChannelMatrix } from '../types';

interface ChannelMatrixPanelProps {
  matrix: ChannelMatrix;
  onClose: () => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

/** Vælg et passende ikon ud fra kanalnavnet (robust mod fri-tekst fra modellen). */
function channelIcon(channel: string) {
  const c = (channel || '').toLowerCase();
  if (/film|video|tv|motion/.test(c)) return Clapperboard;
  if (/radio|audio|lyd|podcast|spotify/.test(c)) return Radio;
  if (/ooh|outdoor|print|billboard|abribus|plakat/.test(c)) return ImageIcon;
  if (/social|insta|linkedin|tiktok|facebook|reel|some/.test(c)) return Share2;
  if (/aktiv|experien|event|stunt|oplev/.test(c)) return Sparkles;
  if (/pr|presse|press|earned/.test(c)) return Newspaper;
  return Megaphone;
}

/** Hele kanal-eksekveringen som ren tekst (til "kopiér hele kanalen"). */
function assetToText(a: ChannelAsset): string {
  const blocks = a.script.map((b) => `${b.label}: ${b.content}`).join('\n');
  return `${a.channel} — ${a.format}\n${a.headline}\n\n${blocks}\n\nProduktion: ${a.productionNotes}\nCTA: ${a.cta}`;
}

export function ChannelMatrixPanel({
  matrix,
  onClose,
  onRegenerate,
  isGenerating,
  copiedKey,
  onCopy,
}: ChannelMatrixPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(0);

  return (
    <div className="bg-slate-950 border border-emerald-500/25 rounded-xl shadow-sm overflow-hidden">

      {/* HEADER */}
      <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 to-teal-600/5">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-emerald-500/15 flex items-center justify-center">
            <Layers className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <span className="text-xs font-bold text-white font-mono uppercase tracking-wider">
              Omni-channel Matrix
            </span>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Den valgte idé skaleret til {matrix.channels.length} kanaler
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-300 hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Skalér idéen til kanaler igen"
          >
            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            title="Luk omni-channel matrix"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {matrix.channels.map((a, i) => {
          const isOpen = expanded === i;
          const Icon = channelIcon(a.channel);
          return (
            <div
              key={i}
              className={`border rounded-xl overflow-hidden transition-all ${
                isOpen ? 'border-emerald-500/40 bg-slate-900' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
              }`}
            >
              {/* Card header */}
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className={`shrink-0 w-7 h-7 rounded-md flex items-center justify-center ${
                    isOpen ? 'bg-emerald-500/15' : 'bg-slate-800'
                  }`}>
                    <Icon className={`w-3.5 h-3.5 ${isOpen ? 'text-emerald-300' : 'text-slate-400'}`} />
                  </span>
                  <div className="min-w-0">
                    <span className={`text-xs font-bold block truncate ${isOpen ? 'text-emerald-200' : 'text-slate-200'}`}>
                      {a.channel}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate block font-mono">{a.format}</span>
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

                  {/* Headline + key message */}
                  <div className="pt-3 space-y-1.5">
                    <p className="text-sm text-white leading-snug font-semibold">{a.headline}</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{a.keyMessage}</p>
                  </div>

                  {/* Script blocks */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    {a.script.map((b, bi) => (
                      <div key={bi} className="flex items-start space-x-2.5">
                        <span className="font-mono font-bold text-[10px] text-emerald-400/90 uppercase tracking-wider shrink-0 min-w-[68px] pt-0.5">
                          {b.label}
                        </span>
                        <span className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-line">{b.content}</span>
                      </div>
                    ))}
                  </div>

                  {/* Production notes */}
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">Produktion</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{a.productionNotes}</p>
                  </div>

                  {/* CTA */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">CTA</span>
                    <p className="text-[11px] font-bold text-teal-300 leading-snug">{a.cta}</p>
                  </div>

                  {/* Copy whole channel */}
                  <button
                    onClick={() => onCopy(assetToText(a), `matrix_channel_${i}`)}
                    className="flex items-center space-x-1 text-[11px] font-mono text-slate-500 hover:text-emerald-300 transition-colors pt-0.5"
                  >
                    {copiedKey === `matrix_channel_${i}`
                      ? <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Kopieret</span></>
                      : <><Copy className="w-3 h-3" /><span>Kopiér hele kanalen</span></>
                    }
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
