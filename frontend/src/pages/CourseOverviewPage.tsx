import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import CertificateProgress from '../components/CertificateProgress';

import { useCourseProgress } from '../hooks/useCourseProgress';
import { CourseHero } from '../components/course/CourseHero';
import { CurriculumTimeline } from '../components/course/CurriculumTimeline';
import { CourseSidebar } from '../components/course/CourseSidebar';
import { CourseOverviewSkeleton } from '../components/course/CourseOverviewSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export default function CourseOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    course,
    loading,
    progress,
    estimatedHours,
    difficulty,
    skills,
    nextLessonId,
    setCourse,
    error,
    refetch
  } = useCourseProgress(id);

  if (loading) {
    return <CourseOverviewSkeleton />;
  }
  
  if (error) {
    return (
      <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary pb-24">
        <PageContainer className="relative z-10 pt-6 max-w-7xl mx-auto">
          <BackButton to="/courses" label="Back to Library" className="mb-6 -ml-2" />
          <ErrorState
            title="Unable to load course"
            description="We couldn't load this course. Please try again."
            onRetry={refetch}
          />
        </PageContainer>
      </div>
    );
  }

  if (!course || !course.modules || course.modules.length === 0) {
    return (
      <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary pb-24">
        <PageContainer className="relative z-10 pt-6 max-w-7xl mx-auto">
          <BackButton to="/courses" label="Back to Library" className="mb-6 -ml-2" />
          <EmptyState
            title="Course not found"
            description="This course has no content or does not exist."
            action={
              <Button size="lg" className="rounded-xl shadow-sm" onClick={() => navigate('/courses')}>
                Return to Library
              </Button>
            }
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary pb-24">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[100%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen opacity-70" />
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[100%] rounded-full bg-blue-500/5 blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <PageContainer className="relative z-10 pt-6 max-w-7xl mx-auto">
        <BackButton to="/courses" label="Back to Library" className="mb-2 -ml-2" />
        <Breadcrumb
          items={[{ label: 'My Courses', to: '/courses' }, { label: course.title }]}
          className="mb-6"
        />

        <CourseHero
          course={course}
          courseId={id}
          difficulty={difficulty}
          estimatedHours={estimatedHours}
          progress={progress}
          nextLessonId={nextLessonId}
          setCourse={setCourse}
        />

        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
          <div className="space-y-10">
            <CurriculumTimeline course={course} courseId={id} />

            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.15 }}
            >
              <CertificateProgress
                course={course}
                onContinue={(lessonId) => navigate(`/course/${id}/lesson/${lessonId}`)}
                onViewCertificate={() => navigate(`/course/${id}/certificate`)}
                onTakeTest={() => navigate(`/course/${id}/test`)}
              />
            </motion.section>
          </div>

          <CourseSidebar 
            skills={skills}
            difficulty={difficulty}
            estimatedHours={estimatedHours}
            course={course}
            progress={progress}
            nextLessonId={nextLessonId}
            courseId={id}
          />
        </div>
      </PageContainer>
    </div>
  );
}
