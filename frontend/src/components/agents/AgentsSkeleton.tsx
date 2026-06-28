import React from 'react';
import { Skeleton, SkeletonText } from '../ui/skeleton';

export function AgentsSkeleton() {
  return (
    <div className="flex h-full flex-col p-4 animate-in fade-in duration-300">
      <Skeleton className="h-8 w-48 mb-6 rounded-md" />
      <div className="space-y-4">
        <SkeletonText lines={4} />
        <Skeleton className="h-32 w-full rounded-xl mt-6" />
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
