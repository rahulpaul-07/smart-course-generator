import type { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Adapted from Magic UI's Bento Grid (MIT, magicui.design). Changes: theme
 * tokens instead of hard-coded neutrals, and the call to action is always
 * visible. The original only revealed it on hover, so touch and keyboard users
 * never saw it; it also lifted the whole card on hover.
 */
export function BentoGrid({ children, className, ...props }: ComponentPropsWithoutRef<'div'>) {
  return (
    <div className={cn('grid w-full grid-cols-1 gap-4 md:grid-cols-3', className)} {...props}>
      {children}
    </div>
  );
}

interface BentoCardProps extends Omit<ComponentPropsWithoutRef<'article'>, 'children'> {
  name: string;
  description: string;
  Icon: ElementType;
  background: ReactNode;
  /** In-app route. Omit for a card with no link. */
  to?: string;
  cta?: string;
}

export function BentoCard({ name, description, Icon, background, to, cta, className, ...props }: BentoCardProps) {
  return (
    <article
      className={cn(
        'flex flex-col overflow-hidden rounded-xl border border-border bg-card',
        'shadow-[0_1px_2px_rgba(0,0,0,.04),0_8px_24px_-12px_rgba(0,0,0,.08)] dark:shadow-[inset_0_-24px_64px_-32px_rgba(255,255,255,.08)]',
        className
      )}
      {...props}
    >
      <div className="relative min-h-[220px] flex-1 overflow-hidden border-b border-border">{background}</div>
      <div className="flex flex-col gap-2 p-6">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
        <h3 className="text-base font-semibold tracking-tight">{name}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        {to && cta && (
          <Link to={to} className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline">
            {cta} <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        )}
      </div>
    </article>
  );
}
