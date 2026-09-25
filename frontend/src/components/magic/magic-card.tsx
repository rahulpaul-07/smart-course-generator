import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MagicCardProps {
  children: ReactNode;
  className?: string;
  /** Radius of the cursor spotlight in px. */
  spotlight?: number;
}

/**
 * Card with a cursor-following spotlight on its surface and border. Position
 * is written to CSS variables on the element, so moving the mouse never
 * re-renders React.
 */
export function MagicCard({ children, className, spotlight = 320 }: MagicCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      style={{ '--spot': `${spotlight}px` } as CSSProperties}
      className={cn(
        'group/card relative overflow-hidden rounded-2xl border border-border/70 bg-card/60 [--mx:-999px] [--my:-999px]',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
        style={{ background: 'radial-gradient(var(--spot) circle at var(--mx) var(--my), hsl(var(--primary) / 0.10), transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] p-px opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 [mask-composite:exclude] [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)]"
        style={{ background: 'radial-gradient(calc(var(--spot) * 0.8) circle at var(--mx) var(--my), hsl(var(--primary) / 0.55), transparent 70%)' }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  );
}
