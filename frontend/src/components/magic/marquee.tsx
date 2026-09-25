import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: ReactNode;
  className?: string;
  reverse?: boolean;
  pauseOnHover?: boolean;
  /** Copies of the content laid end to end; 2 is enough for a seamless loop. */
  repeat?: number;
}

/** Infinite horizontal scroller. Duplicate copies are hidden from assistive tech. */
export function Marquee({ children, className, reverse, pauseOnHover = true, repeat = 2 }: MarqueeProps) {
  return (
    <div
      className={cn(
        'group flex overflow-hidden [--duration:40s] [--gap:3rem] [gap:var(--gap)]',
        '[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]',
        className
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0}
          className={cn(
            'flex shrink-0 items-center justify-around [gap:var(--gap)] animate-marquee',
            reverse && '[animation-direction:reverse]',
            pauseOnHover && 'group-hover:[animation-play-state:paused]'
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
