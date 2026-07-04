import React, { Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import LessonSidebar from './LessonSidebar';
import ReadingProgressBar from './ReadingProgressBar';
import type { Lesson, LessonContentBlock, PopulatedCourse } from '../../types';
const StudyTools = React.lazy(() => import('./StudyTools'));
const AIChatPanel = React.lazy(() => import('./AIChatPanel'));

export type ActivePanel = 'chat' | 'flashcards' | 'lab' | 'notes' | null;

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
  toolsOpen: boolean;
  onToolsOpenChange: (open: boolean) => void;
  activePanel: ActivePanel;
  onActivePanelChange: (panel: ActivePanel) => void;
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
  toolsOpen,
  onToolsOpenChange,
  activePanel,
  onActivePanelChange,
  lessonScrollRef,
  addVideos,
  updateCurrentLesson,
  onNavigateBack,
  onSelectLesson,
  children
}: LessonLayoutProps) {
  const toolsAvailable = !isFocusMode && hasContent && !generating && !!lesson;
  const closeTools = () => {
    onToolsOpenChange(false);
    onActivePanelChange(null);
  };

  return (
    <div className={`grid overflow-hidden relative bg-background transition-all duration-300 ease-out ${isFocusMode ? 'fixed inset-0 z-50 h-screen w-screen block' : 'h-[calc(100vh-4.5rem)] lg:grid-cols-[auto_1fr]'}`}>
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

      {/* Mobile Study Tools FAB (desktop trigger lives in LessonActions) */}
      {toolsAvailable && !toolsOpen && (
        <motion.button
          key="mobile-study-tools-fab"
          type="button"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 250 }}
          onClick={() => onToolsOpenChange(true)}
          aria-label="Open study tools"
          className="lg:hidden fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20"
        >
          <Wrench className="h-4 w-4" />
          Study Tools
        </motion.button>
      )}

      {/* On-demand Study Tools / AI Tutor drawer (shared by desktop + mobile,
          shown only when explicitly opened rather than as a permanent column) */}
      <AnimatePresence>
        {toolsAvailable && toolsOpen && (
          <motion.div
            key="tools-drawer"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 top-[4.5rem] z-40 flex flex-col rounded-t-2xl border-t border-border/30 bg-background shadow-2xl lg:inset-x-auto lg:right-0 lg:w-[380px] xl:w-[400px] lg:rounded-none lg:border-l lg:border-t-0"
          >
            <Suspense fallback={<div className="flex items-center justify-center h-full"><LoadingSpinner text="Loading study tools..." /></div>}>
              {activePanel === 'chat' ? (
                <AIChatPanel
                  lessonId={lessonId!}
                  courseId={courseId!}
                  lessonTitle={lessonTitle}
                  onBack={() => onActivePanelChange(null)}
                  onClose={closeTools}
                />
              ) : (
                <StudyTools
                  lesson={lesson!}
                  courseId={courseId!}
                  addingVideos={addingVideos}
                  activePanel={activePanel}
                  onActivePanelChange={onActivePanelChange}
                  onAddVideos={addVideos}
                  onLessonUpdate={updateCurrentLesson}
                  onClose={closeTools}
                />
              )}
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
