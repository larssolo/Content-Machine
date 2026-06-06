/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CheckCircle, RotateCcw, Search, Sliders } from 'lucide-react';
import { BrandSurfaceOutput } from '../types';

interface ToneAnalysisPanelProps {
  output: BrandSurfaceOutput;
  isAnalyzing: boolean;
  handleTriggerAnalysis: () => void;
}

export function ToneAnalysisPanel({ output, isAnalyzing, handleTriggerAnalysis }: ToneAnalysisPanelProps) {
  return (
                <div id="tone_analysis_panel" className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-850 pb-3 gap-2">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-5 h-5 text-orange-500" />
                      <div>
                        <h3 className="font-display font-medium text-xs text-slate-100 uppercase tracking-wider font-bold flex items-center space-x-1.5">
                          <Search className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span>Tone & Floskel-tjek</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Uafhængig AI-revisor baseret på vores redaktionelle dogmer
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={handleTriggerAnalysis}
                      disabled={isAnalyzing || !output}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono border transition-all flex items-center space-x-1.5 ${
                        isAnalyzing
                          ? 'bg-slate-900 border-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-slate-900 hover:bg-slate-800 active:scale-95 border-slate-850 text-orange-400 hover:text-orange-300'
                      }`}
                    >
                      {isAnalyzing ? (
                        <>
                          <div className="w-3.5 h-3.5 border border-slate-400/20 border-t-slate-400 rounded-full animate-spin"></div>
                          <span>Analyserer...</span>
                        </>
                      ) : (
                        <>
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Genanalyser redigeret tekst</span>
                        </>
                      )}
                    </button>
                  </div>

                  {output.toneAnalysis ? (
                    <div className="space-y-4">
                      
                      {/* SCORES ROW */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        
                        {/* Cliche Score */}
                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 flex flex-col justify-between">
                          <span className="text-[11px] font-medium text-slate-400 block">
                            Floskel-frihed
                          </span>
                          <div className="flex items-baseline space-x-1 mt-1">
                            <span className={`text-xl font-bold font-mono ${
                              output.toneAnalysis.clicheScore >= 80 ? 'text-emerald-400' :
                              output.toneAnalysis.clicheScore >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {output.toneAnalysis.clicheScore}%
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">/100</span>
                          </div>
                          
                          {/* Mini visual gauge */}
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-2">
                            <div 
                              className={`h-full rounded-full ${
                                output.toneAnalysis.clicheScore >= 80 ? 'bg-emerald-500' :
                                output.toneAnalysis.clicheScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${output.toneAnalysis.clicheScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Concreteness Score */}
                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 flex flex-col justify-between">
                          <span className="text-[11px] font-medium text-slate-400 block">
                            Konkrethed (Leverancer)
                          </span>
                          <div className="flex items-baseline space-x-1 mt-1">
                            <span className={`text-xl font-bold font-mono ${
                              output.toneAnalysis.concretenessScore >= 80 ? 'text-emerald-400' :
                              output.toneAnalysis.concretenessScore >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {output.toneAnalysis.concretenessScore}%
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">/100</span>
                          </div>
                          
                          {/* Mini visual gauge */}
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-2">
                            <div 
                              className={`h-full rounded-full ${
                                output.toneAnalysis.concretenessScore >= 80 ? 'bg-emerald-500' :
                                output.toneAnalysis.concretenessScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${output.toneAnalysis.concretenessScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Human & Prof Score */}
                        <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 flex flex-col justify-between">
                          <span className="text-[11px] font-medium text-slate-400 block">
                            Menneskelig nerve
                          </span>
                          <div className="flex items-baseline space-x-1 mt-1">
                            <span className={`text-xl font-bold font-mono ${
                              output.toneAnalysis.humanScore >= 80 ? 'text-emerald-400' :
                              output.toneAnalysis.humanScore >= 50 ? 'text-amber-400' : 'text-red-400'
                            }`}>
                              {output.toneAnalysis.humanScore}%
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">/100</span>
                          </div>
                          
                          {/* Mini visual gauge */}
                          <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden mt-2">
                            <div 
                              className={`h-full rounded-full ${
                                output.toneAnalysis.humanScore >= 80 ? 'bg-emerald-500' :
                                output.toneAnalysis.humanScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${output.toneAnalysis.humanScore}%` }}
                            />
                          </div>
                        </div>

                      </div>

                      {/* FLOSKEL ALERTER */}
                      <div className="p-3 bg-slate-900/80 border border-slate-850 rounded-lg">
                        <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                          Udpegede Floskler & Klichéer
                        </span>
                        
                        {output.toneAnalysis.clichesFound.length === 0 ? (
                          <div className="text-xs text-emerald-400 flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-emerald-405 shrink-0" />
                            <span>Klip-klap! Ingen corporate klichéer, varm luft eller tom snak fundet i dine tekster.</span>
                          </div>
                        ) : (
                          <div className="space-y-1.5">
                            <div className="text-[11px] text-slate-355">
                              Følgende overflødige vendinger bør erstattes med mere konkrete beskrivelser af de reelle fysiske eller digitale leverancer:
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {output.toneAnalysis.clichesFound.map((cl, idx) => (
                                <span key={idx} className="px-2 py-0.5 rounded bg-red-950/40 border border-red-900/50 text-[11px] font-mono text-red-400">
                                  "{cl}"
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* CORE GUIDELINES / DETAILED EVALUATIONS */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-semibold text-slate-300 block">
                          Overholdelse af Redaktionelle Retningslinjer
                        </span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {output.toneAnalysis.evaluations.map((ev, idx) => (
                            <div key={idx} className="bg-slate-900/40 border border-slate-850 rounded-lg p-3 space-y-1 text-left">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-white tracking-tight">{ev.ruleName}</span>
                                {ev.status === 'passed' ? (
                                  <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-1 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">Overholdt</span>
                                ) : ev.status === 'warning' ? (
                                  <span className="text-[11px] bg-amber-500/10 text-amber-400 px-1 py-0.5 rounded border border-amber-500/20 font-bold uppercase">Obs</span>
                                ) : (
                                  <span className="text-[11px] bg-red-500/10 text-red-400 px-1 py-0.5 rounded border border-red-500/20 font-bold uppercase">Mangler</span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed">{ev.feedback}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* OVERALL COMMENT */}
                      <div className="p-3 bg-slate-900/30 border border-slate-850 rounded-lg text-left italic relative">
                        <span className="absolute right-3 bottom-2 text-[11px] font-mono text-slate-600 uppercase tracking-wider font-bold">Dom</span>
                        <p className="text-slate-300 text-xs leading-relaxed font-sans pr-14">
                          "{output.toneAnalysis.overallReview}"
                        </p>
                      </div>

                    </div>
                  ) : (
                    <div className="text-slate-500 font-mono text-[11px] py-4 text-center">
                      Kør generering eller tryk på "Genanalyser redigeret tekst" for at beregne guideline scores.
                    </div>
                  )}
                </div>
  );
}
