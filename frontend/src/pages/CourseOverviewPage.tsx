import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import CertificateProgress from '../components/CertificateProgress';

import { useCourseProgress } from '../hooks/useCourseProgress';
import { CourseHero } from '../components/course/CourseHero';
import { CurriculumTimeline } from '../components/course/CurriculumTimeline';
import { CourseSidebar } from '../components/course/CourseSidebar';

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
    setCourse
  } = useCourseProgress(id);

  if (loading) {
    return (
      <PageContainer className="pt-8 pb-24 max-w-6xl mx-auto space-y-8">
        <Skeleton className="w-40 h-10 rounded-lg mb-4" />
        <Skeleton className="w-full h-[400px] rounded-2xl" />
        <div className="grid md:grid-cols-[1fr_320px] gap-8 mt-12">
          <div className="space-y-6">
            <Skeleton className="w-64 h-10 rounded-lg" />
            <Skeleton className="w-full h-24 rounded-2xl" />
            <Skeleton className="w-full h-[500px] rounded-[24px]" />
          </div>
          <div className="space-y-6">
            <Skeleton className="w-full h-[300px] rounded-[24px]" />
          </div>
        </div>
      </PageContainer>
    );
  }
  
  if (!course) return (
    <PageContainer>
      <div className="py-24 text-center flex flex-col items-center max-w-md mx-auto">
        <div className="h-20 w-20 bg-muted border border-border/30 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <BookOpen className="h-10 w-10 text-muted-foreground/60" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-3">Course not found</h2>
        <p className="text-muted-foreground font-medium mb-8 leading-relaxed">The course you are looking for does not exist or was deleted. Please check your library.</p>
        <Button size="lg" className="rounded-xl shadow-sm" onClick={() => navigate('/courses')}>Return to Library</Button>
      </div>
    </PageContainer>
  );

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary pb-24">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 right-0 h-[600px] overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[100%] rounded-full bg-primary/5 blur-[120px] mix-blend-screen opacity-70" />
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[100%] rounded-full bg-blue-500/5 blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background" />
      </div>

      <PageContainer className="relative z-10 pt-6 max-w-7xl mx-auto">
        <Button
          variant="ghost" 
          onClick={() => navigate('/courses')} 
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 -ml-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>

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
