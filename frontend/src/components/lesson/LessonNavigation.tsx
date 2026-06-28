import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LessonNavigationProps {
  courseId: string | undefined;
  prevLesson: any;
  nextLesson: any;
}

export function LessonNavigation({ courseId, prevLesson, nextLesson }: LessonNavigationProps) {
  const navigate = useNavigate();

  return (
    <div className="hidden sm:flex items-center gap-1 border border-border/30 rounded-xl p-1 bg-muted/20">
      <button 
        onClick={() => prevLesson && navigate(`/course/${courseId}/lesson/${prevLesson._id}`)}
        disabled={!prevLesson}
        className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Previous Lesson"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="w-px h-4 bg-border/50" />
      <button 
        onClick={() => nextLesson && navigate(`/course/${courseId}/lesson/${nextLesson._id}`)}
        disabled={!nextLesson}
        className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
        aria-label="Next Lesson"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
