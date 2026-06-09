/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type Anthropic from '@anthropic-ai/sdk';

// Genbrugt regel-evaluerings-skema (toneanalyse). 'status' er nu et strikt enum,
// så det altid matcher frontendens RuleEvaluation-union.
const evaluationItems = {
  type: 'object',
  properties: {
    ruleName: {
      type: 'string',
      description:
        "F.eks 'Undgå floskler', 'Fysiske/digitale leverancer til stede', 'Menneskelig tone'",
    },
    status: {
      type: 'string',
      enum: ['passed', 'warning', 'failed'],
      description: "Skal være 'passed', 'warning', eller 'failed'.",
    },
    score: { type: 'integer', description: 'Score fra 0 til 100 for denne specifikke regel.' },
    feedback: {
      type: 'string',
      description: 'Konstruktiv uddybning og specifik feedback på dansk om reglens overholdelse.',
    },
  },
  required: ['ruleName', 'status', 'score', 'feedback'],
} as const;

// --- /api/generate -----------------------------------------------------------

export const generateTool: Anthropic.Tool = {
  name: 'submit_brand_surface_output',
  description: 'Aflever hele Neura Studio content-pakken som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      shortCaseText: {
        type: 'string',
        description:
          'Kort, præcis og fængende case-tekst (ca. 100-150 ord). Konkret og konkret om leverancen.',
      },
      longCaseText: {
        type: 'string',
        description:
          'Længere og mere struktureret case-tekst til hjemmesiden (ca. 250-400 ord). Opbyg med konkrete leverancer, milepæle og detaljer.',
      },
      linkedinPost: {
        type: 'string',
        description:
          'Professionelt, levende og engagerende LinkedIn-opslag med afsnit, konkrete resultater, professionel krog og Call To Action. Sparsom brug af emojis (kun absolut relevante) uden spam.',
      },
      headlines: {
        type: 'array',
        items: { type: 'string' },
        description: '5 korte og stærke overskrifter i overensstemmelse med bureauets stil.',
      },
      keywords: {
        type: 'array',
        items: { type: 'string' },
        description: '8-10 vigtige keywords og søgetermer relateret til projektet.',
      },
      cta: {
        type: 'array',
        items: { type: 'string' },
        description: '3 stærke call-to-actions (direkte, blød, kreativ).',
      },
      english: {
        type: 'object',
        properties: {
          shortCaseText: { type: 'string', description: 'English version of the short case text.' },
          longCaseText: { type: 'string', description: 'English version of the long case text.' },
          linkedinPost: { type: 'string', description: 'English version of the LinkedIn post.' },
          headlines: {
            type: 'array',
            items: { type: 'string' },
            description: 'English version of the strong headlines.',
          },
        },
        required: ['shortCaseText', 'longCaseText', 'linkedinPost', 'headlines'],
      },
      imagePrompts: {
        type: 'object',
        properties: {
          hero: {
            type: 'string',
            description:
              'Hero image prompt (English). High production value, lighting, visual style, camera angle, mood.',
          },
          detail: {
            type: 'string',
            description:
              'Detail/close-up prompt (English). Macro or detailed view, focus on mechanics, design details, texture, lighting.',
          },
          abstract: {
            type: 'string',
            description:
              'Abstract background prompt (English). Colors, motion, lighting, textures representing the event/brand spirit.',
          },
        },
        required: ['hero', 'detail', 'abstract'],
      },
      mailchimpSubjects: {
        type: 'array',
        items: { type: 'string' },
        description:
          '4 stærke subject lines til nyhedsbrevet (Mailchimp) - både direkte og nysgerrighedsskabende.',
      },
      productionProposed: {
        type: 'boolean',
        description: 'True if the project is related to graphic, event, 3D, web or newsletter.',
      },
      production: {
        type: 'object',
        properties: {
          missingImages: {
            type: 'array',
            items: { type: 'string' },
            description: 'Suggestions of elements/visuals currently missing from documentations.',
          },
          suggestedFormats: {
            type: 'array',
            items: { type: 'string' },
            description: 'Specifications of recommended media sizes / ratios to package.',
          },
          heroVisual: {
            type: 'string',
            description: 'Proposal for the main dynamic hero screen visual asset idea.',
          },
          someFormat: {
            type: 'string',
            description: 'Creative suggestion for custom SoMe animation or carousel structure.',
          },
          newsletterSection: {
            type: 'string',
            description: 'Outline or arrangement proposal for Mailchimp sections.',
          },
          cta: { type: 'string', description: 'Event-focused production Call To Action proposal.' },
        },
        required: [
          'missingImages',
          'suggestedFormats',
          'heroVisual',
          'someFormat',
          'newsletterSection',
          'cta',
        ],
      },
      directUsable: {
        type: 'object',
        properties: {
          bestHeadline: { type: 'string', description: 'Den absolut bedste overskrift.' },
          bestShortText: { type: 'string', description: 'Den absolut bedste korte tekst.' },
          bestCta: { type: 'string', description: 'Den absolut bedste CTA.' },
          bestLinkedinStart: {
            type: 'string',
            description: 'Den sjoveste/bedste LinkedIn startlinje (hook).',
          },
        },
        required: ['bestHeadline', 'bestShortText', 'bestCta', 'bestLinkedinStart'],
      },
      toneAnalysis: {
        type: 'object',
        properties: {
          clichesFound: {
            type: 'array',
            items: { type: 'string' },
            description:
              "Eventuelle floskler eller unødvendige klichéer fundet i de genererede tekster (f.eks. 'opleve ud over det sædvanlige', 'synergy' osv.). Listen skal være tom hvis ingen klichéer findes.",
          },
          clicheScore: {
            type: 'integer',
            description:
              'Score fra 0 til 100 for frihed for klichéer og floskler. 100 betyder fuldstændig fri for tom marketing-sludder, 0 betyder udelukkende floskler.',
          },
          concretenessScore: {
            type: 'integer',
            description:
              'Score for konkrethed fra 0 til 100. Er der rige, konkrete leverance-detaljer (såsom størrelser, karakterer, tal, formater) i stedet for overfladisk snak.',
          },
          humanScore: {
            type: 'integer',
            description:
              'Score for menneskelighed og personlig nerve fra 0 til 100. Føles det levende, udtalt og direkte professionelt, frem for stift maskinskrevet robot-corporate.',
          },
          evaluations: { type: 'array', items: evaluationItems },
          overallReview: {
            type: 'string',
            description:
              'Samlet kvalitetsvurdering og redaktionel dom baseret på bureauets retningslinjer (ca. 40-75 ord).',
          },
        },
        required: [
          'clichesFound',
          'clicheScore',
          'concretenessScore',
          'humanScore',
          'evaluations',
          'overallReview',
        ],
      },
      cviSuggestion: {
        type: 'object',
        properties: {
          brandColors: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                hex: { type: 'string', description: 'HEX-farvekode, f.eks #FF5400' },
                name: {
                  type: 'string',
                  description: "Navn til farven, f.eks 'Brand Orange' eller 'Cosmic Anthracite'",
                },
                useCase: { type: 'string', description: 'Hvad farven skal bruges til i layouts' },
              },
              required: ['hex', 'name', 'useCase'],
            },
            description: 'Foreslåede 3-4 brand-farvekoder med navne og brugsområder.',
          },
          fonts: {
            type: 'object',
            properties: {
              primaryHeadings: {
                type: 'string',
                description: "Anbefalet overskriftsfont, f.eks 'Space Grotesk' eller 'Outfit'",
              },
              bodyText: {
                type: 'string',
                description: "Anbefalet brødtekstfont, f.eks 'Inter' eller 'Plus Jakarta Sans'",
              },
              description: { type: 'string', description: 'Kort begrundelse for dette valg af typografi' },
            },
            required: ['primaryHeadings', 'bodyText', 'description'],
          },
          imageStyleGuidelines: {
            type: 'string',
            description: 'Definition og instruktioner af billedstil og fotomanual baseret på projektet',
          },
          graphicElementsRules: {
            type: 'string',
            description:
              'Vigtigste grafiske elementer og opsætningsregler, f.eks brug af bento grid, kraftige skygger, minimalisme, runde hjørner eller kantet asymmetriske linjer',
          },
          generalBrandIdentitySummary: {
            type: 'string',
            description: 'Det overordnede visuelle designkoncept (få sætninger)',
          },
          logoUsageRules: {
            type: 'string',
            description: 'Regler for brug og placering af brandets logo i layoutet',
          },
          visualIdentityConcept: {
            type: 'string',
            description: 'Kreativ forklaring af det samlede brand look & feel og dybere design-vibe',
          },
        },
        required: [
          'brandColors',
          'fonts',
          'imageStyleGuidelines',
          'graphicElementsRules',
          'generalBrandIdentitySummary',
          'logoUsageRules',
          'visualIdentityConcept',
        ],
      },
    },
    required: [
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
    ],
  },
};

