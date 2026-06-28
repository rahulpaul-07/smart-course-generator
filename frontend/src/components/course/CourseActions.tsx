import React from 'react';
import { motion } from 'framer-motion';
import { PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface CourseActionsProps {
  progress: any;
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
        size="lg" 
        className="w-full h-12 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base" 
        onClick={() => nextLessonId && navigate(`/course/${courseId}/lesson/${nextLessonId}`)}
      >
        {progress.percentage === 0 ? 'Start Learning' : 'Continue Learning'}
        <PlayCircle className="ml-2 h-5 w-5" />
      </Button>
    </motion.section>
  );
}
