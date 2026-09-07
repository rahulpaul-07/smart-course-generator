import { BookOpen, Brain, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { formatTimeDistance } from '@/utils/dates';
import type { ContinueLearning } from '../../services/dashboardService';

const ICONS: Record<string, typeof BookOpen> = {
  Course: BookOpen,
  'Interview Prep': Brain,
  Roadmap: Map,
};

/**
 * One row, not a card with a 256px placeholder thumbnail. The thumbnail was a
 * grey box with a book glyph in it -- it carried no information about the
 * course, so it was spending the most prominent space on the row to say
 * nothing.
 */
export function DashboardContinueLearning({ data }: { data: ContinueLearning }) {
  const navigate = useNavigate();
  const Icon = ICONS[data.type] || BookOpen;

  return (
    <section aria-label="Continue learning">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Pick up where you left off
      </h2>
      <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-card p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="h-5 w-5 text-muted-foreground" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{data.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {data.type} · updated {formatTimeDistance(data.updatedAt)}
          </p>
        </div>
        <Button onClick={() => navigate(data.url)} className="shrink-0">
          Resume
        </Button>
      </div>
    </section>
  );
}
