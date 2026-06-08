/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ComponentProps, Dispatch, SetStateAction } from 'react';
import {
  CulturalScanResult,
  StrategyFoundation,
  CampaignPlatform,
  CampaignTerritory,
  IdeaDeliberationResult,
  ChannelMatrix,
  EffectivenessFramework,
  BrainstormResult,
  VisualDevResult,
  ProjectBrief,
} from '../types';
import { CulturalAntennaPanel } from './CulturalAntennaPanel';
import { StrategyPanel } from './StrategyPanel';
import { CampaignPanel } from './CampaignPanel';
import { IdeaPressureTestPanel } from './IdeaPressureTestPanel';
import { ChannelMatrixPanel } from './ChannelMatrixPanel';
import { EffectivenessPanel } from './EffectivenessPanel';
import { BrainstormPanel } from './BrainstormPanel';
import { VisualDevPanel } from './VisualDevPanel';

/**
 * Den kreative funnel: kæden af betingede resultat-paneler i højre kolonne
 * (kulturel antenne → strategi → Den Store Idé → ECD pres-test → omni-channel
 * → effekt-lag → brainstorm → visuel udvikling). Hvert panel renderes kun når
 * dets state findes. Udtrukket fra App.tsx for læsbarhed — ren forwarding.
 */
interface FunnelPanelsProps {
  // Pres-test/copy fælles
  copiedKey: ComponentProps<typeof CampaignPanel>['copiedKey'];
  onCopy: ComponentProps<typeof CampaignPanel>['onCopy'];

  // Kulturel antenne
  culturalIntel: CulturalScanResult | null;
  onClearCulturalIntel: () => void;

  // Strategi
  strategy: StrategyFoundation | null;
  onClearStrategy: () => void;
  isGeneratingStrategy: boolean;
  onGenerateStrategy: () => void;

  // Den Store Idé
  campaignPlatform: CampaignPlatform | null;
  setCampaignPlatform: Dispatch<SetStateAction<CampaignPlatform | null>>;
  selectedTerritory: CampaignTerritory | null;
  onSelectTerritory: ComponentProps<typeof CampaignPanel>['onSelectTerritory'];
  onClearTerritory: () => void;
  onExportDeck: () => void;
  isGeneratingCampaign: boolean;
  onGenerateBigIdea: () => void;

  // ECD pres-test
  pressureTest: { original: CampaignTerritory; result: IdeaDeliberationResult } | null;
  onPressureTest: ComponentProps<typeof CampaignPanel>['onPressureTest'];
  isSharpening: boolean;
  sharpeningTarget: string | null;
  onAdoptSharpened: ComponentProps<typeof IdeaPressureTestPanel>['onAdopt'];
  onClearPressureTest: () => void;

  // Omni-channel matrix
  channelMatrix: ChannelMatrix | null;
  isGeneratingMatrix: boolean;
  onGenerateChannelMatrix: () => void;
  onClearChannelMatrix: () => void;

  // Effekt-lag
  effectiveness: EffectivenessFramework | null;
  isGeneratingEffectiveness: boolean;
  onGenerateEffectiveness: () => void;
  onClearEffectiveness: () => void;

  // Brainstorm
  brainstormResult: BrainstormResult | null;
  setBrainstormResult: Dispatch<SetStateAction<BrainstormResult | null>>;
  brief: ProjectBrief;
  setBrief: Dispatch<SetStateAction<ProjectBrief>>;

  // Visuel udvikling
  visualResult: VisualDevResult | null;
  setVisualResult: Dispatch<SetStateAction<VisualDevResult | null>>;
  generatedImages: ComponentProps<typeof VisualDevPanel>['images'];
  onAspectChange: ComponentProps<typeof VisualDevPanel>['onAspectChange'];
  onGenerateImage: ComponentProps<typeof VisualDevPanel>['onGenerateImage'];
}

