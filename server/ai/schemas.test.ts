import { describe, it, expect } from 'vitest';
import {
  generateTool,
  analyzeTool,
  analyzeCviTool,
  humanizeTool,
  variantsTool,
  creativeTool,
  visualConceptTool,
  visualCritiqueTool,
  visualDirectionsTool,
} from './schemas';

describe('generateTool', () => {
  it('requires all 14 top-level fields (matches the old Gemini schema)', () => {
    const req = (generateTool.input_schema as any).required;
    expect(req).toEqual([
      'shortCaseText',
      'longCaseText',
      'linkedinPost',
      'headlines',
      'keywords',
      'cta',
      'english',
      'imagePrompts',
      'mailchimpSubjects',
      'productionProposed',
      'production',
      'directUsable',
      'toneAnalysis',
      'cviSuggestion',
    ]);
  });

  it('uses a strict enum for the toneAnalysis evaluation status', () => {
    const props = (generateTool.input_schema as any).properties;
    const status = props.toneAnalysis.properties.evaluations.items.properties.status;
    expect(status.enum).toEqual(['passed', 'warning', 'failed']);
  });

  it('keeps cviSuggestion.brandColors as an object array and includes visualIdentityConcept', () => {
    const cvi = (generateTool.input_schema as any).properties.cviSuggestion;
    expect(cvi.properties.brandColors.items.type).toBe('object');
    expect(cvi.required).toContain('visualIdentityConcept');
  });
});

describe('analyzeTool', () => {
  it('enforces the status enum', () => {
    const status = (analyzeTool.input_schema as any).properties.evaluations.items.properties.status;
    expect(status.enum).toEqual(['passed', 'warning', 'failed']);
  });
});

describe('analyzeCviTool', () => {
  it('keeps brandColors as a string array (CviManual contract)', () => {
    const bc = (analyzeCviTool.input_schema as any).properties.brandColors;
    expect(bc.type).toBe('array');
    expect(bc.items.type).toBe('string');
  });
});

describe('humanizeTool', () => {
  it('requires the humanizer result fields', () => {
    const req = (humanizeTool.input_schema as any).required;
    expect(req).toEqual([
      'originalAiScore',
      'clichesDetected',
      'humanizedText',
      'humanizedAiScore',
      'improvements',
    ]);
  });
});

describe('variantsTool', () => {
  it('requires a string array of variants', () => {
    const props = (variantsTool.input_schema as any).properties;
    expect(props.variants.type).toBe('array');
    expect(props.variants.items.type).toBe('string');
    expect((variantsTool.input_schema as any).required).toEqual(['variants']);
  });
});

describe('creativeTool', () => {
  it('is named submit_creative_directions and requires the three idea arrays', () => {
    expect(creativeTool.name).toBe('submit_creative_directions');
    expect((creativeTool.input_schema as any).required).toEqual(['boldHeadlines', 'boldHooks', 'angles']);
  });

  it('types each direction field as a string array', () => {
    const props = (creativeTool.input_schema as any).properties;
    for (const key of ['boldHeadlines', 'boldHooks', 'angles']) {
      expect(props[key].type).toBe('array');
      expect(props[key].items.type).toBe('string');
    }
  });
});

describe('visual tools', () => {
  it('visualConceptTool returns concept + imagePrompts + moodKeywords', () => {
    expect(visualConceptTool.name).toBe('submit_visual_concept');
    const schema = visualConceptTool.input_schema as any;
    expect(schema.required).toEqual(['visualConcept', 'imagePrompts', 'moodKeywords']);
    expect(schema.properties.imagePrompts.required).toEqual(['hero', 'detail', 'abstract']);
    expect(schema.properties.moodKeywords.items.type).toBe('string');
  });

  it('visualCritiqueTool exposes the three visual scores', () => {
    expect(visualCritiqueTool.name).toBe('submit_visual_critique');
    expect((visualCritiqueTool.input_schema as any).required).toEqual([
      'onBrandScore',
      'specificityScore',
      'originalityScore',
      'weaknesses',
      'overallReview',
    ]);
  });

  it('visualDirectionsTool requires the three idea arrays', () => {
    expect(visualDirectionsTool.name).toBe('submit_visual_directions');
    const props = (visualDirectionsTool.input_schema as any).properties;
    for (const key of ['boldVisuals', 'lightingAndColor', 'compositions']) {
      expect(props[key].type).toBe('array');
      expect(props[key].items.type).toBe('string');
    }
    expect((visualDirectionsTool.input_schema as any).required).toEqual([
      'boldVisuals',
      'lightingAndColor',
      'compositions',
    ]);
  });
});
