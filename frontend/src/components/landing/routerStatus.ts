import type { AiStatus } from '@/services/aiStatusService';

export type RouterSummary =
  | { state: 'loading' }
  | { state: 'unavailable' }
  | { state: 'mock' }
  | { state: 'live'; available: number; configured: number };

/** Collapse GET /api/ai/status into what the landing page indicator shows. */
export function summarizeRouter(status: AiStatus | null): RouterSummary {
  if (!status) return { state: 'unavailable' };
  const configured = status.providers.filter((p) => p.configured);
  if (configured.length === 0) return { state: 'mock' };
  const available = configured.filter((p) => p.breaker.status !== 'open').length;
  return { state: 'live', available, configured: configured.length };
}

export function routerLabel(summary: RouterSummary): string {
  switch (summary.state) {
    case 'loading':
      return 'Checking AI providers…';
    case 'unavailable':
      return 'Router status';
    case 'mock':
      return 'Offline mock mode: no AI provider configured';
    case 'live':
      return `${summary.available} of ${summary.configured} AI providers available`;
  }
}

/** Tailwind background class for the status dot. */
export function routerTone(summary: RouterSummary): string {
  if (summary.state === 'mock') return 'bg-amber-400';
  if (summary.state !== 'live') return 'bg-muted-foreground';
  if (summary.available === summary.configured) return 'bg-emerald-400';
  return summary.available > 0 ? 'bg-amber-400' : 'bg-red-500';
}