export function FunnelPanels({
  copiedKey, onCopy,
  culturalIntel, onClearCulturalIntel,
  strategy, onClearStrategy, isGeneratingStrategy, onGenerateStrategy,
  campaignPlatform, setCampaignPlatform, selectedTerritory, onSelectTerritory,
  onClearTerritory, onExportDeck, isGeneratingCampaign, onGenerateBigIdea,
  pressureTest, onPressureTest, isSharpening, sharpeningTarget,
  onAdoptSharpened, onClearPressureTest,
  channelMatrix, isGeneratingMatrix, onGenerateChannelMatrix, onClearChannelMatrix,
  effectiveness, isGeneratingEffectiveness, onGenerateEffectiveness, onClearEffectiveness,
  brainstormResult, setBrainstormResult, brief, setBrief,
  visualResult, setVisualResult, generatedImages, onAspectChange, onGenerateImage,
}: FunnelPanelsProps) {
  return (
    <>
      {/* CULTURAL ANTENNA PANEL */}
      {culturalIntel && (
        <CulturalAntennaPanel
          intel={culturalIntel}
          onClose={onClearCulturalIntel}
          onGenerateStrategy={onGenerateStrategy}
          isGeneratingStrategy={isGeneratingStrategy}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      )}

      {/* STRATEGY FOUNDATION PANEL (Strategi-fundament) */}
      {strategy && (
        <StrategyPanel
          strategy={strategy}
          onClose={onClearStrategy}
          onGenerateBigIdea={onGenerateBigIdea}
          isGeneratingCampaign={isGeneratingCampaign}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      )}

      {/* CAMPAIGN PLATFORM PANEL (Den Store Idé) */}
      {campaignPlatform && (
        <CampaignPanel
          platform={campaignPlatform}
          selectedTerritory={selectedTerritory}
          onSelectTerritory={onSelectTerritory}
          onClearTerritory={onClearTerritory}
          onExportDeck={onExportDeck}
          onPressureTest={onPressureTest}
          isSharpening={isSharpening}
          sharpeningTarget={sharpeningTarget}
          onClose={() => setCampaignPlatform(null)}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      )}

      {/* ECD PRESSURE-TEST PANEL */}
      {pressureTest && (
        <IdeaPressureTestPanel
          original={pressureTest.original}
          result={pressureTest.result}
          onAdopt={onAdoptSharpened}
          onClose={onClearPressureTest}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      )}

      {/* OMNI-CHANNEL MATRIX PANEL */}
      {channelMatrix && (
        <ChannelMatrixPanel
          matrix={channelMatrix}
          onClose={onClearChannelMatrix}
          onRegenerate={onGenerateChannelMatrix}
          isGenerating={isGeneratingMatrix}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      )}

      {/* EFFECTIVENESS PANEL (Effekt-lag) */}
      {effectiveness && (
        <EffectivenessPanel
          framework={effectiveness}
          onClose={onClearEffectiveness}
          onRegenerate={onGenerateEffectiveness}
          isGenerating={isGeneratingEffectiveness}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      )}

      {/* BRAINSTORM RESULT PANEL */}
      {brainstormResult && (
        <BrainstormPanel
          result={brainstormResult}
          onClose={() => setBrainstormResult(null)}
          onAddNote={(text) => {
            const sep = brief.notes.trim() ? '\n\n' : '';
            setBrief(prev => ({ ...prev, notes: prev.notes.trim() + sep + text }));
          }}
          copiedKey={copiedKey}
          onCopy={onCopy}
        />
      )}

      {/* VISUAL DEVELOPMENT RESULT (visuel redaktion) */}
      {visualResult && (
        <VisualDevPanel
          result={visualResult}
          images={generatedImages}
          copiedKey={copiedKey}
          clientName={brief.client}
          onCopyPrompt={onCopy}
          onAspectChange={onAspectChange}
          onGenerateImage={onGenerateImage}
          onClose={() => setVisualResult(null)}
        />
      )}
    </>
  );
}