// --- /api/analyze ------------------------------------------------------------

export const analyzeTool: Anthropic.Tool = {
  name: 'submit_tone_analysis',
  description: 'Aflever den redaktionelle toneanalyse som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      clichesFound: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Eventuelle floskler eller unødvendige klichéer fundet i teksterne. Skal være tom liste hvis ingen findes.',
      },
      clicheScore: {
        type: 'integer',
        description:
          'Score fra 0 til 100 for frihed for klichéer og floskler. 100 betyder fuldstændig fri for tom marketing-sludder.',
      },
      concretenessScore: {
        type: 'integer',
        description:
          'Score for konkrethed fra 0 til 100 baseret på reelle leverancer i stedet for fluffy snak.',
      },
      humanScore: { type: 'integer', description: 'Score for menneskelighed og tone fra 0 til 100.' },
      evaluations: { type: 'array', items: evaluationItems },
      overallReview: {
        type: 'string',
        description: 'Samlet redaktionel opsummering og vurdering på dansk (ca. 40-75 ord).',
      },
    },
    required: [
      'clichesFound',
      'clicheScore',
      'concretenessScore',
      'humanScore',
      'evaluations',
      'overallReview',
    ],
  },
};

// --- /api/analyze-cvi --------------------------------------------------------

export const analyzeCviTool: Anthropic.Tool = {
  name: 'submit_cvi_manual',
  description: 'Aflever de uddragne CVI/designmanual-konstanter som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      brandColors: {
        type: 'array',
        items: { type: 'string' },
        description:
          "Brand farver fundet i CVI (fx '#FF5400 - Primary Brand Orange', '#1E293B - Deep Navy'). Min 3-5 farver.",
      },
      fonts: {
        type: 'object',
        properties: {
          primaryHeadings: {
            type: 'string',
            description:
              "Anbefalet skrifttype til overskrifter (headings) baseret på CVI (fx 'Space Grotesk' eller 'Montserrat Bold').",
          },
          bodyText: {
            type: 'string',
            description: "Anbefalet skrifttype til brødtekst / body (fx 'Inter', 'Roboto' el. lign.).",
          },
          description: { type: 'string', description: 'Typografiske spilleregler eller særtræk.' },
        },
        required: ['primaryHeadings', 'bodyText', 'description'],
      },
      imageStyleGuidelines: {
        type: 'string',
        description:
          "Konkret visuel fotostil eller retningslinjer for Midjourney/Firefly prompts (fx 'cinematic, minimalist background, warm volumetric lighting').",
      },
      graphicElementsRules: {
        type: 'string',
        description: 'Regler for grafik, layouts, grid-strukturer, borders eller SoMe-opsætning.',
      },
      generalBrandIdentitySummary: {
        type: 'string',
        description: 'Et kort, fængende resumé af brandets overordnede visuelle identitet og stemning.',
      },
      logoUsageRules: {
        type: 'string',
        description: "Dogmer for placering af logo eller kritiske do's/dont's for brandets logo og markører.",
      },
    },
    required: [
      'brandColors',
      'fonts',
      'imageStyleGuidelines',
      'graphicElementsRules',
      'generalBrandIdentitySummary',
      'logoUsageRules',
    ],
  },
};

