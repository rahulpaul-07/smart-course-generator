import React from 'react';
import { Skeleton, SkeletonCard, SkeletonText, SkeletonButton } from '../ui/skeleton';

export function InterviewPrepSkeleton() {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-12">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header Section */}
        <section className="text-center space-y-6 max-w-2xl mx-auto pt-10">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/40 mb-2 shadow-sm">
             <Skeleton className="h-10 w-10 rounded-full" />
          </div>
          <Skeleton className="h-14 w-3/4 mx-auto rounded-2xl" />
          <SkeletonText lines={2} className="w-full max-w-xl mx-auto" />
        </section>

        {/* Prompt Form */}
        <div className="max-w-2xl mx-auto relative">
          <div className="relative flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-2xl border border-border shadow-md">
            <Skeleton className="flex-1 h-12 rounded-xl" />
            <SkeletonButton className="h-12 w-40 rounded-xl" />
          </div>
        </div>

        {/* Recent Interviews */}
        <div className="pt-10">
          <div className="flex items-center justify-between mb-8">
            <Skeleton className="h-5 w-48 rounded-md" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} className="p-6 flex flex-col justify-between min-h-[180px]">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <Skeleton className="h-6 w-20 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                  <SkeletonText lines={2} />
                </div>
                <div className="mt-6">
                  <Skeleton className="h-5 w-24 rounded-md" />
                </div>
              </SkeletonCard>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

export function ResultsDashboardSkeleton() {
  return (
    <div className="space-y-10 animate-enter pb-16">
      
      {/* Header */}
      <div className="text-center space-y-4 mb-16 pt-4">
        <Skeleton className="inline-flex items-center justify-center h-24 w-24 rounded-2xl mb-4" />
        <Skeleton className="h-12 w-64 mx-auto rounded-xl" />
        <Skeleton className="h-5 w-48 mx-auto rounded-md" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <SkeletonCard className="p-10 flex flex-col justify-center items-center text-center shadow-md">
           <Skeleton className="h-4 w-32 rounded-lg mb-8" />
           <Skeleton className="h-48 w-48 rounded-full mb-8" />
           <Skeleton className="h-8 w-32 rounded-md mb-2" />
        </SkeletonCard>
        
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </SkeletonCard>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6 pt-6">
        <SkeletonCard className="p-8">
           <Skeleton className="h-6 w-48 rounded-lg mb-6" />
           <div className="space-y-4">
             {Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="flex gap-3">
                 <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                 <Skeleton className="h-5 w-full rounded-md" />
               </div>
             ))}
           </div>
        </SkeletonCard>
        <SkeletonCard className="p-8">
           <Skeleton className="h-6 w-48 rounded-lg mb-6" />
           <div className="space-y-4">
             {Array.from({ length: 3 }).map((_, i) => (
               <div key={i} className="flex gap-3">
                 <Skeleton className="h-5 w-5 rounded-full shrink-0 mt-0.5" />
                 <Skeleton className="h-5 w-full rounded-md" />
               </div>
             ))}
           </div>
        </SkeletonCard>
      </div>

      {/* AI Recommendations */}
      <SkeletonCard className="p-10">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-7 w-64 rounded-lg" />
        </div>
        <div className="space-y-4">
          <SkeletonText lines={3} />
        </div>
      </SkeletonCard>
      
    </div>
  );
}
