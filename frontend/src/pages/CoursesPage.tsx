import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { courseService } from '../services/courseService';
import { useLocalStorage } from '../hooks/useStorage';
import { sortCourses } from '../utils/sorting';
import type { Course, Module, Lesson } from '../types';

import { CourseFilters } from '../components/courses/CourseFilters';
import { CourseList } from '../components/courses/CourseList';
import { STORAGE_KEYS } from '../utils/constants';

type FilterableCourse = Course & { progress?: number };

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Opened');
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'list'>(STORAGE_KEYS.COURSE_VIEW_PREFERENCE, 'grid');

  const { data: courses, isLoading, isError, refetch } = useQuery({
    queryKey: ['myCourses'],
    queryFn: async () => {
      const [res, err] = await courseService.getMyCourses();
      if (err) throw new Error(err);
      return res || [];
    }
  });

  const filters = ['All', 'In Progress', 'Completed'];
  const sorts = ['Recently Opened', 'Recently Created', 'Alphabetical', 'Progress'];

  const filteredCourses = (courses as FilterableCourse[] | undefined)?.map((course) => {
    const modules = course.modules as Module[] | undefined;
    const progress = course.progress || (modules?.reduce((acc: number, m) => acc + ((m.lessons as Lesson[] | undefined)?.filter((l) => l.completedAt)?.length || 0), 0) || 0) / (modules?.reduce((acc: number, m) => acc + ((m.lessons as Lesson[] | undefined)?.length || 0), 0) || 1) * 100;
    return { ...course, progress };
  }).filter((course) => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;

    const isCompleted = course.progress >= 100;
    const isInProgress = course.progress > 0 && course.progress < 100;

    if (filter === 'In Progress' && !isInProgress) return false;
    if (filter === 'Completed' && !isCompleted) return false;

    return true;
  }) || [];

  const sortedAndFilteredCourses = sortCourses(filteredCourses, sortBy);

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <PageContainer className="relative z-10 pt-8 pb-24 space-y-8 max-w-7xl mx-auto">
        
        <PageHeader
          title="My Courses"
          description="Pick up where you left off, or generate something new."
          action={(
            <Button className="rounded-xl shadow-primary/20 active:scale-[0.98] transition-all duration-200 bg-primary hover:bg-primary/90 font-bold" onClick={() => navigate('/dashboard#course-generator')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New Course
            </Button>
          )}
        />

        {/* 2. Controls Toolbar (Search & Filters) */}
        <CourseFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filter={filter}
          setFilter={setFilter}
          filters={filters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sorts={sorts}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />

        {/* 3. Main Content Area */}
        <CourseList 
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          courses={sortedAndFilteredCourses}
          viewMode={viewMode}
          searchQuery={searchQuery}
          filter={filter}
          onClearFilters={() => { setSearchQuery(''); setFilter('All'); }}
          onCourseDeleted={refetch}
        />
      </PageContainer>
    </div>
  );
}
