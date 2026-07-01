import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton } from '../ui/skeleton';

export function RoadmapSkeleton() {
  return (
    <div className="grid lg:grid-cols-12 gap-8 items-start">
      {/* Main Column */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* RoadmapHero Skeleton */}
        <div className="relative overflow-hidden rounded-3xl border border-border/30 bg-card p-8 lg:p-10 shadow-sm">
          <div className="relative z-10 flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <Skeleton className="h-8 w-64 rounded-xl" />
              <SkeletonText lines={2} className="w-full max-w-md" />
              <div className="flex gap-4">
                <Skeleton className="h-6 w-24 rounded-md" />
                <Skeleton className="h-6 w-24 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SkeletonButton className="h-10 w-24" />
              <SkeletonButton className="h-10 w-24" />
            </div>
          </div>
        </div>

        {/* RoadmapTimeline Skeleton */}
        <div className="rounded-2xl border border-border/30 bg-background/50 p-6 lg:p-10 shadow-sm relative">
          <Skeleton className="h-7 w-48 rounded-xl mb-8" />
          
          <div className="space-y-8 relative">
            <div className="absolute left-6 top-6 bottom-6 w-[2px] bg-muted/40 rounded-full" />
            
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="relative pl-16">
                <Skeleton className="absolute left-[20px] top-4 h-5 w-5 rounded-full" />
                <SkeletonCard className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-40 rounded-md" />
                      <SkeletonText lines={2} />
                    </div>
                    <SkeletonButton className="h-8 w-24 shrink-0" />
                  </div>
                  <div className="space-y-3 mt-6 border-t border-border/30 pt-6">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-3/4 rounded-md" />
                      </div>
                    ))}
                  </div>
                </SkeletonCard>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sidebar Column */}
      <div className="lg:col-span-4 space-y-6 sticky top-24">
        
        {/* RoadmapStats Skeleton */}
        <SkeletonCard className="p-6">
          <Skeleton className="h-6 w-32 rounded-xl mb-6" />
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center p-4 bg-background/50 rounded-xl border border-border/30">
                <Skeleton className="h-6 w-12 rounded-md mb-2" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-border/30 space-y-2">
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-4 w-10 rounded-md" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </SkeletonCard>

        {/* RoadmapActions Skeleton */}
        <SkeletonCard className="p-6 space-y-4">
          <Skeleton className="h-6 w-32 rounded-xl mb-2" />
          <SkeletonButton className="w-full h-11" />
          <SkeletonButton className="w-full h-11" />
          <SkeletonButton className="w-full h-11" />
        </SkeletonCard>

      </div>
    </div>
  );
}
