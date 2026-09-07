import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';

export interface QuickAction {
  label: string;
  icon: LucideIcon;
  url: string;
}

/**
 * Reduced from five gradient cards to one row of links.
 *
 * Each destination here is already in the sidebar, and the old "Recommended"
 * block listed the same routes a third time -- three widgets pointing at five
 * pages is what makes a dashboard read as filler. Kept as a thin row because
 * losing the discovery entirely would be a regression; the gradients went
 * because their colours were assigned by position and meant nothing.
 */
export function DashboardQuickActions({ actions }: { actions: QuickAction[] }) {
  return (
    <nav aria-label="Shortcuts" className="flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.url}
          to={action.url}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <action.icon className="h-4 w-4" aria-hidden />
          {action.label}
        </Link>
      ))}
    </nav>
  );
}
