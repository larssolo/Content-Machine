/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Printer, ChevronDown, FileText, Palette, BookOpen, Check, Copy, Globe,
  Presentation, Download,
} from 'lucide-react';
import { BrandSurfaceOutput, CampaignTerritory } from '../types';

/**
 * Eksport-dropdown: PDF-skabeloner, Markdown, HTML, pitch-deck og Word.
 * Den primære knap kører fuld PDF; chevron åbner skabelon-popover på hover.
 * Udtrukket fra App.tsx's output-workspace.
 */
interface ExportMenuProps {
  output: BrandSurfaceOutput;
  copiedKey: string | null;
  selectedTerritory: CampaignTerritory | null;
  onExportSection: (mode: 'all' | 'cvi' | 'case') => void;
  onExportMarkdown: () => void;
  onCopyAllMarkdown: () => void;
  onExportHtml: () => void;
  onExportDeck: () => void;
  onExportDocx: () => void;
}

export function ExportMenu({
  output, copiedKey, selectedTerritory,
  onExportSection, onExportMarkdown, onCopyAllMarkdown, onExportHtml, onExportDeck, onExportDocx,
}: ExportMenuProps) {
  return (
    <div className="relative group/export mb-2 sm:mb-0 mr-2 flex items-stretch">
      <button
        onClick={() => onExportSection('all')}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-brand-orange-600 hover:bg-brand-orange-500 text-white text-[11px] font-semibold rounded-l-lg transition-all shadow-sm cursor-pointer active:scale-95"
        title="Generer pænt formateret kundemateriale med alt indhold som PDF"
      >
        <Printer className="w-3.5 h-3.5 text-white" />
        <span>Eksportér til PDF</span>
      </button>

      <div className="relative flex items-stretch">
        <button
          type="button"
          className="flex items-center justify-center px-1.5 bg-brand-orange-600 hover:bg-brand-orange-500 text-white text-[11px] rounded-r-lg shadow-sm cursor-pointer transition-all border-l border-white/10 active:scale-95"
          title="Vælg specifik PDF eksport skabelon"
        >
          <ChevronDown className="w-3.5 h-3.5 text-white" />
        </button>

        {/* Dropdown Options List displayed on hover as a rich interactive popover */}
        <div className="absolute right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all duration-150 z-30 w-52 p-1 text-left font-mono">
          <div className="px-2.5 py-1 bg-slate-900/40 rounded border-b border-slate-900/60 mb-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">PDF Skabeloner</span>
          </div>

          <button
            onClick={() => onExportSection('all')}
            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
          >
            <FileText className="w-3.5 h-3.5 text-brand-orange-500 shrink-0" />
            <span>Fuld rapport (Alt)</span>
          </button>

          {output.cviSuggestion && (
            <button
              onClick={() => onExportSection('cvi')}
              className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2 border-t border-slate-900"
            >
              <Palette className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="font-bold text-amber-400">Kun Brand CVI-ark</span>
            </button>
          )}

          <button
            onClick={() => onExportSection('case')}
            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2 border-t border-slate-900"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Kun Case-tekster</span>
          </button>

          <div className="px-2.5 py-1 bg-slate-900/40 rounded border-y border-slate-900/60 my-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">Markdown</span>
          </div>

          <button
            onClick={onExportMarkdown}
            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Download som Markdown (.md)</span>
          </button>

          <button
            onClick={onCopyAllMarkdown}
            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2 border-t border-slate-900"
          >
            {copiedKey === 'export_all_md'
              ? <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              : <Copy className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            <span>Kopiér alt (Markdown)</span>
          </button>

          <div className="px-2.5 py-1 bg-slate-900/40 rounded border-y border-slate-900/60 my-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">HTML</span>
          </div>

          <button
            onClick={onExportHtml}
            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span>Download som HTML (.html)</span>
          </button>

          {selectedTerritory && (
            <>
              <div className="px-2.5 py-1 bg-slate-900/40 rounded border-y border-slate-900/60 my-1">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">Pitch-deck</span>
              </div>

              <button
                onClick={onExportDeck}
                className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
              >
                <Presentation className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                <span className="font-bold text-violet-300">Eksportér pitch-deck (.html)</span>
              </button>
            </>
          )}

          <div className="px-2.5 py-1 bg-slate-900/40 rounded border-y border-slate-900/60 my-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest block">Word</span>
          </div>

          <button
            onClick={onExportDocx}
            className="w-full text-left px-2.5 py-1.5 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors flex items-center space-x-2"
          >
            <Download className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Download som Word (.docx)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
