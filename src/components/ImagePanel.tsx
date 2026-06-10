/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Languages, Wand2 } from 'lucide-react';
import { ImageGenCard, type ImageGenState } from './ImageGenCard';

interface ImagePanelProps {
  image: ImageGenState;
  onGenerate: (prompt: string) => void;
  onAspectChange: (ratio: string) => void;
  onOptimize: (prompt: string, mode: 'translate' | 'refine') => Promise<string | null>;
  isOptimizing: boolean;
}

export function ImagePanel({ image, onGenerate, onAspectChange, onOptimize, isOptimizing }: ImagePanelProps) {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const trimmed = prompt.trim();

  const runOptimize = async (mode: 'translate' | 'refine') => {
    if (!trimmed) return;
    const result = await onOptimize(prompt, mode);
    if (result) setPrompt(result);
  };

  const handleCopy = () => {
    if (!trimmed) return;
    navigator.clipboard?.writeText(prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
      <span className="block text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">Billede</span>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Beskriv billedet du vil generere…"
        rows={3}
        className="w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans resize-y"
      />

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => runOptimize('translate')}
          disabled={!trimmed || isOptimizing}
          className="flex-1 py-2 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Oversæt og omdan dit input til en optimeret engelsk billed-prompt"
        >
          <Languages className="w-3.5 h-3.5 text-brand-orange-400 shrink-0" />
          <span>Oversæt til engelsk</span>
        </button>
        <button
          type="button"
          onClick={() => runOptimize('refine')}
          disabled={!trimmed || isOptimizing}
          className="flex-1 py-2 px-3 rounded-lg border border-slate-800 bg-slate-900 text-slate-200 hover:border-slate-700 hover:text-white font-mono text-[11px] flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Forfin den eksisterende prompt gennem AI"
        >
          <Wand2 className="w-3.5 h-3.5 text-brand-orange-400 shrink-0" />
          <span>Forfin gennem AI</span>
        </button>
      </div>

      <ImageGenCard
        label="Dit billede"
        footer="Genereres direkte fra din prompt — ingen funnel nødvendig."
        alt="Genereret billede"
        ratios={['1:1', '16:9', '9:16', '4:3']}
        promptText={trimmed || '—'}
        image={image}
        downloadBase="neura_billede"
        copied={copied}
        onCopy={handleCopy}
        onAspectChange={onAspectChange}
        onGenerate={() => { if (trimmed) onGenerate(trimmed); }}
        disabled={!trimmed}
      />
    </div>
  );
}
