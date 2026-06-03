import { describe, it, expect } from 'vitest';
import { buildHtml } from './exportHtml';
import type { BrandSurfaceOutput } from '../types';

const output = {
  shortCaseText: 'Kort tekst',
  longCaseText: 'Lang tekst',
  linkedinPost: 'LinkedIn post',
  headlines: ['Overskrift A'],
  keywords: ['led', 'display'],
  cta: ['Kontakt os'],
  mailchimpSubjects: ['Nyhed'],
  english: { shortCaseText: 'Short', longCaseText: 'Long', linkedinPost: 'Li', headlines: [] },
  imagePrompts: { hero: 'hero prompt', detail: 'detail prompt', abstract: 'abstract prompt' },
  directUsable: { bestHeadline: 'BH', bestShortText: 'BS', bestCta: 'BC', bestLinkedinStart: 'BL' },
  productionProposed: false,
  production: null,
} as unknown as BrandSurfaceOutput;

describe('buildHtml', () => {
  it('produces a valid HTML document', () => {
    const html = buildHtml(output, { client: 'Acme', project: 'Launch' } as any);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="da">');
    expect(html).toContain('Acme — Launch');
  });

  it('escapes HTML special characters', () => {
    const unsafe = { ...output, shortCaseText: '<script>alert("xss")</script>' };
    const html = buildHtml(unsafe as any);
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('includes all major sections', () => {
    const html = buildHtml(output);
    expect(html).toContain('Kort tekst');
    expect(html).toContain('LinkedIn post');
    expect(html).toContain('Overskrift A');
    expect(html).toContain('led');
    expect(html).toContain('hero prompt');
    expect(html).toContain('BH');
  });
});
