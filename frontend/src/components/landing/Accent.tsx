import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** The italic serif accent used for one phrase in a landing headline. */
export function Accent({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <em className={cn('font-accent text-[1.1em] font-normal italic tracking-normal', className)}>{children}</em>
  );
}
