/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ImageProvider } from './provider';

// Stub: aktivér ved at sætte IMAGE_PROVIDER=stability og implementere et kald til
// Stability AI (kræver STABILITY_API_KEY). Returnér en data:- eller https-URL.
export const stabilityProvider: ImageProvider = {
  async generate() {
    throw new Error(
      'Stability billed-provideren er ikke aktiveret. Brug IMAGE_PROVIDER=fal (standard) eller implementér stability-provideren.',
    );
  },
};
