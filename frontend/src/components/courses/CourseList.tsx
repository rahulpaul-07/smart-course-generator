import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CourseCard } from './CourseCard';
import { useNavigate } from 'react-router-dom';

interface CourseListProps {
  isLoading: boolean;
  isError: boolean;
  courses: any[];
  viewMode: 'grid' | 'list';
  searchQuery: string;
  filter: string;
  onClearFilters: () => void;
}

export function CourseList({
  isLoading,
  isError,
  courses,
  viewMode,
  searchQuery,
  filter,
  onClearFilters
}: CourseListProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Skeleton key={n} className={`rounded-2xl border border-border/40 ${viewMode === 'grid' ? 'h-[420px]' : 'h-48'}`} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 lg:p-20 bg-card/20 border border-border/40 rounded-[32px] backdrop-blur-xl text-center shadow-sm"
      >
        <div className="h-16 w-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/20">
          <AlertCircle className="h-8 w-8 text-rose-500" />
        </div>
        <h3 className="text-2xl font-bold mb-3">Unable to load courses</h3>
        <p className="text-muted-foreground mb-8 max-w-md font-medium leading-relaxed">
          There was a problem fetching your courses from the server. Please check your connection and try again.
        </p>
        <Button size="lg" className="rounded-xl shadow-sm active:scale-[0.98] transition-transform font-bold" onClick={() => window.location.reload()}>
          Retry Connection
        </Button>
      </motion.div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center p-12 lg:p-24 bg-card/20 border border-dashed border-border/60 rounded-[32px] backdrop-blur-sm text-center relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 h-24 w-24 bg-background/50 backdrop-blur-xl rounded-3xl flex items-center justify-center mb-8 border border-border/40 shadow-sm shadow-primary/5">
          <BookOpen className="h-10 w-10 text-muted-foreground/60" />
          <Sparkles className="h-5 w-5 text-primary absolute -top-2 -right-2" />
        </div>
        
        <h3 className="text-3xl font-extrabold tracking-tight mb-4 relative z-10">
          {searchQuery || filter !== 'All' ? "No matches found" : "Your learning journey begins here"}
        </h3>
        <p className="text-lg text-muted-foreground mb-10 max-w-md font-medium leading-relaxed relative z-10">
          {searchQuery || filter !== 'All' 
            ? "Try adjusting your search criteria or clearing your active filters to find what you're looking for."
            : "Generate a fully personalized, AI-driven course in minutes and start acquiring new skills."}
        </p>
        
        {searchQuery || filter !== 'All' ? (
          <Button variant="outline" size="lg" className="rounded-xl font-bold active:scale-[0.98] transition-all relative z-10" onClick={onClearFilters}>
            Clear All Filters
          </Button>
        ) : (
          <Button size="lg" className="rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 bg-primary hover:bg-primary/90 font-bold px-8 h-12 relative z-10" onClick={() => navigate('/dashboard')}>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate New Course
          </Button>
        )}
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="popLayout">
      <motion.div 
        layout
        className={viewMode === 'grid' ? 'grid md:grid-cols-2 xl:grid-cols-3 gap-6' : 'flex flex-col gap-4'}
      >
        {courses.map((course: any) => (
          <CourseCard key={course._id} course={course} viewMode={viewMode} />
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
