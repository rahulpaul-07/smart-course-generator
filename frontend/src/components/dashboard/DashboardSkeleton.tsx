import { Skeleton } from '../ui/skeleton';

/** Mirrors the dashboard's real block order so the page does not reflow on load. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-4">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-5 w-96 max-w-full" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-32" />
        ))}
      </div>

      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-[140px] w-full" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <Skeleton className="h-[180px] w-full" />
          <Skeleton className="h-[160px] w-full" />
        </div>
        <Skeleton className="h-[280px] w-full" />
      </div>
    </div>
  );
}
