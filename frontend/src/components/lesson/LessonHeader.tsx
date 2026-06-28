import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Clock, Minimize } from 'lucide-react';
import { LessonNavigation } from './LessonNavigation';
import { LessonActions } from './LessonActions';

interface LessonHeaderProps {
  courseId: string | undefined;
  course: any;
  lesson: any;
  prevLesson: any;
  nextLesson: any;
  isFocusMode: boolean;
  setIsFocusMode: (v: boolean) => void;
}

export function LessonHeader({
  courseId,
  course,
  lesson,
  prevLesson,
  nextLesson,
  isFocusMode,
  setIsFocusMode
}: LessonHeaderProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-20 w-full bg-background/90 backdrop-blur-2xl border-b border-border/50 shadow-sm transition-all">
      <div className={`mx-auto flex items-center justify-between px-6 py-3 min-h-[64px] ${isFocusMode ? 'max-w-[900px]' : ''}`}>
        
        <div className="flex items-center min-w-0 pr-4">
          {isFocusMode && (
            <button 
              onClick={() => setIsFocusMode(false)}
              className="mr-4 flex items-center justify-center w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Exit Focus Mode"
            >
              <Minimize className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-0.5">
              <span className="truncate max-w-[120px] sm:max-w-[200px] hover:text-foreground cursor-pointer transition-colors" onClick={() => navigate(`/course/${courseId}`)}>{course?.title}</span>
              <ChevronRight className="w-3 h-3 shrink-0" />
              <span className="shrink-0 flex items-center gap-1.5 text-primary">
                <Clock className="w-3 h-3" /> ~15m
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-foreground truncate">{lesson.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <LessonNavigation courseId={courseId} prevLesson={prevLesson} nextLesson={nextLesson} />
          <LessonActions isFocusMode={isFocusMode} setIsFocusMode={setIsFocusMode} />
        </div>
      </div>
    </div>
  );
}
