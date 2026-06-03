// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { saveSession, loadSession, clearSession } from './session';
import { loadHistory, pushHistory, removeHistory, clearHistory } from './history';
import type { BrandSurfaceOutput } from '../types';

const output = { shortCaseText: 'x', longCaseText: 'y', linkedinPost: 'z' } as unknown as BrandSurfaceOutput;
const brief = { client: 'Acme', project: 'Launch' } as any;

beforeEach(() => localStorage.clear());

describe('session storage', () => {
  it('round-trips a saved session', () => {
    saveSession({ brief, output, activeTab: 'linkedin' });
    const s = loadSession();
    expect(s?.brief?.client).toBe('Acme');
    expect(s?.output?.shortCaseText).toBe('x');
    expect(s?.activeTab).toBe('linkedin');
  });

  it('resets transient image loading flags on load', () => {
    saveSession({ generatedImages: { hero: { url: '', loading: true, error: null, aspectRatio: '16:9' } } });
    const s = loadSession();
    expect(s?.generatedImages?.hero.loading).toBe(false);
  });

  it('returns null when nothing is stored', () => {
    clearSession();
    expect(loadSession()).toBeNull();
  });
});

describe('history storage', () => {
  it('pushes newest first and persists', () => {
    let list = loadHistory();
    list = pushHistory(list, { ...brief, project: 'A' }, output);
    list = pushHistory(list, { ...brief, project: 'B' }, output);
    expect(list[0].project).toBe('B');
    expect(loadHistory()).toHaveLength(2);
  });

  it('caps the history at 20 entries', () => {
    let list = loadHistory();
    for (let i = 0; i < 25; i++) list = pushHistory(list, { ...brief, project: `P${i}` }, output);
    expect(list).toHaveLength(20);
    expect(list[0].project).toBe('P24');
  });

  it('removes and clears entries', () => {
    let list = pushHistory(loadHistory(), brief, output);
    const id = list[0].id;
    list = removeHistory(list, id);
    expect(list).toHaveLength(0);
    pushHistory(list, brief, output);
    expect(clearHistory()).toHaveLength(0);
    expect(loadHistory()).toHaveLength(0);
  });
});
