import { cn } from '@/lib/utils';

/** CourseAI mark: three curriculum lines, shortening as a syllabus narrows. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className={cn('h-7 w-7', className)}>
      <rect width="32" height="32" rx="7" fill="#1D4ED8" />
      <rect x="8" y="9" width="16" height="2.6" rx="1" fill="white" />
      <rect x="8" y="14.7" width="11" height="2.6" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="8" y="20.4" width="6" height="2.6" rx="1" fill="white" fillOpacity="0.6" />
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
