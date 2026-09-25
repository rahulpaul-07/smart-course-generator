import { useId } from 'react';
import { cn } from '@/lib/utils';

/** CourseAI mark: three curriculum lines resolving into a spark. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('h-7 w-7', className)}>
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8b7cff" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${id}-bg)`} />
      <rect x="0.5" y="0.5" width="31" height="31" rx="8.5" fill="none" stroke="white" strokeOpacity="0.18" />
      <rect x="8" y="9" width="11" height="2.6" rx="1.3" fill="white" />
      <rect x="8" y="14.7" width="8" height="2.6" rx="1.3" fill="white" fillOpacity="0.8" />
      <rect x="8" y="20.4" width="5" height="2.6" rx="1.3" fill="white" fillOpacity="0.6" />
      <path d="M22.5 15.2l1.1 2.6 2.6 1.1-2.6 1.1-1.1 2.6-1.1-2.6-2.6-1.1 2.6-1.1z" fill="white" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-semibold tracking-tight', className)}>
      <LogoMark />
      <span>CourseAI</span>
    </span>
  );
}
