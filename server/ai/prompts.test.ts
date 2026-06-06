import { describe, it, expect } from 'vitest';
import {
  buildGenerate,
  buildRefine,
  buildVariants,
  buildCreativePush,
  buildSynthesize,
  buildBigIdea,
  buildStrategy,
  buildChannelMatrix,
  campaignContextText,
  strategyContextText,
  refineInstruction,
  cacheableSystem,
} from './prompts';

describe('cacheableSystem', () => {
  it('marks only the last block with cache_control and filters empty blocks', () => {
    const blocks = cacheableSystem(['a', '', '  ', 'b']);
    expect(blocks).toHaveLength(2);
    expect((blocks[0] as any).cache_control).toBeUndefined();
    expect((blocks[1] as any).cache_control).toEqual({ type: 'ephemeral' });
  });
});

describe('buildGenerate', () => {
  const baseBrief = { client: 'Acme', project: 'Launch', description: 'x', language: 'Dansk' };

  it('includes the static role and the brief fields', () => {
    const { system, user } = buildGenerate(baseBrief);
    expect(system).toHaveLength(1);
    expect(system[0].text).toContain('Content Machine Produktionsassistent');
    expect(user).toContain('Acme');
    expect(user).toContain('Launch');
    expect(user).toContain('Dansk');
  });

  it('adds a cached CVI block when cviManual is present', () => {
    const { system } = buildGenerate({
      ...baseBrief,
      cviManual: { brandColors: ['#FF5400 - Orange'] },
    });
    expect(system).toHaveLength(2);
    expect(system[1].text).toContain('#FF5400');
    expect((system[1] as any).cache_control).toEqual({ type: 'ephemeral' });
  });

  it('stays unchanged when no chosen idea is passed (regression)', () => {
    const { user } = buildGenerate(baseBrief);
    expect(user).not.toContain('VALGT KAMPAGNE-PLATFORM');
  });

  it('injects the chosen campaign platform into the user text (coherence contract)', () => {
    const { user } = buildGenerate(baseBrief, {
      name: 'Rute X',
      bigIdea: 'Verden venter ikke',
      tagline: 'Kom i bevægelse',
    });
    expect(user).toContain('VALGT KAMPAGNE-PLATFORM');
    expect(user).toContain('Verden venter ikke');
    expect(user).toContain('Kom i bevægelse');
  });
});

describe('buildBigIdea', () => {
  it('casts the ECD and embeds the brief fields', () => {
    const { system, user } = buildBigIdea({ client: 'Acme', project: 'Launch', language: 'Dansk' });
    expect(system[0].text).toContain('Executive Creative Director');
    expect(user).toContain('Acme');
    expect(user).toContain('Launch');
    expect(user).toContain('TRE konkurrerende');
  });

  it('stays unchanged when no strategy is passed (regression)', () => {
    const { user } = buildBigIdea({ client: 'Acme', project: 'Launch', language: 'Dansk' });
    expect(user).not.toContain('STRATEGISK FUNDAMENT');
  });

  it('injects the strategy foundation when present (feeds the idea engine)', () => {
    const { user } = buildBigIdea(
      { client: 'Acme', project: 'Launch', language: 'Dansk' },
      { singleMindedProposition: 'Tid er den nye luksus', audienceTruth: 'De drukner i valg' },
    );
    expect(user).toContain('STRATEGISK FUNDAMENT');
    expect(user).toContain('Tid er den nye luksus');
    expect(user).toContain('De drukner i valg');
  });
});

describe('buildStrategy', () => {
  it('casts the Head of Strategy and embeds the brief fields', () => {
    const { system, user } = buildStrategy({ client: 'Acme', project: 'Launch', language: 'Dansk' });
    expect(system[0].text).toContain('Chefstrateg');
    expect(user).toContain('Acme');
    expect(user).toContain('Launch');
    expect(user).toContain('strategiske fundament');
  });

  it('adds a cached CVI block when cviManual is present', () => {
    const { system } = buildStrategy({
      client: 'Acme',
      cviManual: { brandColors: ['#FF5400 - Orange'] },
    });
    expect(system).toHaveLength(2);
    expect((system[1] as any).cache_control).toEqual({ type: 'ephemeral' });
  });
});

