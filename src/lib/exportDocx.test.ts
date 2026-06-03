import { describe, it, expect } from 'vitest';
import { Packer } from 'docx';
import { buildDocxDocument } from './exportDocx';
import type { BrandSurfaceOutput } from '../types';

const output = {
  shortCaseText: 'Kort',
  longCaseText: 'Lang',
  linkedinPost: 'LinkedIn',
  headlines: ['A', 'B'],
  keywords: ['led'],
  cta: ['Kontakt'],
  english: { shortCaseText: 'S', longCaseText: 'L', linkedinPost: 'Li', headlines: [] },
  imagePrompts: { hero: 'h', detail: 'd', abstract: 'a' },
  mailchimpSubjects: ['Emne'],
  productionProposed: false,
  production: null,
  directUsable: { bestHeadline: 'A', bestShortText: 'K', bestCta: 'C', bestLinkedinStart: 'H' },
} as unknown as BrandSurfaceOutput;

describe('buildDocxDocument', () => {
  it('produces a non-empty .docx buffer', async () => {
    const buf = await Packer.toBuffer(buildDocxDocument(output, { client: 'Acme', project: 'Launch' } as any));
    expect(buf.length).toBeGreaterThan(500);
  });
});