// --- /api/variants -----------------------------------------------------------

export const variantsTool: Anthropic.Tool = {
  name: 'submit_variants',
  description: 'Aflever de alternative tekstversioner som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      variants: {
        type: 'array',
        items: { type: 'string' },
        description: 'De alternative, distinkte versioner af teksten.',
      },
    },
    required: ['variants'],
  },
};

// --- deliberation: kreativ direktør ------------------------------------------

export const creativeTool: Anthropic.Tool = {
  name: 'submit_creative_directions',
  description: 'Aflever dristige, alternative kreative retninger som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      boldHeadlines: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dristige, uventede alternative overskrifter (mindst 4).',
      },
      boldHooks: {
        type: 'array',
        items: { type: 'string' },
        description: 'Skarpe alternative LinkedIn-kroge / åbningslinjer (mindst 3).',
      },
      angles: {
        type: 'array',
        items: { type: 'string' },
        description: 'Korte noter om friske kreative vinkler at forfølge (2-3).',
      },
    },
    required: ['boldHeadlines', 'boldHooks', 'angles'],
  },
};

// --- /api/humanize -----------------------------------------------------------

export const humanizeTool: Anthropic.Tool = {
  name: 'submit_humanized_text',
  description: 'Aflever den humaniserede tekst og AI-detektionsvurdering som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      originalAiScore: {
        type: 'integer',
        description: 'Estimeret oprindelig AI-robot-sandsynlighed i procent (fx 95 betyder næsten sikkert AI).',
      },
      clichesDetected: {
        type: 'array',
        items: { type: 'string' },
        description: 'De robot-vendinger eller corporate klichéer der blev opdaget i udgangsteksten.',
      },
      humanizedText: { type: 'string', description: 'Den nyskrevne organiske, menneskelige tekst.' },
      humanizedAiScore: {
        type: 'integer',
        description: 'Estimeret ny AI-robot-sandsynlighed efter omskrivning (ideelt under 10%).',
      },
      improvements: {
        type: 'array',
        items: { type: 'string' },
        description:
          "Specifikke forbedringer på dansk om, hvad der blev ændret for at gøre teksten menneskelig og sværere at detektere (fx 'Fjernede passiv form', 'Varierede sætningslængde').",
      },
    },
    required: ['originalAiScore', 'clichesDetected', 'humanizedText', 'humanizedAiScore', 'improvements'],
  },
};

