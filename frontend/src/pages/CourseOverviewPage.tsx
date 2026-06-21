import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Bookmark, CheckCircle2, Circle, Layers3, Sparkles, PlayCircle, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateProgress from '../components/CertificateProgress';
import ShareCourseButton from '../components/ShareCourseButton';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import api from '../utils/api';
import { courseProgress } from '../utils/courseProgress';

export default function CourseOverviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api.get(`/courses/${id}`)
      .then(({ data }) => {
        if (active) setCourse(data);
      })
      .catch(() => toast.error('Failed to load course'))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <PageContainer>
        <Skeleton className="w-32 h-10 mb-6" />
        <Skeleton className="w-full h-64 rounded-2xl mb-8" />
        <Skeleton className="w-full h-40 rounded-xl mb-10" />
        <div className="space-y-6">
          <Skeleton className="w-64 h-8" />
          <Skeleton className="w-full h-32 rounded-xl" />
          <Skeleton className="w-full h-32 rounded-xl" />
        </div>
      </PageContainer>
    );
  }
  
  if (!course) return (
    <PageContainer>
      <div className="py-20 text-center flex flex-col items-center">
        <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Course not found</h2>
        <p className="text-muted-foreground mt-2 mb-6">The course you are looking for does not exist or was deleted.</p>
        <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
      </div>
    </PageContainer>
  );

  const progress = courseProgress(course);

  return (
    <PageContainer>
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-6 -ml-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <Card className="relative overflow-hidden mb-8 border-none bg-gradient-to-br from-card to-muted/30 shadow-xl">
        <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        <CardContent className="p-8 md:p-10">
          <Badge variant="secondary" className="mb-6 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Personalized Learning Path
          </Badge>
          
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-foreground max-w-4xl leading-tight mb-4">
            {course.title}
          </h1>
          
          {course.description && (
            <p className="text-lg text-muted-foreground max-w-3xl leading-relaxed mb-8">
              {course.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-3">
            <ShareCourseButton course={course} onUpdate={setCourse} />
            <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium">
              {course.modules?.length || 0} Modules
            </Badge>
            <Badge variant="outline" className="px-3 py-1.5 text-sm font-medium">
              {progress.totalLessons} Lessons
            </Badge>
            <Badge variant="default" className="px-3 py-1.5 text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
              {progress.percentage}% Complete
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="mb-12">
        <CertificateProgress
          course={course}
          onContinue={(lessonId) => navigate(`/course/${id}/lesson/${lessonId}`)}
          onViewCertificate={() => navigate(`/course/${id}/certificate`)}
          onTakeTest={() => navigate(`/course/${id}/test`)}
        />
      </div>

      <div className="max-w-4xl">
        <SectionHeader 
          title="Course Curriculum" 
          description="Your step-by-step path to mastery." 
        />
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-7 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
          {course.modules?.map((moduleDoc: any, moduleIndex: number) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              key={moduleDoc._id} 
              className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
            >
              <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-background bg-muted text-muted-foreground shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                <span className="font-bold text-sm">{String(moduleIndex + 1).padStart(2, '0')}</span>
              </div>
              
              <Card className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] hover:border-primary/50 transition-colors shadow-sm">
                <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between gap-4 space-y-0">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">Module {moduleIndex + 1}</p>
                    <h3 className="font-bold text-foreground line-clamp-1">{moduleDoc.title}</h3>
                  </div>
                  <Badge variant="secondary" className="shrink-0 hidden sm:flex">
                    <Layers3 className="mr-1.5 h-3.5 w-3.5" />
                    {moduleDoc.lessons?.length || 0}
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    {moduleDoc.lessons?.map((lesson: any, lessonIndex: number) => (
                      <button
                        key={lesson._id}
                        onClick={() => navigate(`/course/${id}/lesson/${lesson._id}`)}
                        className="w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50 group/lesson"
                      >
                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border ${
                          lesson.completedAt 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                            : 'bg-background border-border text-muted-foreground'
                        }`}>
                          {lesson.completedAt ? <CheckCircle2 className="h-4 w-4" /> : lessonIndex + 1}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate transition-colors ${lesson.completedAt ? 'text-muted-foreground' : 'text-foreground group-hover/lesson:text-primary'}`}>
                            {lesson.title}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {lesson.bookmarked && <Bookmark className="h-4 w-4 text-primary fill-primary/20" />}
                          {lesson.quizBestScore > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {lesson.quizBestScore}/5
                            </Badge>
                          )}
                          <PlayCircle className={`h-5 w-5 transition-transform group-hover/lesson:scale-110 ${
                            lesson.completedAt ? 'text-muted-foreground/50' : 'text-primary/70 group-hover/lesson:text-primary'
                          }`} />
                        </div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
