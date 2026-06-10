/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fal } from '@fal-ai/client';

export const TTS_VOICES = ['Achernar','Achird','Algenib','Algieba','Alnilam','Aoede','Autonoe','Callirrhoe','Charon','Despina','Enceladus','Erinome','Fenrir','Gacrux','Iapetus','Kore','Laomedeia','Leda','Orus','Pulcherrima','Puck','Rasalgethi','Sadachbia','Sadaltager','Schedar','Sulafat','Umbriel','Vindemiatrix','Zephyr','Zubenelgenubi'] as const;

export interface SpeechRequest {
  prompt: string;
  voice?: string;
  styleInstructions?: string;
  temperature?: number;
}

/** Ren mapping: SpeechRequest → fal TTS input. Ugyldig voice → Kore. */
export function buildTtsInput(req: SpeechRequest): Record<string, unknown> {
  const voice = (TTS_VOICES as readonly string[]).includes(req.voice ?? '') ? req.voice : 'Kore';
  const input: Record<string, unknown> = { prompt: req.prompt, voice, output_format: 'mp3' };
  if (typeof req.temperature === 'number') input.temperature = Math.min(1, Math.max(0, req.temperature));
  if (req.styleInstructions?.trim()) input.style_instructions = req.styleInstructions;
  return input;
}

let configured = false;
function ensureConfigured() {
  if (!configured && process.env.FAL_KEY) {
    fal.config({ credentials: process.env.FAL_KEY });
    configured = true;
  }
}

/** Generér tale via Gemini 3.1 Flash TTS på fal.ai. */
export async function generateSpeech(req: SpeechRequest): Promise<{ audioUrl: string }> {
  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY er ikke sat i miljøet. Tilføj din fal.ai API-nøgle for at generere tale.');
  }
  ensureConfigured();

  const result: any = await fal.subscribe('fal-ai/gemini-3.1-flash-tts', { input: buildTtsInput(req) as any });

  const url: string | undefined = result?.data?.audio?.url ?? result?.audio?.url;
  if (!url) {
    throw new Error('Ingen lyd blev returneret fra fal.ai.');
  }
  return { audioUrl: url };
}
