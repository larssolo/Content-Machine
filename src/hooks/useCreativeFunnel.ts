/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, Dispatch, SetStateAction } from 'react';
import {
  ProjectBrief, UsageInfo, CulturalScanResult, StrategyFoundation,
  CampaignPlatform, CampaignTerritory, IdeaDeliberationResult, ChannelMatrix,
  EffectivenessFramework,
} from '../types';
import { loadSession } from '../lib/session';
import { httpErrorMessage } from './httpError';

interface CreativeFunnelDeps {
  brief: ProjectBrief;
  setLastUsage: Dispatch<SetStateAction<UsageInfo | null>>;
  setErrorMsg: Dispatch<SetStateAction<string | null>>;
}

/**
 * Den kreative funnel som ét sammenhængende domæne: kulturel antenne →
 * strategi-fundament → Den Store Idé → ECD pres-test → omni-channel matrix →
 * effekt-lag. Enheden er selv-indeholdt: den læser kun `brief` udefra og styrer
 * alle interne clear-kaskader selv (skift af rute rydder forældet matrix/effekt).
 * Initial state hydreres fra den gemte session, præcis som før.
 */
export function useCreativeFunnel({ brief, setLastUsage, setErrorMsg }: CreativeFunnelDeps) {
  const [culturalIntel, setCulturalIntel] = useState<CulturalScanResult | null>(() => loadSession()?.culturalIntel ?? null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const [strategy, setStrategy] = useState<StrategyFoundation | null>(() => loadSession()?.strategy ?? null);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState<boolean>(false);

  const [campaignPlatform, setCampaignPlatform] = useState<CampaignPlatform | null>(null);
  const [isGeneratingCampaign, setIsGeneratingCampaign] = useState<boolean>(false);
  const [selectedTerritory, setSelectedTerritory] = useState<CampaignTerritory | null>(() => loadSession()?.selectedTerritory ?? null);

  // ECD pres-test (transient — gemmes ikke i session)
  const [pressureTest, setPressureTest] = useState<{ original: CampaignTerritory; result: IdeaDeliberationResult } | null>(null);
  const [isSharpening, setIsSharpening] = useState<boolean>(false);
  const [sharpeningTarget, setSharpeningTarget] = useState<string | null>(null);

  const [channelMatrix, setChannelMatrix] = useState<ChannelMatrix | null>(() => loadSession()?.channelMatrix ?? null);
  const [isGeneratingMatrix, setIsGeneratingMatrix] = useState<boolean>(false);

  const [effectiveness, setEffectiveness] = useState<EffectivenessFramework | null>(() => loadSession()?.effectiveness ?? null);
  const [isGeneratingEffectiveness, setIsGeneratingEffectiveness] = useState<boolean>(false);

  const handleCulturalScan = async () => {
    if (!brief.client || !brief.description) {
      setErrorMsg('Udfyld mindst Kunde og Hvad lavede vi for at scanne kulturen.');
      return;
    }
    setIsScanning(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/cultural-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const data = await response.json();
      setCulturalIntel(data as CulturalScanResult);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kulturel scanning fejlede.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleClearCulturalIntel = () => {
    setCulturalIntel(null);
  };

  const handleGenerateStrategy = async () => {
    if (!brief.client || !brief.project || !brief.description) {
      setErrorMsg("Udfyld venligst mindst Kunde, Projekt og Hvad lavede vi for at bygge strategi-fundamentet.");
      return;
    }
    setIsGeneratingStrategy(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/strategy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, culturalIntel: culturalIntel ?? undefined })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const raw = await response.json();
      const { _usage, ...foundation } = raw as any;
      if (_usage) setLastUsage(_usage);
      setStrategy(foundation as StrategyFoundation);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kunne ikke bygge det strategiske fundament.');
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const handleClearStrategy = () => {
    setStrategy(null);
  };

  const handleGenerateBigIdea = async () => {
    if (!brief.client || !brief.project || !brief.description) {
      setErrorMsg("Udfyld venligst mindst Kunde, Projekt og Hvad lavede vi for at finde Den Store Idé.");
      return;
    }
    setIsGeneratingCampaign(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/big-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, strategy })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const raw = await response.json();
      const { _usage, ...platform } = raw as any;
      if (_usage) setLastUsage(_usage);
      setCampaignPlatform(platform as CampaignPlatform);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kunne ikke udvikle kampagne-platforme.');
    } finally {
      setIsGeneratingCampaign(false);
    }
  };

  const handleSelectTerritory = (territory: CampaignTerritory) => {
    setSelectedTerritory(prev => {
      // Skift af rute gør en eksisterende matrix/effekt-lag forældet (forkert idé) — ryd dem.
      if (!prev || prev.name !== territory.name || prev.bigIdea !== territory.bigIdea) {
        setChannelMatrix(null);
        setEffectiveness(null);
      }
      return territory;
    });
  };

  const handleClearTerritory = () => {
    setSelectedTerritory(null);
    setChannelMatrix(null);
    setEffectiveness(null);
  };

  const handleSharpenIdea = async (territory: CampaignTerritory) => {
    setIsSharpening(true);
    setSharpeningTarget(territory.name);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/sharpen-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, territory, strategy: strategy ?? undefined }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const raw = await response.json();
      const { _usage, ...result } = raw as any;
      if (_usage) setLastUsage(_usage);
      setPressureTest({ original: territory, result: result as IdeaDeliberationResult });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kunne ikke pres-teste ruten.');
    } finally {
      setIsSharpening(false);
      setSharpeningTarget(null);
    }
  };

  const handleAdoptSharpened = () => {
    if (!pressureTest?.result?.sharpened) return;
    const { original, result } = pressureTest;
    const s = result.sharpened!;
    // SharpenedTerritory → CampaignTerritory (dropper whatChanged).
    const adopted: CampaignTerritory = {
      name: s.name,
      bigIdea: s.bigIdea,
      tagline: s.tagline,
      manifesto: s.manifesto,
      strategicRoot: s.strategicRoot,
      channelExpressions: s.channelExpressions,
      toneDescriptor: s.toneDescriptor,
      rationale: s.rationale,
    };
    // Erstat den oprindelige rute i platformen, så kortet afspejler den skærpede idé.
    setCampaignPlatform(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        territories: prev.territories.map(t =>
          t.name === original.name && t.bigIdea === original.bigIdea ? adopted : t,
        ),
      };
    });
    setSelectedTerritory(adopted);
    setChannelMatrix(null); // skærpet idé gør en eksisterende matrix forældet
    setEffectiveness(null);
    setPressureTest(null);
  };

  const handleClearPressureTest = () => {
    setPressureTest(null);
  };

  const handleGenerateChannelMatrix = async () => {
    if (!selectedTerritory) {
      setErrorMsg("Vælg en kampagne-platform (rute) først for at skalere den til alle kanaler.");
      return;
    }
    setIsGeneratingMatrix(true);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/channel-matrix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, chosenIdea: selectedTerritory, strategy })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const raw = await response.json();
      const { _usage, ...matrix } = raw as any;
      if (_usage) setLastUsage(_usage);
      setChannelMatrix(matrix as ChannelMatrix);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kunne ikke skalere idéen til kanaler.');
    } finally {
      setIsGeneratingMatrix(false);
    }
  };

  const handleClearChannelMatrix = () => {
    setChannelMatrix(null);
  };

  const handleGenerateEffectiveness = async () => {
    if (!selectedTerritory) {
      setErrorMsg("Vælg en kampagne-platform (rute) først for at bygge effekt-laget.");
      return;
    }
    setIsGeneratingEffectiveness(true);
    setErrorMsg(null);
    try {
      const channels = channelMatrix?.channels?.map(c => c.channel).filter(Boolean) ?? brief.channels;
      const response = await fetch('/api/effectiveness', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, chosenIdea: selectedTerritory, strategy: strategy ?? undefined, channels })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const raw = await response.json();
      const { _usage, ...framework } = raw as any;
      if (_usage) setLastUsage(_usage);
      setEffectiveness(framework as EffectivenessFramework);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Kunne ikke bygge effekt-laget.');
    } finally {
      setIsGeneratingEffectiveness(false);
    }
  };

  const handleClearEffectiveness = () => {
    setEffectiveness(null);
  };

  return {
    // Kulturel antenne
    culturalIntel, setCulturalIntel, isScanning, handleCulturalScan, handleClearCulturalIntel,
    // Strategi-fundament
    strategy, setStrategy,
    isGeneratingStrategy, handleGenerateStrategy, handleClearStrategy,
    // Den Store Idé / kampagne-platform
    campaignPlatform, setCampaignPlatform,
    isGeneratingCampaign, handleGenerateBigIdea,
    selectedTerritory, handleSelectTerritory, handleClearTerritory,
    // ECD pres-test af Idéen
    pressureTest, isSharpening, sharpeningTarget,
    handleSharpenIdea, handleAdoptSharpened, handleClearPressureTest,
    // Omni-channel matrix
    channelMatrix, setChannelMatrix,
    isGeneratingMatrix, handleGenerateChannelMatrix, handleClearChannelMatrix,
    // Effekt-lag
    effectiveness, setEffectiveness, isGeneratingEffectiveness,
    handleGenerateEffectiveness, handleClearEffectiveness,
  };
}
