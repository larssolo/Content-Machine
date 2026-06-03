/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';

dotenv.config();

/**
 * Centraliseret konfiguration for AI-laget.
 * Standardmodel er Opus 4.8 (kvalitet først); en billig hurtig-model bruges til
 * trivielle opgaver som refinement.
 */
export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  // Kvalitet først — konfigurerbar via env.
  model: process.env.ANTHROPIC_MODEL ?? 'claude-opus-4-8',
  // Billig/hurtig model til trivielle opgaver (fx /refine).
  fastModel: process.env.ANTHROPIC_FAST_MODEL ?? 'claude-haiku-4-5',
  // Rigeligt loft pga. stort, tosproget /generate-output.
  maxTokens: Number(process.env.ANTHROPIC_MAX_TOKENS ?? 16000),
  // Pluggbar billed-udbyder: fal (standard) | openai | stability.
  imageProvider: (process.env.IMAGE_PROVIDER ?? 'fal').toLowerCase(),
};
