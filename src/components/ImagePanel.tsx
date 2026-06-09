/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ImageGenCard, type ImageGenState } from './ImageGenCard';

interface ImagePanelProps {
  image: ImageGenState;
  onGenerate: (prompt: string) => void;
  onAspectChange: (ratio: string) => void;
}

export function ImagePanel({ image, onGenerate, onAspectChange }: ImagePanelProps) {
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  const trimmed = prompt.trim();

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
        onGenerate={() => { if (trimmed) onGenerate(prompt); }}
        disabled={!trimmed}
      />
    </div>
  );
}
