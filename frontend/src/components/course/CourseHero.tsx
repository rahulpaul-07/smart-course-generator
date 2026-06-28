import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, PlayCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ShareCourseButton from '../../components/ShareCourseButton';
import { calculateStudiedHours } from '../../utils/durations';
import { formatDateLong } from '../../utils/dates';

interface CourseHeroProps {
  course: any;
  courseId: string | undefined;
  difficulty: string;
  estimatedHours: number;
  progress: any;
  nextLessonId: string | null;
  setCourse: (course: any) => void;
}

export function CourseHero({ course, courseId, difficulty, estimatedHours, progress, nextLessonId, setCourse }: CourseHeroProps) {
  const navigate = useNavigate();

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative w-full rounded-[32px] border border-border/40 bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-12"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
        <div className="flex-1 max-w-3xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm border border-border/50">
              <Sparkles className="h-3.5 w-3.5" /> AI Generated
            </span>
            <span className="inline-flex items-center rounded-md bg-background/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground shadow-sm border border-border/50">
              {difficulty}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm border border-border/50">
              <Clock className="h-3.5 w-3.5" /> ~{estimatedHours} hours
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] drop-shadow-sm">
            {course.title}
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
            {course.description || `A comprehensive AI-generated learning experience covering the fundamentals and advanced concepts of ${course.title}.`}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              className="h-12 px-8 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]" 
              onClick={() => nextLessonId && navigate(`/course/${courseId}/lesson/${nextLessonId}`)}
            >
              {progress.percentage === 0 ? 'Start Course' : progress.percentage === 100 ? 'Review Course' : 'Continue Learning'}
              <PlayCircle className="ml-2 h-5 w-5" />
            </Button>
            
            {progress.percentage === 100 && (
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 px-6 rounded-xl text-sm font-bold border border-border/50 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5" 
                onClick={() => navigate(`/course/${courseId}/certificate`)}
              >
                <Award className="mr-2 h-4 w-4 text-emerald-500" />
                View Certificate
              </Button>
            )}
            <ShareCourseButton course={course} onUpdate={setCourse} />
          </div>
        </div>

        {/* Hero Progress Widget */}
        <div className="w-full lg:w-[320px] shrink-0 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
          <div>
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm font-bold text-foreground">Course Progress</span>
              <span className="text-xl font-extrabold text-primary">{progress.percentage}%</span>
            </div>
            <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${progress.percentage === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                style={{ width: `${progress.percentage}%` }} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Completed</div>
              <div className="text-lg font-bold text-foreground">{progress.completedLessons} <span className="text-sm font-medium text-muted-foreground">/ {progress.totalLessons}</span></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Remaining</div>
              <div className="text-lg font-bold text-foreground">{progress.totalLessons - progress.completedLessons} <span className="text-sm font-medium text-muted-foreground">lessons</span></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Time Studied</div>
              <div className="text-sm font-bold text-foreground mt-1.5">~{calculateStudiedHours(progress.completedLessons)} hours</div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Last Opened</div>
              <div className="text-sm font-bold text-foreground mt-1.5">{formatDateLong(course.updatedAt || course.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
