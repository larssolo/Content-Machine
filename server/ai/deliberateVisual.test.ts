import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the structured-output helper so no real API calls are made.
vi.mock('./structured', () => ({ generateStructured: vi.fn() }));

import { generateStructured } from './structured';
import { config } from './config';
import { runVisualDeliberation } from './deliberateVisual';

const mocked = vi.mocked(generateStructured);

const draft = {
  visualConcept: 'koncept',
  imagePrompts: { hero: 'h', detail: 'd', abstract: 'a' },
  moodKeywords: ['mood'],
};
const weak = { onBrandScore: 60, specificityScore: 60, originalityScore: 60, weaknesses: ['x'], overallReview: 'tam' };
const strong = { onBrandScore: 90, specificityScore: 90, originalityScore: 90, weaknesses: [], overallReview: 'flot' };
const directions = { boldVisuals: ['B'], lightingAndColor: ['L'], compositions: ['C'] };
const final = { ...draft, visualConcept: 'forbedret koncept' };
const brief = { client: 'Acme', project: 'Launch', description: 'd', language: 'Dansk' };

beforeEach(() => mocked.mockReset());

describe('runVisualDeliberation', () => {
  it('runs the full visual roundtable in order with correct model + tool routing', async () => {
    mocked
      .mockResolvedValueOnce(draft) // udkast
      .mockResolvedValueOnce(weak) // kritik (under tærskel)
      .mockResolvedValueOnce(directions) // kreativ
      .mockResolvedValueOnce(final) // syntese
      .mockResolvedValueOnce(strong); // verificér

    const phases: string[] = [];
    const result = await runVisualDeliberation({ brief }, (e) => phases.push(e.phase));

    expect(phases).toEqual(['udkast', 'kritik', 'kreativ', 'syntese', 'verificerer', 'faerdig']);
    expect(result.output).toBe(final);
    expect(result.draft).toBe(draft);
    expect(result.critiqueBefore).toBe(weak);
    expect(result.critiqueAfter).toBe(strong);
    expect(result.earlyStopped).toBe(false);

    const opts = mocked.mock.calls.map((c) => c[0]);
    expect(opts[0].model).toBe(config.model);
    expect(opts[0].tool.name).toBe('submit_visual_concept');
    expect(opts[1].model).toBe(config.fastModel);
    expect(opts[1].tool.name).toBe('submit_visual_critique');
    expect(opts[2].model).toBe(config.fastModel);
    expect(opts[2].tool.name).toBe('submit_visual_directions');
    expect(opts[3].model).toBe(config.model);
    expect(opts[3].tool.name).toBe('submit_visual_concept');
    expect(opts[4].model).toBe(config.fastModel);
  });

  it('early-stops when the visual draft already scores high enough', async () => {
    mocked.mockResolvedValueOnce(draft).mockResolvedValueOnce(strong);

    const phases: string[] = [];
    const result = await runVisualDeliberation({ brief }, (e) => phases.push(e.phase));

    expect(phases).toEqual(['udkast', 'kritik', 'springer-over', 'faerdig']);
    expect(mocked).toHaveBeenCalledTimes(2);
    expect(result.output).toBe(draft);
    expect(result.earlyStopped).toBe(true);
    expect(result.critiqueAfter).toBeUndefined();
  });

  it('recovers from a truncated synthesis by returning the best concept', async () => {
    mocked
      .mockResolvedValueOnce(draft)
      .mockResolvedValueOnce(weak)
      .mockResolvedValueOnce(directions)
      .mockRejectedValueOnce(new Error('Svaret blev afkortet (max_tokens).'));

    const result = await runVisualDeliberation({ brief }, () => {});

    expect(result.output).toBe(draft);
    expect(result.synthesisTruncated).toBe(true);
    expect(result.earlyStopped).toBe(false);
  });

  it('does not call the model when the signal is already aborted', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      runVisualDeliberation({ brief, signal: controller.signal }, () => {}),
    ).rejects.toThrow();
    expect(mocked).not.toHaveBeenCalled();
  });
});
