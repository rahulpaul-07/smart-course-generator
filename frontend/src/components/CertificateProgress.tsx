import { ArrowRight, Award, Lock } from 'lucide-react';
import { courseProgress, nextIncompleteLesson } from '../utils/courseProgress';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { PopulatedCourse } from '../types';

export default function CertificateProgress({
  course,
  onContinue,
  onViewCertificate,
  onTakeTest,
}: { course: PopulatedCourse | null, onContinue?: (id: string) => void, onViewCertificate?: () => void, onTakeTest?: () => void }) {
  const progress = courseProgress(course);
  const nextLesson = nextIncompleteLesson(course);
  const hasCertificate = !!course?.earnedCertificateId;
  const lessonsCompleted = progress.totalLessons > 0 && progress.remainingLessons === 0;
  const lessonWord = progress.remainingLessons === 1 ? 'lesson' : 'lessons';

  return (
    <Card className={`relative overflow-hidden transition-colors ${
      hasCertificate
        ? 'border-emerald-500/30 bg-emerald-500/5'
        : lessonsCompleted
          ? 'border-violet-500/30 bg-violet-500/5'
          : 'border-primary/25 bg-primary/5'
    }`}>
      <div className={`pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full blur-3xl ${
        hasCertificate ? 'bg-emerald-400/15' : lessonsCompleted ? 'bg-violet-400/15' : 'bg-primary/15'
      }`} />
      
      <CardContent className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex gap-4 flex-1">
            <div className={`shrink-0 h-12 w-12 rounded-xl flex items-center justify-center border ${
              hasCertificate ? 'border-emerald-400/20 bg-emerald-500/15 text-emerald-500' : lessonsCompleted ? 'border-violet-400/20 bg-violet-500/15 text-violet-500' : 'border-primary/20 bg-primary/15 text-primary'
            }`}>
              {hasCertificate ? <Award className="h-6 w-6" /> : lessonsCompleted ? <Award className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Course Certificate
              </p>
              <h2 className="text-lg font-semibold text-foreground">
                {hasCertificate
                  ? 'Your certificate is unlocked!'
                  : lessonsCompleted
                    ? 'Final test is ready'
                    : `${progress.remainingLessons} ${lessonWord} left to unlock`}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground max-w-xl">
                {hasCertificate
                  ? 'You completed every lesson and passed the final test. Your certificate is ready.'
                  : lessonsCompleted
                    ? 'You completed all lessons! Take the final certification test to claim your certificate.'
                    : 'Open each lesson, finish learning, then click Complete lesson. The certificate unlocks at 100% and after passing the test.'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0">
            {hasCertificate && onViewCertificate && (
              <Button onClick={onViewCertificate} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Award className="mr-2 h-4 w-4" />
                View Certificate
              </Button>
            )}
            {lessonsCompleted && !hasCertificate && onTakeTest && (
              <Button onClick={onTakeTest} className="bg-violet-600 hover:bg-violet-700 text-white">
                <Award className="mr-2 h-4 w-4" />
                Take Final Test
              </Button>
            )}
            {!lessonsCompleted && nextLesson && onContinue && (
              <Button variant="secondary" onClick={() => onContinue(nextLesson._id)}>
                Continue Course
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between text-xs font-medium text-muted-foreground mb-2">
          <span>{progress.completedLessons} of {progress.totalLessons} lessons complete</span>
          <span className="text-foreground">{progress.percentage}%</span>
        </div>
        <Progress 
          value={progress.percentage} 
          className={`h-2 ${hasCertificate ? '[&>div]:bg-emerald-500' : lessonsCompleted ? '[&>div]:bg-violet-500' : ''}`} 
        />
      </CardContent>
    </Card>
  );
}
