/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { ProjectBrief, BrandSurfaceOutput } from '../types';

const KEY = 'brand_surface_history';
const MAX_ITEMS = 20;

export interface HistoryItem {
  id: string;
  ts: number;
  client: string;
  project: string;
  brief: ProjectBrief;
  output: BrandSurfaceOutput;
}

export function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: HistoryItem[]): HistoryItem[] {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    /* ignorér quota */
  }
  return items;
}

/** Tilføj en ny generering forrest i historikken (cappet til MAX_ITEMS). */
export function pushHistory(
  list: HistoryItem[],
  brief: ProjectBrief,
  output: BrandSurfaceOutput,
): HistoryItem[] {
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    client: brief.client || 'Uden kunde',
    project: brief.project || 'Uden projekt',
    brief: JSON.parse(JSON.stringify(brief)),
    output,
  };
  return persist([item, ...list].slice(0, MAX_ITEMS));
}

export function removeHistory(list: HistoryItem[], id: string): HistoryItem[] {
  return persist(list.filter((i) => i.id !== id));
}

export function clearHistory(): HistoryItem[] {
  return persist([]);
}
