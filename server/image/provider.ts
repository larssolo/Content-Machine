/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { config } from '../ai/config';

export type ImageModel = 'flux' | 'nano-banana-pro' | 'gpt-image-2';

export interface ImageRequest {
  prompt: string;
  aspectRatio: string;
  model?: ImageModel;
}

export interface ImageProvider {
  generate(opts: ImageRequest): Promise<{ imageUrl: string }>;
}

import { falProvider } from './fal';
import { openaiProvider } from './openai';
import { stabilityProvider } from './stability';

/** Vælg billed-udbyder ud fra IMAGE_PROVIDER (standard: fal / Flux 1.1 Pro). */
export function getImageProvider(): ImageProvider {
  switch (config.imageProvider) {
    case 'openai':
      return openaiProvider;
    case 'stability':
      return stabilityProvider;
    case 'fal':
    default:
      return falProvider;
  }
}