// --- /api/big-idea -----------------------------------------------------------

export const campaignPlatformTool: Anthropic.Tool = {
  name: 'submit_campaign_platform',
  description: 'Aflever de tre konkurrerende kampagne-platforme (kreative ruter) som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      territories: {
        type: 'array',
        description: 'Præcis 3 distinkte, konkurrerende kreative ruter/territorier.',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Kort, fængende navn på den kreative rute/territoriet (2-4 ord).',
            },
            bigIdea: {
              type: 'string',
              description:
                'Den store idé som én knivskarp sætning — kampagnens hjerte. Modig og uventet, ikke generisk.',
            },
            tagline: {
              type: 'string',
              description: 'En kort, slagkraftig tagline/endline der fanger idéen.',
            },
            manifesto: {
              type: 'string',
              description:
                'Kort, mobiliserende manifest-copy (ca. 30-60 ord) der sælger følelsen og verdenen bag idéen.',
            },
            strategicRoot: {
              type: 'string',
              description:
                'Den strategiske indsigt eller kulturelle spænding idéen står på (1-2 sætninger).',
            },
            channelExpressions: {
              type: 'array',
              description: 'Hvordan idéen kommer til live på 4-5 forskellige kanaler.',
              items: {
                type: 'object',
                properties: {
                  channel: {
                    type: 'string',
                    description: 'Kanalen, fx Social, OOH/Outdoor, Film, Aktivering/Experiential, PR.',
                  },
                  idea: {
                    type: 'string',
                    description: 'Konkret hvordan den store idé udtrykkes på netop denne kanal.',
                  },
                },
                required: ['channel', 'idea'],
              },
            },
            toneDescriptor: {
              type: 'string',
              description: 'Kort beskrivelse af tonen/stemningen for denne rute.',
            },
            rationale: {
              type: 'string',
              description: 'Hvorfor denne rute vinder — hvad gør den stærk og mindeværdig (1-2 sætninger).',
            },
          },
          required: [
            'name',
            'bigIdea',
            'tagline',
            'manifesto',
            'strategicRoot',
            'channelExpressions',
            'toneDescriptor',
            'rationale',
          ],
        },
      },
    },
    required: ['territories'],
  },
};

// --- /api/sharpen-idea (ECD pres-test) ---------------------------------------

