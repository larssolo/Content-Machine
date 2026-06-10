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
  buildEffectiveness,
  buildTerritoryCritique,
  buildTerritorySharpen,
  territoryFullText,
  campaignContextText,
  strategyContextText,
  briefIntakeText,
  refineInstruction,
  cacheableSystem,
  buildImagePrompt,
} from './prompts';

const sampleTerritory = {
  name: 'Rute Alfa',
  bigIdea: 'En knivskarp idé',
  tagline: 'Slagkraftig tagline',
  manifesto: 'Mobiliserende manifest.',
  strategicRoot: 'Bygger på en spænding.',
  channelExpressions: [{ channel: 'Film', idea: '30-sek film' }],
  toneDescriptor: 'Modig',
  rationale: 'Den vinder.',
};

describe('territoryFullText', () => {
  it('serialises all territory fields including channel expressions', () => {
    const text = territoryFullText(sampleTerritory);
    expect(text).toContain('En knivskarp idé');
    expect(text).toContain('Slagkraftig tagline');
    expect(text).toContain('Film: 30-sek film');
    expect(text).toContain('Den vinder.');
  });

  it('does not crash when channelExpressions is missing', () => {
    expect(() => territoryFullText({ bigIdea: 'x' } as any)).not.toThrow();
  });
});

describe('buildTerritoryCritique', () => {
  it('includes the CSO pressure-test role and the territory', () => {
    const { system, user } = buildTerritoryCritique({ client: 'Acme' }, sampleTerritory);
    const systemText = system.map((b) => b.text).join('\n');
    expect(systemText).toContain('Chief Strategy Officer');
    expect(user).toContain('En knivskarp idé');
    expect(user).toContain('Acme');
  });

  it('injects strategy foundation when provided', () => {
    const { user } = buildTerritoryCritique({ client: 'Acme' }, sampleTerritory, {
      singleMindedProposition: 'Vi gør det enkelt.',
      audienceTruth: 'De er overset.',
    } as any);
    expect(user).toContain('Vi gør det enkelt.');
  });
});

describe('buildEffectiveness', () => {
  it('includes the effectiveness role, the chosen idea and the channels to measure', () => {
    const { system, user } = buildEffectiveness(
      { client: 'Acme', project: 'Launch', language: 'Dansk' },
      { name: 'Rute Alfa', bigIdea: 'En knivskarp idé', tagline: 'Slagkraftig' },
      null,
      ['Film', 'OOH', 'Social'],
    );
    const systemText = system.map((b) => b.text).join('\n');
    expect(systemText).toContain('Head of Effectiveness');
    expect(systemText).toContain('Binet'); // Binet & Field
    expect(user).toContain('En knivskarp idé');
    expect(user).toContain('Film, OOH, Social');
    expect(user).toContain('Acme');
  });

  it('falls back to brief channels when no explicit channels given', () => {
    const { user } = buildEffectiveness(
      { client: 'Acme', channels: ['Radio'] },
      { bigIdea: 'x', tagline: 'y' },
    );
    expect(user).toContain('Radio');
  });

  it('threads strategy foundation when provided', () => {
    const { user } = buildEffectiveness(
      { client: 'Acme' },
      { bigIdea: 'x', tagline: 'y' },
      { singleMindedProposition: 'Vi gør det enkelt.', audienceTruth: 'De er overset.' } as any,
    );
    expect(user).toContain('Vi gør det enkelt.');
  });
});

describe('buildTerritorySharpen', () => {
  it('threads the critique findings into the ECD sharpening prompt', () => {
    const { system, user } = buildTerritorySharpen({ client: 'Acme' }, sampleTerritory, {
      distinctivenessScore: 40,
      weaknesses: ['For generisk'],
      provocations: ['Hvad er det uventede?'],
      killCriterion: 'Konkurrenten ejer allerede dette.',
      verdict: 'Skal skærpes.',
    });
    const systemText = system.map((b) => b.text).join('\n');
    expect(systemText).toContain('Executive Creative Director');
    expect(user).toContain('For generisk');
    expect(user).toContain('Hvad er det uventede?');
    expect(user).toContain('Konkurrenten ejer allerede dette.');
    expect(user).toContain('En knivskarp idé');
  });
});

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
    expect(system[0].text).toContain('Neura Studio Produktionsassistent');
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

describe('briefIntakeText (rigere brief-intake)', () => {
  it('renders only the filled structured fields', () => {
    const text = briefIntakeText({ businessGoal: '+5% markedsandel', budget: '1M media' });
    expect(text).toContain('STRATEGISK INTAKE');
    expect(text).toContain('+5% markedsandel');
    expect(text).toContain('1M media');
    // Unfilled fields are omitted entirely (no empty "N/A" noise)
    expect(text).not.toContain('Konkurrenter');
    expect(text).not.toContain('Mandatories');
  });

  it('returns an empty string when no intake fields are set', () => {
    expect(briefIntakeText({ client: 'Acme' })).toBe('');
    expect(briefIntakeText({ businessGoal: '   ' })).toBe('');
  });

  it('labels competitors and mandatories with their strategic intent', () => {
    const text = briefIntakeText({ competitors: 'Brand A, Brand B', mandatories: 'logo skal med' });
    expect(text).toContain('Konkurrenter (undgå deres positioner): Brand A, Brand B');
    expect(text).toContain('Mandatories (skal med / må ikke bruges): logo skal med');
  });

  it('flows into the strategy prompt so the foundation is grounded in client KPIs', () => {
    const { user } = buildStrategy({ client: 'Acme', businessGoal: '+10pp kendskab', competitors: 'Rival' });
    expect(user).toContain('STRATEGISK INTAKE');
    expect(user).toContain('+10pp kendskab');
    expect(user).toContain('Rival');
  });

  it('flows into the effectiveness prompt so KPI targets can use real benchmarks', () => {
    const { user } = buildEffectiveness(
      { client: 'Acme', businessGoal: '200 leads pr. kvartal' },
      { bigIdea: 'Stor idé', tagline: 'Tag' },
    );
    expect(user).toContain('200 leads pr. kvartal');
  });

  it('is omitted from prompts when the brief has no intake data', () => {
    const { user } = buildStrategy({ client: 'Acme' });
    expect(user).not.toContain('STRATEGISK INTAKE');
  });
});

describe('buildImagePrompt', () => {
  const brief: any = { client: 'Modaxo', project: 'Move 2026', description: 'mobility', audience: 'byer', tone: 'modig' };

  it('translate-mode beder om en engelsk billed-prompt og inkluderer brief-kontekst', () => {
    const { system, user } = buildImagePrompt(brief, 'en blå bil i regn', 'translate');
    expect(system.length).toBeGreaterThan(0);
    expect(user).toContain('Modaxo');
    expect(user).toContain('en blå bil i regn');
    expect(user.toLowerCase()).toContain('engelsk');
  });

  it('refine-mode skærper den eksisterende prompt', () => {
    const { user } = buildImagePrompt(brief, 'a blue car', 'refine');
    expect(user).toContain('a blue car');
    expect(user.toLowerCase()).toContain('forfin');
  });
});
