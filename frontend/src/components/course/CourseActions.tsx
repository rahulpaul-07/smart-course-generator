import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { courseProgress } from '../../utils/courseProgress';

interface CourseActionsProps {
  progress: ReturnType<typeof courseProgress>;
  nextLessonId: string | null;
  courseId: string | undefined;
}

export function CourseActions({ progress, nextLessonId, courseId }: CourseActionsProps) {
  const navigate = useNavigate();

  if (progress.percentage >= 100) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: 0.3 }}
    >
      <Button 
        variant="outline"
        className="w-full h-10 rounded-lg shadow-sm border border-border/30 hover:bg-muted/50 hover:-translate-y-0.5 transition-all duration-200 font-semibold text-sm" 
        onClick={() => nextLessonId && navigate(`/course/${courseId}/lesson/${nextLessonId}`)}
      >
        {progress.percentage === 0 ? 'Start Learning' : 'Continue Learning'}
        <PlayCircle className="ml-2 h-4 w-4" />
      </Button>
    </motion.section>
  );
}