describe('strategyContextText', () => {
  it('renders the foundation as an injectable context block', () => {
    const txt = strategyContextText({
      singleMindedProposition: 'Det enkle løfte',
      audienceTruth: 'En reel indsigt',
      reasonsToBelieve: ['Bevis A', 'Bevis B'],
      springboards: [{ title: 'Afsæt 1', insight: 'Vinkel 1' }],
    });
    expect(txt).toContain('STRATEGISK FUNDAMENT');
    expect(txt).toContain('Det enkle løfte');
    expect(txt).toContain('Bevis A');
    expect(txt).toContain('Afsæt 1');
  });

  it('returns empty string when there is no foundation', () => {
    expect(strategyContextText({})).toBe('');
  });

  it('does not crash when array fields are missing (robusthed)', () => {
    expect(() => strategyContextText({ singleMindedProposition: 'x' } as any)).not.toThrow();
  });
});

describe('campaignContextText', () => {
  it('renders the chosen idea as an injectable context block', () => {
    const txt = campaignContextText({ name: 'Rute X', bigIdea: 'Stor idé her', tagline: 'Tagline her' });
    expect(txt).toContain('VALGT KAMPAGNE-PLATFORM');
    expect(txt).toContain('Stor idé her');
    expect(txt).toContain('Tagline her');
  });

  it('returns empty string when there is no idea', () => {
    expect(campaignContextText({})).toBe('');
  });
});

describe('buildChannelMatrix', () => {
  const baseBrief = { client: 'Acme', project: 'Launch', language: 'Dansk', channels: ['LinkedIn'] };
  const chosenIdea = {
    name: 'Rute X',
    bigIdea: 'Verden venter ikke',
    tagline: 'Kom i bevægelse',
    channelExpressions: [{ channel: 'Film', idea: 'En 30-sek hero-film' }],
  };

  it('casts the Omni-channel director and threads the chosen idea + channel seeds', () => {
    const { system, user } = buildChannelMatrix(baseBrief, chosenIdea);
    expect(system[0].text).toContain('Omni-channel Creative Director');
    expect(user).toContain('VALGT KAMPAGNE-PLATFORM');
    expect(user).toContain('Verden venter ikke');
    expect(user).toContain('KANAL-FRØ');
    expect(user).toContain('En 30-sek hero-film');
    expect(user).toContain('omni-channel matrix');
  });

  it('injects the strategy foundation when present (forankring)', () => {
    const { user } = buildChannelMatrix(baseBrief, chosenIdea, {
      singleMindedProposition: 'Tid er den nye luksus',
    });
    expect(user).toContain('STRATEGISK FUNDAMENT');
    expect(user).toContain('Tid er den nye luksus');
  });

  it('stays free of strategy block when none is passed (regression)', () => {
    const { user } = buildChannelMatrix(baseBrief, chosenIdea);
    expect(user).not.toContain('STRATEGISK FUNDAMENT');
  });

  it('does not crash when channelExpressions is missing (robusthed)', () => {
    expect(() => buildChannelMatrix(baseBrief, { bigIdea: 'x', tagline: 'y' } as any)).not.toThrow();
  });
});

describe('refineInstruction', () => {
  it('maps the built-in commands', () => {
    expect(refineInstruction('/shorten')).toContain('kortere');
    expect(refineInstruction('/punchier')).toContain('punchy');
    expect(refineInstruction('/translate-en')).toContain('engelsk');
  });

  it('passes free-text commands through unchanged', () => {
    expect(refineInstruction('Gør den sjovere')).toBe('Gør den sjovere');
  });
});

