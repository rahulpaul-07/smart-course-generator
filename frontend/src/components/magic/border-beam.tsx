import type { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
}

/**
 * A short gradient light that travels along the parent's border. The parent
 * needs `relative` and a border radius; the beam inherits the radius.
 */
export function BorderBeam({
  className,
  size = 180,
  duration = 12,
  delay = 0,
  colorFrom = 'hsl(var(--primary))',
  colorTo = '#f0abfc',
}: BorderBeamProps) {
  const style = {
    '--size': size,
    '--duration': duration,
    '--delay': `-${delay}s`,
    '--color-from': colorFrom,
    '--color-to': colorTo,
  } as CSSProperties;

  return (
    <div
      aria-hidden
      style={style}
      className={cn(
        'pointer-events-none absolute inset-0 rounded-[inherit] [border:1px_solid_transparent]',
        '![mask-clip:padding-box,border-box] ![mask-composite:intersect] [mask:linear-gradient(transparent,transparent),linear-gradient(white,white)]',
        'after:absolute after:aspect-square after:w-[calc(var(--size)*1px)] after:animate-border-beam after:[animation-delay:var(--delay)]',
        'after:[background:linear-gradient(to_left,var(--color-from),var(--color-to),transparent)]',
        'after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_calc(var(--size)*1px))]',
        className
      )}
    />
  );
}
