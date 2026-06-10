import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('getImageProvider', () => {
  beforeEach(() => vi.resetModules());
  afterEach(() => vi.unstubAllEnvs());

  it('defaults to the fal provider', async () => {
    vi.stubEnv('IMAGE_PROVIDER', '');
    const { getImageProvider } = await import('./provider');
    const { falProvider } = await import('./fal');
    expect(getImageProvider()).toBe(falProvider);
  });

  it('selects the openai provider when IMAGE_PROVIDER=openai', async () => {
    vi.stubEnv('IMAGE_PROVIDER', 'openai');
    const { getImageProvider } = await import('./provider');
    const { openaiProvider } = await import('./openai');
    expect(getImageProvider()).toBe(openaiProvider);
  });
});

describe('falProvider', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('rejects clearly when FAL_KEY is missing', async () => {
    vi.resetModules();
    vi.stubEnv('FAL_KEY', '');
    const { falProvider } = await import('./fal');
    await expect(falProvider.generate({ prompt: 'x', aspectRatio: '16:9' })).rejects.toThrow(/FAL_KEY/);
  });
});

describe('buildFalRequest', () => {
  it('mapper flux til flux-pro med image_size-preset', async () => {
    const { buildFalRequest } = await import('./fal');
    const r = buildFalRequest('flux', 'a cat', '1:1');
    expect(r.id).toBe('fal-ai/flux-pro/v1.1');
    expect(r.input.image_size).toBe('square_hd');
  });
  it('mapper nano-banana-pro med aspect_ratio + resolution', async () => {
    const { buildFalRequest } = await import('./fal');
    const r = buildFalRequest('nano-banana-pro', 'a cat', '16:9');
    expect(r.id).toBe('fal-ai/nano-banana-pro');
    expect(r.input.aspect_ratio).toBe('16:9');
    expect(r.input.resolution).toBe('2K');
  });
  it('mapper gpt-image-2 med image_size-preset + quality', async () => {
    const { buildFalRequest } = await import('./fal');
    const r = buildFalRequest('gpt-image-2', 'a cat', '4:3');
    expect(r.id).toBe('fal-ai/gpt-image-2');
    expect(r.input.image_size).toBe('landscape_4_3');
    expect(r.input.quality).toBe('high');
  });
  it('falder tilbage til flux ved ukendt model', async () => {
    const { buildFalRequest } = await import('./fal');
    const r = buildFalRequest('ukendt' as any, 'a cat', '1:1');
    expect(r.id).toBe('fal-ai/flux-pro/v1.1');
  });
});
