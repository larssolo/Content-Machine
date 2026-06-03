/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type Anthropic from '@anthropic-ai/sdk';
import { anthropic } from './anthropic';
import { config } from './config';

export interface StructuredOptions {
  /** System-blokke (understøtter cache_control for prompt-caching). */
  system: Anthropic.TextBlockParam[];
  /** Bruger-indhold: tekst og/eller document/image-blokke. */
  userContent: Anthropic.ContentBlockParam[];
  /** Værktøjet hvis input_schema definerer det ønskede JSON-output. */
  tool: Anthropic.Tool;
  model?: string;
  maxTokens?: number;
}

/**
 * Kald Claude med et tvunget værktøj (tool_choice) og returnér det parsede
 * JSON-objekt fra tool_use-blokken. Erstatter Geminis responseSchema-tilstand.
 *
 * Bemærk: tvunget tool_choice er ikke kompatibelt med (adaptive) thinking, så
 * thinking udelades bevidst her.
 */
export async function generateStructured<T>(opts: StructuredOptions): Promise<T> {
  const msg = await anthropic.messages.create({
    model: opts.model ?? config.model,
    max_tokens: opts.maxTokens ?? config.maxTokens,
    system: opts.system,
    tools: [opts.tool],
    tool_choice: { type: 'tool', name: opts.tool.name },
    messages: [{ role: 'user', content: opts.userContent }],
  });

  if (msg.stop_reason === 'max_tokens') {
    throw new Error(
      'Svaret blev afkortet (max_tokens). Prøv igen eller forøg ANTHROPIC_MAX_TOKENS.',
    );
  }

  const block = msg.content.find((b) => b.type === 'tool_use');
  if (!block || block.type !== 'tool_use') {
    throw new Error('Intet struktureret output modtaget fra Claude.');
  }
  return block.input as T;
}
