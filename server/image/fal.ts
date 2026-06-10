/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fal } from '@fal-ai/client';
import type { ImageProvider, ImageModel } from './provider';

const SIZE_MAP: Record<string, string> = {
  '16:9': 'landscape_16_9',
  '1:1': 'square_hd',
  '4:3': 'landscape_4_3',
  '9:16': 'portrait_16_9',
};

interface FalRequest { id: string; input: Record<string, unknown>; }

/** Ren mapping: model + format → fal model-id og input-objekt. Ukendt model → flux. */
export function buildFalRequest(model: ImageModel, prompt: string, aspectRatio: string): FalRequest {
  const size = SIZE_MAP[aspectRatio] ?? 'landscape_16_9';
  switch (model) {
    case 'nano-banana-pro':
      return {
        id: 'fal-ai/nano-banana-pro',
        input: { prompt, aspect_ratio: aspectRatio, resolution: '2K', num_images: 1, output_format: 'jpeg' },
      };
    case 'gpt-image-2':
      return {
        id: 'fal-ai/gpt-image-2',
        input: { prompt, image_size: size, quality: 'high', num_images: 1, output_format: 'jpeg' },
      };
    case 'flux':
    default:
      return {
        id: 'fal-ai/flux-pro/v1.1',
        input: { prompt, image_size: size, num_images: 1, output_format: 'jpeg', safety_tolerance: '2' },
      };
  }
}

let configured = false;
function ensureConfigured() {
  if (!configured && process.env.FAL_KEY) {
    fal.config({ credentials: process.env.FAL_KEY });
    configured = true;
  }
}

/** Billedgenerering via fal.ai. Vælger model ud fra request (default flux). */
export const falProvider: ImageProvider = {
  async generate({ prompt, aspectRatio, model }) {
    if (!process.env.FAL_KEY) {
      throw new Error('FAL_KEY er ikke sat i miljøet. Tilføj din fal.ai API-nøgle for at generere billeder.');
    }
    ensureConfigured();

    const { id, input } = buildFalRequest(model ?? 'flux', prompt, aspectRatio);
    const result: any = await fal.subscribe(id, { input });

    const url: string | undefined = result?.data?.images?.[0]?.url ?? result?.images?.[0]?.url;
    if (!url) {
      throw new Error('Ingen billeder blev returneret fra fal.ai.');
    }
    return { imageUrl: url };
  },
};
