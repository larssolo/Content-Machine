/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Compass, Gauge, Layers, Loader2, Radio, Rocket, Sparkles, Swords, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type StepStatus = 'done' | 'ready' | 'locked';

interface ProcessStepperProps {
  isGenerating: boolean;
  deepMode: boolean;
  generationStep: string;
  isScanning: boolean;
  isGeneratingStrategy: boolean;
  isGeneratingCampaign: boolean;
  isGeneratingMatrix: boolean;
  isGeneratingEffectiveness: boolean;
  hasCulturalIntel: boolean;
  hasStrategy: boolean;
  hasCampaignPlatform: boolean;
  hasSelectedTerritory: boolean;
  hasPressureTest: boolean;
  hasChannelMatrix: boolean;
  hasEffectiveness: boolean;
  isSharpening: boolean;
  onSharpenIdea: () => void;
  onCulturalScan: () => void;
  onGenerateStrategy: () => void;
  onGenerateBigIdea: () => void;
  onGenerateChannelMatrix: () => void;
  onGenerateEffectiveness: () => void;
  onGenerateAll: () => void;
}

interface Step {
  n: number;
  title: string;
  hint: string;
  Icon: LucideIcon;
  status: StepStatus;
  busy: boolean;
  onClick?: () => void;
}

const dotClass: Record<StepStatus, string> = {
  done: 'bg-emerald-500',
  ready: 'bg-brand-orange-500',
  locked: 'bg-slate-600',
};

function StepRow({ step, isGenerating }: { step: Step; isGenerating: boolean; key?: string | number | null }) {
  const interactive = !!step.onClick && step.status !== 'locked';
  const muted = step.status === 'locked';
  const className =
    `w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border border-slate-800 bg-slate-900 text-left transition-all ` +
    `${interactive ? 'hover:border-slate-700 cursor-pointer' : 'cursor-default'} ` +
    `${muted ? 'opacity-60' : ''} disabled:opacity-60 disabled:cursor-not-allowed`;

  const inner = (
    <>
      <span className={`shrink-0 w-6 h-6 rounded-full border flex items-center justify-center text-[11px] font-mono font-bold ${
        muted ? 'border-slate-800 text-slate-600' : 'border-brand-orange-500/40 text-brand-orange-400'
      }`}>{step.n}</span>
      <step.Icon className={`w-4 h-4 shrink-0 ${muted ? 'text-slate-600' : 'text-slate-400'}`} />
      <span className="min-w-0 flex-1">
        <span className="block text-xs font-display font-semibold text-slate-200">{step.title}</span>
        <span className="block text-[11px] text-slate-500 leading-tight truncate">{step.hint}</span>
      </span>
      {step.busy
        ? <Loader2 className="w-4 h-4 shrink-0 text-brand-orange-400 animate-spin" />
        : <span className={`shrink-0 w-2 h-2 rounded-full ${dotClass[step.status]}`} />}
    </>
  );

  if (interactive) {
    return (
      <button type="button" data-status={step.status} onClick={step.onClick} disabled={isGenerating || step.busy} className={className}>
        {inner}
      </button>
    );
  }
  return <div data-status={step.status} className={className}>{inner}</div>;
}

export function ProcessStepper(props: ProcessStepperProps) {
  const {
    isGenerating, deepMode, generationStep,
    isScanning, isGeneratingStrategy, isGeneratingCampaign,
    isGeneratingMatrix, isGeneratingEffectiveness,
    hasCulturalIntel, hasStrategy, hasCampaignPlatform, hasSelectedTerritory,
    hasPressureTest, hasChannelMatrix, hasEffectiveness,
    isSharpening, onSharpenIdea,
    onCulturalScan, onGenerateStrategy, onGenerateBigIdea,
    onGenerateChannelMatrix, onGenerateEffectiveness, onGenerateAll,
  } = props;

  const territoryStatus = (done: boolean): StepStatus =>
    done ? 'done' : hasSelectedTerritory ? 'ready' : 'locked';

  const steps: Step[] = [
    { n: 1, title: 'Skan kultur & marked', hint: 'Live trends & konkurrenter (valgfrit)', Icon: Radio,
      status: hasCulturalIntel ? 'done' : 'ready', busy: isScanning, onClick: onCulturalScan },
    { n: 2, title: 'Byg strategi-fundament', hint: 'Indsigt · spænding · løfte', Icon: Compass,
      status: hasStrategy ? 'done' : 'ready', busy: isGeneratingStrategy, onClick: onGenerateStrategy },
    { n: 3, title: 'Find Den Store Idé', hint: 'Tre kampagne-platforme', Icon: Rocket,
      status: hasCampaignPlatform ? 'done' : 'ready', busy: isGeneratingCampaign, onClick: onGenerateBigIdea },
    { n: 4, title: 'Skærp idé', hint: hasSelectedTerritory ? 'Pressure-test af den valgte idé' : 'Kræver en valgt idé', Icon: Swords,
      status: hasPressureTest ? 'done' : hasSelectedTerritory ? 'ready' : 'locked', busy: isSharpening, onClick: onSharpenIdea },
    { n: 5, title: 'Omni-channel matrix', hint: hasSelectedTerritory ? 'Skalér til alle kanaler' : 'Kræver en valgt idé', Icon: Layers,
      status: territoryStatus(hasChannelMatrix), busy: isGeneratingMatrix, onClick: onGenerateChannelMatrix },
    { n: 6, title: 'Effekt-lag', hint: hasSelectedTerritory ? 'KPI & måleplan' : 'Kræver en valgt idé', Icon: Gauge,
      status: territoryStatus(hasEffectiveness), busy: isGeneratingEffectiveness, onClick: onGenerateEffectiveness },
  ];

  return (
    <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 shadow-sm space-y-2">
      <span className="block text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400 mb-1">Proces</span>

      {steps.map((step) => <StepRow key={step.n} step={step} isGenerating={isGenerating} />)}

      <div className="flex items-center gap-2 pt-1.5 pb-0.5" aria-hidden="true">
        <span className="h-px flex-1 bg-slate-800" />
        <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-slate-400">Producér</span>
        <span className="h-px flex-1 bg-slate-800" />
      </div>

      <button
        type="button"
        onClick={onGenerateAll}
        disabled={isGenerating}
        className={`w-full py-3.5 px-4 rounded-xl font-display font-bold text-sm text-white flex items-center justify-center gap-2 transition-all select-none active:scale-[0.98] shadow-sm ${
          isGenerating ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-orange-600 hover:bg-brand-orange-500 cursor-pointer'
        }`}
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            <span>{generationStep || 'Arbejder...'}</span>
          </>
        ) : deepMode ? (
          <>
            <Users className="w-5 h-5 text-white" />
            <span>Kør redaktionsmøde</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-white" />
            <span>Generér indhold</span>
          </>
        )}
      </button>
    </div>
  );
}
