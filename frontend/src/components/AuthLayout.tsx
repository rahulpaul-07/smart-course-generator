import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Check, Loader2 } from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
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
  'Mock interviews, and certificates with a public verification page',
];

function Showcase() {
  return (
    <div className="dark hidden border-l border-border bg-background text-foreground lg:flex lg:flex-col lg:justify-center">
      <div className="p-12 xl:p-16">
        <h2 className="max-w-md text-4xl font-semibold leading-[1.1] tracking-tight">
          A course from one sentence, and the tools to learn it.
        </h2>
        <ul className="mt-10 space-y-4">
          {PERKS.map((perk) => (
            <li key={perk} className="flex items-start gap-3 text-[15px] text-muted-foreground">
              <Check className="mt-1 h-4 w-4 shrink-0 text-primary" aria-hidden />
              {perk}
            </li>
          ))}
        </ul>
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
          By continuing you agree to the{' '}
          <Link to="/terms" className="underline underline-offset-4 hover:text-foreground">terms of use</Link> and{' '}
          <Link to="/privacy" className="underline underline-offset-4 hover:text-foreground">privacy policy</Link>.
        </p>
      </div>
      <Showcase />
    </div>
  );
}
