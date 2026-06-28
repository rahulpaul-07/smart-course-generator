import React from 'react';
import { Skeleton, SkeletonCard, SkeletonButton } from '../ui/skeleton';
import { BarChart3 } from 'lucide-react';

export function AnalyticsSkeleton() {
  return (
    <div className="page-shell">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow"><BarChart3 className="h-3.5 w-3.5" /> Learning Analytics</p>
          <div className="mt-3">
            <Skeleton className="h-10 w-64 rounded-md" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
        </div>
        <SkeletonButton className="w-32 h-10" />
      </div>

      <div className="mt-12 space-y-12">
        {/* Streak Banner Skeleton */}
        <SkeletonCard className="relative overflow-hidden rounded-3xl p-6 sm:p-10 border border-border/30 shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-10">
            <Skeleton className="h-24 w-24 rounded-full shrink-0" />
            <div className="flex-1 text-center sm:text-left space-y-3">
              <Skeleton className="h-6 w-32 rounded-md mx-auto sm:mx-0" />
              <Skeleton className="h-8 w-48 rounded-md mx-auto sm:mx-0" />
              <Skeleton className="h-4 w-64 rounded-md mx-auto sm:mx-0" />
            </div>
            <div className="shrink-0">
              <SkeletonButton className="h-12 w-32 rounded-xl" />
            </div>
          </div>
        </SkeletonCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} className="p-6 rounded-2xl flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="mb-4 p-3 rounded-2xl bg-muted/20">
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md mb-2" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </SkeletonCard>
          ))}
        </div>

        {/* Chart & Activity */}
        <div className="grid gap-8 lg:grid-cols-2">
          <SkeletonCard className="p-6 sm:p-8 rounded-3xl h-[450px]">
            <Skeleton className="h-6 w-48 rounded-md mb-8" />
            <Skeleton className="w-full h-full rounded-xl opacity-30" />
          </SkeletonCard>
          <SkeletonCard className="p-6 sm:p-8 rounded-3xl">
            <Skeleton className="h-6 w-48 rounded-md mb-8" />
            <div className="w-full aspect-[2/1] opacity-50">
              <Skeleton className="w-full h-full rounded-xl" />
            </div>
          </SkeletonCard>
        </div>
      </div>
    </div>
  );
}
