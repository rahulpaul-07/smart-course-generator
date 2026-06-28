import React from 'react';
import { CourseCardSkeleton } from './CourseCardSkeleton';

interface CoursesGridSkeletonProps {
  viewMode?: 'grid' | 'list';
  count?: number;
}

export function CoursesGridSkeleton({ viewMode = 'grid', count = 6 }: CoursesGridSkeletonProps) {
  return (
    <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
      {[...Array(count)].map((_, i) => (
        <CourseCardSkeleton key={i} viewMode={viewMode} />
      ))}
    </div>
  );
}
