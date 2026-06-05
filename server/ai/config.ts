/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dotenv from 'dotenv';

// Indlæs miljøvariabler. Præcedens: ægte env-variabler > .env.local > .env.
// (.env.local er den lokale, ikke-committede nøglefil README henviser til.)
dotenv.config({ path: ['.env.local', '.env'] });

/**
 * Centraliseret konfiguration for AI-laget.
 * Standardmodel er Sonnet 4.6 (god balance mellem kvalitet og pris); en billig
 * hurtig-model (Haiku) bruges til trivielle opgaver. Sæt ANTHROPIC_MODEL=
 * claude-opus-4-8 for højeste kvalitet (markant dyrere).
 */
export const config = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY,
  // Standard: Sonnet (balance kvalitet/pris). Sæt ANTHROPIC_MODEL for at skifte
  // (fx 'claude-opus-4-8' for højeste kvalitet, dyrere).
  model: process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6',
  // Billig/hurtig model til trivielle opgaver (fx /refine).
  fastModel: process.env.ANTHROPIC_FAST_MODEL ?? 'claude-haiku-4-5',
  // Model til syntese-trinet i redaktionsmødet. Default Sonnet (hurtig + robust
  // på Render). Sæt ANTHROPIC_CREATIVE_MODEL=claude-opus-4-8 for mere kreativ
  // forfinelse — men Opus er langsommere og kan droppe lange SSE-kald på Render.
  creativeModel: process.env.ANTHROPIC_CREATIVE_MODEL ?? 'claude-sonnet-4-6',
  // Loft for output-tokens. Sænket fra 16000 → 8000 for at begrænse værste-falds
  // omkostning pr. kald; det fulde generate-output ligger typisk på ~5-6k.
  maxTokens: Number(process.env.ANTHROPIC_MAX_TOKENS ?? 8000),
  // Pluggbar billed-udbyder: fal (standard) | openai | stability.
  imageProvider: (process.env.IMAGE_PROVIDER ?? 'fal').toLowerCase(),
};
