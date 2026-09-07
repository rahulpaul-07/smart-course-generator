import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, ChevronDown, Pause, Play } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { aiStatusService, type BreakerStatus, type ProviderStatus, type TelemetryEvent } from '../services/aiStatusService';
import { cn } from '@/lib/utils';

/**
 * The routing layer is the most substantial engineering in this project and,
 * until now, the least visible: failover between providers, circuit breakers
 * and key rotation all happened silently inside a request. This page renders
 * the same state the router acts on, so the behaviour can be watched rather
 * than described.
 */

const STATUS_COPY: Record<BreakerStatus, { label: string; rail: string; dot: string; text: string }> = {
  closed: { label: 'Healthy', rail: 'bg-emerald-500', dot: 'bg-emerald-500', text: 'text-emerald-500' },
  degraded: { label: 'Degraded', rail: 'bg-amber-500', dot: 'bg-amber-500', text: 'text-amber-500' },
  'half-open': { label: 'Probing', rail: 'bg-sky-500', dot: 'bg-sky-500', text: 'text-sky-500' },
  open: { label: 'Tripped', rail: 'bg-red-500', dot: 'bg-red-500', text: 'text-red-500' },
  unconfigured: { label: 'No key', rail: 'bg-muted-foreground/30', dot: 'bg-muted-foreground/40', text: 'text-muted-foreground' },
};

function formatMs(ms: number | null) {
  if (ms == null) return '—';
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms}ms`;
}

function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour12: false });
}

function ProviderRow({ p, isLast }: { p: ProviderStatus; isLast: boolean }) {
  const s = STATUS_COPY[p.breaker.status] ?? STATUS_COPY.unconfigured;
  const skipped = p.breaker.status === 'open' || !p.configured;

  return (
    <li className="relative grid grid-cols-[2rem_0.25rem_1fr] gap-x-4">
      {/* Position marker and the connector running down to the next provider,
          so the fallback order reads as an actual ordered chain rather than a
          set of unrelated cards. */}
      <div className="flex flex-col items-center">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card font-mono text-xs text-muted-foreground">
          {p.position + 1}
        </span>
        {!isLast && <span className="mt-1 w-px flex-1 bg-border" aria-hidden />}
      </div>

      <span className={cn('rounded-full', s.rail, skipped && 'opacity-40')} aria-hidden />

      <div className={cn('pb-8', skipped && 'opacity-55')}>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-semibold capitalize">{p.provider}</h3>
          <code className="font-mono text-xs text-muted-foreground">{p.model}</code>
          <span className={cn('flex items-center gap-1.5 text-xs font-medium', s.text)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', s.dot)} aria-hidden />
            {s.label}
          </span>
        </div>

        <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-xs text-muted-foreground">Success rate</dt>
            <dd className="font-mono">{p.window.successRate == null ? '—' : `${p.window.successRate}%`}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Avg latency</dt>
            <dd className="font-mono">{formatMs(p.window.avgLatencyMs)}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Calls</dt>
            <dd className="font-mono">
              {p.window.total}
              {p.window.failure > 0 && (
                <span className="ml-1 text-red-500">({p.window.failure} failed)</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Keys in pool</dt>
            <dd className="font-mono">{p.keyCount || '—'}</dd>
          </div>
        </dl>

        {p.breaker.status === 'open' && (
          <p className="mt-3 text-xs text-red-500">
            Breaker tripped after {p.breaker.failures}/{p.breaker.threshold} failures. Skipping this
            provider for another {Math.ceil(p.breaker.retryInMs / 1000)}s.
          </p>
        )}
        {!p.configured && (
          <p className="mt-3 text-xs text-muted-foreground">
            <code className="font-mono">{p.envVar}</code> is not set, so this position is skipped.
          </p>
        )}
      </div>
    </li>
  );
}

function EventRow({ e }: { e: TelemetryEvent }) {
  const failed = e.status === 'failure';
  return (
    <li
      className={cn(
        'grid grid-cols-[4.5rem_1fr_auto] items-baseline gap-3 border-b border-border/60 py-2 font-mono text-xs last:border-0',
        failed && 'text-red-500'
      )}
    >
      <span className="text-muted-foreground">{formatClock(e.timestamp)}</span>
      <span className="truncate">
        <span className="capitalize">{e.provider}</span>
        <span className="text-muted-foreground"> · {e.endpoint}</span>
        {e.attempt > 0 && !failed && (
          <span className="ml-2 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
            FAILOVER #{e.attempt}
          </span>
        )}
        {failed && e.reason && (
          <span className="block truncate text-[11px] opacity-80">{e.reason}</span>
        )}
      </span>
      <span className="text-muted-foreground">{formatMs(e.latencyMs)}</span>
    </li>
  );
}

export default function AiRouterPage() {
  const [live, setLive] = useState(true);
  const [hours, setHours] = useState(24);

  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['ai-status', hours],
    queryFn: async () => {
      const [res] = await aiStatusService.get(hours);
      return res;
    },
    refetchInterval: live ? 5000 : false,
  });

  // Pause polling when the tab is hidden: a status panel left open in a
  // background tab should not keep hitting the API every five seconds.
  useEffect(() => {
    const onVisibility = () => setLive(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  const providers = data?.providers ?? [];

  return (
    <PageContainer>
      <header className="mb-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Router</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Requests walk this chain top to bottom. A provider is skipped when its circuit breaker
              trips, and the next one takes over — every generation you have run is accounted for below.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className="h-9 appearance-none rounded-lg border border-border bg-card pl-3 pr-8 text-sm"
                aria-label="Time window"
              >
                <option value={1}>Last hour</option>
                <option value={24}>Last 24 hours</option>
                <option value={168}>Last 7 days</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <button
              type="button"
              onClick={() => setLive((v) => !v)}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm"
              aria-pressed={live}
            >
              {live ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {live ? 'Live' : 'Paused'}
            </button>
          </div>
        </div>

        {data && (
          <p className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Activity className={cn('h-3.5 w-3.5', live && 'animate-pulse text-emerald-500')} />
              {data.summary.requests} calls in window
            </span>
            <span>{data.summary.failovers} served by a fallback provider</span>
            <span>Updated {formatClock(new Date(dataUpdatedAt).toISOString())}</span>
          </p>
        )}
      </header>

      {isError && (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Could not reach the status endpoint. The API may be starting up.
        </p>
      )}

      {isLoading && !data && (
        <div className="space-y-4" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      )}

      {data && !data.anyProviderConfigured && (
        <p className="mb-8 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
          No provider keys are configured, so generation runs against built-in sample content.
        </p>
      )}

      {data && (
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section aria-label="Provider chain">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Fallback chain
            </h2>
            <ol>
              {providers.map((p, i) => (
                <ProviderRow key={`${p.provider}-${p.position}`} p={p} isLast={i === providers.length - 1} />
              ))}
            </ol>
          </section>

          <section aria-label="Recent activity">
            <h2 className="mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Recent calls
            </h2>
            {data.recent.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nothing in this window yet. Generate a course or an interview pack and it will appear here.
              </p>
            ) : (
              <ul className="rounded-xl border border-border bg-card px-4">
                {data.recent.map((e) => (
                  <EventRow key={e._id} e={e} />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  );
}
