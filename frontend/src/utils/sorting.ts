export function sortCourses(courses: any[], sortBy: string): any[] {
  if (!courses) return [];
  
  return [...courses].sort((a: any, b: any) => {
    if (sortBy === 'Alphabetical') return a.title.localeCompare(b.title);
    if (sortBy === 'Recently Created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === 'Progress') return (b.progress || 0) - (a.progress || 0);
    return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
  });
}
