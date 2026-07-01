import React from 'react';
import { Skeleton, SkeletonCard, SkeletonButton } from '../ui/skeleton';
import { PageContainer } from '../layout/PageContainer';
import { SectionHeader } from '../ui/SectionHeader';

export function SettingsSkeleton() {
  return (
    <PageContainer>
      <SectionHeader 
        title="Settings" 
        description="Manage your account preferences and settings."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SkeletonCard className="p-4 flex flex-col gap-2">
            <Skeleton className="h-10 w-full rounded-md bg-muted/40" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </SkeletonCard>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard className="p-6">
            <Skeleton className="h-6 w-48 rounded-md mb-6" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </SkeletonCard>
          
          <div className="flex justify-end">
            <SkeletonButton className="h-11 w-32" />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
