import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { DashboardStatistics } from '../../services/dashboardService';

interface DashboardOverviewProps {
  statistics?: DashboardStatistics;
  weeklyProgress: number;
  overallCompletion: number;
}

/**
 * Totals were six identical cards, each with its own border, shadow, hover
 * lift, icon chip and a 3xl number -- roughly 140px of chrome to display a
 * single-digit integer. They are a table of counts, so they render as one:
 * hairline-divided cells, monospaced figures that align down the column, and
 * zeros dimmed so the eye lands on what the user has actually done.
 */
const FIELDS: { key: keyof DashboardStatistics; label: string }[] = [
  { key: 'coursesCreated', label: 'Courses' },
  { key: 'coursesCompleted', label: 'Completed' },
  { key: 'lessonsCompleted', label: 'Lessons' },
  { key: 'certificatesEarned', label: 'Certificates' },
  { key: 'roadmapsCreated', label: 'Roadmaps' },
  { key: 'interviewPacks', label: 'Interview packs' },
  { key: 'flashcardsGenerated', label: 'Flashcards' },
  { key: 'aiQuestionsAsked', label: 'Questions asked' },
];

function ProgressRow({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: number;
}) {
  const complete = value >= 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium">{label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className={cn('font-mono tabular-nums text-sm', complete && 'text-emerald-500')}>
          {value}%
        </span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn('h-full rounded-full', complete ? 'bg-emerald-500' : 'bg-primary')}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function DashboardOverview({ statistics, weeklyProgress, overallCompletion }: DashboardOverviewProps) {
  return (
    <div className="space-y-8">
      <section aria-label="Totals">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Totals
        </h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <dl className="grid grid-cols-2 gap-px bg-border sm:grid-cols-3 xl:grid-cols-4">
            {FIELDS.map((field) => {
              const value = statistics?.[field.key] ?? 0;
              return (
                <div key={field.key} className="bg-card px-4 py-3">
                  <dt className="truncate text-xs text-muted-foreground">{field.label}</dt>
                  <dd
                    className={cn(
                      'mt-1 font-mono text-2xl tabular-nums',
                      value === 0 && 'text-muted-foreground/40'
                    )}
                  >
                    {value}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      </section>

      <section aria-label="Progress">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Progress
        </h2>
        <div className="space-y-6 rounded-xl border border-border bg-card p-5">
          <ProgressRow label="Weekly goal" hint="Lessons completed against this week's target" value={weeklyProgress} />
          <ProgressRow label="Overall completion" hint="Across every course you have generated" value={overallCompletion} />
        </div>
      </section>
    </div>
  );
}
