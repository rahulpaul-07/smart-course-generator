import React from 'react';
import { Skeleton, SkeletonCard, SkeletonButton } from '../ui/skeleton';
import { Globe } from 'lucide-react';

export function CommunitySkeleton() {
  return (
    <div className="page-shell">
      <section className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="eyebrow"><Globe className="h-3.5 w-3.5" /> Community</p>
          <div className="mt-3">
            <Skeleton className="h-10 w-64 rounded-md" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-4 w-96 rounded-md" />
          </div>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} className="flex flex-col rounded-2xl p-5 relative overflow-hidden h-[280px]">
            <div className="flex justify-between items-start mb-2 pr-16">
              <Skeleton className="h-6 w-3/4 rounded-md" />
            </div>
            
            <div className="flex items-center gap-1 mb-4">
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>

            <div className="flex-grow space-y-2 mb-4">
              <Skeleton className="h-3 w-full rounded-md" />
              <Skeleton className="h-3 w-5/6 rounded-md" />
              <Skeleton className="h-3 w-4/6 rounded-md" />
            </div>
            
            <div className="flex items-center justify-between border-t border-border/30 pt-4 mb-4 mt-auto">
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-full" />
                <Skeleton className="h-3 w-20 rounded-md" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-8 rounded-md" />
                <Skeleton className="h-4 w-8 rounded-md" />
              </div>
            </div>

            <SkeletonButton className="w-full h-10 rounded-xl" />
          </SkeletonCard>
        ))}
      </div>
    </div>
  );
}
