/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import {
  ProjectBrief, UsageInfo, CulturalScanResult, StrategyFoundation,
  CampaignPlatform, CampaignTerritory, ChannelMatrix, EffectivenessFramework,
  BrandSurfaceOutput, CritiqueResult, BureauStageState, BureauStageStatus, PitchResult,
} from '../types';

export interface BureauModeDeps {
  brief: ProjectBrief;
  setLastUsage: Dispatch<SetStateAction<UsageInfo | null>>;
  setErrorMsg: Dispatch<SetStateAction<string | null>>;
  setCulturalIntel: Dispatch<SetStateAction<CulturalScanResult | null>>;
  setStrategy: Dispatch<SetStateAction<StrategyFoundation | null>>;
  setCampaignPlatform: Dispatch<SetStateAction<CampaignPlatform | null>>;
  handleSelectTerritory: (t: CampaignTerritory) => void;
  setChannelMatrix: Dispatch<SetStateAction<ChannelMatrix | null>>;
  setEffectiveness: Dispatch<SetStateAction<EffectivenessFramework | null>>;
  setOutput: Dispatch<SetStateAction<BrandSurfaceOutput | null>>;
}

const INITIAL_STAGES: Omit<BureauStageState, 'status' | 'streamText'>[] = [
  { id: 'cultural-scan',  role: 'Analysechef',       title: 'Kulturel antenne' },
  { id: 'strategy',       role: 'Chefstrateg',        title: 'Strategi-fundament' },
  { id: 'big-idea',       role: 'Kreativ Direktør',   title: 'Den Store Idé' },
  { id: 'critique-idea',  role: 'Chefstrateg',        title: 'Kritik af idéen' },
  { id: 'channel-matrix', role: 'Konceptudvikler',    title: 'Omni-channel matrix' },
  { id: 'copy',           role: 'Tekstforfatter',     title: 'Copy-pakke' },
  { id: 'critique-copy',  role: 'Kreativ Direktør',   title: 'Kritik af copy' },
  { id: 'effectiveness',  role: 'Effekt-chef',        title: 'Effekt-lag' },
  { id: 'pitch',          role: 'Pitch-producent',    title: 'Klientpræsentation' },
];

function makeStages(): BureauStageState[] {
  return INITIAL_STAGES.map(s => ({ ...s, status: 'idle' as BureauStageStatus, streamText: '' }));
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error((errData as any).error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function readSse(
  url: string,
  body: unknown,
  onDelta: (delta: string) => void,
  signal?: AbortSignal,
): Promise<any> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error((errData as any).error || `HTTP ${res.status}`);
  }
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let finalPayload: any = null;
  let buf = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (raw === '[DONE]') break;
      try {
        const json = JSON.parse(raw);
        if (json.delta) onDelta(json.delta);
        if (json.done) finalPayload = json;
      } catch { /* ignore parse errors */ }
    }
  }
  return finalPayload;
}

