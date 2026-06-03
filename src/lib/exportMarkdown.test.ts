import { describe, it, expect } from 'vitest';
import { buildMarkdown, slugify } from './exportMarkdown';
import type { BrandSurfaceOutput } from '../types';

const output: BrandSurfaceOutput = {
  shortCaseText: 'Kort tekst',
  longCaseText: 'Lang tekst',
  linkedinPost: 'LinkedIn',
  headlines: ['Overskrift A', 'Overskrift B'],
  keywords: ['led', '3d'],
  cta: ['Kontakt os'],
  english: { shortCaseText: 'Short', longCaseText: 'Long', linkedinPost: 'Li', headlines: ['Head'] },
  imagePrompts: { hero: 'hero prompt', detail: 'detail prompt', abstract: 'abstract prompt' },
  mailchimpSubjects: ['Emne 1'],
  productionProposed: true,
  production: {
    missingImages: ['hero foto'],
    suggestedFormats: ['16:9'],
    heroVisual: 'hero idé',
    someFormat: 'carousel',
    newsletterSection: 'intro',
    cta: 'tilmeld',
  },
  directUsable: { bestHeadline: 'A', bestShortText: 'Kort', bestCta: 'Kontakt', bestLinkedinStart: 'Hook' },
};

describe('buildMarkdown', () => {
  it('includes the core sections and brief title', () => {
    const md = buildMarkdown(output, { client: 'Acme', project: 'Launch' } as any);
    expect(md).toContain('# Acme — Launch');
    expect(md).toContain('## Kort case-tekst');
    expect(md).toContain('Kort tekst');
    expect(md).toContain('## LinkedIn-opslag');
    expect(md).toContain('- Overskrift A');
    expect(md).toContain('hero prompt');
    expect(md).toContain('## Produktionsforslag');
  });

  it('omits optional sections when absent', () => {
    const minimal = { ...output, cviSuggestion: null, production: null };
    const md = buildMarkdown(minimal);
    expect(md).not.toContain('## Produktionsforslag');
    expect(md).not.toContain('## CVI-forslag');
  });
});

describe('slugify', () => {
  it('produces a file-safe slug', () => {
    expect(slugify('B&O Beolab 90!')).toBe('b-o-beolab-90');
    expect(slugify('   ')).toBe('content');
  });
});
