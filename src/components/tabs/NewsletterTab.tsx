/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, SetStateAction } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Lock, LockOpen, Loader2, RefreshCw } from 'lucide-react';
import { BrandSurfaceOutput } from '../../types';
import { RevisionSelector } from '../RevisionSelector';

interface NewsletterTabProps {
  output: BrandSurfaceOutput;
  selectedTextKey: string;
  setSelectedTextKey: Dispatch<SetStateAction<string>>;
  setOutput: Dispatch<SetStateAction<BrandSurfaceOutput | null>>;
  isRefining: boolean;
  handleRefine: (command: string, targetKey: string) => void;
  handleUndoRefine: (targetKey: string) => void;
  handleCopyToClipboard: (text: string, key: string) => void;
  copiedKey: string | null;
  refinementHistory: Array<{ key: string; original: string }>;
  revisions: Record<string, string[]>;
  setRevisions: Dispatch<SetStateAction<Record<string, string[]>>>;
  activeCompareIndex: Record<string, number | null>;
  setActiveCompareIndex: Dispatch<SetStateAction<Record<string, number | null>>>;
  setErrorMsg: Dispatch<SetStateAction<string | null>>;
  lockedSections: string[];
  handleToggleLock: (key: string) => void;
  handleRegenerateSection: (key: string) => void;
  regeneratingKey: string | null;
}

export function NewsletterTab({
  output, selectedTextKey, setSelectedTextKey, setOutput,
  isRefining, handleRefine, handleUndoRefine,
  handleCopyToClipboard, copiedKey,
  refinementHistory, revisions, setRevisions, activeCompareIndex,
  setActiveCompareIndex, setErrorMsg,
  lockedSections, handleToggleLock, handleRegenerateSection, regeneratingKey,
}: NewsletterTabProps) {
  const hasHistory = (key: string) => refinementHistory.some(h => h.key === key);
  const isLocked = (key: string) => lockedSections.includes(key);

  return (
    <motion.div
      key="tab_newsletter"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* Subject lines */}
      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
        <span className="text-[11px] font-mono bg-zinc-800 text-zinc-350 px-2 py-0.5 rounded uppercase font-bold tracking-wider">9. Mailchimp Subject Lines</span>

        <div className="space-y-2">
          {output.mailchimpSubjects.map((sub, i) => (
            <div key={i} className="bg-slate-950 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between text-xs text-white">
              <div className="flex items-center space-x-2 truncate">
                <span className="text-orange-500 font-mono font-bold text-[11px] shrink-0">#{i+1}</span>
                <span className="truncate">{sub}</span>
              </div>
              <button
                onClick={() => handleCopyToClipboard(sub, `mailchimp_${i}`)}
                className="text-slate-500 hover:text-slate-300 ml-2"
              >
                {copiedKey === `mailchimp_${i}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Mailchimp Section layout proposal */}
      {output.productionProposed && output.production && (
        <div
          onClick={() => setSelectedTextKey('creativeNewsletterSection')}
          className={`p-4 rounded-xl border transition-all ${
            isLocked('creativeNewsletterSection')
              ? 'bg-amber-950/10 border-amber-700/30'
              : selectedTextKey === 'creativeNewsletterSection'
              ? 'bg-slate-850 border-brand-orange-500/40 ring-1 ring-brand-orange-500/30'
              : 'bg-slate-900/50 border-slate-800 hover:border-slate-750'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-mono bg-zinc-800 text-zinc-350 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Nyhedsbrev Layout / Sektion</span>
              {isLocked('creativeNewsletterSection') && <span className="text-[11px] bg-amber-500/10 text-amber-400 px-1.5 py-0.5 rounded font-mono border border-amber-500/20">Låst</span>}
            </div>
            <div className="flex items-center space-x-1.5">
              {hasHistory('creativeNewsletterSection') && (
                <button
                  onClick={(e) => { e.stopPropagation(); handleUndoRefine('creativeNewsletterSection'); }}
                  className="text-[11px] text-amber-500 hover:text-amber-400 font-mono mr-1"
                >
                  Fortryd
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); handleRegenerateSection('creativeNewsletterSection'); }}
                disabled={isRefining || regeneratingKey !== null || isLocked('creativeNewsletterSection')}
                className="text-slate-400 hover:text-sky-400 disabled:opacity-30 transition-colors"
                title="Generer frisk version fra bunden"
              >
                {regeneratingKey === 'creativeNewsletterSection'
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
                  : <RefreshCw className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleToggleLock('creativeNewsletterSection'); }}
                className={`transition-colors ${isLocked('creativeNewsletterSection') ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'}`}
                title={isLocked('creativeNewsletterSection') ? 'Sektion låst — klik for at låse op' : 'Lås sektion (bevares ved ny generering)'}
              >
                {isLocked('creativeNewsletterSection') ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleCopyToClipboard(output.production?.newsletterSection || "", 'creativeNewsletterSection'); }}
                className="text-slate-400 hover:text-white"
              >
                {copiedKey === 'creativeNewsletterSection' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
          <textarea
            value={output.production?.newsletterSection || ""}
            onChange={(e) => {
              const textVal = e.target.value;
              setOutput(prev => {
                if (!prev || !prev.production) return prev;
                return {
                  ...prev,
                  production: { ...prev.production, newsletterSection: textVal }
                };
              });
            }}
            rows={6}
            className="w-full bg-slate-955 border border-slate-800 focus:border-slate-700 focus:outline-none p-3.5 rounded-lg text-xs leading-relaxed text-slate-200 resize-none font-sans"
          />

          {/* Inline refining packaging */}
          <div className="mt-3 pt-2 border-t border-slate-800/60 flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); handleRefine('/shorten', 'creativeNewsletterSection'); }}
              disabled={isRefining}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded font-mono"
            >
              /shorten
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleRefine('/more-human', 'creativeNewsletterSection'); }}
              disabled={isRefining}
              className="px-2 py-1 text-[11px] bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 rounded font-mono"
            >
              /more-human
            </button>
          </div>

          {/* Revision history comparison selector */}
          <RevisionSelector
            targetKey="creativeNewsletterSection"
            activeValue={output.production?.newsletterSection || ""}
            revisions={revisions}
            setRevisions={setRevisions}
            activeCompareIndex={activeCompareIndex}
            setActiveCompareIndex={setActiveCompareIndex}
            setOutput={setOutput}
            setErrorMsg={setErrorMsg}
          />
        </div>
      )}
    </motion.div>
  );
}
