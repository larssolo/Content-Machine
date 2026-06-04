/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Packer, Paragraph, HeadingLevel, TextRun } from 'docx';
import type { BrandSurfaceOutput, ProjectBrief } from '../types';

function heading(text: string): Paragraph {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
}
function para(text: string): Paragraph {
  return new Paragraph({ children: [new TextRun(text || '')] });
}
function bullet(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 } });
}

/** Byg et docx-dokument ud fra hele content-pakken. */
export function buildDocxDocument(output: BrandSurfaceOutput, brief?: ProjectBrief): Document {
  const children: Paragraph[] = [];
  children.push(
    new Paragraph({
      text: `${brief?.client || 'Content Machine'} — ${brief?.project || 'Case'}`,
      heading: HeadingLevel.TITLE,
    }),
  );
  if (brief?.description) children.push(para(brief.description));

  children.push(heading('Kort case-tekst'), para(output.shortCaseText));
  children.push(heading('Lang case-tekst'), para(output.longCaseText));
  children.push(heading('LinkedIn-opslag'), para(output.linkedinPost));

  if (output.headlines?.length) {
    children.push(heading('Overskrifter'));
    output.headlines.forEach((x) => children.push(bullet(x)));
  }
  if (output.keywords?.length) {
    children.push(heading('Keywords'), para(output.keywords.join(', ')));
  }
  if (output.cta?.length) {
    children.push(heading('Call to actions'));
    output.cta.forEach((x) => children.push(bullet(x)));
  }
  if (output.mailchimpSubjects?.length) {
    children.push(heading('Nyhedsbrev subject lines'));
    output.mailchimpSubjects.forEach((x) => children.push(bullet(x)));
  }
  if (output.imagePrompts) {
    children.push(heading('AI billed-prompts (engelsk)'));
    children.push(para(`Hero: ${output.imagePrompts.hero || ''}`));
    children.push(para(`Detail: ${output.imagePrompts.detail || ''}`));
    children.push(para(`Abstract: ${output.imagePrompts.abstract || ''}`));
  }
  if (output.english) {
    children.push(heading('English version'));
    children.push(para(`Short: ${output.english.shortCaseText || ''}`));
    children.push(para(`Long: ${output.english.longCaseText || ''}`));
    children.push(para(`LinkedIn: ${output.english.linkedinPost || ''}`));
  }
  if (output.production) {
    const pr = output.production;
    children.push(heading('Produktionsforslag'));
    if (pr.heroVisual) children.push(para(`Hero visual: ${pr.heroVisual}`));
    if (pr.someFormat) children.push(para(`SoMe-format: ${pr.someFormat}`));
    if (pr.newsletterSection) children.push(para(`Nyhedsbrev-sektion: ${pr.newsletterSection}`));
    if (pr.cta) children.push(para(`CTA: ${pr.cta}`));
    if (pr.suggestedFormats?.length) {
      children.push(para('Foreslåede formater:'));
      pr.suggestedFormats.forEach((x) => children.push(bullet(x)));
    }
    if (pr.missingImages?.length) {
      children.push(para('Manglende billeder:'));
      pr.missingImages.forEach((x) => children.push(bullet(x)));
    }
  }
  if (output.cviSuggestion) {
    const c = output.cviSuggestion;
    children.push(heading('CVI-forslag'));
    if (c.brandColors?.length) {
      children.push(para('Brandfarver:'));
      c.brandColors.forEach((col) => children.push(bullet(`${col.hex} — ${col.name} (${col.useCase})`)));
    }
    if (c.fonts) {
      children.push(para(`Fonte: Overskrifter ${c.fonts.primaryHeadings}; Brødtekst ${c.fonts.bodyText}`));
    }
    if (c.imageStyleGuidelines) children.push(para(`Billedstil: ${c.imageStyleGuidelines}`));
    if (c.graphicElementsRules) children.push(para(`Grafiske regler: ${c.graphicElementsRules}`));
    if (c.logoUsageRules) children.push(para(`Logo-regler: ${c.logoUsageRules}`));
    if (c.visualIdentityConcept) children.push(para(`Koncept: ${c.visualIdentityConcept}`));
  }

  return new Document({ sections: [{ children }] });
}

/** Generér og download .docx i browseren. */
export async function downloadDocx(
  filename: string,
  output: BrandSurfaceOutput,
  brief?: ProjectBrief,
): Promise<void> {
  const doc = buildDocxDocument(output, brief);
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
