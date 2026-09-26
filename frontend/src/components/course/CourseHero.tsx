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
      className="w-full rounded-xl border border-border bg-card mb-12"
    >
      <div className="p-8 flex flex-col items-start gap-6">
        {/* 1. Title */}
        <h1 className="text-3xl font-bold tracking-tight text-foreground max-w-3xl">
          {course.title}
        </h1>
        
        {/* 2. Description */}
        {course.description && (
          <p className="text-sm text-muted-foreground leading-6 max-w-3xl">{course.description}</p>
        )}
        
        {/* 3. Progress */}
        <div className="w-full max-w-md pt-2">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-semibold text-foreground">Course Progress</span>
            <span className="text-sm font-semibold text-primary">{progress.percentage}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-200 ease-out ${progress.percentage === 100 ? 'bg-success' : 'bg-primary'}`} 
              style={{ width: `${progress.percentage}%` }} 
            />
          </div>
        </div>
        
        {/* 4. Primary CTA & Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <Button 
            className="h-10 px-6" 
            onClick={() => nextLessonId && navigate(`/course/${courseId}/lesson/${nextLessonId}`)}
          >
            {progress.percentage === 0 ? 'Start Course' : progress.percentage === 100 ? 'Review Course' : 'Continue Learning'}
            <PlayCircle className="ml-2 h-4 w-4" />
          </Button>
          
          {progress.percentage === 100 && (
            <Button 
              variant="outline" 
              className="h-10 px-6" 
              onClick={() => navigate(`/course/${courseId}/certificate`)}
            >
              <Award className="mr-2 h-4 w-4 text-success" />
              View Certificate
            </Button>
          )}
          <ShareCourseButton
            course={course}
            onUpdate={(updated: Course) => setCourse({ ...course, ...updated, modules: course.modules })}
          />
        </div>

        {/* 5. Metadata */}
        <div className="flex flex-wrap items-center gap-3 pt-6 mt-2 border-t border-border w-full max-w-3xl">
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
