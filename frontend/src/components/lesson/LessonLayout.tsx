import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import LessonSidebar from './LessonSidebar';
import ReadingProgressBar from './ReadingProgressBar';
const StudyTools = React.lazy(() => import('./StudyTools'));
const AIChatPanel = React.lazy(() => import('./AIChatPanel'));

interface LessonLayoutProps {
  isFocusMode: boolean;
  course: any;
  courseId: string | undefined;
  lessonId: string | undefined;
  lessonTitle: string;
  lessonContent: any;
  hasContent: boolean;
  generating: boolean;
  addingVideos: boolean;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
  lessonScrollRef: React.RefObject<HTMLDivElement>;
  addVideos: () => void;
  updateCurrentLesson: (lesson: any) => void;
  onNavigateBack: () => void;
  onSelectLesson: (id: string) => void;
  children: React.ReactNode;
}

export function LessonLayout({
  isFocusMode,
  course,
  courseId,
  lessonId,
  lessonTitle,
  lessonContent,
  hasContent,
  generating,
  addingVideos,
  showChat,
  setShowChat,
  lessonScrollRef,
  addVideos,
  updateCurrentLesson,
  onNavigateBack,
  onSelectLesson,
  children
}: LessonLayoutProps) {
  return (
    <div className={`grid overflow-hidden relative bg-background transition-all duration-300 ease-out ${isFocusMode ? 'fixed inset-0 z-50 h-screen w-screen block' : 'h-[calc(100vh-4.5rem)] lg:grid-cols-[auto_1fr_auto]'}`}>
      <ReadingProgressBar containerRef={lessonScrollRef as any} />

      {/* Left Sidebar (Course Navigation & TOC) */}
      <AnimatePresence>
        {!isFocusMode && course && (
          <motion.div 
            initial={{ opacity: 0, width: 0, x: -50 }}
            animate={{ opacity: 1, width: 'auto', x: 0 }}
            exit={{ opacity: 0, width: 0, x: -50 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden lg:block h-full"
          >
            <LessonSidebar
              course={course}
              currentLessonId={lessonId!}
              lessonContent={lessonContent}
              onBack={onNavigateBack}
              onSelectLesson={onSelectLesson}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Reading Area */}
      <div 
        ref={lessonScrollRef} 
        className={`flex-1 overflow-y-auto scroll-smooth relative bg-background ${isFocusMode ? 'px-4 sm:px-8' : ''}`}
      >
        {children}
      </div>

      {/* Right Sidebar (Study Tools) */}
      <AnimatePresence>
        {!isFocusMode && (
          <motion.div 
            initial={{ opacity: 0, width: 0, x: 50 }}
            animate={{ opacity: 1, width: 'auto', x: 0 }}
            exit={{ opacity: 0, width: 0, x: 50 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden lg:block h-full border-l border-border/40 bg-card/20 backdrop-blur-3xl overflow-y-auto min-w-[340px]"
          >
            {hasContent && !generating ? (
              <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner text="Loading study tools..." /></div>}>
                <StudyTools 
                  lesson={{ title: lessonTitle, content: lessonContent, ...course?.modules?.flatMap((m: any) => m.lessons)?.find((l: any) => l._id === lessonId) }} 
                  addingVideos={addingVideos} 
                  chatOpen={showChat} 
                  onAddVideos={addVideos} 
                  onLessonUpdate={updateCurrentLesson} 
                  onToggleChat={() => setShowChat((v) => !v)} 
                />
              </Suspense>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <Sparkles className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Study Tools</h3>
                <p className="text-sm font-medium text-muted-foreground">Generate the lesson first to unlock interactive study tools like flashcards and quizzes.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Study Tools Slide-over */}
      {!isFocusMode && hasContent && !generating && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-2xl border-t border-border/50 p-4 max-h-[60vh] overflow-y-auto shadow-[0_-8px_30px_rgb(0,0,0,0.12)]">
          <Suspense fallback={<div className="p-4 flex justify-center"><LoadingSpinner /></div>}>
            <StudyTools 
              lesson={{ title: lessonTitle, content: lessonContent, ...course?.modules?.flatMap((m: any) => m.lessons)?.find((l: any) => l._id === lessonId) }} 
              addingVideos={addingVideos} 
              chatOpen={showChat} 
              onAddVideos={addVideos} 
              onLessonUpdate={updateCurrentLesson} 
              onToggleChat={() => setShowChat((v) => !v)} 
            />
          </Suspense>
        </div>
      )}

      <Suspense fallback={null}>
        <AIChatPanel lessonId={lessonId} courseId={courseId} lessonTitle={lessonTitle} isOpen={showChat} onClose={() => setShowChat(false)} />
      </Suspense>
    </div>
  );
}
