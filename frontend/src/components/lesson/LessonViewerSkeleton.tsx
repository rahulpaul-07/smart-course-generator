import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText } from '../ui/skeleton';

export function LessonViewerSkeleton() {
  return (
    <div className="relative min-h-screen bg-background font-sans overflow-hidden flex flex-col">
      {/* Header Skeleton */}
      <div className="h-[72px] lg:h-[88px] w-full border-b border-border/30 bg-background/80 flex items-center px-4 lg:px-8 shrink-0 justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Skeleton (Hidden on small screens) */}
        <div className="hidden lg:flex flex-col w-[300px] xl:w-[340px] border-r border-border/30 bg-card/20 p-6 shrink-0 space-y-6">
          <Skeleton className="h-6 w-3/4 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-5 w-full rounded-md" />
              <div className="pl-6 space-y-2">
                <Skeleton className="h-4 w-5/6 rounded-md" />
                <Skeleton className="h-4 w-4/6 rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1 flex flex-col relative min-w-0">
          <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
            <Skeleton className="h-full w-1/3" />
          </div>
          
          <div className="flex-1 min-h-0 overflow-y-auto p-6 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
              <Skeleton className="h-10 w-3/4" />
              
              <div className="space-y-4">
                <SkeletonText lines={4} />
              </div>

              <SkeletonCard className="h-64 w-full" />

              <div className="space-y-4">
                <SkeletonText lines={3} />
              </div>
              
              <div className="flex justify-between items-center pt-8 border-t border-border/30">
                <Skeleton className="h-10 w-32 rounded-lg" />
                <Skeleton className="h-10 w-32 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
