import type { Course } from '../types';

type SortableCourse = Course & { progress?: number };

export function sortCourses(courses: SortableCourse[], sortBy: string): SortableCourse[] {
  if (!courses) return [];

  return [...courses].sort((a, b) => {
    if (sortBy === 'Alphabetical') return a.title.localeCompare(b.title);
    if (sortBy === 'Recently Created') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    if (sortBy === 'Progress') return (b.progress || 0) - (a.progress || 0);
    return new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime();
  });
}
