/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fal } from '@fal-ai/client';
import type { ImageProvider } from './provider';

// Map appens aspect ratios til Flux' image_size-enum.
const SIZE_MAP: Record<string, string> = {
  '16:9': 'landscape_16_9',
  '1:1': 'square_hd',
  '4:3': 'landscape_4_3',
  '9:16': 'portrait_16_9',
};

let configured = false;
function ensureConfigured() {
  if (!configured && process.env.FAL_KEY) {
    fal.config({ credentials: process.env.FAL_KEY });
    configured = true;
  }
}

/** Flux 1.1 Pro via fal.ai. Returnerer en hosted https-URL. */
export const falProvider: ImageProvider = {
  async generate({ prompt, aspectRatio }) {
    if (!process.env.FAL_KEY) {
      throw new Error(
        'FAL_KEY er ikke sat i miljøet. Tilføj din fal.ai API-nøgle for at generere billeder.',
      );
    }
    ensureConfigured();

    const result: any = await fal.subscribe('fal-ai/flux-pro/v1.1', {
      input: {
        prompt,
        image_size: (SIZE_MAP[aspectRatio] ?? 'landscape_16_9') as any,
        num_images: 1,
        output_format: 'jpeg',
        safety_tolerance: '2',
      },
    });

    const url: string | undefined = result?.data?.images?.[0]?.url ?? result?.images?.[0]?.url;
    if (!url) {
      throw new Error('Ingen billeder blev returneret fra Flux (fal.ai).');
    }
    return { imageUrl: url };
  },
};
