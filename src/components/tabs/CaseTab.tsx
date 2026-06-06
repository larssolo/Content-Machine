/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, SetStateAction } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Lock, LockOpen, Loader2, RefreshCw, RotateCcw } from 'lucide-react';
import { BrandSurfaceOutput } from '../../types';
import { RevisionSelector } from '../RevisionSelector';
import { VariantsDisplay } from '../VariantsDisplay';

interface CaseTabProps {
  output: BrandSurfaceOutput;
  selectedTextKey: string;
  setSelectedTextKey: Dispatch<SetStateAction<string>>;
  setOutput: Dispatch<SetStateAction<BrandSurfaceOutput | null>>;
  isRefining: boolean;
  isVariating: boolean;
  handleRefine: (command: string, targetKey: string) => void;
  handleUndoRefine: (targetKey: string) => void;
  handleGenerateVariants: (targetKey: string) => void;
  handleCopyToClipboard: (text: string, key: string) => void;
  copiedKey: string | null;
  refinementHistory: Array<{ key: string; original: string }>;
  revisions: Record<string, string[]>;
  setRevisions: Dispatch<SetStateAction<Record<string, string[]>>>;
  activeCompareIndex: Record<string, number | null>;
  setActiveCompareIndex: Dispatch<SetStateAction<Record<string, number | null>>>;
  setErrorMsg: Dispatch<SetStateAction<string | null>>;
  variants: { key: string; options: string[] } | null;
  setVariants: Dispatch<SetStateAction<{ key: string; options: string[] } | null>>;
  handleApplyVariant: (targetKey: string, value: string) => void;
  lockedSections: string[];
  handleToggleLock: (key: string) => void;
  handleRegenerateSection: (key: string) => void;
  regeneratingKey: string | null;
}

