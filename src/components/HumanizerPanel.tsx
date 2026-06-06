/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, SetStateAction } from 'react';
import { Check, Copy, Fingerprint, ShieldCheck, Trash2, UserCheck } from 'lucide-react';
import { HumanizerResult } from '../types';

interface HumanizerPanelProps {
  externalText: string;
  setExternalText: Dispatch<SetStateAction<string>>;
  humanizerResult: HumanizerResult | null;
  setHumanizerResult: Dispatch<SetStateAction<HumanizerResult | null>>;
  isHumanizing: boolean;
  handleHumanizeText: () => void;
  handleCopyToClipboard: (text: string, key: string) => void;
  copiedKey: string | null;
}

export function HumanizerPanel({
  externalText,
  setExternalText,
  humanizerResult,
  setHumanizerResult,
  isHumanizing,
  handleHumanizeText,
  handleCopyToClipboard,
  copiedKey,
}: HumanizerPanelProps) {
  return (
          <div id="external_humanizer_panel" className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 gap-2">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-5 h-5 text-brand-orange-500" />
                <div>
                  <h3 className="font-display font-medium text-xs text-slate-100 uppercase tracking-wider font-bold">
                    ✍️ Ekstern AI-Humanizer & Omgåelse
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Genretabler den menneskelige nerve i gamle/rå tekster & bypass AI-detektorer
                  </p>
                </div>
              </div>
              {externalText && (
                <button 
                  onClick={() => { setExternalText(''); setHumanizerResult(null); }}
                  className="text-[11px] text-slate-500 hover:text-slate-300 font-mono flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ryd</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-medium text-slate-400">Indsæt tidligere tekst (AI-skrevet, råt udkast eller tør tekst):</label>
              <div className="relative">
                <textarea
                  value={externalText}
                  onChange={(e) => setExternalText(e.target.value)}
                  placeholder="Indsæt din rå tekst her... (f.eks. 'Det er vigtigt at bemærke, at vi i denne proces fokuserer på at stræbe efter de synergiske gevinster...')"
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 leading-relaxed font-sans resize-y"
                />
                {externalText && (
                  <div className="absolute bottom-2 right-2 text-[11px] font-mono text-slate-500">
                    {externalText.length} tegn
                  </div>
                )}
              </div>

              <button
                onClick={handleHumanizeText}
                disabled={isHumanizing || !externalText.trim()}
                className={`w-full py-2.5 px-4 rounded-lg font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 ${
                  isHumanizing 
                    ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
                    : 'bg-slate-900 hover:bg-slate-850 text-brand-orange-400 hover:text-brand-orange-300 border border-brand-orange-500/40 active:scale-[0.99]'
                }`}
              >
                {isHumanizing ? (
                  <>
                    <div className="w-3.5 h-3.5 border border-slate-400/20 border-t-slate-400 rounded-full animate-spin"></div>
                    <span>Omformulerer & bypasser AI-tjek...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Analyse & Humaniser Tekst nu</span>
                  </>
                )}
              </button>
            </div>

            {humanizerResult && (
              <div className="mt-4 pt-4 border-t border-slate-850 space-y-4">
                
                {/* SCORES HEAD-TO-HEAD */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* FØR SCORE */}
                  <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 uppercase font-bold text-red-400">🤖 Før omskrivning</span>
                        <span className="text-[11px] bg-red-955 text-red-400 border border-red-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Høj risiko</span>
                      </div>
                      <div className="mt-2 flex items-baseline space-x-1">
                        <span className="text-2xl font-extrabold font-mono text-red-400">
                          {humanizerResult.originalAiScore}%
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">robot-detektion sandsynlighed</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-red-500 rounded-full" style={{ width: `${humanizerResult.originalAiScore}%` }}></div>
                      </div>
                    </div>
                    
                    {humanizerResult.clichesDetected.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <span className="text-[11px] font-mono text-slate-400 uppercase block">Opdagede klichéer:</span>
                        <div className="flex flex-wrap gap-1">
                          {humanizerResult.clichesDetected.map((cl, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-red-950/60 border border-red-900/30 text-[11px] font-mono text-red-300">
                              "{cl}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* EFTER SCORE */}
                  <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-lg p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 uppercase font-bold text-emerald-400">🌱 Efter Humanizing</span>
                        <span className="text-[11px] bg-emerald-955 text-emerald-400 border border-emerald-900/40 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Bypassed</span>
                      </div>
                      <div className="mt-2 flex items-baseline space-x-1">
                        <span className="text-2xl font-extrabold font-mono text-emerald-400">
                          {humanizerResult.humanizedAiScore}%
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">robot-detektion sandsynlighed</span>
                      </div>
                      <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${humanizerResult.humanizedAiScore}%` }}></div>
                      </div>
                    </div>

                    <div className="mt-3 text-[11px] text-emerald-400/90 flex items-center space-x-1 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                      <span>100% klar til udgivelse uden AI flagning.</span>
                    </div>
                  </div>

                </div>

                {/* TEXT BOXES COMPARED */}
                <div className="bg-slate-900/80 rounded-xl border border-slate-850 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                    <span className="text-[11px] font-mono text-slate-300 uppercase font-bold flex items-center space-x-1.5">
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      <span>Menneskeligt & floskelfrit resultat:</span>
                    </span>
                    <button
                      onClick={() => handleCopyToClipboard(humanizerResult.humanizedText, 'humanized_text')}
                      className="bg-slate-950 hover:bg-slate-800 p-1.5 px-3 rounded text-[11px] font-mono text-orange-400 hover:text-orange-300 border border-slate-800 flex items-center space-x-1 transition-all active:scale-95"
                    >
                      {copiedKey === 'humanized_text' ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Kopieret!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Kopier tekst</span>
                        </>
                      )}
                    </button>
                  </div>
                  
                  <p className="text-slate-205 text-xs leading-relaxed font-sans whitespace-pre-wrap select-text selection:bg-orange-500 selection:text-white p-2.5 bg-slate-950 rounded-lg border border-slate-850 max-h-[250px] overflow-y-auto">
                    {humanizerResult.humanizedText}
                  </p>
                </div>

                {/* IMPROVEMENTS PROTOCOL */}
                <div className="bg-slate-900/30 border border-slate-850 rounded-lg p-3.5 space-y-2">
                  <span className="text-[11px] font-mono text-slate-450 uppercase font-bold tracking-wider block">
                    Udførte forbedringer til omgåelse:
                  </span>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-1">
                    {humanizerResult.improvements.map((imp, idx) => (
                      <li key={idx} className="text-[11px] text-slate-400 flex items-start space-x-1.5 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            )}

          </div>
  );
}
