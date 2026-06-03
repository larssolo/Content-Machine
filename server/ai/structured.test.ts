import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./anthropic', () => ({
  anthropic: { messages: { create: vi.fn() } },
}));

import { anthropic } from './anthropic';
import { generateStructured } from './structured';

const create = anthropic.messages.create as unknown as ReturnType<typeof vi.fn>;

const tool = {
  name: 'submit',
  description: 'd',
  input_schema: { type: 'object', properties: {}, required: [] },
} as any;

describe('generateStructured', () => {
  beforeEach(() => create.mockReset());

  it('returns the parsed input from the tool_use block', async () => {
    create.mockResolvedValue({
      stop_reason: 'tool_use',
      content: [{ type: 'tool_use', name: 'submit', input: { a: 1 } }],
    });
    const out = await generateStructured<{ a: number }>({ system: [], userContent: [], tool });
    expect(out).toEqual({ a: 1 });
  });

  it('throws when no tool_use block is returned', async () => {
    create.mockResolvedValue({
      stop_reason: 'end_turn',
      content: [{ type: 'text', text: 'nope' }],
    });
    await expect(
      generateStructured({ system: [], userContent: [], tool }),
    ).rejects.toThrow(/struktureret output/);
  });

  it('throws when the response was truncated (max_tokens)', async () => {
    create.mockResolvedValue({ stop_reason: 'max_tokens', content: [] });
    await expect(
      generateStructured({ system: [], userContent: [], tool }),
    ).rejects.toThrow(/afkortet/);
  });
});
