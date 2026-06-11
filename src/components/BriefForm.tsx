/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, SetStateAction, ChangeEvent } from 'react';
import {
  AlertTriangle, Check, ChevronRight, Compass, FileText, Fingerprint,
  Lightbulb, Loader2, Palette, Pin, RotateCcw, ShieldCheck,
  Swords, Target, Trash2, UploadCloud, Users, Wallet,
} from 'lucide-react';
import { ProjectBrief, BrandSurfaceOutput, PresetBrief } from '../types';
import { ProcessStepper } from './ProcessStepper';

interface BriefFormProps {
  brief: ProjectBrief;
  setBrief: Dispatch<SetStateAction<ProjectBrief>>;
  output: BrandSurfaceOutput | null;
  isGenerating: boolean;
  isVisualDeveloping: boolean;
  deepMode: boolean;
  setDeepMode: Dispatch<SetStateAction<boolean>>;
  cviFileName: string | null;
  isAnalyzingCvi: boolean;
  customPresets: PresetBrief[];
  PRESETS: PresetBrief[];
  handleBriefChange: (field: keyof ProjectBrief, value: any) => void;
  handleChannelToggle: (channel: string) => void;
  handleLoadPreset: (preset: PresetBrief) => void;
  handleCviUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  handleRemoveCvi: () => void;
  handlePinCurrentBrief: () => void;
  handleClearPresets: () => void;
  handleRestorePresets: () => void;
  handleGenerateAll: () => void;
  handleVisualDevelop: () => void;
  handleBrainstorm: () => void;
  isBrainstorming: boolean;
  handleCulturalScan: () => void;
  isScanning: boolean;
  hasCulturalIntel: boolean;
  handleGenerateStrategy: () => void;
  isGeneratingStrategy: boolean;
  hasStrategy: boolean;
  handleGenerateBigIdea: () => void;
  isGeneratingCampaign: boolean;
  hasCampaignPlatform: boolean;
  hasSelectedTerritory: boolean;
  hasPressureTest: boolean;
  hasChannelMatrix: boolean;
  hasEffectiveness: boolean;
  handleGenerateChannelMatrix: () => void;
  isGeneratingMatrix: boolean;
  handleGenerateEffectiveness: () => void;
  isGeneratingEffectiveness: boolean;
  isSharpening: boolean;
  onSharpenIdea: () => void;
  bureauModeActive: boolean;
  onToggleBureauMode: () => void;
  onRunBureau: () => void;
  isBureauRunning: boolean;
  onToggleDeepMode: () => void;
  errorMsg: string | null;
  generationStep: string;
}

