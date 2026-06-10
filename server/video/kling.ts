/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fal } from '@fal-ai/client';

export interface VideoRequest {
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  duration?: '5' | '10';
  cfgScale?: number;
  tailImageUrl?: string;
}

/** Ren mapping: VideoRequest → fal kling input-objekt. */
export function buildKlingInput(req: VideoRequest): Record<string, unknown> {
  const input: Record<string, unknown> = {
    prompt: req.prompt,
    image_url: req.imageUrl,
    duration: req.duration ?? '5',
    cfg_scale: req.cfgScale ?? 0.5,
    negative_prompt: req.negativePrompt?.trim() ? req.negativePrompt : 'blur, distort, and low quality',
  };
  if (req.tailImageUrl?.trim()) input.tail_image_url = req.tailImageUrl;
  return input;
}

let configured = false;
function ensureConfigured() {
  if (!configured && process.env.FAL_KEY) {
    fal.config({ credentials: process.env.FAL_KEY });
    configured = true;
  }
}

/** Generér video via Kling 2.5 Turbo Pro (image-to-video) på fal.ai. */
export async function generateVideo(req: VideoRequest): Promise<{ videoUrl: string }> {
  if (!process.env.FAL_KEY) {
    throw new Error('FAL_KEY er ikke sat i miljøet. Tilføj din fal.ai API-nøgle for at generere video.');
  }
  ensureConfigured();

  const result: any = await fal.subscribe('fal-ai/kling-video/v2.5-turbo/pro/image-to-video', {
    input: buildKlingInput(req) as any,
  });

  const url: string | undefined = result?.data?.video?.url ?? result?.video?.url;
  if (!url) {
    throw new Error('Ingen video blev returneret fra fal.ai.');
  }
  return { videoUrl: url };
}
