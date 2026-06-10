/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { httpErrorMessage } from './httpError';

export type GeneratedImageKey = 'hero' | 'detail' | 'abstract' | 'custom';
export type GeneratedImageState = { url: string; loading: boolean; error: string | null; aspectRatio: string };
export type GeneratedImages = Record<GeneratedImageKey, GeneratedImageState>;

/**
 * AI-billedgenerering pr. slot (hero/detail/abstract/custom): aspekt-forhold og
 * generering via /api/generate-image. Selvstændigt domæne — kun afhængig af
 * den fælles fejl-helper. setGeneratedImages eksponeres så session-gendannelse
 * kan fylde gemte billeder ind.
 */
export function useImageGeneration() {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages>({
    hero: { url: '', loading: false, error: null, aspectRatio: '16:9' },
    detail: { url: '', loading: false, error: null, aspectRatio: '1:1' },
    abstract: { url: '', loading: false, error: null, aspectRatio: '16:9' },
    custom: { url: '', loading: false, error: null, aspectRatio: '1:1' }
  });

  const [isOptimizingImagePrompt, setIsOptimizingImagePrompt] = useState(false);

  const handleGenerateImage = async (key: GeneratedImageKey, promptText: string, model?: string) => {
    setGeneratedImages(prev => ({ ...prev, [key]: { ...prev[key], loading: true, error: null } }));
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText, aspectRatio: generatedImages[key]?.aspectRatio || '16:9', model: model || 'flux' })
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const data = await response.json();
      if (!data.imageUrl) throw new Error('Forkert svar-format fra API.');
      setGeneratedImages(prev => ({ ...prev, [key]: { ...prev[key], url: data.imageUrl, loading: false, error: null } }));
    } catch (err: any) {
      console.error("Fejl i handleGenerateImage:", err);
      setGeneratedImages(prev => ({
        ...prev,
        [key]: { ...prev[key], loading: false, error: err.message || 'Der opstod en uventet fejl under billedgenereringen.' }
      }));
    }
  };

  const handleAspectChange = (key: GeneratedImageKey, ratio: string) => {
    setGeneratedImages(prev => ({ ...prev, [key]: { ...prev[key], aspectRatio: ratio } }));
  };

  const handleOptimizeImagePrompt = async (
    brief: unknown,
    currentPrompt: string,
    mode: 'translate' | 'refine',
  ): Promise<string | null> => {
    setIsOptimizingImagePrompt(true);
    try {
      const response = await fetch('/api/image-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, currentPrompt, mode }),
      });
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(httpErrorMessage(response.status, errData.error));
      }
      const data = await response.json();
      return (data.prompt as string) || null;
    } catch (err) {
      console.error('Fejl i handleOptimizeImagePrompt:', err);
      return null;
    } finally {
      setIsOptimizingImagePrompt(false);
    }
  };

  return { generatedImages, setGeneratedImages, handleGenerateImage, handleAspectChange, isOptimizingImagePrompt, handleOptimizeImagePrompt };
}
