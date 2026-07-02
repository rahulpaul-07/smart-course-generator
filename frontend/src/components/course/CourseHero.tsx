import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Clock, PlayCircle, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ShareCourseButton from '../../components/ShareCourseButton';
import { courseProgress } from '../../utils/courseProgress';
import type { Course, PopulatedCourse } from '../../types';

interface CourseHeroProps {
  course: PopulatedCourse;
  courseId: string | undefined;
  difficulty: string;
  estimatedHours: number;
  progress: ReturnType<typeof courseProgress>;
  nextLessonId: string | null;
  setCourse: (course: PopulatedCourse) => void;
}

export function CourseHero({ course, courseId, difficulty, estimatedHours, progress, nextLessonId, setCourse }: CourseHeroProps) {
  const navigate = useNavigate();

  return (
    <motion.section 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative w-full rounded-2xl border border-border/30 bg-card/40 backdrop-blur-2xl shadow-md overflow-hidden mb-12"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 p-8 flex flex-col items-start gap-6">
        {/* 1. Title */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground drop-shadow-sm max-w-3xl">
          {course.title}
        </h1>
        
        {/* 2. Description */}
        <p className="text-sm text-muted-foreground leading-6 max-w-3xl">
          {course.description || `A comprehensive AI-generated learning experience covering the fundamentals and advanced concepts of ${course.title}.`}
        </p>
        
        {/* 3. Progress */}
        <div className="w-full max-w-md pt-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-foreground">Course Progress</span>
            <span className="text-sm font-semibold text-primary">{progress.percentage}%</span>
          </div>
          <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-200 ease-out ${progress.percentage === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
              style={{ width: `${progress.percentage}%` }} 
            />
          </div>
        </div>
        
        {/* 4. Primary CTA & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button 
            className="h-10 px-6 rounded-lg text-sm font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:-translate-y-0.5 transition-all duration-200" 
            onClick={() => nextLessonId && navigate(`/course/${courseId}/lesson/${nextLessonId}`)}
          >
            {progress.percentage === 0 ? 'Start Course' : progress.percentage === 100 ? 'Review Course' : 'Continue Learning'}
            <PlayCircle className="ml-2 h-4 w-4" />
          </Button>
          
          {progress.percentage === 100 && (
            <Button 
              variant="outline" 
              className="h-10 px-6 rounded-lg text-sm font-semibold border border-border/30 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 shadow-sm" 
              onClick={() => navigate(`/course/${courseId}/certificate`)}
            >
              <Award className="mr-2 h-4 w-4 text-emerald-500" />
              View Certificate
            </Button>
          )}
          <ShareCourseButton
            course={course}
            onUpdate={(updated: Course) => setCourse({ ...course, ...updated, modules: course.modules })}
          />
        </div>

        {/* 5. Metadata */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-2 border-t border-border/30 w-full max-w-3xl">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> AI Generated
          </span>
          <span className="text-border/40">•</span>
          <span className="inline-flex items-center text-xs text-muted-foreground">
            {difficulty}
          </span>
          <span className="text-border/40">•</span>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock className="h-4 w-4" /> ~{estimatedHours} hours
          </span>
          <span className="text-border/40">•</span>
          <span className="inline-flex items-center text-xs text-muted-foreground">
            {progress.completedLessons} / {progress.totalLessons} lessons completed
          </span>
        </div>
      </div>
    </motion.section>
  );
}
