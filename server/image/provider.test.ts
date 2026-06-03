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
