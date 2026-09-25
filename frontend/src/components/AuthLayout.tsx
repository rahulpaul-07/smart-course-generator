import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
import { BorderBeam } from '@/components/magic/border-beam';
import { DotPattern } from '@/components/magic/dot-pattern';
import { useAuthConfig } from '@/hooks/useAuthConfig';
import { useDemoLogin } from '@/hooks/useDemoLogin';

export function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.33 2.98-7.42Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.98-.9 6.63-2.35l-3.25-2.55c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.77-5.61-4.14H3.03v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.92A6.01 6.01 0 0 1 6.07 12c0-.67.11-1.32.32-1.92V7.46H3.03A10 10 0 0 0 2 12c0 1.61.39 3.14 1.03 4.54l3.36-2.62Z" />
      <path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.82 1.5l2.88-2.88A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.97 5.46l3.36 2.62C7.18 7.7 9.39 5.94 12 5.94Z" />
    </svg>
  );
}

const PERKS = [
  'A full curriculum from one sentence, in your language',
  'Lessons that stream in as they are written',
  'Quizzes, flashcards, labs and a tutor on every lesson',
  'Mock interviews and verifiable certificates',
];

function Showcase() {
  return (
    <div className="dark relative hidden overflow-hidden border-l border-border bg-background text-foreground lg:flex lg:flex-col lg:justify-between">
      <DotPattern className="[mask-image:radial-gradient(ellipse_at_top_right,black,transparent_70%)]" />
      <div aria-hidden className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-primary/25 blur-3xl" />
      <div aria-hidden className="absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-fuchsia-500/10 blur-3xl" />

      <div className="relative p-12 xl:p-16">
        <p className="text-sm font-medium text-primary">Why CourseAI</p>
        <h2 className="mt-4 max-w-md text-4xl font-semibold leading-[1.1] tracking-tight xl:text-5xl">
          Learn anything, <span className="font-serif font-normal italic text-muted-foreground">properly.</span>
        </h2>
        <ul className="mt-10 space-y-4">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-[15px] text-muted-foreground">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3 w-3 text-primary" />
              </span>
              {perk}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative m-12 mt-0 rounded-2xl border border-border bg-card/70 p-5 backdrop-blur xl:m-16 xl:mt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono">event: stage</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> streaming
          </span>
        </div>
        <p className="mt-3 text-sm font-medium">Asynchronous JavaScript, From Callbacks to Async Iterators</p>
        <div className="mt-4 space-y-2">
          {['The Event Loop, Macrotasks and Microtasks', 'Promises as State Machines', 'async/await Without Accidental Serialisation'].map((l, i) => (
            <div key={l} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={i === 0 ? 'h-1.5 w-1.5 rounded-full bg-emerald-400' : i === 1 ? 'h-1.5 w-1.5 animate-pulse rounded-full bg-primary' : 'h-1.5 w-1.5 rounded-full bg-muted-foreground/40'} />
              {l}
            </div>
          ))}
        </div>
        <BorderBeam size={140} duration={10} />
      </div>
    </div>
  );
}

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  description?: string;
  footer?: ReactNode;
  eyebrow?: string;
}

export default function AuthLayout({ children, title, description, footer, eyebrow }: AuthLayoutProps) {
  const { demo } = useAuthConfig();
  const { startDemo, starting, waking } = useDemoLogin();

  return (
    <div className="grid min-h-screen bg-background text-foreground lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <Link to="/" className="w-fit rounded-lg text-[15px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <Logo />
        </Link>

        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          {eyebrow && <p className="text-sm font-medium text-primary">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}

          <div className="mt-8">{children}</div>

          {demo && (
            <button
              type="button"
              onClick={startDemo}
              disabled={starting}
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground disabled:opacity-60"
            >
              {starting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              <span aria-live="polite">{waking ? 'Waking the server, up to 30s…' : 'Just looking? Try a guest account'}</span>
              {!starting && <ArrowUpRight className="h-3.5 w-3.5" />}
            </button>
          )}

          {footer && <p className="mt-8 text-center text-sm text-muted-foreground">{footer}</p>}
        </main>

        <p className="text-xs text-muted-foreground">
          By continuing you agree to use AI-generated content responsibly.
        </p>
      </div>
      <Showcase />
    </div>
  );
}
