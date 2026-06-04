/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { BrandSurfaceOutput, ProjectBrief } from '../types';
import { slugify } from './exportMarkdown';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function section(title: string, body: string): string {
  return `<section><h2>${esc(title)}</h2>${body}</section>`;
}

function list(items: string[]): string {
  return `<ul>${items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
}

function para(text: string): string {
  return `<p>${esc(text)}</p>`;
}

/** Build a self-contained HTML document from a BrandSurfaceOutput. */
export function buildHtml(output: BrandSurfaceOutput, brief?: ProjectBrief): string {
  const title = `${brief?.client || 'Content Machine'} — ${brief?.project || 'Case'}`;
  const sections: string[] = [];

  if (brief?.description) {
    sections.push(`<blockquote>${esc(brief.description)}</blockquote>`);
  }

  sections.push(section('Kort case-tekst', para(output.shortCaseText || '')));
  sections.push(section('Lang case-tekst', para(output.longCaseText || '')));
  sections.push(section('LinkedIn-opslag', `<pre>${esc(output.linkedinPost || '')}</pre>`));

  if (output.headlines?.length) {
    sections.push(section('Overskrifter', list(output.headlines)));
  }
  if (output.keywords?.length) {
    sections.push(section('Keywords', `<p class="keywords">${output.keywords.map(esc).join(' · ')}</p>`));
  }
  if (output.cta?.length) {
    sections.push(section('Call to actions', list(output.cta)));
  }
  if (output.mailchimpSubjects?.length) {
    sections.push(section('Nyhedsbrev subject lines', list(output.mailchimpSubjects)));
  }
  if (output.imagePrompts) {
    const ip = output.imagePrompts;
    sections.push(section('AI billed-prompts (engelsk)',
      `<dl>
        <dt>Hero</dt><dd>${esc(ip.hero || '')}</dd>
        <dt>Detail</dt><dd>${esc(ip.detail || '')}</dd>
        <dt>Abstract</dt><dd>${esc(ip.abstract || '')}</dd>
      </dl>`));
  }
  if (output.english) {
    const en = output.english;
    let body = '';
    if (en.shortCaseText) body += `<h3>Short case text</h3>${para(en.shortCaseText)}`;
    if (en.longCaseText) body += `<h3>Long case text</h3>${para(en.longCaseText)}`;
    if (en.linkedinPost) body += `<h3>LinkedIn</h3><pre>${esc(en.linkedinPost)}</pre>`;
    if (en.headlines?.length) body += `<h3>Headlines</h3>${list(en.headlines)}`;
    sections.push(section('English version', body));
  }
  if (output.directUsable) {
    const d = output.directUsable;
    sections.push(section('Kan bruges direkte',
      `<dl>
        <dt>Bedste overskrift</dt><dd class="headline">${esc(d.bestHeadline || '')}</dd>
        <dt>Bedste CTA</dt><dd>${esc(d.bestCta || '')}</dd>
        <dt>Bedste korte pitch</dt><dd>${esc(d.bestShortText || '')}</dd>
        <dt>Bedste LinkedIn-krog</dt><dd class="quote">${esc(d.bestLinkedinStart || '')}</dd>
      </dl>`));
  }
  if (output.production) {
    const p = output.production;
    let body = '';
    if (p.missingImages?.length) body += `<h3>Manglende billeder</h3>${list(p.missingImages)}`;
    if (p.suggestedFormats?.length) body += `<h3>Foreslåede formater</h3>${list(p.suggestedFormats)}`;
    if (p.heroVisual) body += `<h3>Hero visual</h3>${para(p.heroVisual)}`;
    if (p.someFormat) body += `<h3>SoMe-format</h3>${para(p.someFormat)}`;
    if (p.newsletterSection) body += `<h3>Nyhedsbrev-sektion</h3>${para(p.newsletterSection)}`;
    if (p.cta) body += `<h3>CTA</h3>${para(p.cta)}`;
    sections.push(section('Produktionsforslag', body));
  }

  const css = `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; background: #0f172a; color: #e2e8f0; line-height: 1.7; padding: 2rem 1rem; }
    .wrapper { max-width: 800px; margin: 0 auto; }
    header { border-bottom: 1px solid #f97316; padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
    header h1 { font-size: 1.6rem; color: #f97316; margin-bottom: 0.4rem; }
    header p { font-size: 0.8rem; color: #64748b; }
    blockquote { border-left: 3px solid #f97316; padding: 0.5rem 1rem; color: #94a3b8; font-style: italic; margin-bottom: 2rem; background: rgba(249,115,22,0.05); border-radius: 0 6px 6px 0; }
    section { margin-bottom: 2.5rem; }
    h2 { font-size: 0.65rem; font-family: monospace; color: #64748b; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; margin-bottom: 0.75rem; border-bottom: 1px solid #1e293b; padding-bottom: 0.4rem; }
    h3 { font-size: 0.7rem; font-family: monospace; color: #f97316; text-transform: uppercase; letter-spacing: 0.1em; margin: 1rem 0 0.4rem; }
    p { color: #cbd5e1; font-size: 0.93rem; }
    pre { white-space: pre-wrap; word-break: break-word; background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 1rem 1.25rem; font-family: inherit; color: #cbd5e1; font-size: 0.88rem; }
    ul { list-style: none; padding: 0; }
    ul li { padding: 0.3rem 0 0.3rem 1.2rem; position: relative; font-size: 0.9rem; color: #cbd5e1; }
    ul li::before { content: '—'; position: absolute; left: 0; color: #f97316; }
    .keywords { color: #f97316; font-family: monospace; font-size: 0.82rem; letter-spacing: 0.04em; }
    dl { display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1.2rem; }
    dt { font-family: monospace; font-size: 0.7rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; padding-top: 0.25rem; white-space: nowrap; }
    dd { color: #cbd5e1; font-size: 0.9rem; }
    dd.headline { color: #fff; font-weight: 700; font-size: 1rem; }
    dd.quote { font-style: italic; border-left: 2px solid #f97316; padding-left: 0.75rem; }
    @media (max-width: 600px) { dl { grid-template-columns: 1fr; } dt { padding-top: 0.75rem; } }
  `.trim();

  const date = new Date().toLocaleDateString('da-DK', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${css}</style>
</head>
<body>
<div class="wrapper">
<header>
  <h1>${esc(title)}</h1>
  <p>Genereret ${date} · Content Machine Content Machine</p>
</header>
${sections.join('\n')}
</div>
</body>
</html>`;
}

/** Download a self-contained HTML file with the full content package. */
export function downloadHtmlFile(output: BrandSurfaceOutput, brief?: ProjectBrief): void {
  const html = buildHtml(output, brief);
  const slug = slugify(brief?.client || 'brand-surface');
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-case.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
