import { BookOpen, ChevronRight, Globe2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import LessonAudioPlayer from '../components/lesson/LessonAudioPlayer';
import LessonRenderer from '../components/lesson/LessonRenderer';
import api from '../utils/api';

export default function SharedCoursePage() {
  const { shareId } = useParams();
  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/public/courses/${shareId}`)
      .then(({ data }) => {
        setCourse(data);

        for (const moduleDoc of data.modules || []) {
          const lesson = moduleDoc.lessons?.find((item) => item.isEnriched);
          if (lesson) {
            setSelectedLesson(lesson);
            break;
          }
        }
      })
      .catch(() => setCourse(null))
      .finally(() => setLoading(false));
  }, [shareId]);

  if (loading) return <LoadingSpinner text="Loading shared course..." />;
  if (!course) {
    return (
      <div className="page-shell max-w-xl py-24 text-center animate-enter">
        <div className="surface-card rounded-3xl p-10 shadow-lg border border-border/50">
          <BookOpen className="mx-auto h-9 w-9 text-brand-300" />
          <h1 className="mt-5 font-display text-2xl font-bold text-foreground">Course unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">This course is private or the shared link is no longer active.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 px-4 py-4 backdrop-blur-2xl lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-lg shadow-brand-500/20">
              <BookOpen className="h-4 w-4 text-white" />
            </span>
            <div>
              <p className="font-display text-sm font-bold text-foreground">Course<span className="text-brand-300">AI</span></p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Shared learning path</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full border border-cyan-400/15 bg-cyan-400/[0.07] px-3 py-1.5 text-xs text-cyan-200">
            <Globe2 className="h-3.5 w-3.5" />
            Read only
          </span>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[21rem_1fr] lg:px-8 lg:py-10">
        <aside className="surface-card rounded-3xl border border-border/50 h-fit p-5 animate-enter lg:sticky lg:top-28 shadow-sm">
          <p className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Explore course</p>
          <h1 className="gradient-text mt-4 font-display text-2xl font-extrabold leading-tight">{course.title}</h1>
          {course.description && <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{course.description}</p>}

          <div className="mt-8 space-y-5">
            {course.modules?.map((moduleDoc: any, moduleIndex: number) => (
              <section key={moduleDoc._id}>
                <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  {moduleIndex + 1}. {moduleDoc.title}
                </h2>
                <div className="mt-2 space-y-1">
                  {moduleDoc.lessons?.map((lesson: any) => (
                    <button
                      key={lesson._id}
                      type="button"
                      disabled={!lesson.isEnriched}
                      onClick={() => setSelectedLesson(lesson)}
                      className={`group flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                        lesson._id === (selectedLesson as any)?._id
                          ? 'border-brand-400/25 bg-brand-500/10 text-foreground font-medium shadow-sm'
                          : 'border-transparent text-muted-foreground hover:border-border hover:bg-foreground/10 hover:text-foreground/90 disabled:opacity-40'
                      }`}
                    >
                      <ChevronRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
                      {lesson.title}
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section className="surface-card rounded-3xl border border-border/50 min-w-0 p-6 shadow-sm animate-enter-delay lg:p-10 xl:p-12">
          {selectedLesson ? (
            <>
              <p className="eyebrow">Current lesson</p>
              <h2 className="gradient-text mb-10 mt-3 font-display text-3xl font-extrabold">{selectedLesson.title}</h2>
              <LessonAudioPlayer
                key={`audio-${selectedLesson._id}`}
                lesson={selectedLesson}
              />
              <LessonRenderer content={selectedLesson.content} />
            </>
          ) : (
            <div className="py-20 text-center text-muted-foreground">
              <BookOpen className="mx-auto h-8 w-8" />
              <p className="mt-4">This course does not have a generated lesson yet.</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