describe('buildRefine', () => {
  it('embeds the text, the command instruction and the language', () => {
    const { system, user } = buildRefine('Hej verden', '/shorten', {
      language: 'Dansk',
      client: 'Acme',
    });
    expect(system[0].text).toContain('tekstforfatter');
    expect(user).toContain('Hej verden');
    expect(user).toContain('kortere');
    expect(user).toContain('Dansk');
  });
});

describe('buildVariants', () => {
  it('asks for the requested count and embeds the text + language', () => {
    const { system, user } = buildVariants('Original tekst', 2, { language: 'Dansk' });
    expect(system[0].text).toContain('alternative versioner');
    expect(user).toContain('præcis 2');
    expect(user).toContain('Original tekst');
    expect(user).toContain('Dansk');
  });
});

describe('buildCreativePush', () => {
  it('casts the Creative Director and embeds a draft headline, a cliché and the language', () => {
    const draft = { headlines: ['Den gamle overskrift'], linkedinPost: 'En krog her\nResten', shortCaseText: 'Kort' };
    const critique = { clichesFound: ['synergieffekter'], overallReview: 'For tam.' };
    const { system, user } = buildCreativePush(draft, critique, { language: 'Dansk', tone: 'skarp' });
    expect(system[0].text).toContain('Kreativ Direktør');
    expect(user).toContain('Den gamle overskrift');
    expect(user).toContain('synergieffekter');
    expect(user).toContain('Dansk');
  });

  it('does not crash when the model returns non-array fields (robusthed)', () => {
    const draft = { headlines: 'ikke en liste', linkedinPost: 'Krog', shortCaseText: 'Kort' } as any;
    const critique = { clichesFound: 'synergi, banebrydende', overallReview: 'tam' } as any;
    expect(() => buildCreativePush(draft, critique, { language: 'Dansk' })).not.toThrow();
  });
});

describe('buildSynthesize', () => {
  const draft = { shortCaseText: 'Kort', longCaseText: 'Lang', linkedinPost: 'Krog', headlines: ['H1'] };
  const critique = { clichesFound: ['banebrydende'], clicheScore: 60, concretenessScore: 55, humanScore: 70, evaluations: [], overallReview: 'Ok.' };
  const creative = { boldHeadlines: ['Dristig overskrift'], boldHooks: ['Dristig krog'], angles: ['Ny vinkel'] };

  it('includes both the editor role and the generation role, and the three input blocks', () => {
    const { system, user } = buildSynthesize(draft, critique, creative, { client: 'Acme', project: 'Launch', language: 'Dansk' });
    const systemText = system.map((b) => b.text).join('\n');
    expect(systemText).toContain('Chefredaktør');
    expect(systemText).toContain('Produktionsassistent'); // GENERATE_SYSTEM_ROLE inherited
    expect(user).toContain('FØRSTEUDKAST');
    expect(user).toContain('REDAKTIONEL KRITIK');
    expect(user).toContain('KREATIVE ALTERNATIVER');
    expect(user).toContain('banebrydende');
    expect(user).toContain('Dristig overskrift');
    expect(user).toContain('Acme');
  });

  it('marks the last system block (CVI when present) as the cache boundary', () => {
    const { system } = buildSynthesize(draft, critique, creative, {
      client: 'Acme',
      cviManual: { brandColors: ['#FF5400 - Orange'] },
    });
    const last = system[system.length - 1] as any;
    expect(last.text).toContain('#FF5400');
    expect(last.cache_control).toEqual({ type: 'ephemeral' });
  });

  it('does not crash when model fields are non-arrays (robusthed)', () => {
    const badDraft = { headlines: 'x', cta: 'y', mailchimpSubjects: 'z', shortCaseText: 'a' } as any;
    const badCritique = { clichesFound: 'a, b', evaluations: 'nej', overallReview: 'ok' } as any;
    const badCreative = { boldHeadlines: 'h', boldHooks: 'k', angles: 'v' } as any;
    expect(() => buildSynthesize(badDraft, badCritique, badCreative, { client: 'Acme' })).not.toThrow();
  });
});