export const territoryCritiqueTool: Anthropic.Tool = {
  name: 'submit_territory_critique',
  description: 'Aflever den strategiske pres-test af én kreativ rute som struktureret kritik.',
  input_schema: {
    type: 'object',
    properties: {
      distinctivenessScore: {
        type: 'integer',
        description: 'Score 0-100: hvor distinkt og uventet er idéen? (100 = umulig at forveksle med konkurrenten; lav = generisk kategori-kliché).',
      },
      truthScore: {
        type: 'integer',
        description: 'Score 0-100: hvor solidt står idéen på en reel strategisk indsigt eller kulturel spænding (ikke ud af det blå)?',
      },
      elasticityScore: {
        type: 'integer',
        description: 'Score 0-100: hvor godt strækker idéen sig på tværs af kanaler og over tid uden at falde fra hinanden?',
      },
      memorabilityScore: {
        type: 'integer',
        description: 'Score 0-100: hvor mindeværdig, menneskelig og delbar er idéen?',
      },
      weaknesses: {
        type: 'array',
        description: '2-4 konkrete svagheder: hvor er idéen generisk, derivativ, risikabel eller uklar? Vær brutalt ærlig.',
        items: { type: 'string' },
      },
      provocations: {
        type: 'array',
        description: '2-3 skarpe spørgsmål den kreative direktør SKAL svare på for at skærpe idéen.',
        items: { type: 'string' },
      },
      killCriterion: {
        type: 'string',
        description: 'Den ene største risiko der kan dræbe idéen — det der ville få kunden eller kulturen til at afvise den.',
      },
      verdict: {
        type: 'string',
        description: 'Samlet strategisk dom (2-3 sætninger): står idéen, eller skal den skærpes/omtænkes?',
      },
    },
    required: [
      'distinctivenessScore',
      'truthScore',
      'elasticityScore',
      'memorabilityScore',
      'weaknesses',
      'provocations',
      'killCriterion',
      'verdict',
    ],
  },
};

export const sharpenedTerritoryTool: Anthropic.Tool = {
  name: 'submit_sharpened_territory',
  description: 'Aflever den skærpede kreative rute (samme rute, hævet et niveau) som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Rutens navn (behold eller skærp — samme rute, ikke en ny).' },
      bigIdea: {
        type: 'string',
        description: 'Den skærpede store idé som én knivskarp sætning — mere distinkt, sand og mindeværdig end før.',
      },
      tagline: { type: 'string', description: 'Skærpet tagline/endline.' },
      manifesto: { type: 'string', description: 'Skærpet manifest-copy (ca. 30-60 ord).' },
      strategicRoot: { type: 'string', description: 'Den strategiske indsigt/spænding idéen står på (skærpet hvis nødvendigt).' },
      channelExpressions: {
        type: 'array',
        description: 'Hvordan den skærpede idé kommer til live på 4-5 kanaler.',
        items: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Kanalen, fx Social, OOH, Film, Aktivering, PR.' },
            idea: { type: 'string', description: 'Konkret udtryk på netop denne kanal.' },
          },
          required: ['channel', 'idea'],
        },
      },
      toneDescriptor: { type: 'string', description: 'Tone/stemning for ruten.' },
      rationale: { type: 'string', description: 'Hvorfor den skærpede rute vinder (1-2 sætninger).' },
      whatChanged: {
        type: 'array',
        description: '2-4 konkrete punkter: hvad blev skærpet, og hvordan svarer det på pres-testens kritik?',
        items: { type: 'string' },
      },
    },
    required: [
      'name',
      'bigIdea',
      'tagline',
      'manifesto',
      'strategicRoot',
      'channelExpressions',
      'toneDescriptor',
      'rationale',
      'whatChanged',
    ],
  },
};

// --- /api/effectiveness (Effekt-lag) -----------------------------------------

