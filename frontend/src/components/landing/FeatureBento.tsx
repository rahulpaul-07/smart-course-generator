import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useReducedMotion } from 'framer-motion';
import { BadgeCheck, Bot, Brain, Layers, Map, MessagesSquare, Network, ShieldCheck } from 'lucide-react';
import { AnimatedBeam } from '@/components/magicui/animated-beam';
import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid';
import { cn } from '@/lib/utils';

/* ── Router failover ─────────────────────────────────────────────────── */
const PROVIDERS = ['Gemini', 'Groq', 'OpenRouter'];

function Node({ nodeRef, children, className }: { nodeRef: RefObject<HTMLDivElement | null>; children: ReactNode; className?: string }) {
  return (
    <div ref={nodeRef} className={cn('relative z-10 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium', className)}>
      {children}
    </div>
  );
}

type ProviderState = 'down' | 'serving' | 'standby';

/** One provider node plus its beam to the router. Owns its ref, so the parent never reads refs while rendering. */
function ProviderNode({ name, state, containerRef, routerRef }: {
  name: string;
  state: ProviderState;
  containerRef: RefObject<HTMLDivElement | null>;
  routerRef: RefObject<HTMLDivElement | null>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <>
      <Node nodeRef={ref} className={cn('flex w-32 items-center gap-2', state === 'down' && 'border-destructive/40 text-muted-foreground')}>
        <span className={cn('h-1.5 w-1.5 rounded-full', state === 'down' ? 'bg-destructive' : state === 'serving' ? 'bg-success' : 'bg-muted-foreground/50')} />
        {name}
        {state === 'down' && <span className="ml-auto font-mono text-[9px] text-destructive">open</span>}
      </Node>
      <AnimatedBeam containerRef={containerRef} fromRef={ref} toRef={routerRef} idle={state !== 'serving'} duration={2.4} />
    </>
  );
}

function RouterVisual() {
  const reduce = useReducedMotion();
  const [down, setDown] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => setDown((d) => (d + 1) % PROVIDERS.length), 3200);
    return () => window.clearInterval(id);
  }, [reduce]);
  const serving = (down + 1) % PROVIDERS.length;

  const container = useRef<HTMLDivElement>(null);
  const router = useRef<HTMLDivElement>(null);
  const lesson = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={container}
      role="img"
      aria-label="Requests fail over between three AI providers"
      className="absolute inset-0 flex items-center justify-between gap-4 px-6 sm:px-10"
    >
      <div className="flex flex-col gap-4">
        {PROVIDERS.map((name, i) => (
          <ProviderNode
            key={name}
            name={name}
            state={i === down ? 'down' : i === serving ? 'serving' : 'standby'}
            containerRef={container}
            routerRef={router}
          />
        ))}
      </div>
      <Node nodeRef={router} className="border-primary/50 text-center">
        AI Router
        <span className="block font-mono text-[9px] font-normal text-muted-foreground">retry, breaker</span>
      </Node>
      <Node nodeRef={lesson} className="hidden sm:block">Your lesson</Node>
      <AnimatedBeam containerRef={container} fromRef={router} toRef={lesson} duration={2.4} delay={0.6} className="hidden sm:block" />
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
    <div className="absolute inset-0 flex items-center justify-center [perspective:900px]">
      <div className="absolute h-28 w-52 translate-y-4 rotate-[-6deg] rounded-xl border border-border bg-muted/40" />
      <div className="absolute h-28 w-52 translate-y-2 rotate-[4deg] rounded-xl border border-border bg-muted/60" />
      <div className="relative h-28 w-52 transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
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
        <div className="absolute left-3 top-3 h-px w-[45%] bg-primary" />
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
      <div className="ml-auto max-w-[75%] rounded-xl rounded-br-sm bg-primary px-4 py-2 text-xs text-primary-foreground">
        Why does the cache-aside example set a TTL at all?
      </div>
      <div className="flex max-w-[85%] gap-2">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted"><Bot className="h-3.5 w-3.5 text-primary" /></span>
        <div className="rounded-xl rounded-bl-sm border border-border bg-card px-4 py-2 text-xs leading-relaxed text-muted-foreground">
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
      <span className="absolute left-4 top-3 text-[10px] uppercase tracking-wider text-muted-foreground">Example</span>
      <div className="relative w-56 rounded-lg border border-border bg-background p-4">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Certificate</span>
          <BadgeCheck className="h-5 w-5 text-success" />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">System Design Fundamentals</p>
        <div className="mt-3 flex items-center justify-between rounded-md bg-background/60 px-2 py-1 font-mono text-[10px] text-muted-foreground">
          <span>CERT-7F3A-92C1</span>
          <span className="text-success">verified</span>
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

        <BentoGrid className="mt-12">
          <BentoCard
            className="md:col-span-2"
            Icon={Network}
            name="Keeps working when a provider fails"
            description="A custom router fails over across Gemini, Groq and OpenRouter with retry, backoff and a circuit breaker per provider. An outage means a slower answer, not an error."
            to="/status"
            cta="See live router status"
            background={<RouterVisual />}
          />
          <BentoCard Icon={Brain} name="Mock interviews, scored" description="MCQ, theory and coding rounds generated for your topic, graded with a breakdown of strengths and gaps." background={<InterviewVisual />} />
          <BentoCard Icon={Layers} name="Flashcards from every lesson" description="Key ideas extracted into cards you can review in a few minutes. Hover to see an answer." background={<FlashcardVisual />} className="group" />
          <BentoCard className="md:col-span-2" Icon={Map} name="Week-by-week roadmaps" description="Turn a goal, a timeframe and your current level into a plan, with progress tracked per week." background={<RoadmapVisual />} />
          <BentoCard className="md:col-span-2" Icon={MessagesSquare} name="Ask about the lesson" description="A tutor that answers in the context of the lesson you are reading, streamed as it is written and saved per lesson." background={<ChatVisual />} />
          <BentoCard Icon={ShieldCheck} name="Certificates with a public ID" description="Pass the final test to get a certificate with a verification page anyone can open." background={<CertificateVisual />} />
        </BentoGrid>
      </div>
    </section>
  );
}