export function CaseTab({
  output, selectedTextKey, setSelectedTextKey, setOutput,
  isRefining, isVariating, handleRefine, handleUndoRefine,
  handleGenerateVariants, handleCopyToClipboard, copiedKey,
  refinementHistory, revisions, setRevisions, activeCompareIndex,
  setActiveCompareIndex, setErrorMsg, variants, setVariants, handleApplyVariant,
  lockedSections, handleToggleLock, handleRegenerateSection, regeneratingKey,
}: CaseTabProps) {
  const hasHistory = (key: string) => refinementHistory.some(h => h.key === key);
  const isLocked = (key: string) => lockedSections.includes(key);

  return (
    <motion.div
      key="tab_case"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* Segment 1: Kort case-tekst */}
      <div
        onClick={() => setSelectedTextKey('shortCaseText')}
        className={`p-4 rounded-xl border transition-all ${
          isLocked('shortCaseText')
            ? 'bg-amber-950/10 border-amber-700/30'
            : selectedTextKey === 'shortCaseText'
            ? 'bg-slate-850 border-brand-orange-500/40 ring-1 ring-brand-orange-500/30'
            : 'bg-slate-900/50 border-slate-800 hover:border-slate-750'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono bg-zinc-800 text-zinc-350 px-2 py-0.5 rounded uppercase font-bold tracking-wider">1. Kort case-tekst</span>
            {selectedTextKey === 'shortCaseText' && !isLocked('shortCaseText') && <span className="text-[11px] bg-brand-orange-600/20 text-brand-orange-500 px-1.5 py-0.2 rounded font-mono font-medium border border-brand-orange-500/20">Valgt til raffinering</span>}
            {isLocked('shortCaseText') && <span className="text-[11px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono border border-amber-500/20">Låst</span>}
          </div>
          <div className="flex items-center space-x-1.5">
            {hasHistory('shortCaseText') && (
              <button
                onClick={(e) => { e.stopPropagation(); handleUndoRefine('shortCaseText'); }}
                className="text-[11px] text-amber-500 hover:text-amber-400 font-mono flex items-center space-x-0.5 mr-1"
                title="Fortryd omskrivning"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fortryd</span>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleRegenerateSection('shortCaseText'); }}
              disabled={isRefining || regeneratingKey !== null || isLocked('shortCaseText')}
              className="text-slate-400 hover:text-sky-400 disabled:opacity-30 transition-colors"
              title="Generer frisk version fra bunden"
            >
              {regeneratingKey === 'shortCaseText'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                : <RefreshCw className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleLock('shortCaseText'); }}
              className={`transition-colors ${isLocked('shortCaseText') ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
              title={isLocked('shortCaseText') ? 'Sektion låst — klik for at låse op' : 'Lås sektion (bevares ved ny generering)'}
            >
              {isLocked('shortCaseText') ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyToClipboard(output.shortCaseText, 'shortCaseText'); }}
              className="text-slate-400 hover:text-white transition-colors"
              title="Kopier"
            >
              {copiedKey === 'shortCaseText' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <textarea
          value={output.shortCaseText}
          onChange={(e) => setOutput(prev => prev ? { ...prev, shortCaseText: e.target.value } : null)}
          rows={5}
          className="w-full bg-slate-950/40 focus:bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none p-3.5 rounded-lg text-xs leading-relaxed text-slate-200 resize-none font-sans"
        />

        {/* Inline refining toolkit */}
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase mr-1">Raffinér:</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleRefine('/shorten', 'shortCaseText'); }}
              disabled={isRefining}
              id="refine_shorten_short_case"
              className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 rounded font-mono"
              title="Gør kortere"
            >
              /shorten
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRefine('/more-human', 'shortCaseText'); }}
              disabled={isRefining}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 rounded font-mono"
              title="Gør mere menneskelig og ualmindelig varm"
            >
              /more-human
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRefine('/more-business', 'shortCaseText'); }}
              disabled={isRefining}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 rounded font-mono"
              title="Gør mere forretningsmæssig skarp"
            >
              /more-business
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleGenerateVariants('shortCaseText'); }}
              disabled={isVariating}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-amber-700/40 hover:border-amber-600 hover:bg-slate-800 text-amber-400 rounded font-mono"
              title="Generer 2 A/B-varianter"
            >
              /variant
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Genereret uden marketingfloskler</span>
        </div>

        <RevisionSelector
          targetKey="shortCaseText"
          activeValue={output.shortCaseText}
          revisions={revisions}
          setRevisions={setRevisions}
          activeCompareIndex={activeCompareIndex}
          setActiveCompareIndex={setActiveCompareIndex}
          setOutput={setOutput}
          setErrorMsg={setErrorMsg}
        />
        <VariantsDisplay
          targetKey="shortCaseText"
          variants={variants}
          isVariating={isVariating}
          setVariants={setVariants}
          handleApplyVariant={handleApplyVariant}
        />
      </div>

      {/* Segment 2: Længere case-tekst */}
      <div
        onClick={() => setSelectedTextKey('longCaseText')}
        className={`p-4 rounded-xl border transition-all ${
          isLocked('longCaseText')
            ? 'bg-amber-950/10 border-amber-700/30'
            : selectedTextKey === 'longCaseText'
            ? 'bg-slate-850 border-brand-orange-500/40 ring-1 ring-brand-orange-500/30'
            : 'bg-slate-900/50 border-slate-800 hover:border-slate-750'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-mono bg-zinc-800 text-zinc-350 px-2 py-0.5 rounded uppercase font-bold tracking-wider">2. Længere case-tekst (Website)</span>
            {selectedTextKey === 'longCaseText' && !isLocked('longCaseText') && <span className="text-[11px] bg-brand-orange-600/20 text-brand-orange-500 px-1.5 py-0.2 rounded font-mono font-medium border border-brand-orange-500/20">Valgt til raffinering</span>}
            {isLocked('longCaseText') && <span className="text-[11px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono border border-amber-500/20">Låst</span>}
          </div>
          <div className="flex items-center space-x-1.5">
            {hasHistory('longCaseText') && (
              <button
                onClick={(e) => { e.stopPropagation(); handleUndoRefine('longCaseText'); }}
                className="text-[11px] text-amber-500 hover:text-amber-400 font-mono flex items-center space-x-0.5 mr-1"
                title="Fortryd omskrivning"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Fortryd</span>
              </button>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); handleRegenerateSection('longCaseText'); }}
              disabled={isRefining || regeneratingKey !== null || isLocked('longCaseText')}
              className="text-slate-400 hover:text-sky-400 disabled:opacity-30 transition-colors"
              title="Generer frisk version fra bunden"
            >
              {regeneratingKey === 'longCaseText'
                ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                : <RefreshCw className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleToggleLock('longCaseText'); }}
              className={`transition-colors ${isLocked('longCaseText') ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
              title={isLocked('longCaseText') ? 'Sektion låst — klik for at låse op' : 'Lås sektion (bevares ved ny generering)'}
            >
              {isLocked('longCaseText') ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleCopyToClipboard(output.longCaseText, 'longCaseText'); }}
              className="text-slate-400 hover:text-white transition-colors"
              title="Kopier"
            >
              {copiedKey === 'longCaseText' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
        <textarea
          value={output.longCaseText}
          onChange={(e) => setOutput(prev => prev ? { ...prev, longCaseText: e.target.value } : null)}
          rows={10}
          className="w-full bg-slate-955 border border-slate-800 focus:border-slate-700 focus:outline-none p-3.5 rounded-lg text-xs leading-relaxed text-slate-200 resize-none font-sans"
        />

        {/* Inline refining toolkit */}
        <div className="mt-3 pt-2 border-t border-slate-800/60 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-mono text-slate-500 uppercase mr-1">Raffinér:</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleRefine('/shorten', 'longCaseText'); }}
              disabled={isRefining}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 rounded font-mono"
            >
              /shorten
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRefine('/more-human', 'longCaseText'); }}
              disabled={isRefining}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 rounded font-mono"
            >
              /more-human
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRefine('/more-business', 'longCaseText'); }}
              disabled={isRefining}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 text-slate-300 rounded font-mono"
            >
              /more-business
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleGenerateVariants('longCaseText'); }}
              disabled={isVariating}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-amber-700/40 hover:border-amber-600 hover:bg-slate-800 text-amber-400 rounded font-mono"
              title="Generer 2 A/B-varianter"
            >
              /variant
            </button>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Udførlig design documentation</span>
        </div>

        <RevisionSelector
          targetKey="longCaseText"
          activeValue={output.longCaseText}
          revisions={revisions}
          setRevisions={setRevisions}
          activeCompareIndex={activeCompareIndex}
          setActiveCompareIndex={setActiveCompareIndex}
          setOutput={setOutput}
          setErrorMsg={setErrorMsg}
        />
        <VariantsDisplay
          targetKey="longCaseText"
          variants={variants}
          isVariating={isVariating}
          setVariants={setVariants}
          handleApplyVariant={handleApplyVariant}
        />
      </div>
    </motion.div>
  );
}
