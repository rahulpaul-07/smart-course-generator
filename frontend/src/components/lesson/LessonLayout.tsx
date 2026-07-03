import React, { Suspense, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, X } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import LessonSidebar from './LessonSidebar';
import ReadingProgressBar from './ReadingProgressBar';
import type { Lesson, LessonContentBlock, PopulatedCourse } from '../../types';
const StudyTools = React.lazy(() => import('./StudyTools'));
const AIChatPanel = React.lazy(() => import('./AIChatPanel'));

interface LessonLayoutProps {
  isFocusMode: boolean;
  course: PopulatedCourse | null;
  courseId: string | undefined;
  lessonId: string | undefined;
  lesson: Lesson | null;
  lessonTitle: string;
  lessonContent: LessonContentBlock[];
  hasContent: boolean;
  generating: boolean;
  addingVideos: boolean;
  showChat: boolean;
  setShowChat: React.Dispatch<React.SetStateAction<boolean>>;
  lessonScrollRef: React.RefObject<HTMLDivElement | null>;
  addVideos: () => void;
  updateCurrentLesson: (lesson: Lesson) => void;
  onNavigateBack: () => void;
  onSelectLesson: (id: string) => void;
  children: React.ReactNode;
}

export function LessonLayout({
  isFocusMode,
  course,
  courseId,
  lessonId,
  lesson,
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
  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);

  return (
    <div className={`grid overflow-hidden relative bg-background transition-all duration-300 ease-out ${isFocusMode ? 'fixed inset-0 z-50 h-screen w-screen block' : 'h-[calc(100vh-4.5rem)] lg:grid-cols-[auto_1fr_auto]'}`}>
      <ReadingProgressBar containerRef={lessonScrollRef as React.RefObject<HTMLElement>} />

      {/* Left Sidebar (Course Navigation & TOC) */}
      <AnimatePresence>
        {!isFocusMode && course && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
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
        {!isFocusMode && hasContent && !generating && lesson && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="hidden lg:block h-full border-l border-border/30 bg-card overflow-y-auto w-[340px] xl:w-[380px] shrink-0"
          >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner text="Loading study tools..." /></div>}>
              <StudyTools
                lesson={lesson}
                courseId={courseId!}
                addingVideos={addingVideos}
                chatOpen={showChat}
                onAddVideos={addVideos}
                onLessonUpdate={updateCurrentLesson}
                onToggleChat={() => setShowChat((v) => !v)}
              />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Study Tools Slide-over */}
      {!isFocusMode && hasContent && !generating && lesson && (
        <AnimatePresence>
          {mobileToolsOpen ? (
            <motion.div
              key="mobile-study-tools-panel"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 z-40 max-h-[75vh] rounded-t-2xl border-t border-border/30 bg-background shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setMobileToolsOpen(false)}
                aria-label="Close study tools"
                className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-card text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="max-h-[75vh] overflow-y-auto">
                <Suspense fallback={<div className="p-4 flex justify-center"><LoadingSpinner /></div>}>
                  <StudyTools
                    lesson={lesson}
                    courseId={courseId!}
                    addingVideos={addingVideos}
                    chatOpen={showChat}
                    onAddVideos={addVideos}
                    onLessonUpdate={updateCurrentLesson}
                    onToggleChat={() => setShowChat((v) => !v)}
                  />
                </Suspense>
              </div>
            </motion.div>
          ) : (
            <motion.button
              key="mobile-study-tools-fab"
              type="button"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20, stiffness: 250 }}
              onClick={() => setMobileToolsOpen(true)}
              aria-label="Open study tools"
              className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
            >
              <Wrench className="h-4 w-4" />
              Study Tools
            </motion.button>
          )}
        </AnimatePresence>
      )}

      <Suspense fallback={null}>
        <AIChatPanel lessonId={lessonId!} courseId={courseId!} lessonTitle={lessonTitle} isOpen={showChat} onClose={() => setShowChat(false)} />
      </Suspense>
    </div>
  );
}
