import { Link } from 'react-router-dom';
import { formatTimeDistance } from '@/utils/dates';
import type { RecentActivityItem } from '../../services/dashboardService';

/**
 * Every row here used to be stamped "Just now" -- a literal, for all ten items,
 * while the API was already sending a real `timestamp` per item and
 * `formatTimeDistance` was already in utils/dates. A timeline where every entry
 * claims to be seconds old is worse than no timeline.
 */
export function DashboardActivity({ recentActivity = [] }: { recentActivity?: RecentActivityItem[] }) {
  return (
    <section aria-label="Recent activity">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Recent activity
      </h2>

      {recentActivity.length === 0 ? (
        <p className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          Nothing yet. Generate a course and it will show up here.
        </p>
      ) : (
        <ol className="space-y-1 border-l border-border pl-5">
          {recentActivity.map((activity, i) => (
            <li key={`${activity.url}-${i}`} className="relative">
              <span
                className="absolute -left-[1.4rem] top-3 h-1.5 w-1.5 rounded-full bg-border ring-2 ring-background"
                aria-hidden
              />
              <Link
                to={activity.url}
                className="-mx-2 block rounded-lg px-2 py-2 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <p className="truncate text-sm font-medium">{activity.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {activity.type}
                  {activity.timestamp && ` · ${formatTimeDistance(activity.timestamp)}`}
                </p>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