export const effectivenessTool: Anthropic.Tool = {
  name: 'submit_effectiveness_framework',
  description: 'Aflever effekt-laget (mål-hierarki, KPI\'er, kort/lang-balance og måleplan) som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      businessObjective: {
        type: 'string',
        description: 'Det overordnede forretningsmål kampagnen i sidste ende skal flytte (1-2 sætninger, helst kvantificeret).',
      },
      objectives: {
        type: 'array',
        description: '3-5 mål i et hierarki fra forretning → adfærd → kommunikation, hver med en målbar KPI.',
        items: {
          type: 'object',
          properties: {
            level: {
              type: 'string',
              description: 'Niveau i mål-hierarkiet: "Forretning", "Adfærd" eller "Kommunikation".',
            },
            objective: { type: 'string', description: 'Selve målet på dette niveau.' },
            kpi: { type: 'string', description: 'Den konkrete, målbare KPI for målet.' },
            target: { type: 'string', description: 'Et realistisk, ambitiøst måltal (med enhed eller %).' },
            benchmark: { type: 'string', description: 'Branche-/baseline-benchmark KPI\'en holdes op imod.' },
            measurementMethod: { type: 'string', description: 'Hvordan måles det konkret (værktøj eller metode)?' },
          },
          required: ['level', 'objective', 'kpi', 'target', 'benchmark', 'measurementMethod'],
        },
      },
      channelKpis: {
        type: 'array',
        description: 'Pr. kanal: den primære succes-metrik (undgå vanity metrics) og hvordan den måles.',
        items: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Kanalen.' },
            primaryMetric: { type: 'string', description: 'Den vigtigste metrik for kanalen.' },
            target: { type: 'string', description: 'Realistisk måltal.' },
            measurementTool: { type: 'string', description: 'Værktøj/kilde til måling.' },
          },
          required: ['channel', 'primaryMetric', 'target', 'measurementTool'],
        },
      },
      balance: {
        type: 'object',
        description: 'Balancen mellem kortsigtet aktivering og langsigtet brand-opbygning (Binet & Field).',
        properties: {
          shortTermActivation: { type: 'string', description: 'Hvad driver kortsigtet respons/salg nu.' },
          longTermBrand: { type: 'string', description: 'Hvad bygger langsigtet brand-styrke.' },
          recommendedSplit: { type: 'string', description: 'Anbefalet budget-/fokus-split, fx "60% brand / 40% aktivering".' },
        },
        required: ['shortTermActivation', 'longTermBrand', 'recommendedSplit'],
      },
      leadingIndicators: {
        type: 'array',
        description: '2-4 tidlige signaler der indikerer at kampagnen virker (måles tidligt).',
        items: { type: 'string' },
      },
      laggingIndicators: {
        type: 'array',
        description: '2-4 outcome-metrikker der bekræfter effekt (måles senere).',
        items: { type: 'string' },
      },
      successScenario: {
        type: 'string',
        description: 'Et realistisk succes-scenarie: hvad ser vi hvis kampagnen lykkes (3-5 sætninger, konkret og kvantificeret).',
      },
      risks: {
        type: 'array',
        description: '2-3 antagelser eller risici der kan underminere effekten.',
        items: { type: 'string' },
      },
      measurementCadence: {
        type: 'string',
        description: 'Måle-kadence: hvad tracker vi hvornår (fx baseline før launch, ugentligt under, post-kampagne-evaluering).',
      },
    },
    required: [
      'businessObjective',
      'objectives',
      'channelKpis',
      'balance',
      'leadingIndicators',
      'laggingIndicators',
      'successScenario',
      'risks',
      'measurementCadence',
    ],
  },
};

// --- /api/strategy -----------------------------------------------------------

export const strategyTool: Anthropic.Tool = {
  name: 'submit_strategy_foundation',
  description: 'Aflever det strategiske fundament (indsigt, spænding, løfte og afsæt) som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      audienceTruth: {
        type: 'string',
        description:
          'Den reelle menneskelige indsigt om målgruppen — ikke en demografisk beskrivelse, men hvad de faktisk tænker, føler og kæmper med (1-2 sætninger).',
      },
      tension: {
        type: 'string',
        description:
          'Den centrale spænding, barriere eller konflikt kampagnen skal løse (1-2 sætninger).',
      },
      competitiveContext: {
        type: 'string',
        description:
          'Hvordan kategorien/konkurrenterne typisk kommunikerer, og hvilket ledigt territorium dette brand kan eje (1-2 sætninger).',
      },
      singleMindedProposition: {
        type: 'string',
        description:
          'Det enkelt-mindede løfte (single-minded proposition) — det ene vi vil have målgruppen til at tage med sig. Knivskarpt, én sætning.',
      },
      reasonsToBelieve: {
        type: 'array',
        items: { type: 'string' },
        description:
          '2-4 konkrete reasons-to-believe, forankret i de faktiske leverancer, der gør løftet troværdigt.',
      },
      desiredResponse: {
        type: 'string',
        description:
          'Hvad målgruppen skal tænke, føle og gøre efter at have mødt kommunikationen (1-2 sætninger).',
      },
      springboards: {
        type: 'array',
        description: '2-3 strategiske afsæt (springboards) som en kreativ idé-motor kan springe fra.',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Kort, fængende navn på det strategiske afsæt (2-4 ord).',
            },
            insight: {
              type: 'string',
              description: 'Den strategiske vinkel/indsigt afsættet åbner for (1-2 sætninger).',
            },
          },
          required: ['title', 'insight'],
        },
      },
      strategicSummary: {
        type: 'string',
        description:
          'Kort sammenfatning af det strategiske fundament i ét afsnit (ca. 30-60 ord) — essensen en kreativ direktør kan briefes på.',
      },
    },
    required: [
      'audienceTruth',
      'tension',
      'competitiveContext',
      'singleMindedProposition',
      'reasonsToBelieve',
      'desiredResponse',
      'springboards',
      'strategicSummary',
    ],
  },
};

