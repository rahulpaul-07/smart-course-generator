import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Check, Minus, Plus } from 'lucide-react';
import { BlurFade } from '@/components/magic/blur-fade';
import { BorderBeam } from '@/components/magic/border-beam';
import { DotPattern } from '@/components/magic/dot-pattern';
import { Marquee } from '@/components/magic/marquee';
import { NumberTicker } from '@/components/magic/number-ticker';
import { ShimmerButton } from '@/components/magic/shimmer-button';
import { GithubIcon } from '@/components/brand/GithubIcon';
import { cn } from '@/lib/utils';
import { GITHUB_URL } from './LandingNav';

/* ── Stack marquee ───────────────────────────────────────────────────── */
const STACK = ['React 19', 'TypeScript', 'Vite', 'Tailwind CSS', 'TanStack Query', 'Node.js', 'Express', 'MongoDB', 'Gemini', 'Groq', 'OpenRouter', 'Zod', 'Playwright', 'GitHub Actions'];

export function StackMarquee() {
  return (
    <section aria-label="Technology" className="border-y border-border/60 py-10">
      <p className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">Built with</p>
      <Marquee className="[--duration:45s]">
        {STACK.map((name) => (
          <span key={name} className="whitespace-nowrap text-lg font-medium tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground">
            {name}
          </span>
        ))}
      </Marquee>
    </section>
  );
}

/* ── How it works ────────────────────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Describe it', body: 'A sentence is enough: the topic, your level, what you want to be able to do. Pick a language if English is not yours.' },
  { n: '02', title: 'Watch it build', body: 'The outline arrives in seconds. Each lesson streams in as it is written, with code, callouts and a quiz at the end.' },
  { n: '03', title: 'Make it stick', body: 'Flashcards, practice labs, a tutor per lesson and a mock interview. Pass the final test for a verifiable certificate.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <BlurFade className="max-w-2xl">
          <p className="text-sm font-medium text-primary">How it works</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            From a sentence to a syllabus <span className="font-serif font-normal italic text-muted-foreground">in under a minute.</span>
          </h2>
        </BlurFade>
        <ol className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-6">
          <div aria-hidden className="absolute left-0 right-0 top-[19px] hidden h-px bg-gradient-to-r from-primary/60 via-border to-transparent md:block" />
          {STEPS.map((s, i) => (
            <BlurFade key={s.n} delay={i * 0.08}>
              <li className="relative">
                <span className="relative z-10 inline-flex h-10 items-center rounded-full border border-border bg-background px-4 font-mono text-xs text-primary">{s.n}</span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight">{s.title}</h3>
                <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </li>
            </BlurFade>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Engineering ─────────────────────────────────────────────────────── */
const STATS = [
  { value: 3, suffix: '', label: 'LLM providers behind one failover router' },
  { value: 160, suffix: '+', label: 'automated tests: API, UI and end-to-end' },
  { value: 4, suffix: '', label: 'CI jobs on every push: lint, types, tests, evals, E2E' },
  { value: 30, suffix: 'm', label: 'access tokens, rotating refresh with reuse detection' },
];

const ROUTER_SNIPPET = `for (const { provider, model } of resolveChain(chain)) {
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    try {
      const result = await executeWithTimeout(
        (signal) => provider.generateJson(prompt, model, signal));
      if (validator) await validator(result);
      circuitBreaker.onSuccess(provider.name);
      return result;
    } catch (error) {
      // A bad prompt is not an outage: only availability
      // failures count against the provider's health.
      if (countsAgainstProviderHealth(error))
        circuitBreaker.onFailure(provider.name);
      if (!shouldRetry(error)) break;   // fail over now
      await sleep(getExponentialBackoff(attempt));
    }
  }
}
throw new Error(FRIENDLY_ERROR);`;

const PILLARS = [
  { title: 'Measured quality', body: 'An eval harness scores structure, subtopic coverage and LLM-as-judge faithfulness, and runs in CI on every push.' },
  { title: 'Grounded answers', body: 'Optional RAG retrieval injects vetted source excerpts into lesson prompts, behind a pluggable vector store.' },
  { title: 'Real auth', body: 'Short-lived JWTs, httpOnly rotating refresh tokens, verified-email-only account linking, Zod on every write.' },
  { title: 'Streaming by default', body: 'Server-Sent Events with heartbeats, so long generations survive proxies and render block by block.' },
];

