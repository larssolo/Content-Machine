/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ProjectBrief, BrandSurfaceOutput } from '../types';

interface PrintViewProps {
  output: BrandSurfaceOutput | null;
  brief: ProjectBrief;
  printMode: 'all' | 'cvi' | 'case';
  generatedImages: Record<'hero' | 'detail' | 'abstract', { url: string; loading: boolean; error: string | null; aspectRatio: string }>;
}

export function PrintView({ output, brief, printMode, generatedImages }: PrintViewProps) {
  if (!output) return null;

  return (
        <div className="hidden print:block bg-white text-slate-900 p-12 max-w-4xl mx-auto font-sans leading-relaxed text-sm">
          
          {/* Header */}
          <div className="border-b-4 border-orange-500 pb-6 mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 uppercase font-sans">
                {printMode === 'cvi' ? 'CVI Designmanual' : printMode === 'case' ? 'Case-Tekster' : 'Content & CVI Leverance'}
              </h1>
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mt-1">
                Autentisk • Konkret • Kreativ Case Formidling
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold border-2 border-orange-500 text-orange-600 bg-orange-50/40 px-3 py-1.5 rounded uppercase tracking-wider">
                {printMode === 'cvi' ? 'CVI Retningslinjer' : printMode === 'case' ? 'Tekst-Leverance' : 'Leverance Rapport'}
              </span>
              <p className="text-[11px] text-slate-400 font-mono mt-1.5">
                Genereret: {new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Project Summary */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-8 grid grid-cols-2 gap-4">
            <div>
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">Kunde</span>
              <span className="text-sm font-bold text-slate-800">{brief.client || 'Ikke angivet'}</span>
            </div>
            <div>
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">Projekt</span>
              <span className="text-sm font-bold text-slate-800">{brief.project || 'Ikke angivet'}</span>
            </div>
            <div className="col-span-2 border-t border-slate-200 pt-3">
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">Kilde-brief beskrivelse</span>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{brief.description || 'Ingen kildebeskrivelse tilgængelig.'}</p>
            </div>
            {brief.cviManual && (
              <div className="col-span-2 border-t border-slate-250 pt-4 mt-1 space-y-3">
                <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-slate-400 block">Scannet Designmanual / CVI Retningslinjer</span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <strong className="text-slate-700 block font-mono text-[11px]">Brand Farver & Palet:</strong>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {brief.cviManual.brandColors.map((color, cidx) => {
                        const hexM = color.match(/#[0-9a-fA-F]{3,6}/);
                        const hexC = hexM ? hexM[0] : null;
                        return (
                          <span key={cidx} className="inline-flex items-center space-x-1 border border-slate-300 rounded px-1.5 py-0.5 text-[11px] bg-white">
                            {hexC && <span className="w-2 h-2 rounded-full border border-slate-400/50 block shrink-0" style={{ backgroundColor: hexC }}></span>}
                            <span className="text-slate-600 font-mono">{color}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <strong className="text-slate-700 block font-mono text-[11px]">Typografi & Fonte:</strong>
                    <p className="text-slate-600 mt-1">
                      Overskrifter: <span className="font-bold">{brief.cviManual.fonts?.primaryHeadings}</span> <span className="text-slate-300 mx-1">|</span> Brødtekst: <span className="font-bold">{brief.cviManual.fonts?.bodyText}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 italic mt-0.5">{brief.cviManual.fonts?.description}</p>
                  </div>
                  <div className="col-span-2 pt-1.5 border-t border-slate-100">
                    <strong className="text-slate-700 block font-mono text-[11px]">Identificeret Billedstil:</strong>
                    <p className="text-slate-600 mt-0.5 italic">"{brief.cviManual.imageStyleGuidelines}"</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text-based case-delivery sections (Sections 1, 2, 3) */}
          {(printMode === 'all' || printMode === 'case') && (
            <>
              {/* Section 1: Short Case Text */}
              <div className="space-y-3 mb-8 style-print-section">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-250 pb-1.5 flex items-center space-x-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                  <span>1. Kort Case-tekst</span>
                </h2>
                <div className="p-4 bg-orange-50/20 border-l-4 border-orange-500 text-slate-800 rounded-r-lg mt-2 text-xs leading-relaxed font-serif">
                  "{output.shortCaseText}"
                </div>
              </div>

              {/* Section 2: Long Case Text */}
              <div className="space-y-3 mb-8 style-print-section">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-250 pb-1.5 flex items-center space-x-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                  <span>2. Uddybende Case-historie</span>
                </h2>
                <p className="text-slate-850 whitespace-pre-wrap leading-relaxed text-xs p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  {output.longCaseText}
                </p>
              </div>

              {/* Section 3: LinkedIn Post */}
              <div className="space-y-3 mb-8 style-print-section" style={{ pageBreakInside: 'avoid' }}>
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-250 pb-1.5 flex items-center space-x-2">
                  <span className="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                  <span>3. LinkedIn Delingsmateriale</span>
                </h2>
                <div className="p-5 bg-slate-50 border border-slate-200 rounded-lg whitespace-pre-wrap text-xs text-slate-850 leading-relaxed font-sans">
                  {output.linkedinPost}
                </div>
              </div>
            </>
          )}

          {/* Section 4: Image Prompts */}
          {(printMode === 'all' || printMode === 'cvi') && output.imagePrompts && (
            <div className="space-y-4 mb-8 style-print-section" style={{ pageBreakInside: 'avoid' }}>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-250 pb-1.5 flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                <span>4. Foreslåede AI Billedprompts & Konceptbilleder</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                
                {/* Hero Prompt */}
                <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-orange-605 uppercase tracking-wider mb-1.5">
                      Prompt #1: Hero visual design
                    </div>
                    {generatedImages.hero.url && (
                      <div className="mb-2.5 rounded overflow-hidden border border-slate-200">
                        <img src={generatedImages.hero.url} referrerPolicy="no-referrer" alt="Hero conceptual concept" className="w-full h-auto max-h-[120px] object-cover" />
                      </div>
                    )}
                    <p className="text-[11px] text-slate-800 mb-2 italic leading-relaxed">
                      "{output.imagePrompts.hero}"
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500 border-t border-slate-150 pt-2 font-mono">
                    <strong>Type:</strong> High Production Value Hero Design
                  </div>
                </div>

                {/* Detail Prompt */}
                <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-orange-605 uppercase tracking-wider mb-1.5">
                      Prompt #2: Special detail / closeup
                    </div>
                    {generatedImages.detail.url && (
                      <div className="mb-2.5 rounded overflow-hidden border border-slate-200">
                        <img src={generatedImages.detail.url} referrerPolicy="no-referrer" alt="Detail conceptual concept" className="w-full h-auto max-h-[120px] object-cover" />
                      </div>
                    )}
                    <p className="text-[11px] text-slate-800 mb-2 italic leading-relaxed">
                      "{output.imagePrompts.detail}"
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500 border-t border-slate-150 pt-2 font-mono">
                    <strong>Type:</strong> Macro / Structural texturing
                  </div>
                </div>

                {/* Abstract Prompt */}
                <div className="border border-slate-200 p-4 rounded-lg bg-slate-50 flex flex-col justify-between">
                  <div>
                    <div className="text-[11px] font-mono font-bold text-orange-605 uppercase tracking-wider mb-1.5">
                      Prompt #3: Abstract background texture
                    </div>
                    {generatedImages.abstract.url && (
                      <div className="mb-2.5 rounded overflow-hidden border border-slate-200">
                        <img src={generatedImages.abstract.url} referrerPolicy="no-referrer" alt="Abstract conceptual concept" className="w-full h-auto max-h-[120px] object-cover" />
                      </div>
                    )}
                    <p className="text-[11px] text-slate-800 mb-2 italic leading-relaxed">
                      "{output.imagePrompts.abstract}"
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-500 border-t border-slate-150 pt-2 font-mono">
                    <strong>Type:</strong> Ambient vibe / color pattern
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Section 4.5: AI-suggested CVI */}
          {(printMode === 'all' || printMode === 'cvi') && output.cviSuggestion && (
            <div className="space-y-4 mb-8 style-print-section" style={{ pageBreakInside: 'avoid' }}>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider border-b border-slate-250 pb-1.5 flex items-center space-x-2">
                <span className="w-1.5 h-4 bg-orange-500 rounded-sm"></span>
                <span>5. AI-genereret CVI (Corporate Visual Identity) Forslag</span>
              </h2>
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mt-2 space-y-4 text-xs font-sans">
                <div>
                  <h3 className="font-bold text-slate-800 font-sans text-xs uppercase tracking-wider mb-1">A. Visuelt Designkoncept</h3>
                  <p className="text-slate-705 italic leading-relaxed">"{output.cviSuggestion.visualIdentityConcept}"</p>
                  <p className="text-slate-600 mt-1 leading-relaxed">{output.cviSuggestion.generalBrandIdentitySummary}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <h3 className="font-bold text-slate-800 font-sans text-xs uppercase tracking-wider mb-2">B. Farvepalette Forslag</h3>
                    <div className="space-y-2">
                      {output.cviSuggestion.brandColors.map((col, idx) => (
                        <div key={idx} className="flex items-center space-x-3 text-[11px]">
                          <span className="w-5 h-5 rounded border border-slate-350 shrink-0 block shadow-sm" style={{ backgroundColor: col.hex }}></span>
                          <div>
                            <span className="font-bold text-slate-800 font-mono">{col.hex}</span>
                            <span className="text-slate-600 block leading-tight">{col.name} ({col.useCase})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-bold text-slate-800 font-sans text-xs uppercase tracking-wider mb-2">C. Typografiske Retningslinjer</h3>
                    <p className="text-slate-750 font-medium mb-1">
                      Overskrifter: <span className="font-bold text-slate-900">{output.cviSuggestion.fonts.primaryHeadings}</span>
                    </p>
                    <p className="text-slate-750 font-medium mb-2.5">
                      Brødtekst: <span className="font-bold text-slate-900">{output.cviSuggestion.fonts.bodyText}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed italic bg-white border border-slate-100 p-2 rounded">
                      <strong>Rationale:</strong> {output.cviSuggestion.fonts.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                  <div>
                    <h3 className="font-bold text-slate-800 font-sans text-xs uppercase tracking-wider mb-1">D. Billedstil & Fotomanual</h3>
                    <p className="text-slate-600 leading-relaxed text-[11px] font-mono whitespace-pre-line">{output.cviSuggestion.imageStyleGuidelines}</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 font-sans text-xs uppercase tracking-wider mb-1">E. Layout & Grafiske Elementer</h3>
                    <p className="text-slate-600 leading-relaxed text-[11px] whitespace-pre-line">{output.cviSuggestion.graphicElementsRules}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3">
                  <h3 className="font-bold text-slate-800 font-sans text-xs uppercase tracking-wider mb-1">F. Logo Anvendelsesregler</h3>
                  <p className="text-slate-600 leading-relaxed text-[11px]">{output.cviSuggestion.logoUsageRules}</p>
                </div>
              </div>
            </div>
          )}

          {/* Section 5: Tone Assessment / Quality Review */}
          {(printMode === 'all' || printMode === 'case') && output.toneAnalysis && (
            <div className="mt-8 border-t border-slate-200 pt-6" style={{ pageBreakInside: 'avoid' }}>
              <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block font-bold mb-1">
                  Uafhængig Tone-Revisors Vurdering
                </span>
                <p className="text-xs italic text-slate-600 font-sans leading-relaxed">
                  "{output.toneAnalysis.overallReview}"
                </p>
              </div>
            </div>
          )}

          {/* Footer print disclaimer */}
          <div className="mt-12 text-center text-slate-400 text-[11px] font-mono border-t border-slate-150 pt-4">
            <span>Udarbejdet via Neura Studio • larssohl.dk</span>
          </div>

        </div>
  );
}
