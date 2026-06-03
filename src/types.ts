/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CviManual {
  brandColors: string[];
  fonts: {
    primaryHeadings: string;
    bodyText: string;
    description: string;
  };
  imageStyleGuidelines: string;
  graphicElementsRules: string;
  generalBrandIdentitySummary: string;
  logoUsageRules: string;
}

export interface ProjectBrief {
  client: string;
  project: string;
  description: string;
  details: string;
  audience: string;
  tone: string;
  language: string;
  channels: string[];
  notes: string;
  cviManual?: CviManual | null;
}

export interface DirectUsable {
  bestHeadline: string;
  bestShortText: string;
  bestCta: string;
  bestLinkedinStart: string;
}

export interface ImagePrompts {
  hero: string;
  detail: string;
  abstract: string;
}

export interface ProductionSuggestions {
  missingImages: string[];
  suggestedFormats: string[];
  heroVisual: string;
  someFormat: string;
  newsletterSection: string;
  cta: string;
}

export interface EnglishVersion {
  shortCaseText: string;
  longCaseText: string;
  linkedinPost: string;
  headlines: string[];
}

export interface RuleEvaluation {
  ruleName: string;
  status: 'passed' | 'warning' | 'failed';
  score: number;
  feedback: string;
}

export interface BrandColorDetail {
  hex: string;
  name: string;
  useCase: string;
}

export interface CviSuggestion {
  brandColors: BrandColorDetail[];
  fonts: {
    primaryHeadings: string;
    bodyText: string;
    description: string;
  };
  imageStyleGuidelines: string;
  graphicElementsRules: string;
  generalBrandIdentitySummary: string;
  logoUsageRules: string;
  visualIdentityConcept: string;
}

export interface ToneAnalysis {
  clichesFound: string[];
  clicheScore: number;
  concretenessScore: number;
  humanScore: number;
  evaluations: RuleEvaluation[];
  overallReview: string;
}

export interface BrandSurfaceOutput {
  shortCaseText: string;
  longCaseText: string;
  linkedinPost: string;
  headlines: string[];
  keywords: string[];
  cta: string[];
  english: EnglishVersion;
  imagePrompts: ImagePrompts;
  mailchimpSubjects: string[];
  productionProposed: boolean;
  production: ProductionSuggestions | null;
  directUsable: DirectUsable;
  toneAnalysis?: ToneAnalysis;
  cviSuggestion?: CviSuggestion | null;
}

export interface PresetBrief {
  name: string;
  brief: ProjectBrief;
}

export interface HumanizerResult {
  originalAiScore: number;
  clichesDetected: string[];
  humanizedText: string;
  humanizedAiScore: number;
  improvements: string[];
}

