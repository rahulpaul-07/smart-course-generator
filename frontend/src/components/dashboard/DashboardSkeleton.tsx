import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonAvatar, SkeletonButton } from '../ui/skeleton';
import { PageContainer } from '../layout/PageContainer';

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      {/* 1. Hero Banner Skeleton */}
      <Skeleton className="h-[220px] w-full rounded-3xl" />

      {/* Course Generator Section Skeleton */}
      <section className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <SkeletonCard className="h-[140px]" />
      </section>

      {/* 3. Quick Actions Skeleton */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <SkeletonCard key={i} className="h-32" />
          ))}
        </div>
      </section>

      {/* Grid Layout for Stats, Progress, Activity, Recommended */}
      <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8">
        {/* Overview and Progress */}
        <div className="space-y-8">
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <SkeletonCard key={i} className="h-28" />
              ))}
            </div>
          </section>
          <section>
            <SkeletonCard className="h-[200px]" />
          </section>
        </div>

        {/* Activity and Recommended */}
        <div className="space-y-8">
          <section>
            <SkeletonCard className="h-[300px]" />
          </section>
          <section>
            <SkeletonCard className="h-[250px]" />
          </section>
        </div>
      </div>
    </div>
  );
}
