import { useEffect, useRef, useState, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, BookOpen, ChevronRight, Sparkles, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import CertificateProgress from '../components/CertificateProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import ReadingProgress from '../components/ReadingProgress';
const AIChatPanel = lazy(() => import('../components/lesson/AIChatPanel'));
import LessonGenerator from '../components/lesson/LessonGenerator';
import LessonCompletion from '../components/lesson/LessonCompletion';
import LessonAudioPlayer from '../components/lesson/LessonAudioPlayer';
import HinglishAudioExplanation from '../components/lesson/HinglishAudioExplanation';
const LessonRenderer = lazy(() => import('../components/lesson/LessonRenderer'));
import LessonSidebar from '../components/lesson/LessonSidebar';
const StudyTools = lazy(() => import('../components/lesson/StudyTools'));
import VideoBlock from '../components/blocks/VideoBlock';
import api, { baseURL } from '../utils/api';

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
      document.body.classList.add('focus-mode-active');
    } else {
      document.body.classList.remove('focus-mode-active');
    }
    return () => document.body.classList.remove('focus-mode-active');
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
    lessonScrollRef.current?.scrollTo({ top: 0 });

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
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner text="Loading lesson..." />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="px-4 lg:px-8 py-12 text-center">
        <p className="text-slate-400 text-lg">Lesson not found in this course.</p>
        <button onClick={() => navigate(`/course/${courseId}`)} className="btn-secondary mt-4">
          <ArrowLeft className="w-4 h-4" />
          Back to course
        </button>
      </div>
    );
  }

  const hasContent = lesson.content?.length > 0;

  return (
    <div className={`grid overflow-hidden ${isFocusMode ? 'fixed inset-0 z-50 bg-background h-screen block' : 'h-[calc(100vh-4.5rem)] lg:grid-cols-[280px_1fr_320px]'}`}>
      <ReadingProgress containerRef={lessonScrollRef} />

      {course && !isFocusMode && (
        <div className="hidden lg:block border-r border-border/40 bg-card/30 backdrop-blur-xl">
          <LessonSidebar
            course={course}
            currentLessonId={lessonId}
            onBack={() => navigate(`/course/${courseId}`)}
            onSelectLesson={(id) => navigate(`/course/${courseId}/lesson/${id}`)}
          />
        </div>
      )}

      {/* Main Content Column */}
      <div ref={lessonScrollRef} className="flex-1 overflow-y-auto bg-background/95 scroll-smooth relative">
        <div className="sticky top-0 z-20 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground truncate max-w-md">
            <button onClick={() => navigate('/')} className="hover:text-primary transition-colors">Home</button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => navigate(`/course/${courseId}`)} className="hover:text-primary transition-colors truncate">{course?.title}</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-foreground truncate">{lesson.title}</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> ~5m read</span>
            <button 
              onClick={() => setIsFocusMode(!isFocusMode)}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${isFocusMode ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground'}`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Focus
            </button>
          </div>
        </div>

        <article data-reading-content className="mx-auto max-w-[800px] px-5 py-12 lg:px-12 lg:py-16">
          <header className="mb-12">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6 font-serif">
              {lesson.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary uppercase tracking-widest">
                {lesson.language || 'English'}
              </span>
              {lesson.completedAt && (
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 uppercase tracking-widest">
                  Completed
                </span>
              )}
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                <Sparkles className="h-3.5 w-3.5 text-cyan-500" /> AI Generated
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
            <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl my-6 flex items-center justify-center gap-3 text-emerald-500 animate-enter">
              <Sparkles className="w-5 h-5" />
              <span className="font-medium">Lesson generated successfully!</span>
            </div>
          )}

          {streamStatus === 'interrupted' && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-xl my-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-bold text-amber-500 mb-2">Connection Lost</h3>
              <p className="text-muted-foreground mb-6">The AI stream was disconnected. The backend may have finished saving the lesson.</p>
              <div className="flex gap-4">
                <button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-primary/20 transition-all">Resume / Reconnect</button>
                <button onClick={generateLesson} className="bg-muted text-foreground border border-border px-6 py-2 rounded-lg font-medium hover:bg-muted/80 transition-all">Regenerate Lesson</button>
              </div>
            </div>
          )}

          {streamStatus === 'error' && (
            <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl my-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-bold text-destructive mb-2">Generation Failed</h3>
              <p className="text-muted-foreground mb-6">{streamError}</p>
              <button onClick={generateLesson} className="bg-destructive text-destructive-foreground px-6 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-all">Try Again</button>
            </div>
          )}

          <Suspense fallback={<div className="py-20 flex justify-center"><LoadingSpinner text="Loading content..." /></div>}>
            <div className="prose prose-lg prose-invert max-w-none 
              prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight
              prose-p:leading-relaxed prose-p:text-foreground/90 
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-blockquote:border-l-4 prose-blockquote:border-primary/50 prose-blockquote:bg-muted/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:italic
              prose-pre:bg-[#1E1E1E] prose-pre:border prose-pre:border-border/50 prose-pre:shadow-xl prose-pre:rounded-xl
              prose-img:rounded-2xl prose-img:shadow-2xl prose-img:my-10
              marker:text-primary">
              <LessonRenderer content={lesson.content} isStreaming={generating} />
            </div>
          </Suspense>

          {lesson.videos && lesson.videos.length > 0 && (
            <div className="mt-16 pt-10 border-t border-border/40 animate-enter">
              <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-3 font-serif">
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
            <div className="flex flex-col items-center justify-center py-24 text-center rounded-3xl border border-dashed border-border bg-card/20 backdrop-blur-sm mt-12">
              <div className="h-20 w-20 bg-muted/50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <BookOpen className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-serif">Ready to Learn?</h3>
              <p className="text-base text-muted-foreground max-w-md">Generate this lesson to get personalized, AI-crafted educational content.</p>
            </div>
          )}

          {hasContent && !generating && course && (
            <div className="mt-16 pt-10 border-t border-border/40">
              <LessonCompletion course={course} courseId={courseId} lesson={lesson} onLessonUpdate={updateCurrentLesson} />
            </div>
          )}
        </article>
      </div>

      {/* Right Sidebar Study Tools */}
      {!isFocusMode && (
        <div className="hidden lg:block border-l border-border/40 bg-card/10 backdrop-blur-3xl overflow-y-auto">
          {hasContent && !generating ? (
            <Suspense fallback={<div className="p-8 text-center"><LoadingSpinner text="Loading tools..." /></div>}>
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
            <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-50">
              <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium">Generate lesson to unlock study tools.</p>
            </div>
          )}
        </div>
      )}

      {/* Mobile Study Tools Slide-over / Bottom Nav logic would normally go here for full mobile optimization */}
      {!isFocusMode && hasContent && !generating && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-t border-border/50 p-4 max-h-[50vh] overflow-y-auto shadow-2xl">
          <Suspense fallback={<LoadingSpinner />}>
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
