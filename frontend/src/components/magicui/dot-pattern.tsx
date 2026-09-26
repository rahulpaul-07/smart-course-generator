import { useId, type SVGProps } from 'react';
import { cn } from '@/lib/utils';

/**
 * Adapted from Magic UI's Dot Pattern (MIT, magicui.design). The original
 * measures its box and renders one <circle> per dot, with an optional random
 * glow animation; an SVG <pattern> draws the same grid at any size with a
 * single element and nothing to animate.
 */
interface DotPatternProps extends SVGProps<SVGSVGElement> {
  /** Distance between dots, in px. */
  spacing?: number;
  radius?: number;
}

export function DotPattern({ spacing = 16, radius = 1, className, ...props }: DotPatternProps) {
  const id = useId();
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full fill-muted-foreground/25', className)} {...props}>
      <defs>
        <pattern id={id} width={spacing} height={spacing} patternUnits="userSpaceOnUse">
          <circle cx={radius} cy={radius} r={radius} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
