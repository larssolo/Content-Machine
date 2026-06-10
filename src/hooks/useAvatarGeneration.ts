/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { httpErrorMessage } from './httpError';

export const TTS_VOICES = ['Achernar','Achird','Algenib','Algieba','Alnilam','Aoede','Autonoe','Callirrhoe','Charon','Despina','Enceladus','Erinome','Fenrir','Gacrux','Iapetus','Kore','Laomedeia','Leda','Orus','Pulcherrima','Puck','Rasalgethi','Sadachbia','Sadaltager','Schedar','Sulafat','Umbriel','Vindemiatrix','Zephyr','Zubenelgenubi'] as const;

export type SpeechState = { url: string; loading: boolean; error: string | null };
export type AvatarState = { url: string; loading: boolean; error: string | null };

export interface SpeechParams {
  prompt: string;
  voice?: string;
  styleInstructions?: string;
  temperature?: number;
}
export interface AvatarParams {
  imageUrl: string;
  audioUrl: string;
  resolution?: '720p' | '480p';
}

/** Avatar-domæne: TTS (tale) + Fabric (talking-head). Selvstændigt. */
export function useAvatarGeneration() {
  const [speechResult, setSpeechResult] = useState<SpeechState>({ url: '', loading: false, error: null });
  const [avatarResult, setAvatarResult] = useState<AvatarState>({ url: '', loading: false, error: null });

  const handleGenerateSpeech = async (params: SpeechParams) => {
    setSpeechResult({ url: '', loading: true, error: null });
    try {
      const response = await fetch('/api/generate-speech', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const data = await response.json();
      if (!data.audioUrl) throw new Error('Forkert svar-format fra API.');
      setSpeechResult({ url: data.audioUrl, loading: false, error: null });
    } catch (err: any) {
      console.error('Fejl i handleGenerateSpeech:', err);
      setSpeechResult({ url: '', loading: false, error: err.message || 'Der opstod en uventet fejl under tale-genereringen.' });
    }
  };

  const handleGenerateAvatar = async (params: AvatarParams) => {
    setAvatarResult({ url: '', loading: true, error: null });
    try {
      const response = await fetch('/api/generate-avatar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const data = await response.json();
      if (!data.videoUrl) throw new Error('Forkert svar-format fra API.');
      setAvatarResult({ url: data.videoUrl, loading: false, error: null });
    } catch (err: any) {
      console.error('Fejl i handleGenerateAvatar:', err);
      setAvatarResult({ url: '', loading: false, error: err.message || 'Der opstod en uventet fejl under avatar-genereringen.' });
    }
  };

  return { speechResult, avatarResult, handleGenerateSpeech, handleGenerateAvatar };
}
