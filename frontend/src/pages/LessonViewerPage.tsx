import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, ChevronRight, Sparkles, Clock, LayoutTemplate, 
  Maximize, Minimize, ChevronLeft, CheckCircle2, Bookmark
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import ReadingProgress from '../components/ReadingProgress';
const AIChatPanel = lazy(() => import('../components/lesson/AIChatPanel'));
import LessonGenerator from '../components/lesson/LessonGenerator';
import LessonCompletion from '../components/lesson/LessonCompletion';
const LessonRenderer = lazy(() => import('../components/lesson/LessonRenderer'));
import LessonSidebar from '../components/lesson/LessonSidebar';
const StudyTools = lazy(() => import('../components/lesson/StudyTools'));
import { Button } from '../components/ui/button';
import VideoBlock from '../components/blocks/VideoBlock';
import api, { baseURL } from '../utils/api';
import React from 'react';

const API_BASE = baseURL;

export default function LessonViewerPage() {
  const { id: lessonId, courseId } = useParams();
  const navigate = useNavigate();
  const lessonScrollRef = useRef<HTMLDivElement>(null);

  const [lesson, setLesson] = useState<any>(null);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showDepthPicker, setShowDepthPicker] = useState(false);
  const [streamStatus, setStreamStatus] = useState<'idle' | 'interrupted' | 'error' | 'success'>('idle');
  const [streamError, setStreamError] = useState('');
  const [streamStage, setStreamStage] = useState('Creating outline');
  const [selectedDepth, setSelectedDepth] = useState('standard');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [addingVideos, setAddingVideos] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [streamedCount, setStreamedCount] = useState(0);
  const [isFocusMode, setIsFocusMode] = useState(false);

  useEffect(() => {
    if (isFocusMode) {
      document.body.classList.add('overflow-hidden'); // Prevent body scroll just in case
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isFocusMode]);

  useEffect(() => {
    let cancelled = false;
    const abortController = new AbortController();

    async function loadLesson() {
      setLoading(true);
      try {
        const { data } = await api.get(`/courses/${courseId}/lessons/${lessonId}`, {
          signal: abortController.signal
        });
        if (cancelled) return;
        setCourse(data.course);
        setLesson(data.lesson);
        setSelectedLanguage(data.lesson.language || 'English');

        api.patch(`/courses/lessons/${lessonId}/progress`, { opened: true }, { signal: abortController.signal })
          .then(({ data: updatedLesson }) => {
            if (!cancelled) updateCurrentLesson(updatedLesson);
          })
          .catch(() => {});
      } catch (error: any) {
        if (!cancelled && error.name !== 'CanceledError' && error.name !== 'AbortError') {
          toast.error('Failed to load lesson');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLesson();
    lessonScrollRef.current?.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [courseId, lessonId]);

  const isGeneratingRef = useRef(false);

  async function generateLesson() {
    if (isGeneratingRef.current) return;
    const jobKey = `lesson_gen_${courseId}_${lessonId}`;
    const activeStr = sessionStorage.getItem('active_generation_job');
    if (activeStr) {
      try {
        const activeJob = JSON.parse(activeStr);
        if (activeJob.key === jobKey && Date.now() - activeJob.timestamp < 120000) {
          toast.success('Generation is continuing in the background. Please wait...');
          return;
        }
      } catch {}
    }

    isGeneratingRef.current = true;
    sessionStorage.setItem('active_generation_job', JSON.stringify({ key: jobKey, timestamp: Date.now() }));
    setGenerating(true);
    setShowDepthPicker(false);
    setStreamedCount(0);
    setStreamStage('Creating outline');
    setStreamStatus('idle');
    setLesson((prev: any) => prev ? { ...prev, content: [] } : prev);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/enrich-stream`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        credentials: 'include',
        body: JSON.stringify({ depth: selectedDepth, language: selectedLanguage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errMsg = errorData.error || 'Failed to start generation';
        if (typeof errMsg === 'object') errMsg = errMsg.message || JSON.stringify(errMsg);
        throw new Error(errMsg);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let count = 0;
      let streamComplete = false;
      let streamFinished = false;
      let streamInterrupted = false;
      let currentEvent = '';

      while (!streamComplete) {
        let done, value;
        try {
          const result = await reader.read();
          done = result.done;
          value = result.value;
        } catch (readErr) {
          done = true;
          streamInterrupted = true;
        }

        if (done) {
          streamComplete = true;
          continue;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6);
            try {
              const data = JSON.parse(jsonStr);
              if (currentEvent === 'block') {
                count++;
                setStreamedCount(count);
                if (count === 1) setStreamStage('Writing section');
                else if (count === 3) setStreamStage('Generating code examples');
                else if (count === 6) setStreamStage('Finalizing lesson');
                setLesson((prev: any) => prev ? { ...prev, content: [...(prev.content || []), data] } : prev);
              } else if (currentEvent === 'videos') {
                setLesson((prev: any) => prev ? { ...prev, videos: data } : prev);
              } else if (currentEvent === 'done') {
                setStreamStage('Saving lesson');
                updateCurrentLesson(data);
                streamFinished = true;
              } else if (currentEvent === 'error') {
                let errMsg = data.error || 'Generation failed';
                if (typeof errMsg === 'object') errMsg = errMsg.message || JSON.stringify(errMsg);
                throw new Error(errMsg);
              }
            } catch (parseErr: any) {
              if (parseErr.message && !parseErr.message.includes('JSON')) throw parseErr;
            }
            currentEvent = '';
          }
        }
      }

      if (!streamFinished) streamInterrupted = true;
      if (streamInterrupted) throw new Error('STREAM_INTERRUPTED');
      if (count > 0) setStreamStatus('success');
      else {
        toast.error('No content was generated. Please try again.');
        setStreamStatus('error');
      }
    } catch (error: any) {
      if (error.message === 'STREAM_INTERRUPTED') {
        setStreamStatus('interrupted');
        return;
      }
      setStreamStatus('error');
      setStreamError(error.message || 'Failed to generate content');
    } finally {
      sessionStorage.removeItem('active_generation_job');
      isGeneratingRef.current = false;
      setGenerating(false);
      setStreamedCount(0);
    }
  }

  async function addVideos() {
    setAddingVideos(true);
    try {
      const { data } = await api.post(`/courses/${courseId}/lessons/${lessonId}/add-videos`);
      updateCurrentLesson(data.lesson);
      toast.success(`${data.videos.length} videos added`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Could not add videos');
    } finally {
      setAddingVideos(false);
    }
  }

  function updateCurrentLesson(updatedLesson: any) {
    setLesson(updatedLesson);
    setCourse((currentCourse: any) => {
      if (!currentCourse) return currentCourse;
      return {
        ...currentCourse,
        modules: currentCourse.modules.map((moduleDoc: any) => ({
          ...moduleDoc,
          lessons: moduleDoc.lessons.map((item: any) => (
            item._id === updatedLesson._id ? updatedLesson : item
          )),
        })),
      };
    });
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <LoadingSpinner text="Loading lesson workspace..." />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="px-4 lg:px-8 py-24 flex flex-col items-center justify-center text-center">
        <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3">Lesson not found</h2>
        <p className="text-muted-foreground text-lg max-w-md">The lesson you are looking for does not exist in this course.</p>
        <Button variant="secondary" onClick={() => navigate(`/course/${courseId}`)} className="mt-8 gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Course Overview
        </Button>
      </div>
    );
  }

  const hasContent = lesson.content?.length > 0;
  
  // Navigation helpers
  const allLessons = course?.modules?.flatMap((m: any) => m.lessons) || [];
  const currentLessonIndex = allLessons.findIndex((l: any) => l._id === lessonId);
  const prevLesson = currentLessonIndex > 0 ? allLessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex < allLessons.length - 1 ? allLessons[currentLessonIndex + 1] : null;

  return (
    <div className={`grid overflow-hidden relative bg-background transition-all duration-300 ease-out ${isFocusMode ? 'fixed inset-0 z-50 h-screen w-screen block' : 'h-[calc(100vh-4.5rem)] lg:grid-cols-[auto_1fr_auto]'}`}>
      <ReadingProgress containerRef={lessonScrollRef} />

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
              lessonContent={lesson.content}
              onBack={() => navigate(`/course/${courseId}`)}
              onSelectLesson={(id) => navigate(`/course/${courseId}/lesson/${id}`)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Center Reading Area */}
      <div 
        ref={lessonScrollRef} 
        className={`flex-1 overflow-y-auto scroll-smooth relative bg-background ${isFocusMode ? 'px-4 sm:px-8' : ''}`}
      >
        {/* Premium Sticky Header */}
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
              <div className="hidden sm:flex items-center gap-1 border border-border/50 rounded-xl p-1 bg-muted/20">
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
              
              {!isFocusMode && (
                <button 
                  onClick={() => setIsFocusMode(true)}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs transition-colors border border-primary/20"
                >
                  <Maximize className="w-3.5 h-3.5" />
                  Focus
                </button>
              )}
            </div>
          </div>
        </div>

        <article data-reading-content className={`mx-auto w-full transition-all duration-300 px-5 py-12 lg:py-16 ${isFocusMode ? 'max-w-[900px]' : 'max-w-[820px] lg:px-12'}`}>
          <header className="mb-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.15] mb-8 font-serif drop-shadow-sm">
              {lesson.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 border-b border-border/40 pb-8">
              {lesson.completedAt && (
                <span className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold text-emerald-500 uppercase tracking-widest shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-lg bg-primary/10 border border-primary/20 px-3 py-1.5 text-xs font-bold text-primary uppercase tracking-widest shadow-sm">
                <LayoutTemplate className="w-3.5 h-3.5" /> {lesson.language || 'English'}
              </span>
              <span className="flex items-center gap-1.5 rounded-lg bg-muted border border-border px-3 py-1.5 text-xs font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-cyan-500" /> AI Generated
              </span>
            </div>
          </header>

          <LessonGenerator
            hasContent={hasContent}
            isGenerating={generating}
            isPickerOpen={showDepthPicker}
            language={selectedLanguage}
            onGenerate={generateLesson}
            onLanguageChange={setSelectedLanguage}
            onPickerChange={setShowDepthPicker}
            onDepthChange={setSelectedDepth}
            selectedDepth={selectedDepth}
            streamedCount={streamedCount}
            streamStage={streamStage}
          />

          {streamStatus === 'success' && !generating && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl my-8 flex items-center justify-center gap-3 text-emerald-500 shadow-sm backdrop-blur-sm">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold">Lesson generated successfully!</span>
            </div>
          )}

          {streamStatus === 'interrupted' && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-8 rounded-2xl my-8 flex flex-col items-center justify-center text-center shadow-sm backdrop-blur-sm">
              <h3 className="text-xl font-bold text-amber-500 mb-2">Connection Lost</h3>
              <p className="text-muted-foreground font-medium mb-6">The AI stream was disconnected. The backend may have finished saving the lesson.</p>
              <div className="flex gap-4">
                <button onClick={() => window.location.reload()} className="bg-background border border-border/50 text-foreground px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md transition-all">Reload Page</button>
                <button onClick={generateLesson} className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold shadow-sm hover:shadow-md hover:bg-primary/90 transition-all">Regenerate Lesson</button>
              </div>
            </div>
          )}

          {streamStatus === 'error' && (
            <div className="bg-destructive/10 border border-destructive/20 p-8 rounded-2xl my-8 flex flex-col items-center justify-center text-center shadow-sm backdrop-blur-sm">
              <h3 className="text-xl font-bold text-destructive mb-2">Generation Failed</h3>
              <p className="text-muted-foreground font-medium mb-6">{streamError}</p>
              <button onClick={generateLesson} className="bg-destructive text-destructive-foreground px-6 py-2.5 rounded-xl font-bold shadow-sm hover:bg-destructive/90 transition-all">Try Again</button>
            </div>
          )}

          <Suspense fallback={<div className="py-32 flex flex-col items-center justify-center gap-4"><LoadingSpinner text="Rendering premium content..." /></div>}>
            <div className="mt-8">
              <LessonRenderer content={lesson.content} isStreaming={generating} />
            </div>
          </Suspense>

          {lesson.videos && lesson.videos.length > 0 && (
            <div className="mt-20 pt-12 border-t border-border/40">
              <h2 className="text-3xl font-bold text-foreground mb-8 flex items-center gap-3 font-serif">
                Recommended Videos
              </h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {lesson.videos.map((video: any, idx: number) => (
                  <VideoBlock key={idx} block={{ type: 'video', url: video.url, title: video.title }} />
                ))}
              </div>
            </div>
          )}

          {!hasContent && !generating && streamStatus !== 'error' && (
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border-2 border-dashed border-border/60 bg-card/10 backdrop-blur-sm mt-12 shadow-sm">
              <div className="h-24 w-24 bg-muted border border-border/50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                <BookOpen className="h-10 w-10 text-muted-foreground/60" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-serif">Ready to Learn?</h3>
              <p className="text-base font-medium text-muted-foreground max-w-sm">Generate this lesson to get a beautifully formatted, personalized AI-crafted educational content.</p>
            </div>
          )}

          {hasContent && !generating && course && (
            <div className="mt-20 pt-12 border-t border-border/40">
              <LessonCompletion course={course} courseId={courseId} lesson={lesson} onLessonUpdate={updateCurrentLesson} />
            </div>
          )}
        </article>
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
                  lesson={lesson} 
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
              lesson={lesson} 
              addingVideos={addingVideos} 
              chatOpen={showChat} 
              onAddVideos={addVideos} 
              onLessonUpdate={updateCurrentLesson} 
              onToggleChat={() => setShowChat((v) => !v)} 
            />
          </Suspense>
        </div>
      )}

      <AIChatPanel lessonId={lessonId} courseId={courseId} lessonTitle={lesson?.title} isOpen={showChat} onClose={() => setShowChat(false)} />
    </div>
  );
}
