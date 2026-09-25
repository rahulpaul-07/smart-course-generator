import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Pill whose text catches a moving highlight -- for announcements. */
export function ShinyBadge({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'group inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/60 px-3.5 py-1 text-xs backdrop-blur',
        'transition-colors hover:border-primary/40',
        className
      )}
    >
      <span
        style={{ '--shiny-width': '90px' } as CSSProperties}
        className={cn(
          'inline-flex items-center gap-1.5 text-muted-foreground animate-shiny-text bg-clip-text bg-no-repeat',
          '[background-position:0_0] [background-size:var(--shiny-width)_100%]',
          'bg-gradient-to-r from-transparent via-foreground via-50% to-transparent'
        )}
      >
        {children}
      </span>
    </span>
  );
}
