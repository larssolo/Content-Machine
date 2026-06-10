import { describe, it, expect, vi, afterEach } from 'vitest';

describe('buildKlingInput', () => {
  it('mapper med defaults', async () => {
    const { buildKlingInput } = await import('./kling');
    const input = buildKlingInput({ imageUrl: 'http://img', prompt: 'a wave' });
    expect(input.image_url).toBe('http://img');
    expect(input.prompt).toBe('a wave');
    expect(input.duration).toBe('5');
    expect(input.cfg_scale).toBe(0.5);
    expect(input.negative_prompt).toBe('blur, distort, and low quality');
    expect(input.tail_image_url).toBeUndefined();
  });
  it('respekterer eksplicitte værdier + slut-frame', async () => {
    const { buildKlingInput } = await import('./kling');
    const input = buildKlingInput({ imageUrl: 'http://img', prompt: 'a wave', duration: '10', cfgScale: 0.8, negativePrompt: 'no text', tailImageUrl: 'http://end' });
    expect(input.duration).toBe('10');
    expect(input.cfg_scale).toBe(0.8);
    expect(input.negative_prompt).toBe('no text');
    expect(input.tail_image_url).toBe('http://end');
  });
});

describe('generateVideo', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('fejler klart uden FAL_KEY', async () => {
    vi.resetModules();
    vi.stubEnv('FAL_KEY', '');
    const { generateVideo } = await import('./kling');
    await expect(generateVideo({ imageUrl: 'http://img', prompt: 'x' })).rejects.toThrow(/FAL_KEY/);
  });
});
