import { describe, it, expect } from 'vitest';
import { buildDeckHtml, type DeckInput } from './exportDeck';
import type {
  BrandSurfaceOutput,
  ChannelMatrix,
  CampaignTerritory,
  ProjectBrief,
  StrategyFoundation,
} from '../types';

const brief = { client: 'Acme', project: 'Launch' } as ProjectBrief;

const territory: CampaignTerritory = {
  name: 'Rute Alfa',
  bigIdea: 'Den store knivskarpe idé',
  tagline: 'En sælgende tagline',
  manifesto: 'Et mobiliserende manifest om forandring.',
  strategicRoot: 'Bygger på en menneskelig spænding.',
  channelExpressions: [{ channel: 'Film', idea: 'En 30-sek film' }],
  toneDescriptor: 'Modig og varm',
  rationale: 'Den vinder fordi den er konkret.',
};

const strategy: StrategyFoundation = {
  audienceTruth: 'Målgruppen føler sig overset.',
  tension: 'Alle siger det samme.',
  competitiveContext: 'Et hav af ens budskaber.',
  singleMindedProposition: 'Vi gør det enkelt.',
  reasonsToBelieve: ['Bevis A', 'Bevis B'],
  desiredResponse: 'Jeg vil prøve det.',
  springboards: [{ title: 'Vinkel', insight: 'Indsigt' }],
  strategicSummary: 'Samlet set: enkelhed vinder.',
};

const channelMatrix: ChannelMatrix = {
  channels: [
    {
      channel: 'OOH',
      format: 'Billboard',
      headline: 'Stor overskrift',
      keyMessage: 'Kernebudskab',
      script: [{ label: 'Headline', content: 'Tekst på plakaten' }],
      productionNotes: 'Print stort',
      cta: 'Besøg os',
    },
    {
      channel: 'Radio',
      format: '20 sek spot',
      headline: 'Lyt nu',
      keyMessage: 'Hør forskellen',
      script: [{ label: 'VO', content: 'Speak her' }],
      productionNotes: 'Indspil i studie',
      cta: 'Ring i dag',
    },
  ],
};

const output = {
  directUsable: { bestHeadline: 'BH', bestShortText: 'BS', bestCta: 'Kom i gang nu', bestLinkedinStart: 'BL' },
  cviSuggestion: {
    brandColors: [
      { hex: '#112233', name: 'Mørk', useCase: 'Baggrund' },
      { hex: '#ff8800', name: 'Accent', useCase: 'Fremhæv' },
    ],
    fonts: { primaryHeadings: 'Inter', bodyText: 'Georgia', description: '' },
    imageStyleGuidelines: '',
    graphicElementsRules: '',
    generalBrandIdentitySummary: '',
    logoUsageRules: '',
    visualIdentityConcept: 'Rent og moderne.',
  },
} as unknown as BrandSurfaceOutput;

const fullInput: DeckInput = { brief, territory, strategy, channelMatrix, output };

describe('buildDeckHtml', () => {
  it('produces a valid self-contained HTML deck', () => {
    const html = buildDeckHtml(fullInput);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html lang="da">');
    expect(html).toContain('scroll-snap-type');
  });

  it('includes the full narrative arc from state', () => {
    const html = buildDeckHtml(fullInput);
    expect(html).toContain('Acme'); // cover client
    expect(html).toContain('Den store knivskarpe idé'); // big idea
    expect(html).toContain('En sælgende tagline'); // tagline
    expect(html).toContain('Alle siger det samme.'); // tension
    expect(html).toContain('Målgruppen føler sig overset.'); // audience truth
    expect(html).toContain('Vi gør det enkelt.'); // SMP
    expect(html).toContain('Et mobiliserende manifest om forandring.'); // manifesto
    expect(html).toContain('Den vinder fordi den er konkret.'); // rationale
    expect(html).toContain('Kom i gang nu'); // best CTA
  });

  it('renders one slide per channel', () => {
    const html = buildDeckHtml(fullInput);
    expect(html).toContain('Billboard');
    expect(html).toContain('Stor overskrift');
    expect(html).toContain('Lyt nu');
    const channelSlides = (html.match(/class="slide channel"/g) || []).length;
    expect(channelSlides).toBe(2);
  });

  it('applies brand colours from cviSuggestion to the theme', () => {
    const html = buildDeckHtml(fullInput);
    expect(html).toContain('--deck-primary:#112233');
    expect(html).toContain('--deck-accent:#ff8800');
  });

  it('falls back to brand orange when no brand colours are present', () => {
    const html = buildDeckHtml({ brief, territory });
    expect(html).toContain('--deck-primary:#f97316');
  });

  it('degrades gracefully with only a territory (minimum viable deck)', () => {
    const html = buildDeckHtml({ brief, territory });
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('Den store knivskarpe idé');
    // No strategy/channel/cvi slides
    expect(html).not.toContain('Udfordringen');
    expect(html).not.toContain('class="slide channel"');
    expect(html).not.toContain('Visuel identitet');
  });

  it('escapes HTML special characters in content', () => {
    const html = buildDeckHtml({
      brief,
      territory: { ...territory, bigIdea: '<script>alert("xss")</script>' },
    });
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&lt;script&gt;');
  });

  it('inlines raw SVG logo markup when provided', () => {
    const html = buildDeckHtml({ brief, territory, logoSvg: '<svg id="brand-logo"></svg>' });
    expect(html).toContain('<svg id="brand-logo">');
  });
});
