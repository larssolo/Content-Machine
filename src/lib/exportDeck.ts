/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type {
  BrandSurfaceOutput,
  ChannelMatrix,
  CampaignTerritory,
  ProjectBrief,
  StrategyFoundation,
} from '../types';
import { slugify } from './exportMarkdown';

/**
 * Indgangsdata til pitch-decken. Kun `territory` er påkrævet — alt andet er
 * valgfrit og slides springes graciøst over når data mangler.
 */
export interface DeckInput {
  brief: ProjectBrief;
  territory: CampaignTerritory;
  strategy?: StrategyFoundation | null;
  channelMatrix?: ChannelMatrix | null;
  output?: BrandSurfaceOutput | null;
  /** Resolved logo-billed-src (data-URI eller URL). */
  logoSrc?: string | null;
  /** Rå SVG-markup — foretrukket over logoSrc når til stede. */
  logoSvg?: string | null;
  /** Resolved billed-srcs (data-URI eller URL). */
  images?: { hero?: string | null; detail?: string | null; abstract?: string | null };
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Validér en hex-farve så kun trygge værdier havner i CSS. */
function safeHex(hex?: string): string | null {
  if (!hex) return null;
  const m = hex.trim().match(/^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  return m ? `#${m[1]}` : null;
}

const FALLBACK_PRIMARY = '#f97316';
const FALLBACK_ACCENT = '#8b5cf6';

function slide(label: string, body: string, extraClass = '', style = ''): string {
  const styleAttr = style ? ` style="${style}"` : '';
  const labelHtml = label
    ? `<span class="deck-label">${esc(label)}</span>`
    : '';
  return `<section class="slide ${extraClass}"${styleAttr}>
  <div class="slide-inner">${labelHtml}${body}</div>
</section>`;
}

/**
 * Byg en self-contained HTML pitch-deck ud fra app-state. Ren & synkron —
 * alle billed-srcs forventes allerede opløst (data-URI eller URL).
 */
export function buildDeckHtml(input: DeckInput): string {
  const { brief, territory, strategy, channelMatrix, output, logoSrc, logoSvg, images } = input;

  const colors = output?.cviSuggestion?.brandColors ?? [];
  const primary = safeHex(colors[0]?.hex) ?? FALLBACK_PRIMARY;
  const accent = safeHex(colors[1]?.hex) ?? FALLBACK_ACCENT;

  const logoHtml = logoSvg
    ? `<div class="deck-logo">${logoSvg}</div>`
    : logoSrc
      ? `<div class="deck-logo"><img src="${esc(logoSrc)}" alt="Logo"></div>`
      : '';

  const slides: string[] = [];

  // 1. Cover
  slides.push(
    slide(
      '',
      `${logoHtml}
      <p class="cover-client">${esc(brief.client || 'Content Machine')}${brief.project ? ` — ${esc(brief.project)}` : ''}</p>
      <h1 class="cover-tagline">${esc(territory.tagline || territory.bigIdea)}</h1>
      <p class="cover-name">${esc(territory.name)}</p>`,
      'cover',
    ),
  );

  // 2. Udfordringen
  if (strategy?.tension) {
    slides.push(
      slide(
        'Udfordringen',
        `<h2 class="big">${esc(strategy.tension)}</h2>${
          strategy.competitiveContext
            ? `<p class="sub">${esc(strategy.competitiveContext)}</p>`
            : ''
        }`,
      ),
    );
  }

  // 3. Indsigten
  if (strategy?.audienceTruth) {
    slides.push(
      slide(
        'Indsigten',
        `<blockquote class="insight">${esc(strategy.audienceTruth)}</blockquote>`,
      ),
    );
  }

  // 4. Strategien
  if (strategy?.singleMindedProposition) {
    const rtb = strategy.reasonsToBelieve?.length
      ? `<ul class="rtb">${strategy.reasonsToBelieve.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`
      : '';
    slides.push(
      slide(
        'Strategien',
        `<h2 class="big">${esc(strategy.singleMindedProposition)}</h2>${rtb}${
          strategy.desiredResponse
            ? `<p class="sub"><strong>Ønsket respons:</strong> ${esc(strategy.desiredResponse)}</p>`
            : ''
        }`,
      ),
    );
  }

  // 5. Den Store Idé
  const heroStyle = images?.hero
    ? `background-image:linear-gradient(rgba(8,11,20,0.78),rgba(8,11,20,0.92)),url('${esc(images.hero)}');background-size:cover;background-position:center;`
    : '';
  slides.push(
    slide(
      'Den Store Idé',
      `<p class="idea-name">${esc(territory.name)}</p>
      <h1 class="idea">${esc(territory.bigIdea)}</h1>
      <p class="idea-tagline">${esc(territory.tagline)}</p>`,
      'big-idea',
      heroStyle,
    ),
  );

  // 6. Manifest
  if (territory.manifesto) {
    slides.push(
      slide(
        'Manifest',
        `<blockquote class="manifesto">${esc(territory.manifesto)}</blockquote>${
          territory.toneDescriptor
            ? `<p class="sub"><strong>Tone:</strong> ${esc(territory.toneDescriptor)}</p>`
            : ''
        }`,
      ),
    );
  }

  // 7..N. Kanal-eksekvering (én pr. kanal)
  (channelMatrix?.channels ?? []).forEach((ch) => {
    const scriptRows = ch.script?.length
      ? `<div class="script">${ch.script
          .map(
            (b) =>
              `<div class="script-row"><span class="script-label">${esc(b.label)}</span><span class="script-content">${esc(b.content)}</span></div>`,
          )
          .join('')}</div>`
      : '';
    slides.push(
      slide(
        ch.channel || 'Kanal',
        `<p class="ch-format">${esc(ch.format || '')}</p>
        <h2 class="ch-headline">${esc(ch.headline || '')}</h2>
        ${ch.keyMessage ? `<p class="sub">${esc(ch.keyMessage)}</p>` : ''}
        ${scriptRows}
        ${ch.cta ? `<p class="ch-cta">${esc(ch.cta)}</p>` : ''}`,
        'channel',
      ),
    );
  });

  // N+1. Visuel identitet
  const cvi = output?.cviSuggestion;
  if (cvi || logoHtml || images?.detail) {
    const swatches = cvi?.brandColors?.length
      ? `<div class="swatches">${cvi.brandColors
          .map((c) => {
            const hex = safeHex(c.hex);
            return `<div class="swatch"><span class="chip" style="background:${hex ?? '#334155'}"></span><span class="chip-meta"><strong>${esc(c.hex)}</strong>${c.name ? `<span>${esc(c.name)}</span>` : ''}</span></div>`;
          })
          .join('')}</div>`
      : '';
    const fonts = cvi?.fonts
      ? `<p class="sub"><strong>Typografi:</strong> ${esc(cvi.fonts.primaryHeadings)} / ${esc(cvi.fonts.bodyText)}</p>`
      : '';
    const concept = cvi?.visualIdentityConcept
      ? `<p class="sub">${esc(cvi.visualIdentityConcept)}</p>`
      : '';
    const detailImg = images?.detail
      ? `<div class="vi-image"><img src="${esc(images.detail)}" alt="Visuelt koncept"></div>`
      : '';
    slides.push(
      slide(
        'Visuel identitet',
        `${logoHtml}${swatches}${fonts}${concept}${detailImg}`,
        'visual-identity',
      ),
    );
  }

  // N+2. Hvorfor det vinder + CTA
  const bestCta = output?.directUsable?.bestCta || territory.tagline;
  slides.push(
    slide(
      'Hvorfor det vinder',
      `<h2 class="big">${esc(territory.rationale || '')}</h2>${
        strategy?.strategicSummary ? `<p class="sub">${esc(strategy.strategicSummary)}</p>` : ''
      }${bestCta ? `<p class="closing-cta">${esc(bestCta)}</p>` : ''}`,
      'closing',
    ),
  );

  const css = `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :root{--deck-primary:${primary};--deck-accent:${accent};--deck-bg:#080b14;--deck-fg:#e8edf6;--deck-muted:#7c8aa5}
    html{scroll-behavior:smooth}
    body{font-family:'Segoe UI',system-ui,-apple-system,sans-serif;background:var(--deck-bg);color:var(--deck-fg);scroll-snap-type:y mandatory;overflow-x:hidden}
    .slide{min-height:100vh;width:100%;display:flex;align-items:center;justify-content:center;padding:6vh 8vw;scroll-snap-align:start;position:relative;border-bottom:1px solid rgba(255,255,255,0.04)}
    .slide-inner{max-width:960px;width:100%}
    .deck-label{display:inline-block;font-family:ui-monospace,monospace;font-size:0.72rem;letter-spacing:0.22em;text-transform:uppercase;color:var(--deck-primary);font-weight:700;margin-bottom:1.6rem;padding-bottom:0.5rem;border-bottom:2px solid var(--deck-primary)}
    h1.cover-tagline{font-size:clamp(2.4rem,6vw,4.6rem);line-height:1.04;font-weight:800;letter-spacing:-0.02em;margin:0.4rem 0}
    h1.idea{font-size:clamp(2rem,5vw,3.8rem);line-height:1.08;font-weight:800;letter-spacing:-0.015em;margin:0.5rem 0}
    h2.big,h2.ch-headline{font-size:clamp(1.6rem,3.6vw,2.8rem);line-height:1.18;font-weight:700;letter-spacing:-0.01em}
    .cover{background:radial-gradient(circle at 25% 15%,color-mix(in srgb,var(--deck-primary) 22%,transparent),transparent 55%),radial-gradient(circle at 85% 90%,color-mix(in srgb,var(--deck-accent) 20%,transparent),transparent 50%),var(--deck-bg);text-align:center}
    .cover .slide-inner{display:flex;flex-direction:column;align-items:center}
    .deck-logo{max-width:140px;margin-bottom:2rem;line-height:0}
    .deck-logo img,.deck-logo svg{max-width:140px;max-height:120px;height:auto;width:auto}
    .cover-client{font-family:ui-monospace,monospace;font-size:0.8rem;letter-spacing:0.18em;text-transform:uppercase;color:var(--deck-muted);margin-bottom:1rem}
    .cover-name{font-family:ui-monospace,monospace;font-size:0.78rem;letter-spacing:0.14em;text-transform:uppercase;color:var(--deck-primary);margin-top:1.4rem}
    .idea-name{font-family:ui-monospace,monospace;font-size:0.8rem;letter-spacing:0.16em;text-transform:uppercase;color:var(--deck-primary);margin-bottom:0.6rem}
    .idea-tagline{font-size:1.3rem;color:var(--deck-primary);font-weight:600;margin-top:1rem}
    .sub{font-size:1.05rem;line-height:1.6;color:#c3cde0;margin-top:1.4rem;max-width:760px}
    blockquote.insight,blockquote.manifesto{font-size:clamp(1.6rem,3.4vw,2.6rem);line-height:1.32;font-weight:600;font-style:italic;border-left:4px solid var(--deck-primary);padding-left:1.6rem;color:#fff}
    ul.rtb{list-style:none;margin-top:1.8rem;display:grid;gap:0.7rem;max-width:760px}
    ul.rtb li{position:relative;padding-left:1.6rem;font-size:1.02rem;line-height:1.5;color:#c3cde0}
    ul.rtb li::before{content:'';position:absolute;left:0;top:0.55em;width:8px;height:8px;border-radius:50%;background:var(--deck-primary)}
    .ch-format{font-family:ui-monospace,monospace;font-size:0.76rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--deck-muted);margin-bottom:0.8rem}
    .script{margin-top:1.8rem;display:grid;gap:0.6rem;max-width:820px}
    .script-row{display:grid;grid-template-columns:120px 1fr;gap:1rem;padding:0.7rem 0;border-top:1px solid rgba(255,255,255,0.07)}
    .script-label{font-family:ui-monospace,monospace;font-size:0.72rem;letter-spacing:0.08em;text-transform:uppercase;color:var(--deck-primary);font-weight:700;padding-top:0.15rem}
    .script-content{font-size:0.98rem;line-height:1.5;color:#d4dcec;white-space:pre-wrap}
    .ch-cta{margin-top:1.6rem;display:inline-block;font-weight:700;font-size:1.05rem;color:var(--deck-bg);background:var(--deck-primary);padding:0.6rem 1.3rem;border-radius:8px}
    .swatches{display:flex;flex-wrap:wrap;gap:0.9rem;margin:1.6rem 0}
    .swatch{display:flex;align-items:center;gap:0.6rem}
    .chip{width:34px;height:34px;border-radius:8px;border:1px solid rgba(255,255,255,0.2);display:block}
    .chip-meta{display:flex;flex-direction:column;font-family:ui-monospace,monospace;font-size:0.74rem}
    .chip-meta strong{color:#fff}
    .chip-meta span{color:var(--deck-muted)}
    .vi-image{margin-top:1.8rem;border-radius:12px;overflow:hidden;max-width:520px;border:1px solid rgba(255,255,255,0.1)}
    .vi-image img{width:100%;height:auto;display:block}
    .closing-cta{margin-top:2rem;display:inline-block;font-weight:800;font-size:1.5rem;color:var(--deck-primary)}
    @media (max-width:640px){.script-row{grid-template-columns:1fr;gap:0.2rem}.slide{padding:7vh 7vw}}
    @media print{
      html,body{scroll-snap-type:none;background:#fff;color:#111}
      .slide{min-height:auto;page-break-after:always;border:none;padding:3rem 2.5rem}
      .sub,ul.rtb li,.script-content{color:#333}
      .cover{background:#fff}
      .chip-meta strong{color:#111}
    }
  `.trim();

  const nav = `
    (function(){
      var slides=[].slice.call(document.querySelectorAll('.slide'));
      var i=0;
      function go(n){i=Math.max(0,Math.min(slides.length-1,n));slides[i].scrollIntoView({behavior:'smooth'});}
      document.addEventListener('keydown',function(e){
        if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key==='PageDown'||e.key===' '){e.preventDefault();go(i+1);}
        else if(e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();go(i-1);}
      });
      if('IntersectionObserver' in window){
        var obs=new IntersectionObserver(function(en){en.forEach(function(x){if(x.isIntersecting){i=slides.indexOf(x.target);}});},{threshold:0.5});
        slides.forEach(function(s){obs.observe(s);});
      }
    })();
  `.trim();

  const title = `${brief.client || 'Content Machine'} — Pitch`;

  return `<!DOCTYPE html>
<html lang="da">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>${css}</style>
</head>
<body>
${slides.join('\n')}
<script>${nav}</script>
</body>
</html>`;
}

/** Hent en ekstern URL og konvertér til data-URI; fald tilbage til URL'en ved fejl. */
async function toDataUri(url?: string | null): Promise<string | null> {
  if (!url) return null;
  if (url.startsWith('data:')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return url; // graciøs fallback — eksterne URL virker stadig online
  }
}

/** Opløs billeder til data-URIs, byg decken og trigger browser-download. */
export async function downloadDeckFile(input: DeckInput): Promise<void> {
  const [logoSrc, hero, detail, abstract] = await Promise.all([
    input.logoSvg ? Promise.resolve(input.logoSrc ?? null) : toDataUri(input.logoSrc),
    toDataUri(input.images?.hero),
    toDataUri(input.images?.detail),
    toDataUri(input.images?.abstract),
  ]);

  const html = buildDeckHtml({
    ...input,
    logoSrc,
    images: { hero, detail, abstract },
  });

  const slug = slugify(input.brief.client || 'pitch');
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${slug}-pitch-deck.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