export function EngineeringSection() {
  return (
    <section id="engineering" className="relative scroll-mt-24 overflow-hidden border-y border-border/60 bg-card/30 py-24 sm:py-32">
      <DotPattern variant="grid" size={40} className="[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <BlurFade className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Under the hood</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Not another thin wrapper <span className="font-serif font-normal italic text-muted-foreground">around a chat box.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            The interesting part of an AI product is everything that happens when the model is slow, wrong or down. That is where most of the code in this project lives.
          </p>
        </BlurFade>

        <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border/70 bg-border/70 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="bg-background/80 p-6">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-4xl font-semibold tracking-tight sm:text-5xl">
                <NumberTicker value={s.value} suffix={s.suffix} />
              </dd>
              <p className="mt-2 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
          <BlurFade>
            <div className="relative h-full overflow-hidden rounded-2xl border border-border/70 bg-background/80">
              <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5">
                <span className="font-mono text-xs text-muted-foreground">backend/services/aiRouter.js</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">simplified</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-foreground/90"><code>{ROUTER_SNIPPET}</code></pre>
              <BorderBeam size={200} duration={16} />
            </div>
          </BlurFade>
          <div className="grid gap-3 sm:grid-cols-2">
            {PILLARS.map((p, i) => (
              <BlurFade key={p.title} delay={i * 0.05}>
                <div className="h-full rounded-2xl border border-border/70 bg-background/80 p-5">
                  <Check className="h-4 w-4 text-primary" />
                  <h3 className="mt-3 text-sm font-semibold">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/status" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm hover:border-primary/50">
            Live router status <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <Link to="/evals" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm hover:border-primary/50">
            Eval scorecard <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <a href={`${GITHUB_URL}/blob/main/docs/engineering_decisions.md`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-4 py-2 text-sm hover:border-primary/50">
            Engineering decisions <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'Is it free?', a: 'Yes. It is an open-source project. Generation is rate-limited per account so a single user cannot exhaust the shared AI quota.' },
  { q: 'How accurate is the content?', a: 'As accurate as current models, which is to say: usually right, occasionally not. Lessons can be grounded in a curated source corpus, and generation quality is tracked with an eval harness rather than assumed. Treat it as a strong first draft of a course, not a textbook.' },
  { q: 'What happens if an AI provider goes down?', a: 'The router retries with backoff, then fails over to the next configured provider. A provider that keeps failing is benched by a circuit breaker for a cooldown, and the live status page shows the current state of each one.' },
  { q: 'Can I learn in a language other than English?', a: 'Yes. Pick a language when you generate a course and every lesson, quiz and flashcard is written in it. Lessons also have an optional Hinglish audio explanation.' },
  { q: 'Can I try it without an account?', a: 'On deployments with demo mode enabled, "Try the demo" gives you a private guest account with a sample course already in it. Guest accounts are deleted after 24 hours.' },
  { q: 'Can I run it myself?', a: 'Clone the repo and run `npm run dev:memory` in the backend: it starts with an in-memory database and sample content, no setup required. Add a Gemini, Groq or OpenRouter key for real generation.' },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <BlurFade>
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">
            Questions, <span className="font-serif font-normal italic text-muted-foreground">answered.</span>
          </h2>
          <p className="mt-5 text-muted-foreground">
            Something else? <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">Open an issue</a>.
          </p>
        </BlurFade>
        <div className="divide-y divide-border/70 border-y border-border/70">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={f.q}>
                <h3>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-center justify-between gap-6 py-5 text-left text-[15px] font-medium"
                  >
                    {f.q}
                    {isOpen ? <Minus className="h-4 w-4 shrink-0 text-muted-foreground" /> : <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  </button>
                </h3>
                <div
                  id={`faq-${i}`}
                  role="region"
                  className={cn('grid transition-[grid-template-rows] duration-300 ease-out', isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
                >
                  <p className="overflow-hidden pr-10 text-sm leading-relaxed text-muted-foreground">
                    <span className="block pb-5">{f.a}</span>
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ── Final CTA ───────────────────────────────────────────────────────── */
export function FinalCTA() {
  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32">
      <BlurFade>
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl border border-border/70 bg-card/50 px-6 py-20 text-center sm:py-28">
          <DotPattern className="[mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div aria-hidden className="absolute left-1/2 top-full h-72 w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              What will you <span className="font-serif font-normal italic">learn next?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-muted-foreground">Your first course is one sentence away.</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ShimmerButton asChild className="h-12 px-7 text-[15px]">
                <Link to="/signup">Start learning free <ArrowRight className="h-4 w-4" /></Link>
              </ShimmerButton>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-full border border-border bg-background/60 px-6 text-[15px] font-medium hover:bg-muted">
                <GithubIcon className="h-4 w-4" /> Star on GitHub
              </a>
            </div>
          </div>
          <BorderBeam size={300} duration={18} />
        </div>
      </BlurFade>
    </section>
  );
}
