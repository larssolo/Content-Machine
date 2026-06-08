/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Dispatch, SetStateAction } from 'react';
import { Clock, ChevronDown, Trash2 } from 'lucide-react';
import type { HistoryItem } from '../lib/history';

/**
 * Historik-dropdown: tidligere genereringer gemt lokalt i browseren.
 * Udtrukket fra App.tsx's output-workspace.
 */
interface HistoryMenuProps {
  history: HistoryItem[];
  historyOpen: boolean;
  setHistoryOpen: Dispatch<SetStateAction<boolean>>;
  onClearHistory: () => void;
  onLoadHistory: (item: HistoryItem) => void;
}

export function HistoryMenu({
  history, historyOpen, setHistoryOpen, onClearHistory, onLoadHistory,
}: HistoryMenuProps) {
  return (
    <div className="relative mb-2 sm:mb-0 mr-2">
      <button
        type="button"
        onClick={() => setHistoryOpen(o => !o)}
        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-[11px] font-bold font-mono rounded-lg transition-all active:scale-95"
        title="Tidligere genereringer (gemt lokalt i din browser)"
      >
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        <span>HISTORIK ({history.length})</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {historyOpen && (
        <div className="absolute right-0 top-full mt-1.5 bg-slate-950 border border-slate-800 rounded-lg shadow-lg z-30 w-72 p-1 text-left font-mono max-h-80 overflow-y-auto">
          <div className="flex items-center justify-between px-2.5 py-1 bg-slate-900/40 rounded border-b border-slate-900/60 mb-1">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Tidligere genereringer</span>
            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="text-[11px] text-red-400 hover:text-red-300 flex items-center space-x-1"
                title="Ryd historik"
              >
                <Trash2 className="w-3 h-3" /><span>Ryd</span>
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="px-2.5 py-3 text-[11px] text-slate-500">Ingen gemte genereringer endnu.</div>
          ) : history.map(item => (
            <button
              key={item.id}
              onClick={() => { onLoadHistory(item); setHistoryOpen(false); }}
              className="w-full text-left px-2.5 py-2 text-[11px] text-slate-250 hover:text-white hover:bg-slate-900 rounded transition-colors border-t border-slate-900/60 first:border-t-0"
            >
              <div className="font-bold text-slate-200 truncate">{item.client} — {item.project}</div>
              <div className="text-[11px] text-slate-500">{new Date(item.ts).toLocaleString('da-DK')}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
