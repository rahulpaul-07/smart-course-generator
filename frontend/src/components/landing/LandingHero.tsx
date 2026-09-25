import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Loader2, Sparkles } from 'lucide-react';
import { BlurFade } from '@/components/magic/blur-fade';
import { BorderBeam } from '@/components/magic/border-beam';
import { DotPattern } from '@/components/magic/dot-pattern';
import { ShimmerButton } from '@/components/magic/shimmer-button';
import { ShinyBadge } from '@/components/magic/shiny-badge';
import { useAuthConfig } from '@/hooks/useAuthConfig';
import { useDemoLogin } from '@/hooks/useDemoLogin';
import { setPendingPrompt } from '@/lib/pendingPrompt';
import { StreamingDemo } from './StreamingDemo';

const EXAMPLES = [
  'Rust ownership for TypeScript developers',
  'Statistics for product managers',
  'System design for backend interviews',
  'Linear algebra, visually',
  'Kubernetes from zero to production',
];

/** Cycles example topics as a typed placeholder. */
function useTypedPlaceholder(paused: boolean) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (paused) return;
    const word = EXAMPLES[index];
    const done = !deleting && length === word.length;
    const empty = deleting && length === 0;
    const delay = done ? 1800 : empty ? 250 : deleting ? 22 : 45;
    const id = window.setTimeout(() => {
      if (done) setDeleting(true);
      else if (empty) {
        setDeleting(false);
        setIndex((i) => (i + 1) % EXAMPLES.length);
      } else setLength((n) => n + (deleting ? -1 : 1));
    }, delay);
    return () => window.clearTimeout(id);
  }, [index, length, deleting, paused]);

  return EXAMPLES[index].slice(0, length);
}

export function LandingHero() {
  const navigate = useNavigate();
  const { demo } = useAuthConfig();
  const { startDemo, starting } = useDemoLogin();
  const [topic, setTopic] = useState('');
  const placeholder = useTypedPlaceholder(topic.length > 0);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const value = topic.trim() || placeholder.trim();
    if (value) setPendingPrompt(value);
    navigate('/signup');
  }

  return (
    <section className="relative isolate overflow-hidden pt-32 sm:pt-40">
      <DotPattern className="-z-10 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,black,transparent_75%)]" />
      <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-[520px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,hsl(245_90%_65%/0.28),transparent)] blur-2xl" />
      <div aria-hidden className="absolute left-[15%] top-40 -z-10 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6">
        <BlurFade immediate>
          <a href="#engineering" className="inline-block">
            <ShinyBadge>
              <span className="rounded-full bg-primary/20 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wider text-primary">New</span>
              RAG-grounded lessons &amp; a live eval scorecard
              <ArrowRight className="h-3 w-3" />
            </ShinyBadge>
          </a>
        </BlurFade>

        <BlurFade immediate delay={0.06}>
          <h1 className="mx-auto mt-7 max-w-4xl text-balance text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl md:text-7xl">
            Learn anything,{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-fuchsia-200 to-amber-100 bg-clip-text pr-1 font-serif text-[1.08em] font-normal italic tracking-[-0.01em] text-transparent">
              properly.
            </span>
          </h1>
        </BlurFade>

        <BlurFade immediate delay={0.12}>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Describe what you want to learn. CourseAI designs the curriculum, streams every lesson as it is written,
            then drills you with quizzes, flashcards and mock interviews until it sticks.
          </p>
        </BlurFade>

        <BlurFade immediate delay={0.18}>
          <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-2xl">
            <div className="relative rounded-2xl">
              <div className="relative flex items-center gap-2 rounded-2xl border border-border/80 bg-card/70 p-2 pl-4 shadow-2xl shadow-black/30 backdrop-blur-xl focus-within:border-primary/50">
                <Sparkles className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                <label htmlFor="hero-topic" className="sr-only">What do you want to learn?</label>
                <input
                  id="hero-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder={placeholder || 'What do you want to learn?'}
                  autoComplete="off"
                  maxLength={200}
                  className="h-11 min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground/70"
                />
                <ShimmerButton type="submit" className="h-11 shrink-0 px-5">
                  <span className="hidden sm:inline">Generate course</span>
                  <span className="sm:hidden">Generate</span>
                  <ArrowRight className="h-4 w-4" />
                </ShimmerButton>
              </div>
              <BorderBeam size={120} duration={10} />
            </div>
          </form>
        </BlurFade>

        <BlurFade immediate delay={0.24}>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
            {demo ? (
              <button
                type="button"
                onClick={startDemo}
                disabled={starting}
                className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-60"
              >
                {starting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                Try the demo, no sign-up
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link to="/signup" className="inline-flex items-center gap-1.5 font-medium text-foreground underline-offset-4 hover:underline">
                Create a free account <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            )}
            <Link to="/status" className="inline-flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Live AI router status
            </Link>
          </div>
        </BlurFade>
      </div>

      <BlurFade delay={0.1} y={30} className="relative mx-auto mt-16 max-w-6xl px-4 pb-8 sm:mt-20 sm:px-6">
        <div aria-hidden className="absolute inset-x-10 -top-10 -z-10 h-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative rounded-2xl">
          <StreamingDemo />
          <BorderBeam size={260} duration={14} delay={3} />
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </BlurFade>
    </section>
  );
}
