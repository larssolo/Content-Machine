import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the structured-output helper so no real API calls are made.
vi.mock('./structured', () => ({ generateStructured: vi.fn() }));

import { generateStructured } from './structured';
import { config } from './config';
import { runDeliberation } from './deliberate';

const mocked = vi.mocked(generateStructured);

const draft = {
  shortCaseText: 'kort',
  longCaseText: 'lang',
  linkedinPost: 'krog',
  headlines: ['H'],
  cta: ['C'],
  mailchimpSubjects: ['M'],
};
const weak = { clichesFound: ['x'], clicheScore: 60, concretenessScore: 60, humanScore: 60, evaluations: [], overallReview: 'tam' };
const strong = { clichesFound: [], clicheScore: 90, concretenessScore: 90, humanScore: 90, evaluations: [], overallReview: 'flot' };
const creative = { boldHeadlines: ['B'], boldHooks: ['K'], angles: ['V'] };
const final = { ...draft, shortCaseText: 'forbedret kort', longCaseText: 'forbedret lang', linkedinPost: 'forbedret krog' };
const brief = { client: 'Acme', project: 'Launch', description: 'd', language: 'Dansk' };

beforeEach(() => mocked.mockReset());

describe('runDeliberation', () => {
  it('runs the full roundtable in order and returns improved output with before/after critique', async () => {
    mocked
      .mockResolvedValueOnce(draft) // udkast
      .mockResolvedValueOnce(weak) // kritik (under tærskel → fortsæt)
      .mockResolvedValueOnce(creative) // kreativ
      .mockResolvedValueOnce(final) // syntese
      .mockResolvedValueOnce(strong); // verificér

    const phases: string[] = [];
    const result = await runDeliberation({ brief }, (e) => phases.push(e.phase));

    expect(phases).toEqual(['udkast', 'kritik', 'kreativ', 'syntese', 'verificerer', 'faerdig']);
    expect(result.output).toBe(final);
    expect(result.draft).toBe(draft);
    expect(result.critiqueBefore).toBe(weak);
    expect(result.critiqueAfter).toBe(strong);
    expect(result.earlyStopped).toBe(false);

    // Model-routing: Opus til udkast + syntese, Haiku til kritik/kreativ/verificér.
    const opts = mocked.mock.calls.map((c) => c[0]);
    expect(opts[0].model).toBe(config.model);
    expect(opts[0].tool.name).toBe('submit_brand_surface_output');
    expect(opts[1].model).toBe(config.fastModel);
    expect(opts[1].tool.name).toBe('submit_tone_analysis');
    expect(opts[2].model).toBe(config.fastModel);
    expect(opts[2].tool.name).toBe('submit_creative_directions');
    expect(opts[3].model).toBe(config.model);
    expect(opts[3].tool.name).toBe('submit_brand_surface_output');
    expect(opts[4].model).toBe(config.fastModel);
  });

  it('early-stops when the draft already scores high enough', async () => {
    mocked
      .mockResolvedValueOnce(draft) // udkast
      .mockResolvedValueOnce(strong); // kritik (over tærskel)

    const phases: string[] = [];
    const result = await runDeliberation({ brief }, (e) => phases.push(e.phase));

    expect(phases).toEqual(['udkast', 'kritik', 'springer-over', 'faerdig']);
    expect(mocked).toHaveBeenCalledTimes(2);
    expect(result.output).toBe(draft);
    expect(result.earlyStopped).toBe(true);
    expect(result.critiqueAfter).toBeUndefined();
  });

  it('recovers from a truncated synthesis by returning the best draft', async () => {
    mocked
      .mockResolvedValueOnce(draft) // udkast
      .mockResolvedValueOnce(weak) // kritik
      .mockResolvedValueOnce(creative) // kreativ
      .mockRejectedValueOnce(new Error('Svaret blev afkortet (max_tokens).')); // syntese

    const result = await runDeliberation({ brief }, () => {});

    expect(result.output).toBe(draft);
    expect(result.synthesisTruncated).toBe(true);
    expect(result.earlyStopped).toBe(false);
  });

  it('does not call the model when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      runDeliberation({ brief, signal: controller.signal }, () => {}),
    ).rejects.toThrow();
    expect(mocked).not.toHaveBeenCalled();
  });
});
