import { useEffect, useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { BadgeCheck, Bot, Brain, Layers, Map, MessagesSquare, Network, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

function Tile({ icon: Icon, title, body, children, className }: {
  icon: typeof Brain;
  title: string;
  body: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={cn('group/card flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card', className)}>
      <div className="relative min-h-[210px] flex-1 overflow-hidden border-b border-border">{children}</div>
      <div className="p-6">
        <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Icon className="h-4 w-4 text-primary" aria-hidden /> {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}

/* ── Router failover ─────────────────────────────────────────────────── */
const PROVIDERS = ['Gemini', 'Groq', 'OpenRouter'];

function RouterVisual() {
  const reduce = useReducedMotion();
  const [down, setDown] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setDown((d) => (d + 1) % PROVIDERS.length), 3200);
    return () => window.clearInterval(id);
  }, [reduce]);
  const serving = (down + 1) % PROVIDERS.length;
  const ys = [50, 105, 160];

  return (
    <div className="absolute inset-0 flex items-center justify-center px-6">
      <svg viewBox="0 0 520 210" className="h-full w-full max-w-[560px]" role="img" aria-label="Requests fail over between three AI providers">
        {ys.map((y, i) => {
          const isDown = i === down;
          const isServing = i === serving;
          return (
            <g key={PROVIDERS[i]}>
              <path
                d={`M150 ${y} C 215 ${y}, 215 105, 262 105`}
                fill="none"
                strokeWidth={1.5}
                className={isDown ? 'stroke-red-500/30' : 'stroke-border'}
              />
              {isServing && (
                <path
                  d={`M150 ${y} C 215 ${y}, 215 105, 262 105`}
                  fill="none"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeDasharray="14 186"
                  className="animate-beam-dash stroke-primary"
                  style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary)))' }}
                />
              )}
              <rect x={24} y={y - 17} width={126} height={34} rx={10} className={cn('stroke-border', isDown ? 'fill-red-500/10' : 'fill-card')} strokeWidth={1} />
              <circle cx={42} cy={y} r={4} className={isDown ? 'fill-red-500' : isServing ? 'fill-emerald-400' : 'fill-muted-foreground/50'} />
              <text x={54} y={y + 4} className="fill-foreground text-[12px] font-medium">{PROVIDERS[i]}</text>
              {isDown && <text x={150} y={y - 22} textAnchor="end" className="fill-red-400 font-mono text-[9px]">breaker open</text>}
            </g>
          );
        })}
        <path d="M358 105 H 404" strokeWidth={1.5} className="stroke-border" />
        <path d="M358 105 H 404" strokeWidth={2} strokeDasharray="14 186" className="animate-beam-dash stroke-primary" />
        <rect x={262} y={78} width={96} height={54} rx={14} className="fill-primary/15 stroke-primary/50" strokeWidth={1} />
        <text x={310} y={101} textAnchor="middle" className="fill-foreground text-[12px] font-semibold">AI Router</text>
        <text x={310} y={117} textAnchor="middle" className="fill-muted-foreground font-mono text-[9px]">retry · breaker</text>
        <rect x={404} y={83} width={96} height={44} rx={12} className="fill-card stroke-border" strokeWidth={1} />
        <text x={452} y={109} textAnchor="middle" className="fill-foreground text-[12px] font-medium">Your lesson</text>
      </svg>
    </div>
  );
}

