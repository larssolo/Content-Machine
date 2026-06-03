/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BrandSurfaceOutput, ProjectBrief } from '../types';

/** Serialisér hele content-pakken til ren Markdown. */
export function buildMarkdown(output: BrandSurfaceOutput, brief?: ProjectBrief): string {
  const lines: string[] = [];
  const heading = (t: string) => lines.push(`\n## ${t}\n`);

  const title = `${brief?.client || 'Brand Surface'} — ${brief?.project || 'Case'}`;
  lines.push(`# ${title}\n`);
  if (brief?.description) lines.push(`> ${brief.description}\n`);

  heading('Kort case-tekst');
  lines.push(output.shortCaseText || '');
  heading('Lang case-tekst');
  lines.push(output.longCaseText || '');
  heading('LinkedIn-opslag');
  lines.push(output.linkedinPost || '');

  if (output.headlines?.length) {
    heading('Overskrifter');
    output.headlines.forEach((x) => lines.push(`- ${x}`));
  }
  if (output.keywords?.length) {
    heading('Keywords');
    lines.push(output.keywords.join(', '));
  }
  if (output.cta?.length) {
    heading('Call to actions');
    output.cta.forEach((x) => lines.push(`- ${x}`));
  }
  if (output.mailchimpSubjects?.length) {
    heading('Nyhedsbrev subject lines');
    output.mailchimpSubjects.forEach((x) => lines.push(`- ${x}`));
  }
  if (output.imagePrompts) {
    heading('AI billed-prompts (engelsk)');
    lines.push(`**Hero:** ${output.imagePrompts.hero || ''}`);
    lines.push(`\n**Detail:** ${output.imagePrompts.detail || ''}`);
    lines.push(`\n**Abstract:** ${output.imagePrompts.abstract || ''}`);
  }
  if (output.english) {
    heading('English version');
    lines.push(`**Short:** ${output.english.shortCaseText || ''}`);
    lines.push(`\n**Long:** ${output.english.longCaseText || ''}`);
    lines.push(`\n**LinkedIn:** ${output.english.linkedinPost || ''}`);
    if (output.english.headlines?.length) {
      lines.push('\n**Headlines:**');
      output.english.headlines.forEach((x) => lines.push(`- ${x}`));
    }
  }
  if (output.production) {
    heading('Produktionsforslag');
    const p = output.production;
    if (p.missingImages?.length) {
      lines.push('**Manglende billeder:**');
      p.missingImages.forEach((x) => lines.push(`- ${x}`));
    }
    if (p.suggestedFormats?.length) {
      lines.push('\n**Foreslåede formater:**');
      p.suggestedFormats.forEach((x) => lines.push(`- ${x}`));
    }
    if (p.heroVisual) lines.push(`\n**Hero visual:** ${p.heroVisual}`);
    if (p.someFormat) lines.push(`\n**SoMe-format:** ${p.someFormat}`);
    if (p.newsletterSection) lines.push(`\n**Nyhedsbrev-sektion:** ${p.newsletterSection}`);
    if (p.cta) lines.push(`\n**CTA:** ${p.cta}`);
  }
  if (output.cviSuggestion) {
    heading('CVI-forslag');
    const c = output.cviSuggestion;
    if (c.brandColors?.length) {
      lines.push('**Brandfarver:**');
      c.brandColors.forEach((col) => lines.push(`- ${col.hex} — ${col.name} (${col.useCase})`));
    }
    if (c.fonts) {
      lines.push(`\n**Fonte:** Overskrifter: ${c.fonts.primaryHeadings}; Brødtekst: ${c.fonts.bodyText}`);
    }
    if (c.imageStyleGuidelines) lines.push(`\n**Billedstil:** ${c.imageStyleGuidelines}`);
    if (c.graphicElementsRules) lines.push(`\n**Grafiske regler:** ${c.graphicElementsRules}`);
    if (c.logoUsageRules) lines.push(`\n**Logo-regler:** ${c.logoUsageRules}`);
    if (c.visualIdentityConcept) lines.push(`\n**Koncept:** ${c.visualIdentityConcept}`);
  }

  return lines.join('\n');
}

/** Trigger en browser-download af tekstindhold. */
export function downloadTextFile(filename: string, content: string, mime = 'text/markdown') {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Lav et fil-sikkert slug ud fra et navn. */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'content'
  );
}
