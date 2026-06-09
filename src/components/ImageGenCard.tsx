/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Loader2, AlertTriangle, Download, RotateCcw, Sparkles, Check, Copy } from 'lucide-react';

export interface ImageGenState {
  url: string;
  loading: boolean;
  error: string | null;
  aspectRatio: string;
}

interface Props {
  label: string;
  footer: string;
  alt: string;
  ratios: string[];
  promptText: string;
  image: ImageGenState;
  /** Filnavn-base uden endelse, fx "Acme_hero". */
  downloadBase: string;
  copied: boolean;
  onCopy: () => void;
  onAspectChange: (ratio: string) => void;
  onGenerate: () => void;
  /** Deaktiverer generér-knappen (fx når prompten er tom). Default: false. */
  disabled?: boolean;
}

/** Ét kort for en AI-billedprompt med live generering (erstatter 3 ens blokke). */
export function ImageGenCard({
  label,
  footer,
  alt,
  ratios,
  promptText,
  image,
  downloadBase,
  copied,
  onCopy,
  onAspectChange,
  onGenerate,
  disabled = false,
}: Props) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-300">{label}</span>
          <button onClick={onCopy} className="text-slate-500 hover:text-white transition-colors">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed italic border-l border-slate-700 pl-2">
          "{promptText}"
        </p>
      </div>

      {/* Interactive Generation Section */}
      <div className="mt-2 pt-3 border-t border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Billedformat:</span>
          <div className="flex bg-slate-950 p-0.5 rounded-md border border-slate-800 space-x-1">
            {ratios.map((r) => (
              <button
                key={r}
                onClick={() => onAspectChange(r)}
                className={`px-2 py-0.5 text-[11px] font-mono rounded transition-colors ${
                  image.aspectRatio === r
                    ? 'bg-brand-orange-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {image.loading ? (
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-8 flex flex-col items-center justify-center space-y-3 min-h-[140px]">
            <Loader2 className="w-6 h-6 text-brand-orange-500 animate-spin" />
            <span className="text-[11px] text-slate-400">Genererer billede…</span>
          </div>
        ) : image.error ? (
          <div className="bg-red-950/40 border border-red-900/40 text-red-400 rounded-lg p-3 text-[11px] space-y-2">
            <div className="flex items-start space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{image.error}</span>
            </div>
            <button
              onClick={onGenerate}
              className="w-full py-1 text-[11px] bg-red-900/60 hover:bg-red-900/80 border border-red-700/50 rounded font-medium text-white transition-all"
            >
              Prøv igen
            </button>
          </div>
        ) : image.url ? (
          <div className="space-y-2">
            <div className="relative group rounded-lg overflow-hidden border border-slate-800 bg-slate-950 shadow-inner">
              <img
                src={image.url}
                alt={alt}
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover max-h-[180px] rounded-lg transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                <a
                  href={image.url}
                  download={`${downloadBase}_${image.aspectRatio.replace(':', 'x')}.jpg`}
                  className="p-2.5 bg-zinc-900 text-white rounded-full hover:bg-brand-orange-500 hover:scale-110 transition-all shadow-md"
                  title="Download i fuld opløsning"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={onGenerate}
                  className="p-2.5 bg-zinc-900 text-white rounded-full hover:bg-brand-orange-500 hover:scale-110 transition-all shadow-md"
                  title="Generer nyt billede"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-zinc-400 px-1">
              <span className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-zinc-500">Format: {image.aspectRatio}</span>
              <a
                href={image.url}
                download={`${downloadBase}.jpg`}
                className="text-orange-400 hover:text-orange-300 font-medium flex items-center space-x-1"
              >
                <Download className="w-3 h-3" />
                <span>Download</span>
              </a>
            </div>
          </div>
        ) : (
          <button
            onClick={onGenerate}
            disabled={disabled}
            className={`w-full py-2 rounded-lg text-white font-medium text-[11px] shadow-sm transition-all flex items-center justify-center space-x-1.5 ${
              disabled ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-orange-600 hover:bg-brand-orange-500 cursor-pointer'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generer billede</span>
          </button>
        )}
      </div>

      <div className="text-[11px] text-slate-500 mt-3 pt-2 border-t border-slate-800">{footer}</div>
    </div>
  );
}