/* ── Interview score ─────────────────────────────────────────────────── */
function InterviewVisual() {
  const r = 38;
  const c = 2 * Math.PI * r;
  return (
    <div className="absolute inset-0 flex items-center justify-center gap-6 px-6">
      <span className="absolute left-4 top-3 text-[10px] uppercase tracking-wider text-muted-foreground">Sample result</span>
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r={r} strokeWidth="8" fill="none" className="stroke-muted" />
          <circle cx="50" cy="50" r={r} strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * 0.18} className="stroke-primary" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums">82</span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <div className="space-y-2 text-xs">
        {[
          { l: 'MCQ', v: 90 },
          { l: 'Theory', v: 78 },
          { l: 'Coding', v: 76 },
        ].map((row) => (
          <div key={row.l} className="w-32">
            <div className="mb-1 flex justify-between text-muted-foreground"><span>{row.l}</span><span className="tabular-nums">{row.v}%</span></div>
            <div className="h-1.5 rounded-full bg-muted"><div className="h-full rounded-full bg-primary/80" style={{ width: `${row.v}%` }} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Flashcards ──────────────────────────────────────────────────────── */
function FlashcardVisual() {
  return (
    <div className="group/flash absolute inset-0 flex items-center justify-center [perspective:900px]">
      <div className="absolute h-28 w-52 translate-y-4 rotate-[-6deg] rounded-xl border border-border bg-muted/40" />
      <div className="absolute h-28 w-52 translate-y-2 rotate-[4deg] rounded-xl border border-border bg-muted/60" />
      <div className="relative h-28 w-52 transition-transform duration-700 [transform-style:preserve-3d] group-hover/card:[transform:rotateY(180deg)]">
        <div className="absolute inset-0 flex flex-col justify-center rounded-xl border border-border bg-card p-4 [backface-visibility:hidden]">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Question</span>
          <span className="mt-1 text-sm font-medium">What does a microtask queue guarantee?</span>
        </div>
        <div className="absolute inset-0 flex flex-col justify-center rounded-xl border border-primary/40 bg-primary/10 p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <span className="text-[10px] uppercase tracking-wider text-primary">Answer</span>
          <span className="mt-1 text-sm">It drains fully before the next macrotask runs.</span>
        </div>
      </div>
    </div>
  );
}

/* ── Roadmap ─────────────────────────────────────────────────────────── */
function RoadmapVisual() {
  const weeks = ['HTTP & REST', 'Node & Express', 'Databases', 'Auth', 'Testing', 'Deploy'];
  return (
    <div className="absolute inset-0 flex items-center px-6">
      <ol className="relative flex w-full items-start justify-between">
        <div className="absolute left-3 right-3 top-3 h-px bg-border" />
        <div className="absolute left-3 top-3 h-px w-[45%] bg-gradient-to-r from-primary to-primary/40" />
        {weeks.map((w, i) => (
          <li key={w} className="relative flex w-16 flex-col items-center text-center">
            <span className={cn(
              'relative z-10 flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-medium',
              i < 3 ? 'border-primary bg-primary text-primary-foreground' : i === 3 ? 'border-primary bg-background text-primary' : 'border-border bg-background text-muted-foreground'
            )}>
              {i + 1}
            </span>
            <span className="mt-2 text-[10px] leading-tight text-muted-foreground">Week {i + 1}</span>
            <span className="mt-0.5 text-[11px] font-medium leading-tight">{w}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ── Lesson chat ─────────────────────────────────────────────────────── */
function ChatVisual() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3 px-6">
      <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-primary px-4 py-2 text-xs text-primary-foreground">
        Why does the cache-aside example set a TTL at all?
      </div>
      <div className="flex max-w-[85%] gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted"><Bot className="h-3.5 w-3.5 text-primary" /></span>
        <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2 text-xs leading-relaxed text-muted-foreground">
          Without one, a row updated in the database stays stale in the cache forever. The TTL caps how long a wrong answer can be served.
        </div>
      </div>
    </div>
  );
}

/* ── Certificate ─────────────────────────────────────────────────────── */
function CertificateVisual() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-56 rounded-lg border border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Certificate</span>
          <BadgeCheck className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">System Design Fundamentals</p>
        <div className="mt-3 flex items-center justify-between rounded-md bg-background/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
          <span>CERT-7F3A-92C1</span>
          <span className="text-emerald-400">verified</span>
        </div>
      </div>
    </div>
  );
}

export function FeatureBento() {
  return (
    <section id="features" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What happens after the outline</h2>
          <p className="mt-4 text-muted-foreground">
            A curriculum is only the start. Each lesson comes with ways to check you understood it.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
          <Tile className="md:col-span-2" icon={Network} title="Keeps working when a provider fails" body="A custom router fails over across Gemini, Groq and OpenRouter with retry, backoff and a circuit breaker per provider. An outage means a slower answer, not an error.">
            <RouterVisual />
          </Tile>
          <Tile icon={Brain} title="Mock interviews, scored" body="MCQ, theory and coding rounds generated for your topic, graded with a breakdown of strengths and gaps.">
            <InterviewVisual />
          </Tile>
          <Tile icon={Layers} title="Flashcards from every lesson" body="Key ideas extracted into cards you can review in a few minutes.">
            <FlashcardVisual />
          </Tile>
          <Tile className="md:col-span-2" icon={Map} title="Week-by-week roadmaps" body="Turn a goal, a timeframe and your current level into a plan, with progress tracked per week.">
            <RoadmapVisual />
          </Tile>
          <Tile className="md:col-span-2" icon={MessagesSquare} title="Ask about the lesson" body="A tutor that answers in the context of the lesson you are reading, streamed as it is written and saved per lesson.">
            <ChatVisual />
          </Tile>
          <Tile icon={ShieldCheck} title="Certificates with a public ID" body="Pass the final test to get a certificate with a verification page anyone can open.">
            <CertificateVisual />
          </Tile>
        </div>
      </div>
    </section>
  );
}
