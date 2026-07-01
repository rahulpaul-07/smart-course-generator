import React from 'react';
import { Skeleton, SkeletonCard, SkeletonButton } from '../ui/skeleton';
import { PageContainer } from '../layout/PageContainer';
import { SectionHeader } from '../ui/SectionHeader';

export function ProfileSkeleton() {
  return (
    <PageContainer>
      <SectionHeader 
        title="Your Profile" 
        description="Manage your public presence and learning preferences."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <SkeletonCard className="p-6 flex flex-col items-center text-center">
            <Skeleton className="h-28 w-28 rounded-full mb-4" />
            <Skeleton className="h-6 w-32 rounded-md mb-2" />
            <Skeleton className="h-4 w-48 rounded-md mb-6" />
            <div className="w-full space-y-3">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-5/6 rounded-md" />
            </div>
          </SkeletonCard>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <SkeletonCard className="p-6">
            <Skeleton className="h-6 w-48 rounded-md mb-6" />
            <div className="space-y-4">
              <div>
                <Skeleton className="h-4 w-24 rounded-md mb-2" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 rounded-md mb-2" />
                <Skeleton className="h-24 w-full rounded-md" />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <SkeletonButton className="h-10 w-32" />
            </div>
          </SkeletonCard>
        </div>
      </div>
    </PageContainer>
  );
}
