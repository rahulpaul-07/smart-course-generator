import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles, MoreVertical, Layers, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { calculatePercentage } from '../../utils/percentages';

interface CourseCardProps {
  course: any;
  viewMode: 'grid' | 'list';
}

export function CourseCard({ course, viewMode }: CourseCardProps) {
  const navigate = useNavigate();
  const totalLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 12;
  const completedLessons = course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.filter((l: any) => l.completedAt)?.length || 0), 0) || 0;
  const progress = course.progress || calculatePercentage(completedLessons, totalLessons);
  const difficulty = course.difficulty || 'Intermediate';
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`group relative rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/30 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary ${viewMode === 'list' ? 'flex flex-col sm:flex-row gap-0' : 'flex flex-col'}`}
    >
      {/* Cover Thumbnail */}
      <div className={`relative bg-muted/30 border-b border-border/40 overflow-hidden shrink-0 flex items-center justify-center ${viewMode === 'list' ? 'w-full sm:w-[280px] sm:border-r sm:border-b-0' : 'h-40'}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent mix-blend-overlay group-hover:opacity-100 transition-opacity duration-200" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(var(--primary),0.15),transparent_50%)]" />
        
        <BookOpen className="h-12 w-12 text-primary/20 group-hover:scale-110 group-hover:text-primary/40 transition-all duration-300" />
        
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-md bg-background/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm border border-border/50">
            <Sparkles className="h-3 w-3" /> AI
          </span>
          <span className="inline-flex items-center rounded-md bg-background/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-foreground shadow-sm border border-border/50">
            {difficulty}
          </span>
        </div>

        <button className="absolute top-3 right-3 h-8 w-8 rounded-md bg-background/50 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background/90 border border-border/50 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm">
          <MoreVertical className="h-4 w-4 text-foreground" />
        </button>
      </div>

      {/* Card Content */}
      <div className={`flex flex-col p-5 sm:p-6 flex-1 bg-card/20 ${viewMode === 'list' ? 'justify-between' : ''}`}>
        <div className="mb-4">
          <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200 line-clamp-1">{course.title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {course.description || `A comprehensive AI-generated learning experience covering the fundamentals of ${course.title}.`}
          </p>
        </div>

        <div className="mt-auto space-y-5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1.5"><Layers className="h-3.5 w-3.5" /> {totalLessons} lessons</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> ~2.5 hours</span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-end">
              <span className="text-xs font-semibold text-muted-foreground">Progress</span>
              <span className="text-sm font-extrabold text-foreground">{progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
              <div 
                className={`h-full rounded-full transition-all duration-500 ease-out ${progress === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-border/40 pt-4">
            <span className="text-xs font-medium text-muted-foreground w-full sm:w-auto">
              Opened {new Date(course.updatedAt || course.createdAt).toLocaleDateString()}
            </span>
            <Button 
              className="w-full sm:w-auto h-11 px-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] group/btn bg-primary hover:bg-primary/90 text-primary-foreground font-semibold" 
              onClick={() => navigate(`/course/${course._id}`)}
            >
              {progress === 0 ? 'Start Learning' : progress === 100 ? 'Review' : 'Continue'} 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
