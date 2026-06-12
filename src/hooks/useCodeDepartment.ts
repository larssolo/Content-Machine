/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useCallback, Dispatch, SetStateAction } from 'react';
import {
  ProjectBrief, UsageInfo, StrategyFoundation, CampaignTerritory, CodeDepartmentTarget,
} from '../types';

export interface CodeDepartmentDeps {
  brief: ProjectBrief;
  strategy: StrategyFoundation | null;
  selectedTerritory: CampaignTerritory | null;
  setLastUsage: Dispatch<SetStateAction<UsageInfo | null>>;
  setErrorMsg: Dispatch<SetStateAction<string | null>>;
}

export function useCodeDepartment(deps: CodeDepartmentDeps) {
  const { brief, strategy, selectedTerritory, setLastUsage, setErrorMsg } = deps;

  const [codeDeptOpen, setCodeDeptOpen] = useState(false);
  const [codeTarget, setCodeTarget] = useState<CodeDepartmentTarget>('website');
  const [codeNotes, setCodeNotes] = useState('');
  const [codePrompt, setCodePrompt] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerateCodePrompt = useCallback(async () => {
    if (!brief.client && !brief.project && !brief.description) {
      setErrorMsg('Udfyld briefet først, så Code Department har noget at bygge på.');
      return;
    }
    setIsGeneratingCode(true);
    setCodePrompt('');
    setErrorMsg(null);
    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const res = await fetch('/api/code-department', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          target: codeTarget,
          strategy,
          bigIdea: selectedTerritory,
          extraNotes: codeNotes,
        }),
        signal: abort.signal,
      });
      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        throw new Error((errData as any).error || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6);
          if (payload === '[DONE]') continue;
          try {
            const json = JSON.parse(payload);
            if (json.delta) {
              accumulated += json.delta;
              setCodePrompt(accumulated);
            }
            if (json.done) {
              if (json.codePrompt) setCodePrompt(json.codePrompt);
              if (json._usage) setLastUsage(json._usage);
            }
            if (json.error) throw new Error(json.error);
          } catch (e) {
            if (e instanceof SyntaxError) continue;
            throw e;
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setErrorMsg(err.message || 'Kunne ikke generere Claude Code-prompten.');
      }
    } finally {
      setIsGeneratingCode(false);
      abortRef.current = null;
    }
  }, [brief, codeTarget, codeNotes, strategy, selectedTerritory, setLastUsage, setErrorMsg]);

  const abortCodePrompt = useCallback(() => {
    abortRef.current?.abort();
    setIsGeneratingCode(false);
  }, []);

  return {
    codeDeptOpen, setCodeDeptOpen,
    codeTarget, setCodeTarget,
    codeNotes, setCodeNotes,
    codePrompt, isGeneratingCode,
    handleGenerateCodePrompt, abortCodePrompt,
  };
}
