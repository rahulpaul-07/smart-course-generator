import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { evalsService, type EvalGates, type EvalRow } from '../services/evalsService';
import { cn } from '@/lib/utils';

/**
 * The scorecard in `evals/report.md` is the only artefact that answers "is
 * generation still correct?", and it was previously readable only on GitHub.
 *
 * The shape of this data is unusual and the layout follows it: three metrics,
 * of which two are genuinely *not measured* without a provider key. The easy
 * mistake is to render those as 0% or as blank cells -- one lies, the other
 * looks like a rendering bug. They get an explicit "not measured" treatment
 * instead, and colour is spent on exactly one thing: whether a metric clears
 * its gate.
 */

const METRICS = [
  {
    key: 'structure' as const,
    label: 'Structure',
    help: 'Deterministic contract check: the outline has a title, at least one module, and every module has lessons.',
  },
  {
    key: 'coverage' as const,
    label: 'Coverage',
    help: 'Share of the expected subtopics that appear anywhere in the generated outline.',
  },
  {
    key: 'faithfulness' as const,
    label: 'Faithfulness',
    help: 'LLM-as-judge rating of accuracy and scope, 0-10, normalised. Requires a provider key.',
  },
];

function pct(value: number | null) {
  return value == null ? null : `${Math.round(value * 100)}%`;
}

function gateFor(metric: string, gates: EvalGates): number | null {
  if (metric === 'structure') return gates.structure;
  if (metric === 'faithfulness') return gates.faithfulness;
  return null;
}

function formatGenerated(iso: string | null) {
  if (!iso) return 'Unknown date';
  const date = new Date(iso);
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  const stamp = date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  if (days <= 0) return `Generated today, ${stamp}`;
  return `Generated ${stamp} · ${days} day${days === 1 ? '' : 's'} ago`;
}

/**
 * One metric value. Three distinct states, and they must not be confusable:
 * measured and passing, measured and failing its gate, or never measured.
 */
function Score({
  value,
  gate,
  size = 'sm',
}: {
  value: number | null;
  gate: number | null;
  size?: 'sm' | 'lg';
}) {
  if (value == null) {
    return (
      <span
        className={cn(
          'font-mono text-muted-foreground/70',
          size === 'lg' ? 'text-2xl' : 'text-sm'
        )}
        title="Not measured in this run"
      >
        n/a
      </span>
    );
  }

  const fails = gate != null && value < gate;

  return (
    <span className={cn('font-mono tabular-nums', size === 'lg' ? 'text-2xl' : 'text-sm', fails && 'text-red-500')}>
      {pct(value)}
    </span>
  );
}

function ScoreBar({ value, gate }: { value: number | null; gate: number | null }) {
  if (value == null) {
    // A dashed rule reads as "there is nothing here yet" rather than "zero".
    return <div className="mt-1.5 h-1 w-full border-t border-dashed border-border" aria-hidden />;
  }
  const fails = gate != null && value < gate;
  return (
    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
      <div
        className={cn('h-full rounded-full', fails ? 'bg-red-500' : 'bg-emerald-500')}
        style={{ width: `${Math.max(value * 100, 1)}%` }}
      />
    </div>
  );
}

function PromptCell({ row }: { row: EvalRow }) {
  return (
    <div className="min-w-0">
      <code className="font-mono text-sm text-foreground">{row.id}</code>
      {row.prompt && <p className="mt-1 text-sm text-muted-foreground">{row.prompt}</p>}
      {row.expectedSubtopics.length > 0 && (
        <p className="mt-2 flex flex-wrap gap-1.5">
          {row.expectedSubtopics.map((topic) => (
            <span
              key={topic}
              className="rounded border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground"
            >
              {topic}
            </span>
          ))}
        </p>
      )}
    </div>
  );
}

