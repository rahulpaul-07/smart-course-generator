import { ArrowRight, Award, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { courseProgress, nextIncompleteLesson } from '../../utils/courseProgress';

export default function LessonCompletion({ course, courseId, lesson, onLessonUpdate }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const progress = courseProgress(course);
  const nextLesson = nextIncompleteLesson(course);
  const certificateUnlocked = progress.totalLessons > 0 && progress.remainingLessons === 0;

  async function setCompleted(completed) {
    setSaving(true);

    try {
      const { data } = await api.patch(`/courses/lessons/${lesson._id}/progress`, { completed });
      onLessonUpdate(data);

      const unlocksCertificate = completed
        && !lesson.completedAt
        && progress.remainingLessons === 1;
      toast.success(unlocksCertificate ? 'Certificate unlocked!' : completed ? 'Lesson completed' : 'Lesson marked incomplete');
    } catch {
      toast.error('Could not update lesson completion');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={`relative mt-10 overflow-hidden rounded-2xl border p-6 shadow-xl shadow-black/10 ${
      lesson.completedAt
        ? 'border-emerald-500/30 bg-gradient-to-br from-emerald-500/15 to-slate-950/60'
        : 'border-brand-500/25 bg-gradient-to-br from-brand-500/12 to-slate-950/60'
    }`}
    >
      <div className={`pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl ${lesson.completedAt ? 'bg-emerald-400/15' : 'bg-brand-500/15'}`} />
      <div className="flex items-start gap-3">
        {lesson.completedAt
          ? <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-400" />
          : <Circle className="mt-0.5 h-6 w-6 text-brand-400" />}
        <div>
          <h2 className="relative font-display text-xl font-bold text-foreground">
            {lesson.completedAt ? 'Lesson complete' : 'Finished this lesson?'}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {lesson.completedAt
              ? certificateUnlocked
                ? 'You completed the whole course. Your certificate is ready.'
                : `${progress.remainingLessons} more ${progress.remainingLessons === 1 ? 'lesson' : 'lessons'} until your certificate.`
              : 'Mark it complete so it counts toward your course certificate.'}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {!lesson.completedAt && (
          <button type="button" onClick={() => setCompleted(true)} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Complete lesson
          </button>
        )}
        {lesson.completedAt && certificateUnlocked && (
          <button
            type="button"
            onClick={() => navigate(`/course/${courseId}/certificate`)}
            className="btn-primary"
          >
            <Award className="h-4 w-4" />
            View certificate
          </button>
        )}
        {lesson.completedAt && !certificateUnlocked && nextLesson && (
          <button
            type="button"
            onClick={() => navigate(`/course/${courseId}/lesson/${nextLesson._id}`)}
            className="btn-primary"
          >
            Next incomplete lesson
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        {lesson.completedAt && (
          <button type="button" onClick={() => setCompleted(false)} disabled={saving} className="btn-secondary">
            Mark incomplete
          </button>
        )}
      </div>
    </section>
  );
}
