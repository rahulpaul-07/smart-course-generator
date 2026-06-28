import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import api from '../utils/api';
import { courseService } from '../services/courseService';
import { useLocalStorage } from '../hooks/useStorage';
import { sortCourses } from '../utils/sorting';

import { CourseFilters } from '../components/courses/CourseFilters';
import { CourseList } from '../components/courses/CourseList';
import { STORAGE_KEYS } from '../utils/constants';

export default function CoursesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Opened');
  const [viewMode, setViewMode] = useLocalStorage<'grid' | 'list'>(STORAGE_KEYS.COURSE_VIEW_PREFERENCE, 'grid');

  const { data: courses, isLoading, isError } = useQuery({
    queryKey: ['myCourses'],
    queryFn: async () => {
      const [res, err] = await courseService.getMyCourses();
      if (err) throw new Error(err);
      return res || [];
    }
  });

  const filters = ['All', 'In Progress', 'Completed', 'Favorites', 'Recently Viewed', 'Difficulty'];
  const sorts = ['Recently Opened', 'Recently Created', 'Alphabetical', 'Progress'];

  const filteredCourses = courses?.filter((course: any) => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    
    const progress = course.progress || (course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.filter((l: any) => l.completedAt)?.length || 0), 0) || 0) / (course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 1) * 100;
    const isCompleted = progress >= 100;
    const isInProgress = progress > 0 && progress < 100;

    if (filter === 'In Progress' && !isInProgress) return false;
    if (filter === 'Completed' && !isCompleted) return false;
    if (filter === 'Favorites' && !course.isFavorite) return false;
    if (filter === 'Difficulty' && (!course.difficulty || course.difficulty === 'Unknown')) return false;

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
        
        {/* 1. Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground mb-2 drop-shadow-sm">My Courses</h1>
            <p className="text-base md:text-lg text-muted-foreground font-medium">Manage and continue your AI-generated learning journeys.</p>
          </div>
          
          <Button size="lg" className="rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 w-full md:w-auto shrink-0 bg-primary hover:bg-primary/90 font-bold" onClick={() => navigate('/dashboard')}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate New Course
          </Button>
        </motion.div>

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
          courses={sortedAndFilteredCourses}
          viewMode={viewMode}
          searchQuery={searchQuery}
          filter={filter}
          onClearFilters={() => { setSearchQuery(''); setFilter('All'); }}
        />
      </PageContainer>
    </div>
  );
}
