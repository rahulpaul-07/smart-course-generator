import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DotPattern } from '@/components/magicui/dot-pattern';
import { useAuthConfig } from '@/hooks/useAuthConfig';
import { useDemoLogin } from '@/hooks/useDemoLogin';
import { setPendingPrompt } from '@/lib/pendingPrompt';
import { RouterStatusLink } from './RouterStatusLink';
import { StreamingDemo } from './StreamingDemo';

const EXAMPLES = [
  'Rust ownership for TypeScript developers',
  'Statistics for product managers',
  'System design for backend interviews',
];

export function LandingHero() {
  const navigate = useNavigate();
  const { demo } = useAuthConfig();
  const { startDemo, starting, waking } = useDemoLogin();
  const [topic, setTopic] = useState('');

  function submit(value: string) {
    const prompt = value.trim();
    if (prompt) setPendingPrompt(prompt);
    navigate('/signup');
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    submit(topic);
  }

  return (
    <section className="relative isolate overflow-hidden border-b border-border pt-28 sm:pt-36">
      <DotPattern className="-z-10 [mask-image:radial-gradient(ellipse_70%_50%_at_30%_0%,#000_40%,transparent_100%)]" />
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="max-w-3xl">
          <h1 className="text-balance text-4xl font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Describe a topic. Get a course you can work through.
          </h1>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            CourseAI plans the curriculum, streams each lesson as it is written, then tests you with quizzes,
            flashcards and a scored mock interview.
          </p>

          <form onSubmit={onSubmit} className="mt-10 max-w-2xl">
            <label htmlFor="hero-topic" className="text-sm font-medium">
              What do you want to learn?
            </label>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                id="hero-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Kubernetes from zero to production"
                autoComplete="off"
                maxLength={200}
                className="h-12 min-w-0 flex-1 rounded-lg border border-input bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <Button type="submit" className="h-12 px-5">
                Generate course <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
              </Button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span>Try:</span>
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => submit(example)}
                  className="rounded-md border border-border px-2.5 py-1 text-foreground/90 transition-colors hover:border-foreground/40"
                >
                  {example}
                </button>
              ))}
            </div>
          </form>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            {demo ? (
              <button
                type="button"
                onClick={startDemo}
                disabled={starting}
                className="inline-flex items-center gap-2 font-medium text-foreground underline underline-offset-4 disabled:opacity-60"
              >
                {starting && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
                <span aria-live="polite">{waking ? 'Waking the server, up to 30s…' : 'Try the demo without signing up'}</span>
              </button>
            ) : (
              <Link to="/signup" className="font-medium text-foreground underline underline-offset-4">
                Create a free account
              </Link>
            )}
            <RouterStatusLink />
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-4 pb-16 sm:px-6">
        <StreamingDemo />
      </div>
    </section>
  );
}