// --- /api/channel-matrix -----------------------------------------------------

export const channelMatrixTool: Anthropic.Tool = {
  name: 'submit_channel_matrix',
  description:
    'Aflever den komplette omni-channel matrix: en produktionsklar eksekvering pr. kanal, skaleret fra den valgte store idé.',
  input_schema: {
    type: 'object',
    properties: {
      channels: {
        type: 'array',
        description:
          'En produktionsklar eksekvering for hver kanal i platformens kanal-frø (og briefets kanaler). Typisk 4-6.',
        items: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description:
                'Kanalen, fx "Film / Video", "OOH / Outdoor", "Radio / Audio", "Social", "Aktivering / Experiential", "PR".',
            },
            format: {
              type: 'string',
              description:
                'Det konkrete format, fx "30 sek. hero-film 16:9", "Abribus 8 m²", "20 sek. radiospot", "Instagram Reel 9:16".',
            },
            headline: {
              type: 'string',
              description: 'Den bærende overskrift/super for denne kanal-eksekvering.',
            },
            keyMessage: {
              type: 'string',
              description: 'Hvad netop denne kanal-eksekvering skal opnå (1 sætning) — forankret i den store idé.',
            },
            script: {
              type: 'array',
              description:
                'Sekvensen af navngivne blokke der udgør eksekveringen. Brug labels der passer kanalen (fx "Scene 1", "VO", "Super", "SFX", "Caption", "Hashtags", "Subline", "Oplevelse", "Pitch").',
              items: {
                type: 'object',
                properties: {
                  label: {
                    type: 'string',
                    description: 'Blokkens rolle, fx "Scene 1", "VO", "Super", "SFX", "Caption", "Headline", "CTA".',
                  },
                  content: {
                    type: 'string',
                    description: 'Det konkrete indhold for denne blok (replik, billedbeskrivelse, copy, lyd).',
                  },
                },
                required: ['label', 'content'],
              },
            },
            productionNotes: {
              type: 'string',
              description:
                'Konkrete produktionsnoter: varighed, format/ratio, antal scener, talent, lyd/musik, leverancer. Ingen floskler.',
            },
            cta: {
              type: 'string',
              description: 'Den tydelige call-to-action for denne kanal.',
            },
          },
          required: ['channel', 'format', 'headline', 'keyMessage', 'script', 'productionNotes', 'cta'],
        },
      },
    },
    required: ['channels'],
  },
};

// --- /api/logo-prompt --------------------------------------------------------

export const logoPromptTool: Anthropic.Tool = {
  name: 'submit_logo_prompt',
  description: 'Aflever den optimerede Recraft text-to-vector logo-prompt som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      prompt: {
        type: 'string',
        description:
          'Den færdige, optimerede logo-prompt på ENGELSK, klar til Recraft V4 text-to-vector. Konkret om form, symbol, stil og komposition. INGEN tekst/bogstaver i selve logoet.',
      },
    },
    required: ['prompt'],
  },
};

// --- /api/brainstorm ---------------------------------------------------------

export const brainstormTool: Anthropic.Tool = {
  name: 'submit_brainstorm',
  description: 'Aflever brainstorm-idéerne som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      projectCore: {
        type: 'string',
        description:
          'Den virkelige kernehistorie bag projektet — hvad er det EGENTLIG interessante her? (1-2 skarpe sætninger)',
      },
      angles: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Kort, fængende titel for denne kreative vinkel (3-5 ord)',
            },
            headline: {
              type: 'string',
              description: 'En konkret, modig overskrift der repræsenterer denne vinkel',
            },
            linkedinHook: {
              type: 'string',
              description: 'En fængende åbningslinje til LinkedIn i denne vinkel (max 2 linjer)',
            },
            reasoning: {
              type: 'string',
              description: 'Hvorfor virker denne vinkel? Hvad er det der gør den stærk? (1-2 sætninger)',
            },
          },
          required: ['title', 'headline', 'linkedinHook', 'reasoning'],
        },
        description: 'Præcis 4 distinkte, dristige kreative retninger for dette projekt.',
      },
      keyDifferentiators: {
        type: 'array',
        items: { type: 'string' },
        description:
          '3-4 specifikke ting der gør netop dette projekt unikt, interessant og mindeværdigt.',
      },
      audienceInsights: {
        type: 'array',
        items: { type: 'string' },
        description:
          '2-3 konkrete indsigter om målgruppen og hvad de vil reagere positivt på i indholdet.',
      },
      boldQuestion: {
        type: 'string',
        description:
          'Ét provokerende eller tankevækkende spørgsmål der — hvis svaret var i indholdet — ville gøre det markant skarpere.',
      },
      briefGaps: {
        type: 'array',
        items: { type: 'string' },
        description:
          '2-3 vigtige spørgsmål man bør stille kunden for at berige briefet og skrive endnu bedre indhold.',
      },
    },
    required: [
      'projectCore',
      'angles',
      'keyDifferentiators',
      'audienceInsights',
      'boldQuestion',
      'briefGaps',
    ],
  },
};

