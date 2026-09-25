import { Award, Loader2 } from 'lucide-react';

interface SubmitBarProps {
  counts: { label: string; done: number; total: number }[];
  submitting: boolean;
  onSubmit: () => void;
}

/** Sticky footer: per-section progress and the single submit action. */
export function SubmitBar({ counts, submitting, onSubmit }: SubmitBarProps) {
  const sections = counts.filter((c) => c.total > 0);
  const unanswered = sections.reduce((n, c) => n + (c.total - c.done), 0);

  const submit = () => {
    if (unanswered > 0 && !window.confirm(`${unanswered} question${unanswered === 1 ? ' is' : 's are'} still unanswered. Submit anyway?`)) return;
    onSubmit();
  };

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-border/70 bg-background/90 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground" aria-label="Progress">
          {sections.map((c) => (
            <li key={c.label}>
              {c.label} <span className={c.done === c.total ? 'font-medium text-success' : 'font-medium text-foreground'}>{c.done}/{c.total}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={submit}
          disabled={submitting}
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-progress disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Award className="h-4 w-4" />}
          {submitting ? 'Evaluating…' : 'Submit assessment'}
        </button>
      </div>
    </div>
  );
}
