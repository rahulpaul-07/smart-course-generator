import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton } from '../ui/skeleton';
import { cn } from '@/lib/utils';

interface CourseCardSkeletonProps {
  viewMode?: 'grid' | 'list';
}

export function CourseCardSkeleton({ viewMode = 'grid' }: CourseCardSkeletonProps) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl border border-border/30 bg-card/40 overflow-hidden",
        viewMode === 'list' ? 'flex flex-col sm:flex-row gap-0' : 'flex flex-col'
      )}
    >
      {/* Cover Thumbnail Skeleton */}
      <div className={cn(
        "relative bg-muted/30 border-b border-border/30 overflow-hidden shrink-0",
        viewMode === 'list' ? 'w-full sm:w-[280px] sm:border-r sm:border-b-0' : 'h-40'
      )} />

      {/* Card Content Skeleton */}
      <div className={cn(
        "flex flex-col p-5 sm:p-6 flex-1 bg-card/20",
        viewMode === 'list' ? 'justify-between' : ''
      )}>
        <div className="mb-4">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <SkeletonText lines={2} />
        </div>

        <div className="mt-auto space-y-5">
          <div className="flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>

          <div className="pt-5 border-t border-border/30">
            <SkeletonButton className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
