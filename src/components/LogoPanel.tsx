/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Check, Copy, Download, Languages, Loader2, RefreshCw, Sparkles, Wand2, X } from 'lucide-react';
import { ProjectBrief, LogoResult } from '../types';

type RecraftStyle = '' | 'vector_illustration' | 'vector_illustration/flat_design' | 'vector_illustration/bold' | 'vector_illustration/minimalistic';

const STYLE_OPTIONS: { value: RecraftStyle; label: string; desc: string }[] = [
  { value: '', label: 'Auto', desc: 'Lad modellen vælge selv' },
  { value: 'vector_illustration', label: 'Vektor illustration', desc: 'Klassisk rent vektorudtryk' },
  { value: 'vector_illustration/flat_design', label: 'Fladt design', desc: 'Minimalistisk, fladt og moderne' },
  { value: 'vector_illustration/bold', label: 'Bold', desc: 'Kraftfuldt og markant udtryk' },
  { value: 'vector_illustration/minimalistic', label: 'Minimalistisk', desc: 'Ekstra simpelt og rent' },
];

/** Udtræk hex-koder (#xxxxxx) fra CVI brandColors-strenge. */
function extractHexColors(brandColors: string[] | undefined): string[] {
  if (!brandColors) return [];
  const out: string[] = [];
  for (const s of brandColors) {
    const m = s.match(/#[0-9a-fA-F]{6}/i);
    if (m) out.push(m[0].toUpperCase());
  }
  return [...new Set(out)];
}

/** Konvertér hex-streng til {r, g, b} objekt. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

function buildDefaultPrompt(brief: ProjectBrief): string {
  const parts: string[] = [];
  if (brief.client) parts.push(`Logo til ${brief.client}`);
  if (brief.project && brief.project !== brief.client) parts.push(brief.project);
  const base = parts.length > 0 ? parts.join(' — ') : 'Professionelt brand logo';
  return `${base}. Minimalistisk, skalerbart vektordesign. Rent, professionelt og moderne. Ingen tekst i logoet, kun grafisk ikon/symbol.`;
}

interface LogoPanelProps {
  brief: ProjectBrief;
  logoResult: LogoResult | null;
  isGeneratingLogo: boolean;
  handleGenerateLogo: (prompt: string, style: string, colors: Array<{ r: number; g: number; b: number }>) => void;
  isOptimizingLogoPrompt: boolean;
  handleOptimizeLogoPrompt: (currentPrompt: string, mode: 'translate' | 'refine') => Promise<string | null>;
  onClearResult: () => void;
  copiedKey: string | null;
  onCopy: (text: string, key: string) => void;
}

export function LogoPanel({
  brief,
  logoResult,
  isGeneratingLogo,
  handleGenerateLogo,
  isOptimizingLogoPrompt,
  handleOptimizeLogoPrompt,
  onClearResult,
  copiedKey,
  onCopy,
}: LogoPanelProps) {
  const [prompt, setPrompt] = useState<string>(() => buildDefaultPrompt(brief));
  const [style, setStyle] = useState<RecraftStyle>('vector_illustration/flat_design');
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [imgError, setImgError] = useState<boolean>(false);

  // Foretræk den rå SVG-markup som data-URI (renderer robust, omgår CORS/MIME);
  // fald tilbage til den hostede URL hvis serveren ikke kunne hente markuppen.
  const previewSrc = logoResult?.svg
    ? `data:image/svg+xml;utf8,${encodeURIComponent(logoResult.svg)}`
    : logoResult?.imageUrl ?? '';

  // Nulstil fejl-tilstand når et nyt logo kommer ind
  useEffect(() => {
    setImgError(false);
  }, [logoResult?.imageUrl, logoResult?.svg]);

  const cviColors = extractHexColors(brief.cviManual?.brandColors);

  // Opdatér default prompt når brief skifter
  useEffect(() => {
    setPrompt(buildDefaultPrompt(brief));
  }, [brief.client, brief.project]);

  // Auto-vælg CVI-farver første gang de dukker op
  useEffect(() => {
    if (cviColors.length > 0) {
      setSelectedColors(new Set(cviColors.slice(0, 3)));
    }
  }, [brief.cviManual?.brandColors?.join(',')]);

  const toggleColor = (hex: string) => {
    setSelectedColors(prev => {
      const next = new Set(prev);
      if (next.has(hex)) next.delete(hex);
      else next.add(hex);
      return next;
    });
  };

  const onGenerate = () => {
    const colors = [...selectedColors].map(hexToRgb);
    handleGenerateLogo(prompt, style, colors);
  };

  const onOptimize = async (mode: 'translate' | 'refine') => {
    const result = await handleOptimizeLogoPrompt(prompt, mode);
    if (result) setPrompt(result);
  };

  return (
    <div id="logo_generator_panel" className="bg-slate-950 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">

      {/* HEADER */}
      <div className="flex items-center justify-between border-b border-slate-850 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-violet-400" />
          <div>
            <h3 className="font-display font-medium text-xs text-slate-100 uppercase tracking-wider font-bold">
              Logo Generator · Recraft V4 Pro
            </h3>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              SVG vektor-logo via fal-ai/recraft/v4/pro/text-to-vector
            </p>
          </div>
        </div>
        {logoResult && (
          <button
            onClick={onClearResult}
            className="text-[11px] text-slate-500 hover:text-slate-300 font-mono flex items-center space-x-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Ryd</span>
          </button>
        )}
      </div>

      {/* PROMPT */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-medium text-slate-400">Logo beskrivelse / prompt</label>
          <span className="text-[10px] text-slate-600 font-mono">{prompt.length} tegn</span>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="f.eks. Minimalistisk logo for TechCorp. Rent, geometrisk symbol. Ingen tekst."
          className="w-full bg-slate-900 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 rounded-lg p-3 text-xs text-white placeholder:text-slate-600 leading-relaxed transition-all font-sans resize-y"
        />
        {/* AI PROMPT-VÆRKTØJER */}
        <div className="flex flex-wrap gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => onOptimize('translate')}
            disabled={isOptimizingLogoPrompt || isGeneratingLogo}
            title="Oversæt og omdan dit input til en Recraft-optimeret engelsk vektor-prompt baseret på briefet"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-violet-500/40 hover:bg-violet-500/5 text-[11px] font-mono text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOptimizingLogoPrompt ? (
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            ) : (
              <Languages className="w-3 h-3 text-violet-400 shrink-0" />
            )}
            <span>Oversæt til Recraft</span>
          </button>
          <button
            type="button"
            onClick={() => onOptimize('refine')}
            disabled={isOptimizingLogoPrompt || isGeneratingLogo || !prompt.trim()}
            title="Forfin og skærp den nuværende prompt gennem AI"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:border-violet-500/40 hover:bg-violet-500/5 text-[11px] font-mono text-slate-300 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isOptimizingLogoPrompt ? (
              <Loader2 className="w-3 h-3 animate-spin shrink-0" />
            ) : (
              <Wand2 className="w-3 h-3 text-violet-400 shrink-0" />
            )}
            <span>Forfin gennem AI</span>
          </button>
        </div>

        <p className="text-[10px] text-slate-600 font-mono leading-relaxed">
          Tips: beskriv formen, symbolikken og stemningen. Undgå at bede om tekst i logoet. Engelsk prompt giver typisk bedre resultater.
        </p>
      </div>

      {/* STYLE SELECTOR */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-medium text-slate-400 block">Stil</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setStyle(opt.value)}
              className={`px-2.5 py-2 rounded-lg border text-left transition-all ${
                style === opt.value
                  ? 'border-violet-500/60 bg-violet-500/10 text-white'
                  : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span className="block text-[11px] font-bold">{opt.label}</span>
              <span className="block text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CVI COLOR PALETTE (kun vis hvis CVI-farver er tilgængelige) */}
      {cviColors.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-400">Brand-farver fra CVI</label>
            <span className="text-[10px] text-slate-600 font-mono">klik for at inkludere i generering</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {cviColors.map((hex) => {
              const active = selectedColors.has(hex);
              return (
                <button
                  key={hex}
                  type="button"
                  onClick={() => toggleColor(hex)}
                  title={`${hex} — klik for at ${active ? 'fjerne' : 'inkludere'}`}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all ${
                    active
                      ? 'border-violet-500/50 bg-violet-500/10 text-white'
                      : 'border-slate-800 bg-slate-900 text-slate-500 hover:border-slate-700'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-sm border border-white/15 shrink-0"
                    style={{ backgroundColor: hex }}
                  />
                  <span>{hex}</span>
                  {active && <Check className="w-2.5 h-2.5 text-violet-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* GENERATE BUTTON */}
      <button
        onClick={onGenerate}
        disabled={isGeneratingLogo || !prompt.trim()}
        className={`w-full py-2.5 px-4 rounded-lg font-mono font-bold text-xs tracking-wider uppercase transition-all flex items-center justify-center space-x-2 ${
          isGeneratingLogo
            ? 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
            : 'bg-violet-600/15 hover:bg-violet-600/25 text-violet-200 hover:text-white border border-violet-500/40 active:scale-[0.99] cursor-pointer'
        }`}
      >
        {isGeneratingLogo ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Genererer SVG-logo via Recraft V4 Pro...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Generér Logo</span>
          </>
        )}
      </button>

      {/* RESULT */}
      {logoResult && (
        <div className="pt-3 border-t border-slate-850 space-y-4">

          {/* SVG PREVIEW */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            {/* Checkerboard background (synliggør transparens i SVG) */}
            <div
              className="flex items-center justify-center p-8 min-h-[200px]"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%231e293b'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%231e293b'/%3E%3Crect x='10' y='0' width='10' height='10' fill='%23253347'/%3E%3Crect x='0' y='10' width='10' height='10' fill='%23253347'/%3E%3C/svg%3E")`,
              }}
            >
              {imgError ? (
                <div className="text-center space-y-2">
                  <p className="text-[11px] text-slate-400 font-mono">
                    Kunne ikke vise logoet inline.
                  </p>
                  <a
                    href={logoResult.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-mono text-violet-300 hover:text-violet-200 underline"
                  >
                    Åbn SVG i ny fane →
                  </a>
                </div>
              ) : (
                <img
                  src={previewSrc}
                  alt={`Logo: ${logoResult.prompt.slice(0, 60)}`}
                  className="max-w-full max-h-64 object-contain"
                  onError={() => setImgError(true)}
                />
              )}
            </div>

            {/* Result meta */}
            <div className="px-4 py-2.5 border-t border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="text-[10px] font-mono text-slate-500 truncate max-w-[200px]">
                {STYLE_OPTIONS.find(s => s.value === logoResult.style)?.label ?? 'Auto'} · SVG
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onCopy(logoResult.imageUrl, 'logo_url')}
                  className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-mono border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  {copiedKey === 'logo_url' ? (
                    <><Check className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400">Kopieret</span></>
                  ) : (
                    <><Copy className="w-3 h-3" /><span>Kopiér URL</span></>
                  )}
                </button>
                <a
                  href={logoResult.svg
                    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(logoResult.svg)}`
                    : logoResult.imageUrl}
                  download={`logo-${(brief.client || 'brand').toLowerCase().replace(/\s+/g, '-')}.svg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-mono bg-violet-600/15 border border-violet-500/40 text-violet-300 hover:text-white transition-all"
                >
                  <Download className="w-3 h-3" />
                  <span>Download SVG</span>
                </a>
                <button
                  onClick={onGenerate}
                  disabled={isGeneratingLogo}
                  title="Regenerér med samme indstillinger"
                  className="flex items-center space-x-1 px-2 py-1 rounded text-[11px] font-mono border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isGeneratingLogo ? 'animate-spin' : ''}`} />
                  <span>Ny version</span>
                </button>
              </div>
            </div>
          </div>

          {/* Used prompt (collapsible info) */}
          <details className="group">
            <summary className="text-[11px] font-mono text-slate-600 hover:text-slate-400 cursor-pointer select-none list-none flex items-center space-x-1">
              <span>▸</span>
              <span className="group-open:hidden">Vis brugt prompt</span>
              <span className="hidden group-open:inline">Skjul prompt</span>
            </summary>
            <p className="mt-2 text-[11px] text-slate-500 leading-relaxed font-mono bg-slate-900/60 rounded-lg p-2.5 border border-slate-800">
              {logoResult.prompt}
            </p>
          </details>

        </div>
      )}
    </div>
  );
}
