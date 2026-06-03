/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Anthropic from '@anthropic-ai/sdk';
import { config } from './config';

if (!config.anthropicApiKey) {
  console.warn('Advarsel: ANTHROPIC_API_KEY er ikke sat i miljøet.');
}

// Delt klient for alle endpoints. Falder tilbage til en dummy-nøgle så
// serveren (og /api/health) kan starte uden en nøgle — kald fejler dog først
// når et rigtigt request rammer Anthropic.
export const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey ?? 'dummy-key',
});