export function BriefForm({
  brief, setBrief, output, isGenerating, isVisualDeveloping,
  deepMode, setDeepMode, cviFileName, isAnalyzingCvi,
  customPresets, PRESETS,
  handleBriefChange, handleChannelToggle, handleLoadPreset,
  handleCviUpload, handleRemoveCvi, handlePinCurrentBrief,
  handleClearPresets, handleRestorePresets,
  handleGenerateAll, handleVisualDevelop, handleBrainstorm, isBrainstorming,
  handleCulturalScan, isScanning, hasCulturalIntel,
  handleGenerateStrategy, isGeneratingStrategy, hasStrategy,
  handleGenerateBigIdea, isGeneratingCampaign, hasCampaignPlatform, hasSelectedTerritory,
  hasPressureTest, hasChannelMatrix, hasEffectiveness,
  handleGenerateChannelMatrix, isGeneratingMatrix,
  handleGenerateEffectiveness, isGeneratingEffectiveness,
  isSharpening, onSharpenIdea,
  bureauModeActive, onToggleBureauMode, onRunBureau, isBureauRunning, onToggleDeepMode,
  errorMsg, generationStep,
}: BriefFormProps) {
  return (
        <div className="lg:col-span-5 flex flex-col space-y-5">
          
          {/* PRESET CHIPS CARDS */}
          <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-sm">
            <div className="flex items-center justify-between mb-3 text-slate-300">
              <span className="text-xs font-semibold flex items-center space-x-1.5">
                <Compass className="w-3.5 h-3.5 text-slate-500" />
                <span>Vælg et projekt-brief</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRestorePresets}
                  className="text-[11px] text-slate-400 hover:text-orange-400 font-mono transition-colors flex items-center space-x-1 hover:bg-slate-900 border border-transparent hover:border-slate-800 px-2 py-0.5 rounded cursor-pointer"
                  title="Gendan standard-skabeloner"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Gendan</span>
                </button>
                <button
                  onClick={handleClearPresets}
                  className="text-[11px] text-slate-400 hover:text-red-400 font-mono transition-colors flex items-center space-x-1 hover:bg-slate-900 border border-transparent hover:border-slate-800 px-2 py-0.5 rounded cursor-pointer"
                  title="Ryd alle gemte skabeloner"
                >
                  <Trash2 className="w-2.5 h-2.5 text-red-500" />
                  <span>Ryd</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              {customPresets.length === 0 ? (
                <div className="text-center py-4 border border-dashed border-slate-800 rounded-lg bg-slate-900/20 text-slate-500 font-mono text-[11px] space-y-1">
                  <p>Ingen gemte presets / genveje.</p>
                  <p className="text-slate-600">Skriv dit eget brief nedenfor og klik på "Pin" for at gemme det.</p>
                </div>
              ) : (
                customPresets.map((p, i) => (
                  <button
                    key={i}
                    id={`preset_btn_${i}`}
                    onClick={() => handleLoadPreset(p)}
                    className={`text-left text-xs p-2.5 rounded-lg border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      brief.project === p.brief.project 
                        ? 'bg-slate-800 border-brand-orange-500/60 text-white font-medium pl-3' 
                        : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-350 active:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full ${brief.project === p.brief.project ? 'bg-brand-orange-500' : 'bg-slate-600'}`}></span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>

          {/* BRIEF INPUT FORM */}
          <div className="bg-slate-950 rounded-xl p-5 border border-slate-800 shadow-sm space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white flex items-center space-x-2">
                <FileText className="w-5 h-5 text-brand-orange-500" />
                <span>Kilde-brief Skabelon</span>
              </h2>
              <button 
                onClick={() => setBrief({ client: '', project: '', description: '', details: '', audience: '', tone: 'Professionel, menneskelig, kreativ', language: 'Dansk', channels: [], notes: '' })}
                className="text-[11px] text-slate-400 hover:text-white font-mono flex items-center space-x-1"
                title="Ryd alle felter"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Ryd</span>
              </button>
            </div>

            {/* Error notifications */}
            {errorMsg && (
              <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-200 flex items-start space-x-2 animate-shake">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* CVI / DESIGNMANUAL SCANNER */}
            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Fingerprint className="w-4 h-4 text-brand-orange-500" />
                  <span className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">CVI & Designmanual Scanner</span>
                </div>
                {brief.cviManual && (
                  <span className="text-[11px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono px-2 py-0.5 rounded-full flex items-center space-x-1 uppercase tracking-wide">
                    <Check className="w-2.5 h-2.5" />
                    <span>Aktiv CVI</span>
                  </span>
                )}
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Scan og lær din kundes visuelle identitet (CVI, farver, fonte, billedstil og layout) at kende, så AI svar og prompts tilpasser sig automatisk.
              </p>

              {/* Upload Dropzone */}
              {!cviFileName ? (
                <label className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isAnalyzingCvi 
                    ? 'border-brand-orange-500 bg-slate-900/30 text-brand-orange-300' 
                    : 'border-slate-800 hover:border-slate-705 bg-slate-950 hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
                }`}>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*,application/pdf,text/plain,text/markdown" 
                    onChange={handleCviUpload}
                    disabled={isAnalyzingCvi}
                  />
                  {isAnalyzingCvi ? (
                    <div className="flex flex-col items-center space-y-2 py-2">
                      <div className="w-6 h-6 border-2 border-brand-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs font-mono text-brand-orange-400 font-medium">Scanner identitet…</span>
                      <p className="text-[11px] text-slate-500 tracking-normal text-center max-w-[200px]">Afkoder farvepaletter, fonte, billedstil og logo-regler</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-1.5 text-center">
                      <UploadCloud className="w-8 h-8 text-slate-500" />
                      <span className="text-xs font-medium">Klik eller træk CVI-fil herind</span>
                      <span className="text-[11px] text-slate-600 font-mono uppercase">PDF, Billede eller Tekst</span>
                    </div>
                  )}
                </label>
              ) : (
                /* Post-scan details & Active indicators */
                <div className="space-y-3 bg-slate-950/65 p-3 rounded-lg border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs border-b border-slate-900 pb-2">
                    <div className="flex items-center space-x-2 text-slate-300">
                      <FileText className="w-3.5 h-3.5 text-brand-orange-500" />
                      <span className="font-medium truncate max-w-[170px]">{cviFileName}</span>
                    </div>
                    <button 
                      onClick={handleRemoveCvi}
                      className="text-[11px] font-mono text-red-500 hover:text-red-400 transition-colors flex items-center space-x-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Fjern CVI</span>
                    </button>
                  </div>

                  {brief.cviManual ? (
                    <div className="space-y-3 text-[11px] text-slate-300">
                      
                      {/* Colors */}
                      {brief.cviManual.brandColors && brief.cviManual.brandColors.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-mono uppercase text-slate-500 tracking-wider block">Afkodede Brandfarver</span>
                          <div className="flex flex-wrap gap-2">
                            {brief.cviManual.brandColors.map((colorStr, idx) => {
                              // Try to extract hex code if any
                              const hexMatch = colorStr.match(/#[0-9a-fA-F]{3,6}/);
                              const hex = hexMatch ? hexMatch[0] : null;
                              return (
                                <div key={idx} className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 rounded-full px-2 py-0.5 text-[11px]">
                                  {hex && (
                                    <span 
                                      className="w-2 rounded-full border border-white/20 shrink-0 aspect-square" 
                                      style={{ backgroundColor: hex }}
                                    ></span>
                                  )}
                                  <span className="text-slate-400 truncate max-w-[120px]">{colorStr}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Typography */}
                      {brief.cviManual.fonts && (
                        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
                          <div>
                            <span className="text-[11px] font-mono uppercase text-slate-500 tracking-wider block mb-0.5">Overskrifter</span>
                            <span className="font-medium text-white text-xs truncate block">{brief.cviManual.fonts.primaryHeadings}</span>
                          </div>
                          <div>
                            <span className="text-[11px] font-mono uppercase text-slate-500 tracking-wider block mb-0.5">Brødtekst</span>
                            <span className="font-medium text-white text-xs truncate block">{brief.cviManual.fonts.bodyText}</span>
                          </div>
                        </div>
                      )}

                      {/* Photo/Visual style */}
                      {brief.cviManual.imageStyleGuidelines && (
                        <div className="pt-2 border-t border-slate-900 space-y-1">
                          <span className="text-[11px] font-mono uppercase text-slate-500 tracking-wider block">Afkodet Billedstil & Estetik</span>
                          <p className="text-[11px] text-slate-400 leading-normal italic bg-slate-900/50 p-2 rounded border border-slate-850 text-left">
                            "{brief.cviManual.imageStyleGuidelines}"
                          </p>
                        </div>
                      )}

                      {/* Graphic/Layout Elements */}
                      {brief.cviManual.graphicElementsRules && (
                        <div className="space-y-1">
                          <span className="text-[11px] font-mono uppercase text-slate-500 tracking-wider block">Layouts & Grafiske Regler</span>
                          <p className="text-[11px] text-slate-400 leading-normal bg-slate-900/50 p-2 rounded border border-slate-850 text-left">
                            {brief.cviManual.graphicElementsRules}
                          </p>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* Scanning success, building layout */
                    <div className="py-2 text-center text-slate-500 text-[11px] font-mono">
                      Samler designdata…
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Cliente */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Kunde *</label>
                <input
                  type="text"
                  id="input_client"
                  value={brief.client}
                  onChange={(e) => handleBriefChange('client', e.target.value)}
                  placeholder="f.eks. Modaxo"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans"
                />
              </div>

              {/* Project name */}
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Projekt *</label>
                <input
                  type="text"
                  id="input_project"
                  value={brief.project}
                  onChange={(e) => handleBriefChange('project', e.target.value)}
                  placeholder="f.eks. Move 2026"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans"
                />
              </div>
            </div>

            {/* What we did / description */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Hvad lavede vi (Leverance) *</label>
              <textarea
                id="input_description"
                rows={4}
                value={brief.description}
                onChange={(e) => handleBriefChange('description', e.target.value)}
                placeholder="f.eks. Udviklede visuelt indhold til konference i København, speaker presentations, dynamiske visuals til stor LED-skærm..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 leading-relaxed transition-all font-sans resize-y"
              />
            </div>

            {/* Special details */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-medium text-slate-400">Særlige detaljer / Tal</label>
                <span className="text-[11px] text-slate-500 font-mono">f.eks. målinger, LED størrelse, 3D maskotter</span>
              </div>
              <textarea
                id="input_details"
                rows={3}
                value={brief.details}
                onChange={(e) => handleBriefChange('details', e.target.value)}
                placeholder="f.eks. 350 deltagere fra 37 lande, 24x4m LED-skærm. Skabte maskotten 'Moxi' som 3D karakter."
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 leading-relaxed transition-all font-sans resize-y"
              />
            </div>

            {/* Target audience */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Målgruppe</label>
              <input
                type="text"
                id="input_audience"
                value={brief.audience}
                onChange={(e) => handleBriefChange('audience', e.target.value)}
                placeholder="f.eks. Virksomheder, der afholder b2b events, keynotes..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans"
              />
            </div>

            {/* Tone of voice & Sprog */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Tone & Stil</label>
                <input
                  type="text"
                  id="input_tone"
                  value={brief.tone}
                  onChange={(e) => handleBriefChange('tone', e.target.value)}
                  placeholder="Professionel, menneskelig, kreativ"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">Sprog</label>
                <input
                  type="text"
                  id="input_language"
                  value={brief.language}
                  onChange={(e) => handleBriefChange('language', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white transition-all font-sans font-medium"
                />
              </div>
            </div>

            {/* Channels & Extra */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-2">Hvor skal teksten bruges (Kanaler)</label>
              <div className="flex flex-wrap gap-2">
                {["Hjemmeside", "LinkedIn", "Nyhedsbrev"].map((ch) => {
                  const active = brief.channels.includes(ch);
                  return (
                    <button
                      key={ch}
                      type="button"
                      id={`channel_tag_${ch}`}
                      onClick={() => handleChannelToggle(ch)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        active 
                          ? 'bg-slate-800 border-brand-orange-500/40 text-brand-orange-500' 
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {ch}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Extra notes */}
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Ekstra Noter</label>
              <textarea
                id="input_notes"
                rows={2}
                value={brief.notes}
                onChange={(e) => handleBriefChange('notes', e.target.value)}
                placeholder="Vi skal fremstå som en kreativ og praktisk samarbejdspartner..."
                className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg p-2.5 text-xs text-white placeholder:text-slate-600 leading-relaxed transition-all font-sans resize-y"
              />
            </div>

            {/* STRATEGIC INTAKE (rigere brief — fodrer strategi, idé, pres-test & effekt-lag) */}
            <div className="bg-slate-900/40 rounded-xl p-4 border border-slate-800/80 space-y-3">
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold font-mono tracking-wider text-slate-300 uppercase">Strategisk intake</span>
                <span className="text-[10px] text-slate-500 font-mono">valgfrit · skærper alle AI-trin</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Jo mere præcis kontekst, jo skarpere strategi, idéer, KPI'er og pitch. Udfyld det du har — felterne fodrer alle led i kæden.
              </p>

              {/* Business goal & KPI */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1.5">
                  <Target className="w-3 h-3 text-sky-500 shrink-0" />
                  <span>Forretningsmål & KPI</span>
                </label>
                <input
                  type="text"
                  id="input_business_goal"
                  value={brief.businessGoal ?? ''}
                  onChange={(e) => handleBriefChange('businessGoal', e.target.value)}
                  placeholder="f.eks. +5% markedsandel, +10pp kendskab, 200 leads"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans"
                />
              </div>

              {/* Competitors */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1.5">
                  <Swords className="w-3 h-3 text-rose-500 shrink-0" />
                  <span>Konkurrenter</span>
                </label>
                <input
                  type="text"
                  id="input_competitors"
                  value={brief.competitors ?? ''}
                  onChange={(e) => handleBriefChange('competitors', e.target.value)}
                  placeholder="f.eks. Brand A, Brand B — så vi undgår deres positioner"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans"
                />
              </div>

              {/* Mandatories */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1.5">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>Mandatories (skal med / må ikke)</span>
                </label>
                <textarea
                  id="input_mandatories"
                  rows={2}
                  value={brief.mandatories ?? ''}
                  onChange={(e) => handleBriefChange('mandatories', e.target.value)}
                  placeholder="f.eks. logo skal være med, payoff må ikke ændres, ingen humor om bæredygtighed"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg p-2.5 text-xs text-white placeholder:text-slate-600 leading-relaxed transition-all font-sans resize-y"
                />
              </div>

              {/* Budget */}
              <div>
                <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center space-x-1.5">
                  <Wallet className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Budget-ramme</span>
                </label>
                <input
                  type="text"
                  id="input_budget"
                  value={brief.budget ?? ''}
                  onChange={(e) => handleBriefChange('budget', e.target.value)}
                  placeholder="f.eks. 500k DKK produktion + 1M media — kalibrerer kanal-valg"
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans"
                />
              </div>
            </div>

            {/* PROCES-STEPPER (funnel i rækkefølge) */}
            <ProcessStepper
              isGenerating={isGenerating}
              deepMode={deepMode}
              generationStep={generationStep}
              isScanning={isScanning}
              isGeneratingStrategy={isGeneratingStrategy}
              isGeneratingCampaign={isGeneratingCampaign}
              isGeneratingMatrix={isGeneratingMatrix}
              isGeneratingEffectiveness={isGeneratingEffectiveness}
              hasCulturalIntel={hasCulturalIntel}
              hasStrategy={hasStrategy}
              hasCampaignPlatform={hasCampaignPlatform}
              hasSelectedTerritory={hasSelectedTerritory}
              hasPressureTest={hasPressureTest}
              hasChannelMatrix={hasChannelMatrix}
              hasEffectiveness={hasEffectiveness}
              onCulturalScan={handleCulturalScan}
              onGenerateStrategy={handleGenerateStrategy}
              onGenerateBigIdea={handleGenerateBigIdea}
              onGenerateChannelMatrix={handleGenerateChannelMatrix}
              onGenerateEffectiveness={handleGenerateEffectiveness}
              isSharpening={isSharpening}
              onSharpenIdea={onSharpenIdea}
              bureauModeActive={bureauModeActive}
              onToggleBureauMode={onToggleBureauMode}
              onRunBureau={onRunBureau}
              isBureauRunning={isBureauRunning}
              onToggleDeepMode={onToggleDeepMode}
              onGenerateAll={handleGenerateAll}
            />

            {/* VÆRKTØJER */}
            <div className="space-y-2">
              <span className="block text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">Værktøjer</span>

              <button
                type="button"
                onClick={handleBrainstorm}
                disabled={isGenerating || isBrainstorming}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:text-white font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                title="Generer kreative idéer og vinkler for dette brief — uden at forpligte sig til fuld generering"
              >
                {isBrainstorming
                  ? <Loader2 className="w-4 h-4 text-brand-orange-400 animate-spin shrink-0" />
                  : <Lightbulb className="w-4 h-4 text-brand-orange-400 shrink-0" />}
                <span>{isBrainstorming ? 'Brainstormer idéer...' : 'Brainstorm kreative idéer'}</span>
              </button>

              <button
                type="button"
                onClick={handleVisualDevelop}
                disabled={isGenerating || isVisualDeveloping}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:text-white font-display font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                title="Lad art director-redaktionen udvikle de visuelle idéer og billedprompts ud fra briefet"
              >
                <Palette className="w-4 h-4 text-brand-orange-400 shrink-0" />
                <span>Visuel udvikling · Redaktion</span>
              </button>


              <button
                type="button"
                onClick={handlePinCurrentBrief}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-800 bg-slate-900 text-slate-350 hover:border-slate-700 hover:text-white font-mono text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Pin dette brief til dine genveje/presets"
              >
                <Pin className="w-3.5 h-3.5 text-brand-orange-500 shrink-0" />
                <span>PIN JOB TIL GENVEJE & PRESETS</span>
              </button>
            </div>
          </div>

          {/* BRAND VALUES / ANTI-SLOP POLICY ADVICE */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80 text-xs text-slate-400 space-y-2">
            <span className="text-[11px] font-medium text-slate-400 flex items-center space-x-1">
              <Lightbulb className="w-3.5 h-3.5 text-slate-500" />
              <span>Redaktionelle regler</span>
            </span>
            <ul className="list-disc pl-4 space-y-1 text-slate-400 leading-relaxed">
              <li>Ingen unødvendige corporate klichéer (undgå generaliserede floskler).</li>
              <li>Fokusér skarpt på konkrete fysiske/digitale leverancer (skærmstørrelser, animationer, 3D karakterer).</li>
              <li>Smarte, stærke og ekstremt overbevisende overskrifter og LinkedIn hooks.</li>
              <li>Det engelske output skal være strinet og modent.</li>
            </ul>
          </div>
          
        </div>
  );
}
