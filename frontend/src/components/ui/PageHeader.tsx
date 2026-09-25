import type { ComponentType, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Small label above the title, e.g. the section of the app. */
  eyebrow?: { icon?: ComponentType<{ className?: string }>; label: string };
  action?: ReactNode;
  className?: string;
}

/**
 * The one page title treatment for the app. Pages previously hand-rolled
 * their own: 3xl to 5xl, gradient text that faded into the background, some
 * centred, some with the title as an <h2>, and the leaderboard dropping its
 * heading entirely when empty.
 */
export function PageHeader({ title, description, eyebrow, action, className }: PageHeaderProps) {
  const Icon = eyebrow?.icon;
  return (
    <header className={cn('mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-primary">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {eyebrow.label}
          </p>
        )}
        <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground sm:text-[15px]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
