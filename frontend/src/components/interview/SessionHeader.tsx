import { useRef, type KeyboardEvent } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, Clock, Code2, MessageSquare, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InterviewPrep } from '../../types';

interface SessionHeaderProps {
  prep: InterviewPrep;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExit: () => void;
  formattedTime: string;
  onOpenCoach: () => void;
}

/**
 * One header for the whole session: exit, title, section tabs, timer and the
 * coach toggle. This replaces a 288px sidebar column (three links and a
 * decorative card), a mobile-only toolbar, a second tab row and a timer card.
 * With four columns on screen, the questions were squeezed to ~350px at a
 * 1280px viewport and code blocks were clipped.
 */
export function SessionHeader({ prep, activeTab, setActiveTab, onExit, formattedTime, onOpenCoach }: SessionHeaderProps) {
  const tabs = [
    { id: 'mcq', label: 'MCQs', icon: CheckCircle2, count: prep.mcqs?.length ?? 0 },
    { id: 'theory', label: 'Theory', icon: BookOpen, count: prep.theoryQuestions?.length ?? 0 },
    { id: 'coding', label: 'Coding', icon: Code2, count: prep.codingQuestions?.length ?? 0 },
    ...(prep.status === 'completed' ? [{ id: 'results', label: 'Results', icon: Trophy, count: 0 }] : []),
  ];
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = tabs.findIndex((t) => t.id === activeTab);
    const next =
      e.key === 'ArrowRight' ? (i + 1) % tabs.length :
      e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length :
      e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : i;
    if (next !== i) {
      e.preventDefault();
      setActiveTab(tabs[next].id);
      refs.current[next]?.focus();
    }
  };

  return (
    <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onExit}
          aria-label="Exit session"
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border/70 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-semibold tracking-tight">{prep.topic}</h1>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className={cn('h-1.5 w-1.5 rounded-full', prep.status === 'pending' ? 'animate-pulse bg-warning' : 'bg-success')} />
            {prep.status === 'pending' ? 'In progress' : `Completed${prep.overallScore != null ? ` · ${prep.overallScore}%` : ''}`}
          </p>
        </div>
        {prep.status === 'pending' && (
          <span className="hidden items-center gap-1.5 rounded-lg border border-border/70 px-2.5 py-1.5 font-mono text-xs tabular-nums text-foreground sm:inline-flex" aria-label={`Elapsed time ${formattedTime}`}>
            <Clock className="h-3.5 w-3.5 text-muted-foreground" /> {formattedTime}
          </span>
        )}
        <button
          type="button"
          onClick={onOpenCoach}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-primary/10 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20 xl:hidden"
        >
          <MessageSquare className="h-4 w-4" /> <span className="hidden sm:inline">Coach</span>
        </button>
      </div>

      <div role="tablist" aria-label="Interview sections" tabIndex={-1} onKeyDown={onKeyDown} className="flex gap-1 overflow-x-auto px-4 sm:px-6 [scrollbar-width:none]">
        {tabs.map((t, i) => {
          const selected = t.id === activeTab;
          return (
            <button
              key={t.id}
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              role="tab"
              aria-selected={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'relative inline-flex shrink-0 items-center gap-2 px-3 pb-3 pt-1 text-sm font-medium transition-colors',
                selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.count > 0 && <span className="rounded-md bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">{t.count}</span>}
              {selected && <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-primary" />}
            </button>
          );
        })}
      </div>
    </header>
  );
}
