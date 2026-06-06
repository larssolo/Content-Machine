/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type Anthropic from '@anthropic-ai/sdk';
import { anthropic } from './anthropic';
import { config } from './config';

export interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
}

export interface StructuredOptions {
  /** System-blokke (understøtter cache_control for prompt-caching). */
  system: Anthropic.TextBlockParam[];
  /** Bruger-indhold: tekst og/eller document/image-blokke. */
  userContent: Anthropic.ContentBlockParam[];
  /** Værktøjet hvis input_schema definerer det ønskede JSON-output. */
  tool: Anthropic.Tool;
  model?: string;
  maxTokens?: number;
  /** Afbryd det igangværende API-kald hvis klienten lukker forbindelsen. */
  signal?: AbortSignal;
  /** Kaldes med token-forbrug efter et vellykket kald. */
  onUsage?: (u: UsageInfo) => void;
}

function isRetryable(err: any): boolean {
  const status = err?.status ?? err?.statusCode;
  if (status == null) return true; // netværksfejl uden status
  return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Kald Claude med et tvunget værktøj (tool_choice) og returnér det parsede
 * JSON-objekt fra tool_use-blokken. Prøver automatisk igen ved kortvarige fejl
 * (429, 5xx, netværk) med eksponentiel backoff: 2 s → 4 s (max 2 forsøg).
 *
 * Bemærk: tvunget tool_choice er ikke kompatibelt med (adaptive) thinking, så
 * thinking udelades bevidst her.
 */
export async function generateStructured<T>(opts: StructuredOptions): Promise<T> {
  const model = opts.model ?? config.model;
  const maxTokens = opts.maxTokens ?? config.maxTokens;

  // Retry-løkke omslutter KUN API-kaldet. Parsing og validering sker uden for
  // løkken, så applikationsfejl (manglende tool_use-blok, max_tokens) ikke
  // genprøves og forårsager timeouts i tests.
  let msg: Anthropic.Message | undefined;
  let lastErr: any;
  for (let attempt = 0; attempt <= 2; attempt++) {
    if (attempt > 0) {
      await sleep(2 ** (attempt - 1) * 2000); // 2 s, 4 s
      console.warn(`[claude] Retry ${attempt}/2 på ${opts.tool.name} efter: ${lastErr?.message ?? lastErr}`);
    }
    try {
      msg = await anthropic.messages.create(
        {
          model,
          max_tokens: maxTokens,
          system: opts.system,
          tools: [opts.tool],
          tool_choice: { type: 'tool', name: opts.tool.name },
          messages: [{ role: 'user', content: opts.userContent }],
        },
        { signal: opts.signal },
      );
      break; // API-kald lykkedes — forlad retry-løkken
    } catch (err: any) {
      lastErr = err;
      if (!isRetryable(err) || attempt >= 2) throw err;
    }
  }

  // Validering og parsing — aldrig genprøvet.
  const u = (msg as any)?.usage;
  console.log(
    `[claude] ${model} ${opts.tool.name} in=${u?.input_tokens ?? '?'} out=${u?.output_tokens ?? '?'} ` +
      `cache_read=${u?.cache_read_input_tokens ?? 0} cache_write=${u?.cache_creation_input_tokens ?? 0} stop=${msg!.stop_reason}`,
  );

  if (opts.onUsage) {
    opts.onUsage({
      inputTokens: u?.input_tokens ?? 0,
      outputTokens: u?.output_tokens ?? 0,
      cacheReadTokens: u?.cache_read_input_tokens ?? 0,
      cacheWriteTokens: u?.cache_creation_input_tokens ?? 0,
    });
  }

  if (msg!.stop_reason === 'max_tokens') {
    throw new Error(
      'Svaret blev afkortet (max_tokens). Prøv igen eller forøg ANTHROPIC_MAX_TOKENS.',
    );
  }

  const block = msg!.content.find((b) => b.type === 'tool_use');
  if (!block || block.type !== 'tool_use') {
    throw new Error('Intet struktureret output modtaget fra Claude.');
  }
  return block.input as T;
}
