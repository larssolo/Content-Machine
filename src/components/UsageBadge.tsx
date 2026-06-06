/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Zap } from 'lucide-react';
import { UsageInfo } from '../types';

interface UsageBadgeProps {
  usage: UsageInfo;
}

export function UsageBadge({ usage }: UsageBadgeProps) {
  const total = usage.inputTokens + usage.outputTokens;
  const formatted = total >= 1000 ? `${(total / 1000).toFixed(1)}k` : String(total);
  const cachePercent = usage.inputTokens > 0
    ? Math.round((usage.cacheReadTokens / usage.inputTokens) * 100)
    : 0;

  const tooltip = [
    `Input: ${usage.inputTokens.toLocaleString('da-DK')} tokens`,
    `Output: ${usage.outputTokens.toLocaleString('da-DK')} tokens`,
    usage.cacheReadTokens > 0 ? `Cache-læst: ${usage.cacheReadTokens.toLocaleString('da-DK')} tokens (${cachePercent}%)` : null,
    usage.cacheWriteTokens > 0 ? `Cache-skrevet: ${usage.cacheWriteTokens.toLocaleString('da-DK')} tokens` : null,
  ].filter(Boolean).join(' · ');

  return (
    <span
      className="flex items-center space-x-1 text-[11px] font-mono text-slate-500 cursor-default"
      title={tooltip}
    >
      <Zap className="w-3 h-3 text-amber-500/60 shrink-0" />
      <span>~{formatted} tokens</span>
      {cachePercent > 0 && (
        <span className="text-emerald-600/70">({cachePercent}% cache)</span>
      )}
    </span>
  );
}
