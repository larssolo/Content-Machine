/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { fal } from '@fal-ai/client';

export type RecraftVectorStyle =
  | 'vector_illustration'
  | 'vector_illustration/flat_design'
  | 'vector_illustration/bold'
  | 'vector_illustration/minimalistic';

export interface RecraftLogoRequest {
  prompt: string;
  style?: RecraftVectorStyle;
  /** RGB-farver der skal guide generingen (udtrukket fra CVI-palette). */
  colors?: Array<{ r: number; g: number; b: number }>;
  width?: number;
  height?: number;
}

export interface RecraftLogoResult {
  imageUrl: string;
  contentType: string;
  /** Rå SVG-markup (hentet fra imageUrl) så frontenden kan inline-rendere den robust. */
  svg?: string;
}

let configured = false;
function ensureConfigured() {
  if (!configured && process.env.FAL_KEY) {
    fal.config({ credentials: process.env.FAL_KEY });
    configured = true;
  }
}

/**
 * Generer et SVG-logo via Recraft V4 Pro text-to-vector (fal.ai).
 * Returnerer en hosted URL til SVG-filen.
 */
export async function generateLogoSvg(opts: RecraftLogoRequest): Promise<RecraftLogoResult> {
  if (!process.env.FAL_KEY) {
    throw new Error(
      'FAL_KEY er ikke sat i miljøet. Tilføj din fal.ai API-nøgle for at generere logoer.',
    );
  }
  ensureConfigured();

  const result: any = await fal.subscribe('fal-ai/recraft/v4/pro/text-to-vector', {
    input: {
      prompt: opts.prompt,
      width: opts.width ?? 1024,
      height: opts.height ?? 1024,
      ...(opts.style ? { style: opts.style } : {}),
      ...(opts.colors && opts.colors.length > 0 ? { colors: opts.colors } : {}),
    } as any,
  });

  // Recraft text-to-vector returnerer typisk result.data.image.url (SVG hosted link)
  const url: string | undefined =
    result?.data?.image?.url ??
    result?.data?.images?.[0]?.url ??
    result?.image?.url ??
    result?.images?.[0]?.url;

  if (!url) {
    throw new Error('Ingen SVG-logo blev returneret fra Recraft (fal.ai).');
  }

  const contentType: string =
    result?.data?.image?.content_type ??
    result?.data?.images?.[0]?.content_type ??
    'image/svg+xml';

  // Hent selve SVG-markuppen, så frontenden kan inline-rendere den robust
  // (en ekstern SVG-URL renderer ikke altid i et <img>-tag pga. MIME/CORS).
  // Best-effort: fejler hentningen, falder vi tilbage til den hostede URL.
  let svg: string | undefined;
  try {
    const r = await fetch(url);
    if (r.ok) {
      const text = await r.text();
      if (text.includes('<svg')) svg = text;
    }
  } catch {
    /* ignorér — frontenden bruger imageUrl som fallback */
  }

  return { imageUrl: url, contentType, svg };
}