export function useBureauMode(deps: BureauModeDeps) {
  const {
    brief, setLastUsage, setErrorMsg,
    setCulturalIntel, setStrategy, setCampaignPlatform,
    handleSelectTerritory, setChannelMatrix, setEffectiveness, setOutput,
  } = deps;

  const [bureauModeActive, setBureauModeActive] = useState(false);
  const [stages, setStages] = useState<BureauStageState[]>(makeStages);
  const [isRunning, setIsRunning] = useState(false);
  const [pitchResult, setPitchResult] = useState<PitchResult | null>(null);
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const updateStage = useCallback((id: string, patch: Partial<BureauStageState>) => {
    setStages(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
  }, []);

  const runBureau = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setStages(makeStages());
    setPitchResult(null);
    const abort = new AbortController();
    abortRef.current = abort;

    let culturalIntel: CulturalScanResult | null = null;
    let strategy: StrategyFoundation | null = null;
    let territory: CampaignTerritory | null = null;
    let channelMatrix: ChannelMatrix | null = null;
    let effectiveness: EffectivenessFramework | null = null;
    let output: BrandSurfaceOutput | null = null;

    const run = async () => {
      // 1. Kulturel antenne
      try {
        updateStage('cultural-scan', { status: 'working' });
        const data = await postJson<CulturalScanResult>('/api/cultural-scan', { brief });
        culturalIntel = data;
        setCulturalIntel(data);
        updateStage('cultural-scan', { status: 'done' });
      } catch (err: any) {
        updateStage('cultural-scan', { status: 'error', error: err.message });
      }
      if (abort.signal.aborted) return;

      // 2. Strategi
      try {
        updateStage('strategy', { status: 'working' });
        const raw = await postJson<any>('/api/strategy', { brief, culturalIntel });
        const { _usage, ...foundation } = raw;
        strategy = foundation as StrategyFoundation;
        setStrategy(strategy);
        if (_usage) setLastUsage(_usage);
        updateStage('strategy', { status: 'done' });
      } catch (err: any) {
        updateStage('strategy', { status: 'error', error: err.message });
        return;
      }
      if (abort.signal.aborted) return;

      // 3. Den Store Idé
      try {
        updateStage('big-idea', { status: 'working' });
        const raw = await postJson<any>('/api/big-idea', { brief, strategy });
        const { _usage, ...platform } = raw;
        const campaignPlatform = platform as CampaignPlatform;
        setCampaignPlatform(campaignPlatform);
        if (_usage) setLastUsage(_usage);
        territory = campaignPlatform.territories?.[0] ?? null;
        if (territory) handleSelectTerritory(territory);
        updateStage('big-idea', { status: 'done' });
      } catch (err: any) {
        updateStage('big-idea', { status: 'error', error: err.message });
        return;
      }
      if (abort.signal.aborted) return;

      // 4. Kritik af idéen (Chefstrateg)
      if (territory && strategy) {
        try {
          updateStage('critique-idea', { status: 'critiquing' });
          const stratCtx = `Single-minded proposition: ${strategy.singleMindedProposition || 'N/A'}. Audience truth: ${strategy.audienceTruth || 'N/A'}.`;
          const artifact = `Idé: ${territory.bigIdea}\nTagline: ${territory.tagline}\nManifest: ${territory.manifesto}`;
          const critique = await postJson<CritiqueResult>('/api/critique', {
            role: 'Chefstrateg',
            artifact,
            context: stratCtx,
            language: brief.language || 'Dansk',
          });
          updateStage('critique-idea', { status: 'done', critiqueVerdict: critique.verdict });

          if (critique.verdict === 'revise' && critique.revisionNotes.length > 0) {
            updateStage('critique-idea', { status: 'revising' });
            const raw = await postJson<any>('/api/big-idea', { brief, strategy, revisionNotes: critique.revisionNotes });
            const { _usage, ...revised } = raw;
            const revisedPlatform = revised as CampaignPlatform;
            setCampaignPlatform(revisedPlatform);
            if (_usage) setLastUsage(_usage);
            territory = revisedPlatform.territories?.[0] ?? territory;
            if (territory) handleSelectTerritory(territory);
            updateStage('critique-idea', { status: 'done' });
          }
        } catch (err: any) {
          updateStage('critique-idea', { status: 'error', error: err.message });
        }
      } else {
        updateStage('critique-idea', { status: 'skipped' });
      }
      if (abort.signal.aborted) return;

      // 5. Omni-channel matrix
      if (territory) {
        try {
          updateStage('channel-matrix', { status: 'working' });
          const raw = await postJson<any>('/api/channel-matrix', { brief, chosenIdea: territory, strategy });
          const { _usage, ...matrix } = raw;
          channelMatrix = matrix as ChannelMatrix;
          setChannelMatrix(channelMatrix);
          if (_usage) setLastUsage(_usage);
          updateStage('channel-matrix', { status: 'done' });
        } catch (err: any) {
          updateStage('channel-matrix', { status: 'error', error: err.message });
        }
      } else {
        updateStage('channel-matrix', { status: 'skipped' });
      }
      if (abort.signal.aborted) return;

      // 6. Copy-pakke (generate-deep via SSE)
      try {
        updateStage('copy', { status: 'working' });
        const payload = await readSse(
          '/api/generate-deep',
          { brief, chosenIdea: territory || null },
          (delta) => updateStage('copy', { streamText: delta }),
          abort.signal,
        );
        if (payload?.output) {
          output = payload.output as BrandSurfaceOutput;
          setOutput(output);
        }
        updateStage('copy', { status: 'done', streamText: '' });
      } catch (err: any) {
        if (abort.signal.aborted) return;
        updateStage('copy', { status: 'error', error: err.message });
      }
      if (abort.signal.aborted) return;

      // 7. Kritik af copy (Kreativ Direktør)
      if (output) {
        try {
          updateStage('critique-copy', { status: 'critiquing' });
          const artifact = `Kort case-tekst:\n${output.shortCaseText}\n\nLinkedIn:\n${output.linkedinPost}\n\nBedste overskrift:\n${output.directUsable?.bestHeadline || output.headlines?.[0] || ''}`;
          const ideaCtx = territory ? `Kampagne-platform: ${territory.bigIdea}. Tagline: ${territory.tagline}.` : '';
          const critique = await postJson<CritiqueResult>('/api/critique', {
            role: 'Kreativ Direktør',
            artifact,
            context: ideaCtx,
            language: brief.language || 'Dansk',
          });
          updateStage('critique-copy', { status: 'done', critiqueVerdict: critique.verdict });
        } catch (err: any) {
          updateStage('critique-copy', { status: 'error', error: err.message });
        }
      } else {
        updateStage('critique-copy', { status: 'skipped' });
      }
      if (abort.signal.aborted) return;

      // 8. Effekt-lag
      if (territory) {
        try {
          updateStage('effectiveness', { status: 'working' });
          const channels = channelMatrix?.channels?.map(c => c.channel).filter(Boolean) ?? brief.channels;
          const raw = await postJson<any>('/api/effectiveness', { brief, chosenIdea: territory, strategy, channels });
          const { _usage, ...framework } = raw;
          effectiveness = framework as EffectivenessFramework;
          setEffectiveness(effectiveness);
          if (_usage) setLastUsage(_usage);
          updateStage('effectiveness', { status: 'done' });
        } catch (err: any) {
          updateStage('effectiveness', { status: 'error', error: err.message });
        }
      } else {
        updateStage('effectiveness', { status: 'skipped' });
      }
      if (abort.signal.aborted) return;

      // 9. Pitch
      try {
        updateStage('pitch', { status: 'working' });
        const matrixSummary = channelMatrix?.channels?.slice(0, 3).map(c => `${c.channel}: ${c.headline}`).join('; ') || '';
        const effectSummary = effectiveness ? `Business objective: ${effectiveness.businessObjective}. Success: ${effectiveness.successScenario}` : '';
        const raw = await postJson<any>('/api/pitch', {
          brief,
          strategy,
          bigIdea: territory,
          channelMatrixSummary: matrixSummary,
          effectivenessSummary: effectSummary,
        });
        const { _usage, ...pitchData } = raw;
        if (_usage) setLastUsage(_usage);
        setPitchResult(pitchData as PitchResult);
        updateStage('pitch', { status: 'done' });
      } catch (err: any) {
        updateStage('pitch', { status: 'error', error: err.message });
      }
    };

    try {
      await run();
    } finally {
      setIsRunning(false);
      abortRef.current = null;
    }
  }, [isRunning, brief, setLastUsage, setErrorMsg, setCulturalIntel, setStrategy, setCampaignPlatform, handleSelectTerritory, setChannelMatrix, setEffectiveness, setOutput, updateStage]);

  const abortBureau = useCallback(() => {
    abortRef.current?.abort();
    setIsRunning(false);
    setStages(prev => prev.map(s =>
      s.status === 'working' || s.status === 'critiquing' || s.status === 'revising'
        ? { ...s, status: 'error' as BureauStageStatus, error: 'Afbrudt' }
        : s,
    ));
  }, []);

  const handleGeneratePitch = useCallback(async () => {
    setIsGeneratingPitch(true);
    try {
      const raw = await postJson<any>('/api/pitch', { brief });
      const { _usage, ...pitchData } = raw;
      if (_usage) setLastUsage(_usage);
      setPitchResult(pitchData as PitchResult);
    } catch (err: any) {
      setErrorMsg(err.message || 'Kunne ikke generere pitch-materialet.');
    } finally {
      setIsGeneratingPitch(false);
    }
  }, [brief, setLastUsage, setErrorMsg]);

  return {
    bureauModeActive, setBureauModeActive,
    stages, isRunning,
    runBureau, abortBureau,
    pitchResult, isGeneratingPitch, handleGeneratePitch,
  };
}
