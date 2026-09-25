import { useId } from 'react';
import { cn } from '@/lib/utils';

interface PatternProps {
  className?: string;
  size?: number;
  variant?: 'dots' | 'grid';
}

/** SVG background pattern; pair with a mask class to fade the edges. */
export function DotPattern({ className, size = 22, variant = 'dots' }: PatternProps) {
  const id = useId();
  return (
    <svg aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)}>
      <defs>
        <pattern id={id} width={size} height={size} patternUnits="userSpaceOnUse">
          {variant === 'dots' ? (
            <circle cx={1} cy={1} r={1} className="fill-foreground/[0.14]" />
          ) : (
            <path d={`M.5 ${size}V.5H${size}`} fill="none" className="stroke-foreground/[0.07]" />
          )}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
