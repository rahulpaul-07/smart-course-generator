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
import api from '../utils/api';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

export default function LessonViewerPage() {
  const { id: lessonId, courseId } = useParams();
  const navigate = useNavigate();
  const lessonScrollRef = useRef(null);

  const [lesson, setLesson] = useState(null);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showDepthPicker, setShowDepthPicker] = useState(false);
  const [selectedDepth, setSelectedDepth] = useState('standard');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [addingVideos, setAddingVideos] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [streamedCount, setStreamedCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadLesson() {
      setLoading(true);

      try {
        const { data } = await api.get(`/courses/${courseId}/lessons/${lessonId}`);
        if (cancelled) return;

        setCourse(data.course);
        setLesson(data.lesson);
        setSelectedLanguage(data.lesson.language || 'English');

        api.patch(`/courses/lessons/${lessonId}/progress`, { opened: true })
          .then(({ data: updatedLesson }) => {
            if (!cancelled) updateCurrentLesson(updatedLesson);
          })
          .catch(() => {});
      } catch {
        if (!cancelled) toast.error('Failed to load lesson');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadLesson();
    lessonScrollRef.current?.scrollTo({ top: 0 });

    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  async function generateLesson() {
    setGenerating(true);
    setShowDepthPicker(false);
    setStreamedCount(0);

    // Clear existing content so blocks stream in fresh
    setLesson((prev) => prev ? { ...prev, content: [] } : prev);

    try {
      const response = await fetch(`${API_BASE}/courses/${courseId}/lessons/${lessonId}/enrich-stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ depth: selectedDepth, language: selectedLanguage }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start generation');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let count = 0;
      let streamComplete = false;

      while (!streamComplete) {
        const { done, value } = await reader.read();
        if (done) {
          streamComplete = true;
          continue;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        // Keep the last partial line in the buffer
        buffer = lines.pop() || '';

        let currentEvent = '';
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
                setLesson((prev) => {
                  if (!prev) return prev;
                  return { ...prev, content: [...(prev.content || []), data] };
                });
              } else if (currentEvent === 'done') {
                // Final saved lesson from the server
                updateCurrentLesson(data);
              } else if (currentEvent === 'error') {
                throw new Error(data.error || 'Generation failed');
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

      if (count > 0) {
        toast.success('Lesson content generated');
      } else {
        toast.error('No content was generated. Please try again.');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setGenerating(false);
      setStreamedCount(0);
    }
  }

  async function addVideos() {
    setAddingVideos(true);

    try {
      const { data } = await api.post(`/courses/lessons/${lessonId}/add-videos`);
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
    <div className="flex h-[calc(100vh-4.5rem)] overflow-hidden">
      <ReadingProgress containerRef={lessonScrollRef} />

      {course && (
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
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                <BookOpen className="h-4 w-4" /> Focus Mode
              </p>
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
          />

          <LessonRenderer content={lesson.content} isStreaming={generating} />

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
        key={lessonId}
        lessonId={lessonId}
        lessonTitle={lesson.title}
        isOpen={showChat}
        onClose={() => setShowChat(false)}
      />
    </div>
  );
}
