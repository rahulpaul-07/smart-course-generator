import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Check,
  Code2,
  Languages,
  LineChart,
  Microscope,
  Palette,
  Sparkles,
  WandSparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const LEARNING_PATH = [
  { label: 'Understand the foundations', detail: 'Concepts + examples', complete: true },
  { label: 'Practice with guidance', detail: 'Interactive exercises', active: true },
  { label: 'Build something real', detail: 'Personalized project' },
];

const TOPICS = [
  { icon: Code2, label: 'Development' },
  { icon: LineChart, label: 'Business' },
  { icon: Languages, label: 'Languages' },
  { icon: Palette, label: 'Creative skills' },
];

const COURSE_IDEAS = [
  { icon: Code2, label: 'Build a full-stack app', color: 'text-cyan-200 bg-cyan-400/10 border-cyan-400/15' },
  { icon: Microscope, label: 'Explore machine learning', color: 'text-violet-200 bg-violet-400/10 border-violet-400/15' },
  { icon: LineChart, label: 'Understand personal finance', color: 'text-emerald-200 bg-emerald-400/10 border-emerald-400/15' },
];

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

function LearningStudio() {
  return (
    <div className="auth-workspace relative mt-9 max-w-2xl overflow-hidden rounded-3xl border border-border bg-card/90 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-foreground/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg -white">
            <WandSparkles className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-foreground/90">AI Learning Studio</p>
            <p className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground">Designing your course</p>
          </div>
        </div>
        <span className="auth-live-badge rounded-full border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-300">
          Generating
        </span>
      </div>

      <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
        <div className="border-b border-border p-4 lg:border-b-0 lg:border-r">
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Learning goal</p>
          <div className="rounded-xl border border-brand-400/20 bg-brand-500/[0.07] p-3">
            <div className="flex gap-2">
              <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-300" />
              <p className="auth-prompt-text font-mono text-[10px] leading-5 text-foreground/90">
                Teach me a practical skill from beginner to confident, with clear lessons and a real project.
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {COURSE_IDEAS.map(({ icon: Icon, label, color }, index) => (
              <div
                key={label}
                className="auth-idea-card flex items-center gap-3 rounded-xl border border-border bg-foreground/10 p-2.5"
                style={{ animationDelay: `${0.7 + index * 0.45}s` }}
              >
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border ${color}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[10px] font-semibold text-foreground/90">{label}</span>
                  <span className="mt-0.5 block text-[8px] text-muted-foreground">Personalized path ready</span>
                </span>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            {['Lessons', 'Practice', 'AI tutor', 'Certificate'].map((item, index) => (
              <span
                key={item}
                className="auth-feature-chip flex-1 rounded-lg border border-border bg-foreground/10 px-2 py-1.5 text-center text-[8px] font-semibold text-muted-foreground"
                style={{ animationDelay: `${index * 0.35}s` }}
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-brand-300">Your course</p>
              <h3 className="mt-1 font-display text-xs font-bold text-foreground">A path built around you</h3>
            </div>
            <div className="relative grid h-11 w-11 place-items-center rounded-full bg-foreground/10">
              <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90">
                <circle cx="20" cy="20" r="17" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="3" />
                <circle className="auth-progress-ring" cx="20" cy="20" r="17" fill="none" stroke="url(#authProgress)" strokeWidth="3" strokeLinecap="round" />
                <defs>
                  <linearGradient id="authProgress">
                    <stop stopColor="#818cf8" />
                    <stop offset="1" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-[8px] font-bold text-brand-200">68%</span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {LEARNING_PATH.map((step, index) => (
              <div
                key={step.label}
                className={`auth-module-row flex items-center gap-2.5 rounded-xl border px-2.5 py-2.5 ${
                  step.active
                    ? 'border-brand-400/25 bg-brand-500/10'
                    : 'border-transparent bg-foreground/10'
                }`}
                style={{ animationDelay: `${0.4 + index * 0.38}s` }}
              >
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[9px] font-bold ${
                  step.complete
                    ? 'bg-emerald-400/10 text-emerald-300'
                    : step.active
                      ? 'bg-brand-500 text-foreground shadow-lg shadow-brand-500/20'
                      : 'bg-foreground/10 text-muted-foreground'
                }`}>
                  {step.complete ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[10px] font-semibold text-foreground/90">{step.label}</span>
                  <span className="block text-[8px] text-muted-foreground">{step.detail}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.07] to-brand-500/[0.06] p-3">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/10 text-cyan-200">
                <BrainCircuit className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-[9px] font-bold text-foreground/90">AI tutor included</p>
                <p className="mt-0.5 text-[8px] text-muted-foreground">Ask questions at every step</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthLayout({
  children,
  title,
  description,
  footer,
  eyebrow,
}) {
  return (
    <main className="auth-stage relative min-h-screen overflow-x-hidden text-foreground lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(450px,0.88fr)]">
      <div className="auth-aurora auth-aurora-one pointer-events-none absolute" />
      <div className="auth-aurora auth-aurora-two pointer-events-none absolute" />
      <div className="auth-particles pointer-events-none absolute inset-0" />

      <section className="relative hidden min-h-screen overflow-hidden border-r border-border p-10 lg:flex lg:flex-col xl:p-14">
        <div className="auth-circuit pointer-events-none absolute inset-0 opacity-50" />

        <Link to="/" className="relative z-20 flex w-fit items-center gap-3 text-foreground">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-lg shadow-brand-500/20">
            <BookOpen className="h-5 w-5" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Course<span className="text-brand-300">AI</span></span>
        </Link>

        <div className="relative z-10 my-auto max-w-3xl py-8 animate-enter">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-brand-400/20 bg-brand-500/10 px-3 py-1.5 text-xs font-medium text-brand-300">
            {/* <Sparkles className="h-3.5 w-3.5" /> */}
            Learn anything, built around you
          </div>
          <h2 className="gradient-text max-w-2xl font-display text-5xl font-extrabold leading-[1.04] tracking-[-0.055em] xl:text-6xl">
            Turn any curiosity into real capability.
          </h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-muted-foreground xl:text-base">
            CourseAI creates a complete learning journey for your goal, with clear lessons, hands-on practice, helpful videos, quizzes, and an AI tutor.
          </p>

          <div className="mt-5 flex max-w-xl flex-wrap gap-2">
            {TOPICS.map(({ icon: Icon, label }, index) => (
              <span
                key={label}
                className="auth-topic-chip inline-flex items-center gap-1.5 rounded-full border border-border bg-foreground/10 px-3 py-1.5 text-[10px] font-semibold text-muted-foreground"
                style={{ animationDelay: `${index * 0.35}s` }}
              >
                <Icon className="h-3 w-3 text-brand-300" />
                {label}
              </span>
            ))}
          </div>

          <LearningStudio />
        </div>

        <div className="relative z-10 flex items-center gap-5 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          <span>Any topic</span>
          <span className="h-1 w-1 rounded-full bg-brand-400" />
          <span>Your pace</span>
          <span className="h-1 w-1 rounded-full bg-cyan-400" />
          <span>Real outcomes</span>
        </div>
      </section>

      <section className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 lg:px-10">
        <div className="auth-circuit pointer-events-none absolute inset-0 opacity-20 lg:hidden" />
        <div className="w-full max-w-md animate-enter-delay">
          <Link to="/" className="mb-8 flex w-fit items-center gap-2.5 text-foreground lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-lg shadow-brand-500/20">
              <BookOpen className="h-4 w-4" />
            </span>
            <span className="font-display font-bold tracking-tight">Course<span className="text-brand-300">AI</span></span>
          </Link>

          <div className="relative overflow-hidden rounded-3xl border border-border bg-card/95 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.15)] backdrop-blur-2xl sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative mb-7">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-300">{eyebrow}</p>
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">{title}</h1>
              <p className="mt-2.5 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>

            <div className="relative">{children}</div>

            <div className="relative mt-7 border-t border-border/ pt-6 text-center text-sm text-muted-foreground">
              {footer}
            </div>
          </div>

          <Link
            to="/"
            className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground/90"
          >
            Explore CourseAI
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
