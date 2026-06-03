import { describe, it, expect } from 'vitest';
import {
  buildGenerate,
  buildRefine,
  buildVariants,
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
    expect(system[0].text).toContain('Brand Surface Produktionsassistent');
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
