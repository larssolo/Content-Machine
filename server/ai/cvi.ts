/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type Anthropic from '@anthropic-ai/sdk';

const SUPPORTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];

/**
 * Byg Claude-bruger-indhold til CVI-analyse ud fra et uploadet dokument.
 * PDF → document-blok, billede → image-blok, ellers → tekst-blok.
 * Bevarer den eksisterende data:-URL parsing fra Gemini-versionen.
 */
export function buildCviUserContent(
  fileContent: string,
  fileType?: string,
): Anthropic.ContentBlockParam[] {
  const isBase64DataUrl = typeof fileContent === 'string' && fileContent.startsWith('data:');

  let finalContent = fileContent;
  let finalMimeType = fileType || 'image/png';

  if (isBase64DataUrl) {
    const matches = fileContent.match(/^data:([^;]+);base64,(.*)$/);
    if (matches && matches.length === 3) {
      finalMimeType = matches[1];
      finalContent = matches[2];
    }
  }

  const blocks: Anthropic.ContentBlockParam[] = [];

  if (finalMimeType === 'application/pdf') {
    blocks.push({
      type: 'document',
      source: { type: 'base64', media_type: 'application/pdf', data: finalContent },
    });
  } else if (SUPPORTED_IMAGE_TYPES.includes(finalMimeType)) {
    blocks.push({
      type: 'image',
      source: {
        type: 'base64',
        media_type: finalMimeType as 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp',
        data: finalContent,
      },
    });
  } else {
    // Tekst/markdown/html — dekod base64 hvis det kom som en data:-URL.
    let textContent = finalContent;
    if (isBase64DataUrl) {
      try {
        textContent = Buffer.from(finalContent, 'base64').toString('utf-8');
      } catch {
        /* behold som det er */
      }
    }
    blocks.push({
      type: 'text',
      text: `Her er tekstmæssige retningslinjer eller metadata fra CVI filen:\n\n${textContent}`,
    });
  }

  blocks.push({
    type: 'text',
    text: 'Analysér den vedhæftede designmanual/CVI ovenfor og aflever resultatet via værktøjet.',
  });

  return blocks;
}
