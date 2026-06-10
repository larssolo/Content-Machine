import { describe, it, expect, vi, afterEach } from 'vitest';

describe('buildTtsInput', () => {
  it('default voice Kore + mp3', async () => {
    const { buildTtsInput } = await import('./tts');
    const input = buildTtsInput({ prompt: 'hej' });
    expect(input.prompt).toBe('hej');
    expect(input.voice).toBe('Kore');
    expect(input.output_format).toBe('mp3');
    expect(input.style_instructions).toBeUndefined();
  });
  it('ugyldig voice falder tilbage til Kore; clamp temperatur; style når sat', async () => {
    const { buildTtsInput } = await import('./tts');
    const input = buildTtsInput({ prompt: 'hej', voice: 'NotAVoice', temperature: 5, styleInstructions: 'varmt' });
    expect(input.voice).toBe('Kore');
    expect(input.temperature).toBe(1);
    expect(input.style_instructions).toBe('varmt');
  });
  it('gyldig voice bevares', async () => {
    const { buildTtsInput } = await import('./tts');
    expect(buildTtsInput({ prompt: 'x', voice: 'Zephyr' }).voice).toBe('Zephyr');
  });
});

describe('generateSpeech', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('fejler klart uden FAL_KEY', async () => {
    vi.resetModules();
    vi.stubEnv('FAL_KEY', '');
    const { generateSpeech } = await import('./tts');
    await expect(generateSpeech({ prompt: 'x' })).rejects.toThrow(/FAL_KEY/);
  });
});
