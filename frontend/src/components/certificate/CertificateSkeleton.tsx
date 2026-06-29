import React from 'react';
import { Skeleton, SkeletonText, SkeletonButton, SkeletonCard } from '../ui/skeleton';

export function CertificateSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Banner Skeleton */}
      <div className="w-full bg-muted/20 border-b border-border/30 py-3 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Skeleton className="h-4 w-48 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-12 lg:pt-16 flex flex-col items-center">
        {/* Certificate Preview Skeleton */}
        <div className="w-full max-w-[1000px] mb-16 aspect-[1.414/1] relative bg-card/50 border border-border/50 rounded-lg overflow-hidden shadow-xl">
          <Skeleton className="absolute inset-0" />
        </div>

        {/* Metadata Skeleton */}
        <div className="w-full max-w-[1000px] mb-8 bg-card/30 backdrop-blur-xl border border-border/30 rounded-3xl p-8 lg:p-12 shadow-md">
          <div className="grid md:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 rounded-md mb-2" />
                <Skeleton className="h-6 w-32 rounded-md" />
              </div>
            ))}
          </div>
        </div>

        {/* Achievements & Share Panel Skeleton */}
        <div className="w-full max-w-[1000px] grid md:grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-8 bg-card/40 backdrop-blur-md border border-border/30 rounded-3xl p-8 shadow-sm">
            <Skeleton className="h-6 w-48 rounded-md mb-8" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48 rounded-md" />
                    <SkeletonText lines={2} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="col-span-12 md:col-span-4 bg-card/40 backdrop-blur-md border border-border/30 rounded-3xl p-8 shadow-sm flex flex-col">
            <Skeleton className="h-6 w-32 rounded-md mb-8" />
            <div className="space-y-4">
              <SkeletonButton className="w-full h-12 rounded-xl" />
              <SkeletonButton className="w-full h-12 rounded-xl" />
              <div className="my-6">
                <Skeleton className="h-px w-full" />
              </div>
              <SkeletonButton className="w-full h-12 rounded-xl" />
              <SkeletonButton className="w-full h-12 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificatesGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} className="p-6 rounded-2xl flex flex-col items-center text-center">
          <Skeleton className="h-12 w-12 rounded-full mb-4" />
          <Skeleton className="h-6 w-3/4 rounded-md mb-2" />
          <SkeletonButton className="w-full h-10 mt-4 rounded-xl" />
        </SkeletonCard>
      ))}
    </div>
  );
}
