import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard, type CourseCardCourse } from './CourseCard';
import { useNavigate } from 'react-router-dom';
import { CoursesGridSkeleton } from './CoursesGridSkeleton';
import { ErrorState } from '../ui/ErrorState';
import { EmptyState } from '../ui/EmptyState';

interface CourseListProps {
  isLoading: boolean;
  isError: boolean;
  courses: CourseCardCourse[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  filter: string;
  onClearFilters: () => void;
  onRetry: () => void;
  onCourseDeleted?: () => void;
}

export function CourseList({
  isLoading,
  isError,
  courses,
  viewMode,
  searchQuery,
  filter,
  onClearFilters,
  onRetry,
  onCourseDeleted
}: CourseListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return <CoursesGridSkeleton viewMode={viewMode} count={6} />;
  }

  if (isError) {
    return (
      <ErrorState 
        title="Unable to load courses" 
        description="Something went wrong while loading your courses." 
        onRetry={onRetry} 
      />
    );
  }

  if (!courses || courses.length === 0) {
    const isFiltered = searchQuery || filter !== 'All';
    return (
      <EmptyState
        title={isFiltered ? "No matches found" : "Your learning journey begins here"}
        description={isFiltered 
          ? "Try adjusting your search criteria or clearing your active filters to find what you're looking for." 
          : "Generate a fully personalized, AI-driven course in minutes and start acquiring new skills."}
        action={
          isFiltered ? (
            <Button variant="outline" size="lg" onClick={onClearFilters}>
              Clear All Filters
            </Button>
          ) : (
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-8 shadow-md" onClick={() => navigate('/dashboard#course-generator')}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate New Course
            </Button>
          )
        }
      />
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div 
        layout
        className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}
      >
        {courses.map((course: CourseCardCourse) => (
          <CourseCard key={course._id} course={course} viewMode={viewMode} onDeleted={onCourseDeleted} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
