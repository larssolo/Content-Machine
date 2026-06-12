/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Code2, Copy, Check, Loader2, Square, AppWindow, Globe, Rocket, Gamepad2, Wand2 } from 'lucide-react';
import type { CodeDepartmentTarget } from '../types';

interface CodeDepartmentPanelProps {
  target: CodeDepartmentTarget;
  setTarget: (t: CodeDepartmentTarget) => void;
  notes: string;
  setNotes: (n: string) => void;
  codePrompt: string;
  isGenerating: boolean;
  onGenerate: () => void;
  onAbort: () => void;
}

const TARGETS: { id: CodeDepartmentTarget; label: string; Icon: typeof AppWindow }[] = [
  { id: 'app',        label: 'App',         Icon: AppWindow },
  { id: 'website',    label: 'Hjemmeside',  Icon: Globe },
  { id: 'landing',    label: 'Landing page', Icon: Rocket },
  { id: 'game',       label: 'Spil',        Icon: Gamepad2 },
  { id: 'experience', label: 'Experience',  Icon: Wand2 },
];

export function CodeDepartmentPanel({
  target, setTarget, notes, setNotes,
  codePrompt, isGenerating, onGenerate, onAbort,
}: CodeDepartmentPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codePrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard utilgængelig — ignorér */ }
  };

  return (
    <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-slate-800 bg-gradient-to-r from-emerald-500/10 to-cyan-600/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <Code2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="block font-medium text-sm text-white">Code Department · Vibe Code</span>
            <span className="block text-[11px] text-slate-400">
              Prisvindende Claude Code-prompt bygget på kampagnens idé og strategi
            </span>
          </div>
        </div>
        {isGenerating ? (
          <button
            onClick={onAbort}
            className="px-3 py-1.5 text-[11px] font-mono rounded-lg border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors flex items-center gap-1.5"
          >
            <Square className="w-3 h-3" />
            Afbryd
          </button>
        ) : (
          <button
            onClick={onGenerate}
            className="px-3 py-1.5 text-[11px] font-mono rounded-lg border border-emerald-500/40 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors"
          >
            {codePrompt ? 'Regenerér' : 'Generér prompt'}
          </button>
        )}
      </div>

      <div className="px-5 py-4 space-y-3 border-b border-slate-800">
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-[11px] text-slate-500 mr-1">Byg-mål:</span>
          {TARGETS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTarget(id)}
              disabled={isGenerating}
              className={`px-2.5 py-1.5 text-[11px] font-mono rounded-md border transition-all flex items-center gap-1.5 disabled:opacity-60 ${
                target === id
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isGenerating}
          placeholder="Særlige ønsker (valgfrit) — fx 'mørk og filmisk', '3D-elementer', 'inspireret af brutalisme'…"
          className="w-full bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-white placeholder:text-slate-600 px-3 py-2 focus:outline-none focus:border-emerald-500/50 disabled:opacity-60"
        />
      </div>

      {!codePrompt && !isGenerating && (
        <div className="px-5 py-8 text-center text-slate-500 text-sm">
          Vælg byg-mål og klik "Generér prompt" — jo mere funnel du har kørt (strategi, Den Store Idé), jo skarpere bliver prompten.
        </div>
      )}

      {(codePrompt || isGenerating) && (
        <div className="relative">
          {codePrompt && !isGenerating && (
            <button
              onClick={handleCopy}
              className="absolute top-3 right-3 z-10 px-2.5 py-1.5 text-[11px] font-mono rounded-md border border-slate-700 bg-slate-900/90 text-slate-300 hover:text-white hover:border-slate-600 transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Kopieret' : 'Kopiér prompt'}
            </button>
          )}
          <pre className="px-5 py-4 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[480px] overflow-y-auto select-text">
            {codePrompt}
            {isGenerating && <span className="inline-flex items-center gap-1.5 text-emerald-400 ml-1"><Loader2 className="w-3 h-3 animate-spin inline" /></span>}
          </pre>
        </div>
      )}
    </div>
  );
}
