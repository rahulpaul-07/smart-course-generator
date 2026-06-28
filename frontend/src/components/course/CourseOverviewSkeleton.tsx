import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton } from '../ui/skeleton';
import { PageContainer } from '../layout/PageContainer';

export function CourseOverviewSkeleton() {
  return (
    <PageContainer className="pt-6 max-w-7xl mx-auto">
      {/* Back Button Skeleton */}
      <div className="mb-6 -ml-4 flex items-center">
        <Skeleton className="w-32 h-8 rounded-lg" />
      </div>

      {/* Hero Skeleton */}
      <SkeletonCard className="w-full h-[380px] rounded-3xl mb-8 lg:mb-12" />

      <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
        <div className="space-y-10">
          {/* Curriculum Timeline Skeleton */}
          <section className="space-y-6">
            <Skeleton className="w-48 h-8 rounded-lg" />
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <SkeletonCard key={n} className="h-24 w-full" />
              ))}
            </div>
          </section>

          {/* Certificate Progress Skeleton */}
          <section>
            <SkeletonCard className="h-48 w-full" />
          </section>
        </div>

        {/* Sidebar Skeleton */}
        <div className="space-y-6">
          <SkeletonCard className="w-full h-[400px] rounded-3xl" />
          <SkeletonCard className="w-full h-[250px] rounded-3xl" />
        </div>
      </div>
    </PageContainer>
  );
}
