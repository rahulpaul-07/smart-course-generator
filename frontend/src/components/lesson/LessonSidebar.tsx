import { ArrowLeft, Bookmark, CheckCircle2 } from 'lucide-react';

export default function LessonSidebar({ course, currentLessonId, onBack, onSelectLesson }) {
  return (
    <aside className="hidden h-full w-72 flex-shrink-0 overflow-y-auto border-r border-border bg-card/75 backdrop-blur-xl lg:block">
      <header className="sticky top-0 z-10 border-b border-border bg-card/90 p-4 backdrop-blur-xl">
        <button onClick={onBack} className="mb-3 flex items-center gap-2 text-xs text-muted-foreground transition hover:text-primary">
          <ArrowLeft className="h-3 w-3" />
          Back to course
        </button>
        <h2 className="truncate font-display text-sm font-bold text-foreground">{course.title}</h2>
      </header>

      {course.modules?.map((moduleDoc, moduleIndex) => (
        <section key={moduleDoc._id} className="border-b border-border py-4">
          <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {moduleIndex + 1}. {moduleDoc.title}
          </h3>
          {moduleDoc.lessons?.map((lesson) => (
            <button
              key={lesson._id}
              onClick={() => onSelectLesson(lesson._id)}
              className={`relative mt-1 w-full px-4 py-2.5 text-left text-xs transition ${
                lesson._id === currentLessonId
                  ? 'bg-primary/10 text-primary font-medium before:absolute before:inset-y-1 before:left-0 before:w-1 before:rounded-r-full before:bg-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-2">
                {lesson.completedAt && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                {lesson.bookmarked && <Bookmark className="h-3 w-3 text-primary" />}
                <span className="line-clamp-2">{lesson.title}</span>
              </span>
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
