import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';
import { Check, CircleDashed, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A scripted replay of a real generation: the prompt, the SSE `stage` events
 * the backend emits (see courseAiController.generateCourseContentStream), the
 * curriculum arriving, then a lesson streaming in block by block. Everything
 * is derived from one clock so the loop can pause off-screen.
 */

const PROMPT = 'System design for backend interviews, with real trade-offs';
const LOOP_MS = 15500;

const MODULES = [
  { at: 2500, title: 'Scaling a single service', lessons: ['Vertical vs horizontal scaling', 'Load balancers & health checks'] },
  { at: 2900, title: 'Data at scale', lessons: ['Caching & invalidation', 'Replication and CAP'] },
  { at: 3300, title: 'Async systems', lessons: ['Queues & back-pressure', 'Idempotent consumers'] },
];

const PARAGRAPH =
  'A cache trades freshness for speed. The hard part is not storing data, it is deciding when a stored copy has stopped being true.';

const CODE = [
  'async function getUser(id) {',
  '  const hit = await cache.get(`user:${id}`);',
  '  if (hit) return hit;',
  '  const user = await db.users.find(id);',
  '  await cache.set(`user:${id}`, user, { ttl: 60 });',
  '  return user;',
  '}',
];

const EVENTS: { at: number; event: string; data: string }[] = [
  { at: 1500, event: 'stage', data: '{"stage":"analyzing_topic"}' },
  { at: 2200, event: 'stage', data: '{"stage":"designing_curriculum"}' },
  { at: 3900, event: 'stage', data: '{"stage":"saving_course"}' },
  { at: 4500, event: 'done', data: '{"modules":3,"lessons":6}' },
  { at: 5200, event: 'block', data: '{"type":"heading"}' },
  { at: 5600, event: 'block', data: '{"type":"paragraph"}' },
  { at: 7900, event: 'block', data: '{"type":"code","language":"js"}' },
  { at: 10300, event: 'block', data: '{"type":"callout","calloutType":"tip"}' },
  { at: 11300, event: 'block', data: '{"type":"quiz","questions":5}' },
];

const STAGES = [
  { at: 1500, label: 'Analyzing topic' },
  { at: 2200, label: 'Designing curriculum' },
  { at: 3900, label: 'Saving course' },
  { at: 4500, label: 'Streaming lesson' },
];

function useLoopClock(active: boolean, reduce: boolean) {
  const [t, setT] = useState(reduce ? LOOP_MS - 1 : 0);
  useEffect(() => {
    if (reduce || !active) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      setT((prev) => (prev + (now - last)) % LOOP_MS);
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, reduce]);
  return t;
}

const reveal = (text: string, t: number, start: number, cps: number) =>
  text.slice(0, Math.max(0, Math.min(text.length, Math.floor(((t - start) / 1000) * cps))));

export function StreamingDemo({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-80px' });
  const reduce = Boolean(useReducedMotion());
  const t = useLoopClock(inView, reduce);

  const typed = reveal(PROMPT, t, 200, 48);
  const stage = [...STAGES].reverse().find((s) => t >= s.at);
  const generating = t >= 1400 && t < 11500;
  const events = EVENTS.filter((e) => t >= e.at).slice(-5);
  const paragraph = reveal(PARAGRAPH, t, 5700, 70);
  const codeLines = CODE.filter((_, i) => t >= 8000 + i * 280);

  return (
    <div ref={ref} className={cn('overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border px-4 py-3 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Course generation, replayed</span>
        <span>Scripted, but the events and their order match the real SSE stream.</span>
      </div>

      {/* prompt */}
      <div className="border-b border-border p-4 sm:p-5">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-background px-4 py-3">
          <p className="min-w-0 flex-1 truncate text-sm text-foreground">
            {typed}
            {t < 1400 && <span className="ml-px inline-block h-4 w-[2px] translate-y-0.5 animate-blink bg-primary" />}
          </p>
          <span
            className={cn(
              'hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium sm:inline-flex',
              generating ? 'bg-primary/15 text-primary' : 'bg-foreground text-background'
            )}
          >
            {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            {generating ? stage?.label ?? 'Starting' : 'Generate'}
          </span>
        </div>
      </div>

      <div className="grid min-h-[340px] grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* curriculum */}
        <aside className="hidden border-r border-border p-4 md:block">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Curriculum</p>
          <div className="space-y-3">
            {MODULES.map((m, mi) => {
              const visible = t >= m.at;
              return (
                <div key={m.title} className={cn('transition-all duration-500', visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0')}>
                  <p className="text-xs font-medium text-foreground">
                    <span className="mr-1.5 font-mono text-muted-foreground">{String(mi + 1).padStart(2, '0')}</span>
                    {m.title}
                  </p>
                  <ul className="mt-1.5 space-y-1 border-l border-border pl-3">
                    {m.lessons.map((l, li) => {
                      const active = mi === 1 && li === 0 && t >= 4500;
                      return (
                        <li key={l} className={cn('flex items-center gap-1.5 text-[11px]', active ? 'text-primary' : 'text-muted-foreground')}>
                          {active ? <CircleDashed className="h-3 w-3 animate-spin [animation-duration:3s]" /> : <span className="h-1 w-1 rounded-full bg-current opacity-50" />}
                          <span className="truncate">{l}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>

        {/* lesson stream */}
        <div className="relative p-5 sm:p-6">
          {t < 4500 ? (
            <div className="space-y-3" aria-hidden>
              {[92, 78, 85, 60].map((w, i) => (
                <div key={i} className="h-3 rounded-full bg-muted/70" style={{ width: `${w}%`, opacity: t > 1400 ? 1 : 0.4 }} />
              ))}
              <div className="mt-6 h-28 rounded-xl bg-muted/40" />
            </div>
          ) : (
            <article className="space-y-4">
              {t >= 5200 && <h3 className="text-lg font-semibold tracking-tight">Caching &amp; invalidation</h3>}
              {t >= 5600 && (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {paragraph}
                  {paragraph.length < PARAGRAPH.length && <span className="ml-px inline-block h-3.5 w-[2px] translate-y-0.5 animate-blink bg-primary" />}
                </p>
              )}
              {codeLines.length > 0 && (
                <pre className="overflow-hidden rounded-xl border border-border bg-background/80 p-4 font-mono text-[11.5px] leading-6">
                  {codeLines.map((line, i) => (
                    <div key={i} className="whitespace-pre text-foreground/90">
                      <span className="mr-4 select-none text-muted-foreground">{i + 1}</span>
                      {line}
                    </div>
                  ))}
                </pre>
              )}
              {t >= 10300 && (
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200/90">
                  <span className="font-semibold text-emerald-300">Tip · </span>
                  Pick the TTL from how stale the data may be, not from how often it changes.
                </div>
              )}
              {t >= 11300 && (
                <div className="inline-flex items-center gap-2 rounded-lg border border-border bg-background/70 px-3 py-1.5 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-emerald-400" /> Knowledge check · 5 questions
                </div>
              )}
            </article>
          )}
        </div>
      </div>

      {/* raw SSE log */}
      <div className="border-t border-border bg-background/60 px-4 py-3 font-mono text-[11px] leading-5">
        <div className="mb-1 flex items-center gap-2 text-muted-foreground">
          <span className={cn('h-1.5 w-1.5 rounded-full', generating ? 'animate-pulse bg-emerald-400' : 'bg-muted-foreground/40')} />
          text/event-stream
        </div>
        <div className="h-[100px] overflow-hidden">
          {events.map((e) => (
            <div key={e.at} className="truncate animate-in fade-in slide-in-from-bottom-1 duration-300">
              <span className="text-primary">event:</span> <span className="text-foreground/90">{e.event}</span>
              <span className="ml-3 text-muted-foreground">data: {e.data}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
