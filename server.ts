/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const PORT = 3000;

  // Initialize Gemini AI
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Advarsel: GEMINI_API_KEY er ikke sat i miljøet.");
  }
  
  const ai = new GoogleGenAI({
    apiKey: apiKey || "dummy-key",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Main generator endpoint
  app.post('/api/generate', async (req, res) => {
    try {
      const { brief } = req.body;
      if (!brief) {
        return res.status(400).json({ error: 'Brief er påkrævet.' });
      }

      let cviSection = '';
      if (brief.cviManual) {
        cviSection = `
SÆRLIGE BRAND CVI / DESIGNMANUAL RETNINGSLINJER (SKAL OVERHOLDES STRENGT):
- Brand Farver: ${(brief.cviManual.brandColors || []).join(', ')}
- Typografi/Fonte: Overskrifter: ${brief.cviManual.fonts?.primaryHeadings || 'N/A'}, Brødtekst: ${brief.cviManual.fonts?.bodyText || 'N/A'}. Designtankegang: ${brief.cviManual.fonts?.description || 'N/A'}
- Billeder & Visuel stil: ${brief.cviManual.imageStyleGuidelines || 'N/A'}
- Grafiske layouts & formater: ${brief.cviManual.graphicElementsRules || 'N/A'}
- Overordnet brand-vibe & identitet: ${brief.cviManual.generalBrandIdentitySummary || 'N/A'}
- Logo anvendelsesdogmer: ${brief.cviManual.logoUsageRules || 'N/A'}

REGLER FOR ADHERENCE TIL CVI I OUTPUTS:
1. De 3 AI Billedprompts skal skrives på ENGELSK og MÅLRETTES brandets visuelle CVI-retningslinjer (inddrag farvepaletten '${(brief.cviManual.brandColors || []).join(', ')}', belysningsinstrukser, fotostil og grafiske dogmer '${brief.cviManual.imageStyleGuidelines || ''}' direkte i prompterne som dækkende æstetiske prompts, fx 'using the brand\'s signature colors, dramatic lighting, minimalist framing').
2. Produktionsforslagene skal eksplicit foreslå formater, layouts, nyhedsbrevssektioner og web-komponenter, som inkorporerer og understøtter disse fonte og farver (tænk på, hvordan du designer en nyhedsskabelon i overensstemmelse med ${brief.cviManual.graphicElementsRules || 'reglerne'} og fontvalgene ${brief.cviManual.fonts?.primaryHeadings || 'overordnede overskriftsfonte'} / ${brief.cviManual.fonts?.bodyText || 'brødtekst'}).
3. Case-teksterne skal passe stilmæssigt til den overordnede brandidentitet og stemning (${brief.cviManual.generalBrandIdentitySummary || 'retningslinjerne'}).
`;
      }

      const prompt = `
Du er en professionel Brand Surface Produktionsassistent og brand-tekstforfatter.
Din opgave er at transformere følgende projekt-brief til en fuldstændig pakke af case-indhold og produktionsforslag baseret på Brand Surface guidelines.

PROJEKT BRIEF:
- Kunde: ${brief.client || 'N/A'}
- Projekt: ${brief.project || 'N/A'}
- Hvad lavede vi (Beskrivelse): ${brief.description || 'N/A'}
- Særlige detaljer: ${brief.details || 'N/A'}
- Målgruppe: ${brief.audience || 'N/A'}
- Tone: ${brief.tone || 'Professionel, menneskelig, kreativ'}
- Sprog: ${brief.language || 'Dansk'}
- Hvor det bruges: ${(brief.channels || []).join(', ') || 'N/A'}
- Ekstra noter: ${brief.notes || 'N/A'}
${cviSection}

Brand Surface Retningslinjer:
1. Undgå floskler. Ingen overflødige vendinger som "oplevelse ud over det sædvanlige", medmindre det passer utroligt specifikt ind. Skriv i stedet konkret om Brand Surfaces faktiske leverancer (f.eks. formater, LED-skærme, 3D-karakterer, interaktivitet, animation osv.).
2. Hold overskrifter korte, skarpe og stærke.
3. Lav AI-billedprompts på ENGELSK. De skal være brugbare til Midjourney eller Firefly. Lav altid præcis tre typer: (1) Hero image prompt, (2) Detail/close-up prompt, (3) Abstract background prompt. Prøv at fange projektets stemning, belysning, kamera/vinkel, stil, og undgå at have tekst i billederne.
4. Produktionsforslag: Hvis briefet omhandler event, grafik, 3D, web eller nyhedsbrev, skal du angive værdifulde og konkrete forslag til det kreative workflow (manglende billedmaterialer, foreslåede formater f.eks. HD 16:9, vertical 9:16, hero visual idé, SoMe-format, nyhedsbrev-layout og en specifik CTA).
5. "Kan bruges direkte": Identificer og isoler det absolut bedste fra outputtet, herunder overskrift, kort tekst, Call to Action og den stærke LinkedIn-start/krog.
6. CVI-Forslag (cviSuggestion): Generer et unikt, moderne og fuldstændig gennemtænkt CVI designmanual-forslag baseret på kunden, opgaven og resultatet. Hvis der er angivet brand-manual data i briefet (CVI), skal du inddrage dette og raffinere det yderligere til dette projekt. Foreslå 3-4 eksplicitte brandfarver med dækkende HEX-koder (f.eks. mørkeblå, komplementære nuancer), typografi/font paringer samt specifikke grafiske og billedmæssige designregler/guidebøger.

Generer hele resultatet præcist som et JSON-objekt, der matcher det specificerede skema. Sørg for at teksterne er skrevet på det angivne sprog (som er ${brief.language || 'Dansk'}).
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              shortCaseText: { type: Type.STRING, description: "Kort, præcis og fængende case-tekst (ca. 100-150 ord). Konkret og konkret om leverancen." },
              longCaseText: { type: Type.STRING, description: "Længere og mere struktureret case-tekst til hjemmesiden (ca. 250-400 ord). Opbyg med konkrete leverancer, milepæle og detaljer." },
              linkedinPost: { type: Type.STRING, description: "Professionelt, levende og engagerende LinkedIn-opslag med afsnit, konkrete resultater, professionel krog og Call To Action. Sparsom brug af emojis (kun absolut relevante) uden spam." },
              headlines: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "5 korte og stærke overskrifter i overensstemmelse med Brand Surface stilen."
              },
              keywords: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "8-10 vigtige keywords og søgetermer relateret til projektet."
              },
              cta: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "3 stærke call-to-actions (direkte, blød, kreativ)."
              },
              english: {
                type: Type.OBJECT,
                properties: {
                  shortCaseText: { type: Type.STRING, description: "English version of the short case text." },
                  longCaseText: { type: Type.STRING, description: "English version of the long case text." },
                  linkedinPost: { type: Type.STRING, description: "English version of the LinkedIn post." },
                  headlines: { type: Type.ARRAY, items: { type: Type.STRING }, description: "English version of the strong headlines." }
                },
                required: ["shortCaseText", "longCaseText", "linkedinPost", "headlines"]
              },
              imagePrompts: {
                type: Type.OBJECT,
                properties: {
                  hero: { type: Type.STRING, description: "Hero image prompt (English). High production value, lighting, visual style, camera angle, mood." },
                  detail: { type: Type.STRING, description: "Detail/close-up prompt (English). Macro or detailed view, focus on mechanics, design details, texture, lighting." },
                  abstract: { type: Type.STRING, description: "Abstract background prompt (English). Colors, motion, lighting, textures representing the event/brand spirit." }
                },
                required: ["hero", "detail", "abstract"]
              },
              mailchimpSubjects: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "4 stærke subject lines til nyhedsbrevet (Mailchimp) - både direkte og nysgerrighedsskabende."
              },
              productionProposed: { type: Type.BOOLEAN, description: "True if the project is related to graphic, event, 3D, web or newsletter." },
              production: {
                type: Type.OBJECT,
                properties: {
                  missingImages: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions of elements/visuals currently missing from documentations." },
                  suggestedFormats: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specifications of recommended media sizes / ratios to package." },
                  heroVisual: { type: Type.STRING, description: "Proposal for the main dynamic hero screen visual asset idea." },
                  someFormat: { type: Type.STRING, description: "Creative suggestion for custom SoMe animation or carousel structure." },
                  newsletterSection: { type: Type.STRING, description: "Outline or arrangement proposal for Mailchimp sections." },
                  cta: { type: Type.STRING, description: "Event-focused production Call To Action proposal." }
                },
                required: ["missingImages", "suggestedFormats", "heroVisual", "someFormat", "newsletterSection", "cta"]
              },
              directUsable: {
                type: Type.OBJECT,
                properties: {
                  bestHeadline: { type: Type.STRING, description: "Den absolut bedste overskrift." },
                  bestShortText: { type: Type.STRING, description: "Den absolut bedste korte tekst." },
                  bestCta: { type: Type.STRING, description: "Den absolut bedste CTA." },
                  bestLinkedinStart: { type: Type.STRING, description: "Den sjoveste/bedste LinkedIn startlinje (hook)." }
                },
                required: ["bestHeadline", "bestShortText", "bestCta", "bestLinkedinStart"]
              },
              toneAnalysis: {
                type: Type.OBJECT,
                properties: {
                  clichesFound: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Eventuelle floskler eller unødvendige klichéer fundet i de genererede tekster (f.eks. 'opleve ud over det sædvanlige', 'synergy' osv.). Listen skal være tom hvis ingen klichéer findes."
                  },
                  clicheScore: { type: Type.INTEGER, description: "Score fra 0 til 100 for frihed for klichéer og floskler. 100 betyder fuldstændig fri for tom marketing-sludder, 0 betyder udelukkende floskler." },
                  concretenessScore: { type: Type.INTEGER, description: "Score for konkrethed fra 0 til 100. Er der rige, konkrete leverance-detaljer (såsom størrelser, karakterer, tal, formater) i stedet for overfladisk snak." },
                  humanScore: { type: Type.INTEGER, description: "Score for menneskelighed og personlig nerve fra 0 til 100. Føles det levende, udtalt og direkte professionelt, frem for stift maskinskrevet robot-corporate." },
                  evaluations: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        ruleName: { type: Type.STRING, description: "F.eks 'Undgå floskler', 'Fysiske/digitale leverancer til stede', 'Menneskelig tone'" },
                        status: { type: Type.STRING, description: "Skal være 'passed', 'warning', eller 'failed'." },
                        score: { type: Type.INTEGER, description: "Score fra 0 til 100 for denne specifikke regel." },
                        feedback: { type: Type.STRING, description: "Konstruktiv uddybning og specifik feedback på dansk om reglens overholdelse." }
                      },
                      required: ["ruleName", "status", "score", "feedback"]
                    }
                  },
                  overallReview: { type: Type.STRING, description: "Samlet kvalitetsvurdering og redaktionel dom baseret på Brand Surface retningslinjer (ca. 40-75 ord)." }
                },
                required: ["clichesFound", "clicheScore", "concretenessScore", "humanScore", "evaluations", "overallReview"]
              },
              cviSuggestion: {
                type: Type.OBJECT,
                properties: {
                  brandColors: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        hex: { type: Type.STRING, description: "HEX-farvekode, f.eks #FF5400" },
                        name: { type: Type.STRING, description: "Navn til farven, f.eks 'Brand Orange' eller 'Cosmic Anthracite'" },
                        useCase: { type: Type.STRING, description: "Hvad farven skal bruges til i layouts" }
                      },
                      required: ["hex", "name", "useCase"]
                    },
                    description: "Foreslåede 3-4 brand-farvekoder med navne og brugsområder."
                  },
                  fonts: {
                    type: Type.OBJECT,
                    properties: {
                      primaryHeadings: { type: Type.STRING, description: "Anbefalet overskriftsfont, f.eks 'Space Grotesk' eller 'Outfit'" },
                      bodyText: { type: Type.STRING, description: "Anbefalet brødtekstfont, f.eks 'Inter' eller 'Plus Jakarta Sans'" },
                      description: { type: Type.STRING, description: "Kort begrundelse for dette valg af typografi" }
                    },
                    required: ["primaryHeadings", "bodyText", "description"]
                  },
                  imageStyleGuidelines: { type: Type.STRING, description: "Definition og instruktioner af billedstil og fotomanual baseret på projektet" },
                  graphicElementsRules: { type: Type.STRING, description: "Vigtigste grafiske elementer og opsætningsregler, f.eks brug af bento grid, kraftige skygger, minimalisme, runde hjørner eller kantet asymmetriske linjer" },
                  generalBrandIdentitySummary: { type: Type.STRING, description: "Det overordnede visuelle designkoncept (få sætninger)" },
                  logoUsageRules: { type: Type.STRING, description: "Regler for brug og placering af brandets logo i layoutet" },
                  visualIdentityConcept: { type: Type.STRING, description: "Kreativ forklaring af det samlede brand look & feel og dybere design-vibe" }
                },
                required: ["brandColors", "fonts", "imageStyleGuidelines", "graphicElementsRules", "generalBrandIdentitySummary", "logoUsageRules", "visualIdentityConcept"]
              }
            },
            required: [
              "shortCaseText", "longCaseText", "linkedinPost", "headlines", "keywords", "cta", "english", "imagePrompts", "mailchimpSubjects", "productionProposed", "production", "directUsable", "toneAnalysis", "cviSuggestion"
            ]
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error('Intet output modtaget fra Gemini API.');
      }

      const cleanJson = textOutput.trim();
      const parsed = JSON.parse(cleanJson);
      res.json(parsed);

    } catch (error: any) {
      console.error("Fejl under generering:", error);
      res.status(500).json({ error: error.message || 'Internt server fejl under generering.' });
    }
  });

  // Refine text endpoint
  app.post('/api/refine', async (req, res) => {
    try {
      const { text, command, brief } = req.body;
      if (!text || !command) {
        return res.status(400).json({ error: 'Text og command er påkrævet.' });
      }

      // Base context
      const contextClient = brief?.client || 'en kunde';
      const contextProject = brief?.project || 'et projekt';
      const contextTone = brief?.tone || 'professionel, menneskelig, kreativ';
      const contextLang = brief?.language || 'Dansk';

      let cviContext = '';
      if (brief?.cviManual) {
        cviContext = `Identitet: ${brief.cviManual.generalBrandIdentitySummary || 'N/A'}. Farver: ${(brief.cviManual.brandColors || []).join(', ')}. Image-Retning: ${brief.cviManual.imageStyleGuidelines || 'N/A'}. Fonte: Overskrifter: ${brief.cviManual.fonts?.primaryHeadings || 'N/A'}`;
      }

      let instruction = "";
      if (command === '/shorten') {
        instruction = "Gør teksten meget kortere, skarp og yderst præcis. Bevar de vigtigste fakta, tal og navne, men fjern alle overflødige ord. Bevar afsnit hvis relevant. Svaret skal kun bestå af den omskrevne tekst.";
      } else if (command === '/more-human') {
        instruction = "Gør teksten more menneskelig, levende, engagerende og nærværende. Undgik kolde og corporate formuleringer, men hold den stadig ualmindeligt professionel og seriøs. Svaret skal kun bestå af den omskrevne tekst.";
      } else if (command === '/more-business') {
        instruction = "Gør teksten mere strategisk skarp, forretningsorienteret, professionel og business-minded. Fremhæv det konkrete forretningsmæssige udbytte og professionalisme uden at blive alt for 'corporate-stiv'. Svaret skal kun bestå af den omskrevne tekst.";
      } else {
        instruction = command; // Direct query instructions
      }

      const prompt = `
Du er en professionel Brand Surface tekstforfatter.
Opgave: Omskriv den givne tekst baseret på instruktionen nedenfor.

GIVEN TEKST SOM SKAL OMSKRIVES:
"""
${text}
"""

PROJEKT RETNINGSLINJER SOM SKAL OVERHODES:
- Kunde: ${contextClient}
- Projekt: ${contextProject}
- Tone: ${contextTone}
- Sprog: ${contextLang}
${brief?.cviManual ? `- CVI/Designmanual guidelines: ${cviContext}` : ''}

INSTRUKTION FOR OMSKRIVNINGEN:
${instruction}

KRAV TIL OUTPUT:
1. Svar UDELUKKENDE med den omskrevne og raffinerede tekst. Du må IKKE inkludere introduktioner (f.eks. "Her er den kortere version:"), ingen forklaringer, ingen kommentarer, og ingen markdown-citater (som \`\`\`) rundt om teksten. Bare lever den rene tekst direkte.
2. Bevar det samme sprog (som er ${contextLang}) som input-teksten, medmindre andet er specifikt aftalt i instruktionen.
3. Bevar faktuelle rigtige oplysninger og tal.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error('Kunne ikke generere raffineret tekst.');
      }

      res.json({ refinedText: textOutput.trim() });
    } catch (error: any) {
      console.error("Fejl under raffinering:", error);
      res.status(500).json({ error: error.message || 'Kunne ikke raffinere teksten.' });
    }
  });

  // Analyze text endpoint
  app.post('/api/analyze', async (req, res) => {
    try {
      const { texts, brief } = req.body;
      if (!texts) {
        return res.status(400).json({ error: 'Tekster er påkrævet for analyse.' });
      }

      const prompt = `
Du er en uafhængig Brand Surface Redaktionel Revisor. Din opgave er at lave en uvildig, saglig analyse af det givne indhold baseret på Brand Surface guidelines.

INDHOLD DER SKAL ANALYSERES:
- Kort Case-Tekst:
"""
${texts.shortCaseText || ''}
"""
- Lang Case-Tekst:
"""
${texts.longCaseText || ''}
"""
- LinkedIn Opslag:
"""
${texts.linkedinPost || ''}
"""

PROJEKT BRIEF KONTEXT:
- Kunde: ${brief?.client || 'N/A'}
- Projekt: ${brief?.project || 'N/A'}
- Hvad lavede vi (Beskrivelse): ${brief?.description || 'N/A'}
- Særlige detaljer: ${brief?.details || 'N/A'}
- Tone: ${brief?.tone || 'Professionel, menneskelig, kreativ'}

Brand Surface Retningslinjer:
1. Undgå floskler. Ingen overflødige vendinger som "oplevelse ud over det sædvanlige", "synergieffekter", "unik løsning", "banebrydende" medmindre de passer i en ualmindeligt specifik sammenhæng. Vi vil have rene, ærlige formuleringer, der beskriver Brand Surfaces faktiske leverancer (f.eks. formater, LED-skærme, 3D-karakterer, interaktivitet, animation osv.).
2. Hold overskrifter og budskaber præcise og uden snak.
3. Tone skal balanceres mellem professionel B2B gennemslagskraft og en imødekommende, menneskelig nerve.

Analyser de tre tekster grundigt i forhold to disse regler. Find eventuelle floskler og klichéer (gem dem som liste 'clichesFound'), beregn de tre delscorer (fra 0 til 100), lav 3 specifikke regel-evalueringer (Undgå floskler, konkrethed, tone og personlighed), og formuler en samlet ærlig, konstruktiv dom (overallReview) på dansk.

Generer resultatet præcist som et JSON-objekt, der matcher det specificerede skema. Sørg for at al feedback og anmeldelse er på Dansk.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              clichesFound: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Eventuelle floskler eller unødvendige klichéer fundet i teksterne. Skal være tom liste hvis ingen findes."
              },
              clicheScore: { type: Type.INTEGER, description: "Score fra 0 til 100 for frihed for klichéer og floskler. 100 betyder fuldstændig fri for tom marketing-sludder." },
              concretenessScore: { type: Type.INTEGER, description: "Score for konkrethed fra 0 til 100 baseret på reelle leverancer i stedet for fluffy snak." },
              humanScore: { type: Type.INTEGER, description: "Score for menneskelighed og tone fra 0 til 100." },
              evaluations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    ruleName: { type: Type.STRING, description: "F.eks 'Undgå floskler', 'Fysiske/digitale leverancer til stede', 'Menneskelig tone'" },
                    status: { type: Type.STRING, description: "Skal være 'passed', 'warning', eller 'failed'." },
                    score: { type: Type.INTEGER, description: "Score fra 0 til 100 for denne specifikke regel." },
                    feedback: { type: Type.STRING, description: "Uddybning og konstruktiv feedback på dansk om reglens overholdelse." }
                  },
                  required: ["ruleName", "status", "score", "feedback"]
                }
              },
              overallReview: { type: Type.STRING, description: "Samlet redaktionel opsummering og vurdering på dansk (ca. 40-75 ord)." }
            },
            required: ["clichesFound", "clicheScore", "concretenessScore", "humanScore", "evaluations", "overallReview"]
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error('Kunne ikke generere analyse.');
      }

      res.json(JSON.parse(textOutput.trim()));
    } catch (error: any) {
      console.error("Fejl under toneanalyse:", error);
      res.status(500).json({ error: error.message || 'Kunne ikke udføre toneanalyse.' });
    }
  });

  // CVI / Designmanual Analysis Engine
  app.post('/api/analyze-cvi', async (req, res) => {
    try {
      const { fileType, fileContent, fileName } = req.body;
      if (!fileContent) {
        return res.status(400).json({ error: 'Filindhold (base64 eller tekst) er påkrævet.' });
      }

      let parts: any[] = [];
      const isBase64DataUrl = fileContent.startsWith('data:');
      
      let finalContent = fileContent;
      let finalMimeType = fileType || 'image/png';

      if (isBase64DataUrl) {
        const matches = fileContent.match(/^data:([^;]+);base64,(.*)$/);
        if (matches && matches.length === 3) {
          finalMimeType = matches[1];
          finalContent = matches[2];
        }
      }

      if (finalMimeType.startsWith('image/')) {
        parts.push({
          inlineData: {
            mimeType: finalMimeType,
            data: finalContent
          }
        });
      } else if (finalMimeType === 'application/pdf') {
        parts.push({
          inlineData: {
            mimeType: 'application/pdf',
            data: finalContent
          }
        });
      } else {
        // Assume text file format (CVI in text/markdown/html)
        let textContent = finalContent;
        if (!isBase64DataUrl) {
          try {
            // Check if base64 encoded
            textContent = Buffer.from(finalContent, 'base64').toString('utf-8');
          } catch (e) {
            // Keep as is
          }
        }
        parts.push({
          text: `Her er tekstmæssige retningslinjer eller metadata fra CVI filen:\n\n${textContent}`
        });
      }

      parts.push({
        text: `Du er en førende Brand Surface Identitetsrevisor og CVI-specialist.
Din opgave er at scanne og analysere den vedhæftede designmanual, Corporate Visual Identity (CVI) eller stilguide (der kommer som et billede, PDF eller tekst).

Uddrag de vigtigste styling-regler og brand-identitets-dogmer til brug i vores AI Content indholdsgenerator. 
Du skal levere et struktureret JSON-objekt med præcis de designmæssige konstanter, f.eks. farver (hex-koder + navne), fonte, anbefalede billedstilarter (fx kontraster, belysning, kameraer), grafiske særtræk, logo-dogmer og et kort identitetsresumé.

Hvis bestemte elementer (fx skrifttyper eller et logo-rule) ikke eksplicit fremgår af dokumentet, så brug din professionelle brand-æstetiske intelligens til at ekstrapolere hvad der vil klæde dette brand bedst ud fra dokumentets udtryk.

Al JSON-tekst og feedback skal være på Dansk, så vores brugere kan forstå og redigere det.`
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: { parts },
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              brandColors: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Brand farver fundet i CVI (fx '#FF5400 - Primary Brand Orange', '#1E293B - Deep Navy'). Min 3-5 farver."
              },
              fonts: {
                type: Type.OBJECT,
                properties: {
                  primaryHeadings: { type: Type.STRING, description: "Anbefalet skrifttype til overskrifter (headings) baseret på CVI (fx 'Space Grotesk' eller 'Montserrat Bold')." },
                  bodyText: { type: Type.STRING, description: "Anbefalet skrifttype til brødtekst / body (fx 'Inter', 'Roboto' el. lign.)." },
                  description: { type: Type.STRING, description: "Typografiske spilleregler eller særtræk." }
                },
                required: ["primaryHeadings", "bodyText", "description"]
              },
              imageStyleGuidelines: { type: Type.STRING, description: "Konkret visuel fotostil eller retningslinjer for Midjourney/Firefly prompts (fx 'cinematic, minimalist background, warm volumetric lighting')." },
              graphicElementsRules: { type: Type.STRING, description: "Regler for grafik, layouts, grid-strukturer, borders eller SoMe-opsætning." },
              generalBrandIdentitySummary: { type: Type.STRING, description: "Et kort, fængende resumé af brandets overordnede visuelle identitet og stemning." },
              logoUsageRules: { type: Type.STRING, description: "Dogmer for placering af logo eller kritiske do's/dont's for brandets logo og markører." }
            },
            required: ["brandColors", "fonts", "imageStyleGuidelines", "graphicElementsRules", "generalBrandIdentitySummary", "logoUsageRules"]
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error('Kunne ikke generere designmanual-analyse.');
      }

      res.json(JSON.parse(textOutput.trim()));
    } catch (error: any) {
      console.error("Fejl under CVI analyse:", error);
      res.status(500).json({ error: error.message || 'Kunne ikke fuldføre scanningen af designmanualen.' });
    }
  });

  // Humanize & Bypass AI detection endpoint
  app.post('/api/humanize', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Tekst er påkrævet.' });
      }

      const prompt = `
Du er en elite Brand Surface Redaktør og ekspert i AI Detektions-omgåelse (AI Humanizer).

Din opgave er at tage en rå tekst (der måske lyder meget som AI eller "tør" corporate sprog) og humanisere den fuldstændigt.

REGLER FOR HUMANISERING:
1. Omgå AI-tekst tjek (Bypass AI detection): Standard AI-detektorer kigger efter lav "perplexity" (ordforudsigelighed) og lav "burstiness" (ensformig sætningslængde). Omskriv teksten med høj burstiness:
   - Varier sætningslængden markant (nogle MEGET korte sætninger. Andre lidt længere, men uden at blive snørklede).
   - Undgå det typiske AI "rytme"-mønster. Brug uventede, utraditionelle synonymer og more mundtlige, levende overgange.
2. Udryd typiske robot-ord og AI-vendinger på dansk:
   - Fjern overflødige fyldord som "desuden", "derudover", "ydermere", "ydeligere", "herunder", "ydet en stor indsats for at", "vigtigt at huske", "lad os...", "sidst, men ikke mindst".
   - Stop brugen af svulstige overgange som "I en verden, hvor...", "Det er afgørende at...", "Nøglen til succes er..."
   - Skriv i aktiv form i stedet for passiv (f.eks. "Vi designede skærmen" i stedet for "Skærmen blev designet af os").
3. Implementer Brand Surface dogmer: 
   - Beskriv konkrete fysiske, sensoriske eller digitale leverancer præcist. Ingen varm luft eller "opleve det uforglemmelige". Hvis teksten snakker udenom, så tilføj konkrete eksempler eller omskriv to at sige præcis hvad det drejer sig om, i en levende, tillidsvækkende B2B tone.

UDGANGSTEKST DER SKAL HUMANISERES:
"""
${text}
"""

Analyser først den originale tekst, identificer clichérne/robot-vendingerne, giv et estimat over, hvor sandsynligt det er at en AI-detektor vil flage den bagefter (før og efter), og lever til sidst den helt nye, omskrevne menneskelige tekst samt en liste over de forbedringer, du foretog.

Al feedback skal være på Dansk. Retur-JSON skal passe helt med det specificerede skema.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              originalAiScore: { type: Type.INTEGER, description: "Estimeret oprindelig AI-robot-sandsynlighed i procent (fx 95 betyder næsten sikkert AI)." },
              clichesDetected: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "De robot-vendinger eller corporate klichéer der blev opdaget i udgangsteksten."
              },
              humanizedText: { type: Type.STRING, description: "Den nyskrevne organiske, menneskelige tekst." },
              humanizedAiScore: { type: Type.INTEGER, description: "Estimeret ny AI-robot-sandsynlighed efter omskrivning (ideelt under 10%)." },
              improvements: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Specifikke forbedringer på dansk om, hvad der blev ændret for at gøre teksten menneskelig og sværere at detektere (fx 'Fjernede passiv form', 'Varierede sætningslængde')."
              }
            },
            required: ["originalAiScore", "clichesDetected", "humanizedText", "humanizedAiScore", "improvements"]
          }
        }
      });

      const textOutput = response.text;
      if (!textOutput) {
        throw new Error('Kunne ikke generere humaniseret tekst.');
      }

      res.json(JSON.parse(textOutput.trim()));
    } catch (error: any) {
      console.error("Fejl under humanisering:", error);
      res.status(500).json({ error: error.message || 'Kunne ikke fuldføre humanisering af teksten.' });
    }
  });

  // Generate Image from Prompt using Imagen
  app.post('/api/generate-image', async (req, res) => {
    try {
      const { prompt, aspectRatio } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt er påkrævet.' });
      }

      // We use the top-tier 'imagen-3.0-generate-002' model as requested for official image generation
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio || '16:9', // Defaults to 16:9 or custom
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error('Ingen billeder blev returneret fra Imagen API.');
      }

      const base64Bytes = response.generatedImages[0].image.imageBytes;
      res.json({ imageUrl: `data:image/jpeg;base64,${base64Bytes}` });
    } catch (error: any) {
      console.error("Fejl under billedgenerering:", error);
      res.status(500).json({ error: error.message || 'Kunne ikke generere billede. Kontroller din API konfiguration.' });
    }
  });

  // Serve static assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server kører på http://localhost:${PORT}`);
  });
}

startServer();
