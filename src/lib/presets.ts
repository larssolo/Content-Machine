/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { PresetBrief } from '../types';

/** Standard projekt-briefs der kan indlæses i UI'et (kan nulstilles/ryddes af brugeren). */
export const PRESETS: PresetBrief[] = [
  {
    name: "Modaxo Move 2026 (Konference / 3D Maskot)",
    brief: {
      client: "Modaxo",
      project: "Modaxo Move 2026",
      description: "Vi udviklede visuelt indhold til en international konference i København. Vi lavede speaker presentations, dynamiske visuals til LED-skærm, dinner visuals, awards visuals og content til liveoptrædener.",
      details: "350 deltagere fra hele verden, deltagere fra 37 lande, 24x4 meter LED-skærm. Vi var også med til at udvikle Moxi, Modaxos nye lille maskot. Hun blev skabt med udgangspunkt i Modaxos logo og vækket til live som en 3D-karakter.",
      audience: "Virksomheder der holder events, konferencer, messer og keynotes.",
      tone: "Professionel, menneskelig, kreativ, ikke barnlig.",
      language: "Dansk",
      channels: ["Hjemmeside", "LinkedIn", "Nyhedsbrev"],
      notes: "Vi skal fremstå som en kreativ og praktisk samarbejdspartner, der kan løfte visuelle oplevelser i stor skala."
    }
  },
  {
    name: "B&O Beolab Launch (Eksklusiv Event / 3D)",
    brief: {
      client: "Bang & Olufsen",
      project: "Beolab Theatre Launch Event",
      description: "Vi leverede komplet 3D-visualisering og scenekonstruktion til den skandinaviske produktlancering. Vi designede et ultra-high-end digitalt univers, herunder live 3D eksploderede tegninger af produktkomponenter på scenen synkroniseret med lys-show.",
      details: "Afholdt i et historisk teater i København for 150 VIP arkitekter og lyd-anmeldere. Ekstremt luksuriøs finish og fotorealistisk 3D visualisering.",
      audience: "High-end lyd-entusiaster, arkitekter, tech-medier og top-forhandlere.",
      tone: "Sofistikeret, design-fokuseret, eksklusiv, præcis.",
      language: "Dansk",
      channels: ["LinkedIn", "Hjemmeside", "Nyhedsbrev"],
      notes: "Vi skal fremhæves som den præcise kreative teknologiske kraft, der gør det muligt at forstå akustisk storhed visuelt."
    }
  },
  {
    name: "Ørsted Wind Summit (Data / Infografik / Web)",
    brief: {
      client: "Ørsted",
      project: "Green Wind Summit Copenhagen",
      description: "Produktion af digital grafik, interaktive infografikker til touch-screens og en komplet nyhedsbrev-kampagne i forbindelse med det globale vindtopmøde.",
      details: "5 interaktive info-standere på messestanden, 12 animerede infografik-loops. Fokus på vindmølle-teknologiens fremtid på havbunden.",
      audience: "Industrispecialister, investorer, journalister og grønne rådgivere.",
      tone: "Visionær, troværdig, professionel, grøn og skarp.",
      language: "Dansk",
      channels: ["Nyhedsbrev", "LinkedIn"],
      notes: "Vi skal formidle indviklede tekniske klimadata enkelt, visuelt stærkt og inspirerende."
    }
  }
];
