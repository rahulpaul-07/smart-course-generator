import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiStatusService } from '@/services/aiStatusService';
import { cn } from '@/lib/utils';
import { routerLabel, routerTone, summarizeRouter, type RouterSummary } from './routerStatus';

/**
 * Link to /status whose indicator reflects the router's actual state, read
 * from GET /api/ai/status. It replaces an always-green "live" dot that
 * reported nothing. The request also wakes a sleeping free-tier API before
 * the visitor starts the demo.
 */
export function RouterStatusLink() {
  const [summary, setSummary] = useState<RouterSummary>({ state: 'loading' });

  useEffect(() => {
    let cancelled = false;
    aiStatusService.get(1).then(([data]) => {
      if (!cancelled) setSummary(summarizeRouter(data));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link to="/status" className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
      <span aria-hidden className={cn('h-2 w-2 rounded-full', routerTone(summary))} />
      <span aria-live="polite">{routerLabel(summary)}</span>
    </Link>
  );
}