// --- visuel redaktion (art direction-deliberation) ---------------------------

// Genbrugt billedprompt-skema (engelske prompts til Midjourney/Flux/Firefly).
const imagePromptsSchema = {
  type: 'object',
  properties: {
    hero: {
      type: 'string',
      description:
        'Hero image prompt (English). High production value, lighting, visual style, camera angle, mood.',
    },
    detail: {
      type: 'string',
      description:
        'Detail/close-up prompt (English). Macro or detailed view, focus on mechanics, design details, texture, lighting.',
    },
    abstract: {
      type: 'string',
      description:
        'Abstract background prompt (English). Colors, motion, lighting, textures representing the event/brand spirit.',
    },
  },
  required: ['hero', 'detail', 'abstract'],
} as const;

// Udkast + syntese i den visuelle redaktion afleverer denne pakke.
export const visualConceptTool: Anthropic.Tool = {
  name: 'submit_visual_concept',
  description: 'Aflever det visuelle koncept og de tre forfinede billedprompts som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      visualConcept: {
        type: 'string',
        description:
          'Kort, skarpt visuelt koncept / art direction på dansk (ca. 40-80 ord): den bærende idé, stemning, lys, farve og billedsprog der binder de tre prompts sammen.',
      },
      imagePrompts: imagePromptsSchema,
      moodKeywords: {
        type: 'array',
        items: { type: 'string' },
        description:
          '5-8 stikord der fanger stemning, lys, farvepalet og stil (fx "volumetric lighting", "muted teal palette", "editorial minimalism").',
      },
    },
    required: ['visualConcept', 'imagePrompts', 'moodKeywords'],
  },
};

// Den visuelle kritiker (art director) afleverer denne vurdering.
export const visualCritiqueTool: Anthropic.Tool = {
  name: 'submit_visual_critique',
  description: 'Aflever den visuelle kritik (scorer + svagheder) som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      onBrandScore: {
        type: 'integer',
        description: 'Score 0-100 for hvor godt det visuelle koncept rammer brandets CVI (farver, stil, stemning).',
      },
      specificityScore: {
        type: 'integer',
        description:
          'Score 0-100 for konkrethed: er lys, komposition, linse, farve og motiv specifikt beskrevet frem for generisk stock-foto-snak.',
      },
      originalityScore: {
        type: 'integer',
        description: 'Score 0-100 for originalitet: undgår klichéer (håndtryk, generiske kontorer, lyspærer) og virker friskt.',
      },
      weaknesses: {
        type: 'array',
        items: { type: 'string' },
        description: 'Konkrete visuelle svagheder eller klichéer der bør løftes (tom liste hvis ingen).',
      },
      overallReview: {
        type: 'string',
        description: 'Samlet visuel dom på dansk (ca. 30-60 ord).',
      },
    },
    required: ['onBrandScore', 'specificityScore', 'originalityScore', 'weaknesses', 'overallReview'],
  },
};

// Den kreative visuelle direktør afleverer dristigere retninger.
export const visualDirectionsTool: Anthropic.Tool = {
  name: 'submit_visual_directions',
  description: 'Aflever dristige, alternative visuelle retninger som struktureret data.',
  input_schema: {
    type: 'object',
    properties: {
      boldVisuals: {
        type: 'array',
        items: { type: 'string' },
        description: 'Dristige, uventede visuelle koncepter/motiver at forfølge (mindst 3).',
      },
      lightingAndColor: {
        type: 'array',
        items: { type: 'string' },
        description: 'Konkrete idéer til lys og farve der hæver udtrykket (mindst 2).',
      },
      compositions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Idéer til komposition, beskæring og kameravinkel (mindst 2).',
      },
    },
    required: ['boldVisuals', 'lightingAndColor', 'compositions'],
  },
};