export default function EvalsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['evals-report'],
    queryFn: async () => {
      const [res] = await evalsService.get();
      return res;
    },
    // The report is a committed file; it changes when someone runs the harness
    // and commits, not while the tab is open.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  return (
    <PageContainer>
      <header className="mb-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Evals</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Every course generator claims it works. This is the scorecard that checks: four golden
              prompts, run through the real generation path, scored on structure, topic coverage and
              faithfulness. Written by <code className="font-mono text-xs">npm run eval</code> and
              committed to the repo — this page reads that file, it does not re-run the harness.
            </p>
          </div>

          {data?.available && (
            <div className="text-right">
              <span className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 font-mono text-xs">
                mode: {data.mode}
              </span>
              <p className="mt-2 text-xs text-muted-foreground">{formatGenerated(data.generatedAt)}</p>
            </div>
          )}
        </div>
      </header>

      {isLoading && (
        <div className="space-y-4" aria-hidden>
          <div className="h-24 animate-pulse rounded-xl bg-muted/40" />
          <div className="h-64 animate-pulse rounded-xl bg-muted/40" />
        </div>
      )}

      {isError && (
        <p className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Could not reach the evals endpoint. The API may be starting up.
        </p>
      )}

      {data && !data.available && (
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">No scorecard on disk</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            {data.reason === 'not-found'
              ? 'The API could not find evals/report.md next to it. That happens when only the backend directory is deployed.'
              : 'The API found evals/report.md but could not read it.'}{' '}
            Run <code className="font-mono text-xs">npm run eval</code> from the backend directory to
            generate one, then commit the result.
          </p>
        </div>
      )}

      {data?.available && (
        <>
          {/* Aggregate first: the headline numbers, each against its gate. */}
          <section aria-label="Aggregate scores" className="mb-10 grid gap-4 sm:grid-cols-3">
            {METRICS.map((metric) => {
              const value = data.aggregate[metric.key];
              const gate = gateFor(metric.key, data.gates);
              const fails = value != null && gate != null && value < gate;
              return (
                <div key={metric.key} className="rounded-xl border border-border bg-card p-5">
                  <div className="flex items-baseline justify-between gap-2">
                    <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {metric.label}
                    </h2>
                    {gate != null && (
                      <span className="font-mono text-[11px] text-muted-foreground">
                        gate ≥{pct(gate)}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <Score value={value} gate={gate} size="lg" />
                    {value != null && gate != null && (
                      <span
                        className={cn(
                          'font-mono text-xs',
                          fails ? 'text-red-500' : 'text-emerald-500'
                        )}
                      >
                        {fails ? 'below gate' : 'pass'}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {value == null ? 'Not measured in this run. ' : ''}
                    {metric.help}
                  </p>
                </div>
              );
            })}
          </section>

          <section aria-label="Per-prompt scores" className="min-w-0">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Golden prompts
            </h2>
            <div className="min-w-0 overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full min-w-[40rem] border-collapse text-left">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Prompt
                    </th>
                    {METRICS.map((metric) => (
                      <th
                        key={metric.key}
                        scope="col"
                        className="w-32 px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {metric.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 align-top last:border-0">
                      <td className="px-5 py-4">
                        <PromptCell row={row} />
                      </td>
                      {METRICS.map((metric) => {
                        const gate = gateFor(metric.key, data.gates);
                        return (
                          <td key={metric.key} className="px-5 py-4">
                            <Score value={row[metric.key]} gate={gate} />
                            <ScoreBar value={row[metric.key]} gate={gate} />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {data.note && (
            <p className="mt-6 max-w-3xl border-l-2 border-border pl-4 text-sm leading-relaxed text-muted-foreground">
              {data.note}
            </p>
          )}

          <details className="mt-8 rounded-xl border border-border bg-card">
            <summary className="cursor-pointer px-5 py-3 text-sm font-medium">
              Raw <code className="font-mono text-xs">evals/report.md</code>
            </summary>
            <pre className="overflow-x-auto border-t border-border px-5 py-4 font-mono text-xs leading-relaxed text-muted-foreground">
              {data.raw}
            </pre>
          </details>
        </>
      )}
    </PageContainer>
  );
}
