import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GithubIcon } from '@/components/brand/GithubIcon';
import { cn } from '@/lib/utils';
import { GITHUB_URL } from './LandingNav';

/* ── How it works ────────────────────────────────────────────────────── */
const STEPS = [
  { n: '1', title: 'Describe it', body: 'A sentence is enough: the topic, your level, what you want to be able to do. Pick a language if English is not yours.' },
  { n: '2', title: 'Watch it build', body: 'The outline arrives first. Each lesson then streams in as it is written, with code, callouts and a quiz at the end.' },
  { n: '3', title: 'Check yourself', body: 'Flashcards, practice labs, a tutor per lesson and a mock interview. Pass the final test to earn a certificate.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">From a sentence to a syllabus</h2>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s) => (
            <li key={s.n} className="border-t border-border pt-6">
              <span className="font-mono text-4xl font-medium tabular-nums text-muted-foreground/60" aria-hidden>0{s.n}</span>
              <h3 className="mt-4 text-xl font-semibold tracking-tight">{s.title}</h3>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Engineering ─────────────────────────────────────────────────────── */
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
  { title: 'Checked output', body: 'Every generation is validated against a schema before it is saved. An eval harness adds coverage and LLM-as-judge faithfulness scores when run with a provider key.' },
  { title: 'Grounded answers', body: 'Optional retrieval injects vetted source excerpts into lesson prompts, behind a pluggable vector store.' },
  { title: 'Session security', body: 'Short-lived access tokens, a rotating httpOnly refresh token with reuse detection, and verified-email-only account linking.' },
  { title: 'Streaming by default', body: 'Server-Sent Events with heartbeats, so long generations survive proxies and render block by block.' },
];

const LINK_CLASS = 'inline-flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 text-sm transition-colors hover:border-foreground/40';

export function EngineeringSection() {
  return (
    <section id="engineering" className="scroll-mt-24 border-b border-border bg-card/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Built for when the model is slow, wrong or down</h2>
          <p className="mt-4 text-muted-foreground">
            Calling a model is the easy part. Most of this codebase handles failures: retries, failover, validation and
            streams that survive long generations.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.15fr_1fr] [&>*]:min-w-0">
          <figure className="overflow-hidden rounded-xl border border-border bg-background">
            <figcaption className="flex items-center justify-between border-b border-border px-4 py-2.5 text-xs text-muted-foreground">
              <span className="font-mono">backend/services/aiRouter.js</span>
              <span>simplified</span>
            </figcaption>
            <pre className="overflow-x-auto p-5 font-mono text-[12.5px] leading-6 text-foreground/90"><code>{ROUTER_SNIPPET}</code></pre>
          </figure>
          <dl className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
            {PILLARS.map((p) => (
              <div key={p.title}>
                <dt className="text-sm font-semibold">{p.title}</dt>
                <dd className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/status" className={LINK_CLASS}>
            Router status <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <Link to="/evals" className={LINK_CLASS}>
            Eval results <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
          <a href={`${GITHUB_URL}/blob/main/docs/engineering_decisions.md`} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            Engineering decisions <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </section>
  );
}

/* ── FAQ ─────────────────────────────────────────────────────────────── */
const FAQS = [
  { q: 'Is it free?', a: 'Yes. It is an open-source project. Generation is rate-limited per account so a single user cannot exhaust the shared AI quota.' },
  { q: 'How accurate is the content?', a: 'As accurate as current models, which is to say: usually right, occasionally not. Lessons can be grounded in a curated source corpus. Treat a course as a strong first draft, not a textbook.' },
  { q: 'What happens if an AI provider goes down?', a: 'The router retries with backoff, then fails over to the next configured provider. A provider that keeps failing is benched by a circuit breaker for a cooldown, and the status page shows the current state of each one.' },
  { q: 'Can I learn in a language other than English?', a: 'Yes. Pick a language when you generate a course and every lesson, quiz and flashcard is written in it.' },
  { q: 'Can I try it without an account?', a: 'On deployments with demo mode enabled, "Try the demo" gives you a private guest account with a sample course already in it. Guest accounts are deleted after 24 hours.' },
  { q: 'Can I run it myself?', a: 'Clone the repo and run `npm run dev:memory` in the backend: it starts with an in-memory database and sample content, no setup required. Add a Gemini, Groq or OpenRouter key for real generation.' },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1fr_1.4fr]">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Questions</h2>
          <p className="mt-4 text-muted-foreground">
            Something else? <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4">Open an issue</a>.
          </p>
        </div>
        <div className="divide-y divide-border border-y border-border">
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
                    {isOpen ? <Minus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden /> : <Plus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
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
    <section className="py-20 sm:py-28">
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">What do you want to learn next?</h2>
          <p className="mt-4 text-muted-foreground">Your first course is one sentence away.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 px-6">
            <Link to="/signup">Start learning <ArrowRight className="ml-2 h-4 w-4" aria-hidden /></Link>
          </Button>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 rounded-lg border border-border px-6 text-sm font-medium transition-colors hover:border-foreground/40">
            <GithubIcon className="h-4 w-4" /> Source on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
