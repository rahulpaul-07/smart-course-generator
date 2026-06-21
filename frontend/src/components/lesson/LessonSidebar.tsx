import { ArrowLeft, Bookmark, CheckCircle2 } from 'lucide-react';

export default function LessonSidebar({ course, currentLessonId, onBack, onSelectLesson }) {
  return (
    <aside className="hidden h-full w-72 flex-shrink-0 overflow-y-auto border-r border-white/[0.07] bg-[#070916]/75 backdrop-blur-xl lg:block">
      <header className="sticky top-0 z-10 border-b border-white/[0.07] bg-[#070916]/90 p-4 backdrop-blur-xl">
        <button onClick={onBack} className="mb-3 flex items-center gap-2 text-xs text-slate-500 transition hover:text-brand-200">
          <ArrowLeft className="h-3 w-3" />
          Back to course
        </button>
        <h2 className="truncate font-display text-sm font-bold text-white">{course.title}</h2>
      </header>

      {course.modules?.map((moduleDoc, moduleIndex) => (
        <section key={moduleDoc._id} className="border-b border-white/[0.055] py-4">
          <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">
            {moduleIndex + 1}. {moduleDoc.title}
          </h3>
          {moduleDoc.lessons?.map((lesson) => (
            <button
              key={lesson._id}
              onClick={() => onSelectLesson(lesson._id)}
              className={`relative mt-1 w-full px-4 py-2.5 text-left text-xs transition ${
                lesson._id === currentLessonId
                  ? 'bg-gradient-to-r from-brand-500/15 to-transparent text-white before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-brand-400'
                  : 'text-slate-500 hover:bg-white/[0.025] hover:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2">
                {lesson.completedAt && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                {lesson.bookmarked && <Bookmark className="h-3 w-3 text-brand-400" />}
                <span className="line-clamp-2">{lesson.title}</span>
              </span>
            </button>
          ))}
        </section>
      ))}
    </aside>
  );
}
