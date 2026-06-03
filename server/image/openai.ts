/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ImageProvider } from './provider';

// Stub: aktivér ved at sætte IMAGE_PROVIDER=openai og implementere et kald til
// OpenAI gpt-image-1 (kræver OPENAI_API_KEY). Returnér en data:- eller https-URL.
export const openaiProvider: ImageProvider = {
  async generate() {
    throw new Error(
      'OpenAI billed-provideren er ikke aktiveret. Brug IMAGE_PROVIDER=fal (standard) eller implementér openai-provideren.',
    );
  },
};
