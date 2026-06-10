/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Loader2, AlertTriangle, Download, Volume2, Clapperboard } from 'lucide-react';
import { TTS_VOICES, type SpeechState, type AvatarState, type SpeechParams, type AvatarParams } from '../hooks/useAvatarGeneration';

interface AvatarPanelProps {
  generatedImageUrl: string;
  speech: SpeechState;
  avatar: AvatarState;
  onGenerateSpeech: (p: SpeechParams) => void;
  onGenerateAvatar: (p: AvatarParams) => void;
}

const SEG = 'flex-1 py-1.5 px-2 rounded-lg border text-[11px] font-mono transition-all';
const active = 'border-brand-orange-500/50 bg-brand-orange-600/10 text-brand-orange-300';
const idle = 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700';

export function AvatarPanel({ generatedImageUrl, speech, avatar, onGenerateSpeech, onGenerateAvatar }: AvatarPanelProps) {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [style, setStyle] = useState('');
  const [temperature, setTemperature] = useState(1);
  const [useGenerated, setUseGenerated] = useState(true);
  const [urlInput, setUrlInput] = useState('');
  const [resolution, setResolution] = useState<'720p' | '480p'>('480p');

  const imageUrl = useGenerated ? generatedImageUrl : urlInput.trim();
  const canSpeak = !!text.trim() && !speech.loading;
  const canAvatar = !!imageUrl && !!speech.url && !avatar.loading;

  const inputCls = 'w-full bg-slate-900 border border-slate-800 focus:border-brand-orange-500 focus:ring-1 focus:ring-brand-orange-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-600 transition-all font-sans';

  const submitSpeech = () => { if (canSpeak) onGenerateSpeech({ prompt: text.trim(), voice, styleInstructions: style, temperature }); };
  const submitAvatar = () => { if (canAvatar) onGenerateAvatar({ imageUrl, audioUrl: speech.url, resolution }); };

  return (
    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-sm space-y-3">
      <span className="block text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">Avatar</span>

      {/* 1 — TALE */}
      <div className="space-y-2 pb-2 border-b border-slate-800">
        <span className="block text-[11px] font-mono text-slate-500">1 · Tale</span>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Skriv hvad avataren skal sige… (understøtter [sigh], [whispering])" rows={2} className={`${inputCls} resize-y`} />
        <div className="flex items-center gap-2">
          <select aria-label="Stemme" value={voice} onChange={(e) => setVoice(e.target.value)} className={`${inputCls} flex-1`}>
            {TTS_VOICES.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-mono text-slate-400">Temp</span>
            <span className="text-[11px] font-mono text-brand-orange-300 w-7 text-right">{temperature.toFixed(1)}</span>
          </div>
        </div>
        <input type="range" aria-label="Temperatur" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full accent-brand-orange-500" />
        <input type="text" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Stil-instruktion (valgfri, fx 'tal varmt og langsomt')" className={inputCls} />
        <button type="button" onClick={submitSpeech} disabled={!canSpeak}
          className={`w-full py-2 px-4 rounded-lg font-display font-semibold text-xs text-white flex items-center justify-center gap-2 transition-all ${
            canSpeak ? 'bg-brand-orange-600 hover:bg-brand-orange-500 cursor-pointer' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}>
          {speech.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
          <span>{speech.loading ? 'Genererer tale…' : 'Generér tale'}</span>
        </button>
        {speech.error && (
          <div className="bg-red-950/40 border border-red-900/40 text-red-400 rounded-lg p-3 text-[11px] flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span className="leading-tight">{speech.error}</span>
          </div>
        )}
        {speech.url && !speech.loading && (
          <audio src={speech.url} controls className="w-full" />
        )}
      </div>

      {/* 2 — AVATAR */}
      <div className="space-y-2">
        <span className="block text-[11px] font-mono text-slate-500">2 · Avatar</span>
        <span className="block text-[11px] font-mono text-slate-400">Inputbillede</span>
        <div className="flex gap-1.5">
          <button type="button" aria-pressed={useGenerated} onClick={() => setUseGenerated(true)} className={`${SEG} ${useGenerated ? active : idle}`}>Brug genereret billede</button>
          <button type="button" aria-pressed={!useGenerated} onClick={() => setUseGenerated(false)} className={`${SEG} ${!useGenerated ? active : idle}`}>Indsæt URL</button>
        </div>
        {useGenerated && !generatedImageUrl && (
          <span className="block text-[11px] text-slate-500">Generér først et billede ovenfor, eller vælg "Indsæt URL".</span>
        )}
        {!useGenerated && (
          <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="https://… billede-URL" className={inputCls} />
        )}

        <div className="flex items-center justify-between gap-3">
          <span className="text-[11px] font-mono text-slate-400">Opløsning</span>
          <div className="flex gap-1.5">
            {(['480p', '720p'] as const).map((r) => (
              <button key={r} type="button" aria-pressed={resolution === r} onClick={() => setResolution(r)}
                className={`py-1 px-3 rounded-lg border text-[11px] font-mono transition-all ${resolution === r ? active : idle}`}>{r}</button>
            ))}
          </div>
        </div>

        <span className={`block text-[11px] font-mono ${speech.url ? 'text-brand-orange-300' : 'text-slate-500'}`}>
          {speech.url ? '✓ Tale klar' : 'Generér tale først (trin 1)'}
        </span>

        <button type="button" onClick={submitAvatar} disabled={!canAvatar}
          className={`w-full py-3 px-4 rounded-xl font-display font-bold text-sm text-white flex items-center justify-center gap-2 transition-all shadow-sm ${
            canAvatar ? 'bg-brand-orange-600 hover:bg-brand-orange-500 cursor-pointer active:scale-[0.98]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}>
          {avatar.loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clapperboard className="w-5 h-5" />}
          <span>{avatar.loading ? 'Genererer avatar…' : 'Generér avatar'}</span>
        </button>
        {avatar.loading && <span className="block text-[11px] text-slate-500 text-center">Fabric kan tage et par minutter…</span>}
        {avatar.error && (
          <div className="bg-red-950/40 border border-red-900/40 text-red-400 rounded-lg p-3 text-[11px] flex items-start gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /><span className="leading-tight">{avatar.error}</span>
          </div>
        )}
        {avatar.url && !avatar.loading && (
          <div className="space-y-2">
            <video src={avatar.url} controls className="w-full rounded-lg border border-slate-800 bg-slate-950" />
            <a href={avatar.url} download="neura_avatar.mp4" className="text-[11px] text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1">
              <Download className="w-3 h-3" /><span>Download avatar</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
