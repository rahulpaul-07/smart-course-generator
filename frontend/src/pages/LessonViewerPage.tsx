import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import CertificateProgress from '../components/CertificateProgress';
import LoadingSpinner from '../components/LoadingSpinner';
import ReadingProgress from '../components/ReadingProgress';
import AIChatPanel from '../components/lesson/AIChatPanel';
import LessonGenerator from '../components/lesson/LessonGenerator';
import LessonCompletion from '../components/lesson/LessonCompletion';
import LessonAudioPlayer from '../components/lesson/LessonAudioPlayer';
import HinglishAudioExplanation from '../components/lesson/HinglishAudioExplanation';
import LessonRenderer from '../components/lesson/LessonRenderer';
import LessonSidebar from '../components/lesson/LessonSidebar';
import StudyTools from '../components/lesson/StudyTools';
import VideoBlock from '../components/blocks/VideoBlock';
import api, { baseURL } from '../utils/api';

const API_BASE = baseURL;

export default function LessonViewerPage() {
  const { id: lessonId, courseId } = useParams();
  const navigate = useNavigate();
  const lessonScrollRef = useRef(null);

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
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

    // Clear existing content so blocks stream in fresh
    setLesson((prev) => prev ? { ...prev, content: [] } : prev);

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
        if (typeof errMsg === 'object') {
          errMsg = errMsg.message || JSON.stringify(errMsg);
        }
        throw new Error(errMsg);
      }

      const reader = response.body.getReader();
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
        // Keep the last partial line in the buffer
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
                setLesson((prev) => {
                  if (!prev) return prev;
                  return { ...prev, content: [...(prev.content || []), data] };
                });
              } else if (currentEvent === 'videos') {
                setLesson((prev) => {
                  if (!prev) return prev;
                  return { ...prev, videos: data };
                });
              } else if (currentEvent === 'done') {
                setStreamStage('Saving lesson');
                updateCurrentLesson(data);
                streamFinished = true;
              } else if (currentEvent === 'error') {
                let errMsg = data.error || 'Generation failed';
                if (typeof errMsg === 'object') {
                  errMsg = errMsg.message || JSON.stringify(errMsg);
                }
                throw new Error(errMsg);
              }
            } catch (parseErr) {
              if (parseErr.message && !parseErr.message.includes('JSON')) {
                throw parseErr;
              }
              // Ignore JSON parse errors from partial data
            }
            currentEvent = '';
          }
        }
      }

      if (!streamFinished) {
        streamInterrupted = true;
      }

      if (streamInterrupted) {
        throw new Error('STREAM_INTERRUPTED');
      }

      if (count > 0) {
        setStreamStatus('success');
      } else {
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
    } catch (error) {
      toast.error(error.response?.data?.error || 'Could not add videos');
    } finally {
      setAddingVideos(false);
    }
  }

  function updateCurrentLesson(updatedLesson) {
    setLesson(updatedLesson);
    setCourse((currentCourse) => {
      if (!currentCourse) return currentCourse;

      return {
        ...currentCourse,
        modules: currentCourse.modules.map((moduleDoc) => ({
          ...moduleDoc,
          lessons: moduleDoc.lessons.map((item) => (
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
    <div className={`flex overflow-hidden ${isFocusMode ? 'fixed inset-0 z-50 bg-background h-screen' : 'h-[calc(100vh-4.5rem)]'}`}>
      <ReadingProgress containerRef={lessonScrollRef} />

      {course && !isFocusMode && (
        <LessonSidebar
          course={course}
          currentLessonId={lessonId}
          onBack={() => navigate(`/course/${courseId}`)}
          onSelectLesson={(id) => navigate(`/course/${courseId}/lesson/${id}`)}
        />
      )}

      <div ref={lessonScrollRef} className="flex-1 overflow-y-auto">
        <div data-reading-content className="mx-auto max-w-5xl px-4 py-8 lg:px-12 lg:py-10">
          <div className="mb-7 flex flex-wrap items-center gap-2 text-xs text-slate-500 animate-enter">
            <button onClick={() => navigate('/')} className="hover:text-white transition-colors">
              Home
            </button>
            <ChevronRight className="w-3 h-3" />
            {course && (
              <>
                <button
                  onClick={() => navigate(`/course/${courseId}`)}
                  className="hover:text-white transition-colors truncate max-w-[150px]"
                >
                  {course.title}
                </button>
                <ChevronRight className="w-3 h-3" />
              </>
            )}
            <span className="text-slate-300 truncate max-w-[200px]">{lesson.title}</span>
          </div>

          <header className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-card/50 p-6 shadow-xl backdrop-blur sm:p-10">
            <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
            <div className="relative">
              <button 
                onClick={() => setIsFocusMode(!isFocusMode)}
                className={`flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-4 transition-colors px-3 py-1.5 rounded-lg border ${isFocusMode ? 'text-primary border-primary/50 bg-primary/10' : 'text-muted-foreground border-border hover:bg-muted/50'}`}
              >
                <BookOpen className="h-4 w-4" /> Focus Mode {isFocusMode ? 'ON' : 'OFF'}
              </button>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                {lesson.title}
              </h1>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                  {lesson.language || 'English'}
                </span>
                {lesson.completedAt && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-500">
                    Lesson Complete
                  </span>
                )}
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-cyan-500" />
                  AI-powered lesson
                </span>
              </div>
            </div>
          </header>


          {course && (
            <div className="mb-8 animate-enter-delay">
              <CertificateProgress
                course={course}
                onContinue={(nextId) => navigate(`/course/${courseId}/lesson/${nextId}`)}
                onViewCertificate={() => navigate(`/course/${courseId}/certificate`)}
                onTakeTest={() => navigate(`/course/${courseId}/test`)}
              />
            </div>
          )}

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
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Resume / Reconnect
                </button>
                <button 
                  onClick={generateLesson}
                  className="bg-muted text-foreground border border-border px-6 py-2 rounded-lg font-medium hover:bg-muted/80 transition-all"
                >
                  Regenerate Lesson
                </button>
              </div>
            </div>
          )}

          {streamStatus === 'error' && (
            <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl my-6 flex flex-col items-center justify-center text-center">
              <h3 className="text-xl font-bold text-destructive mb-2">Generation Failed</h3>
              <p className="text-muted-foreground mb-6">{streamError}</p>
              <button 
                onClick={generateLesson}
                className="bg-destructive text-destructive-foreground px-6 py-2 rounded-lg font-medium hover:bg-destructive/90 transition-all"
              >
                Try Again
              </button>
            </div>
          )}

          <LessonRenderer content={lesson.content} isStreaming={generating} />

          {lesson.videos && lesson.videos.length > 0 && (
            <div className="mt-12 pt-8 border-t border-border/50 animate-enter">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                🎥 Recommended Videos
              </h2>
              <div className="space-y-6">
                {lesson.videos.map((video: any, idx: number) => (
                  <VideoBlock key={idx} block={{ type: 'video', url: video.url, title: video.title }} />
                ))}
              </div>
            </div>
          )}

          {!hasContent && !generating && streamStatus !== 'error' && (
            <div className="flex flex-col items-center justify-center py-20 text-center glass-card rounded-2xl border-dashed border-2 border-slate-700/50 mt-8">
              <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Content Yet</h3>
              <p className="text-sm text-slate-400 max-w-sm">Use the generator above to bring this lesson to life.</p>
            </div>
          )}

          {hasContent && !generating && (
            <StudyTools
              key={lessonId}
              lesson={lesson}
              addingVideos={addingVideos}
              chatOpen={showChat}
              onAddVideos={addVideos}
              onLessonUpdate={updateCurrentLesson}
              onToggleChat={() => setShowChat((visible) => !visible)}
            />
          )}

          {hasContent && !generating && (
            <LessonAudioPlayer key={`audio-${lessonId}`} lesson={lesson} />
          )}
          {hasContent && !generating && (
            <HinglishAudioExplanation 
              key={`hinglish-${lessonId}`}
              lessonText={lesson.content?.filter(b => b.type === 'paragraph' || b.type === 'heading')?.map(b => b.text || b.code || '')?.join('\n') || ''} 
            />
          )}

          {hasContent && !generating && course && (
            <LessonCompletion
              course={course}
              courseId={courseId}
              lesson={lesson}
              onLessonUpdate={updateCurrentLesson}
            />
          )}
        </div>
      </div>

      <AIChatPanel 
        lessonId={lessonId} 
        courseId={courseId}
        lessonTitle={lesson?.title} 
        isOpen={showChat} 
        onClose={() => setShowChat(false)} 
      />
    </div>
  );
}
