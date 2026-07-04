import { ArrowRight, Award, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { lessonService } from '../../services/lessonService';
import { courseProgress, nextIncompleteLesson } from '../../utils/courseProgress';
import { Button } from '../ui/button';
import type { PopulatedCourse, Lesson } from '../../types';

interface LessonCompletionProps {
  course: PopulatedCourse;
  courseId: string;
  lesson: Lesson;
  onLessonUpdate: (lesson: Lesson) => void;
}

const LessonCompletion = React.memo(({ course, courseId, lesson, onLessonUpdate }: LessonCompletionProps) => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const progress = courseProgress(course);
  const nextLesson = nextIncompleteLesson(course);
  const certificateUnlocked = progress.totalLessons > 0 && progress.remainingLessons === 0;

  async function setCompleted(completed: boolean) {
    setSaving(true);
    const [data] = await lessonService.updateProgress(lesson._id, { completed });
    setSaving(false);
    
    if (data) {
      onLessonUpdate(data);

      const unlocksCertificate = completed
        && !lesson.completedAt
        && progress.remainingLessons === 1;
      toast.success(unlocksCertificate ? 'Certificate unlocked!' : completed ? 'Lesson completed' : 'Lesson marked incomplete');
    }
  }

  return (
    <section className={`relative mt-10 overflow-hidden rounded-2xl border p-6 shadow-md shadow-black/10 ${
      lesson.completedAt
        ? 'border-success/30 bg-gradient-to-br from-success/15 to-background/60'
        : 'border-brand-500/25 bg-gradient-to-br from-brand-500/12 to-background/60'
    }`}
    >
      <div className={`pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full blur-3xl ${lesson.completedAt ? 'bg-success/15' : 'bg-brand-500/15'}`} />
      <div className="flex items-start gap-3">
        {lesson.completedAt
          ? <CheckCircle2 className="mt-0.5 h-6 w-6 text-success" />
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
          <Button type="button" onClick={() => setCompleted(true)} disabled={saving} className={saving ? 'cursor-progress' : ''}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
            Complete lesson
          </Button>
        )}
        {lesson.completedAt && certificateUnlocked && (
          <Button
            type="button"
            onClick={() => navigate(`/course/${courseId}/certificate`)}
          >
            <Award className="h-4 w-4 mr-2" />
            View certificate
          </Button>
        )}
        {lesson.completedAt && !certificateUnlocked && nextLesson && (
          <Button
            type="button"
            onClick={() => navigate(`/course/${courseId}/lesson/${nextLesson._id}`)}
          >
            Next incomplete lesson
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
        {lesson.completedAt && (
          <Button type="button" onClick={() => setCompleted(false)} disabled={saving} variant="secondary" className={saving ? 'cursor-progress' : ''}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Mark incomplete
          </Button>
        )}
      </div>
    </section>
  );
});

export default LessonCompletion;
