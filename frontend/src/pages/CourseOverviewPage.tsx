import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Bookmark, CheckCircle2, Circle, Layers3, Sparkles, 
  PlayCircle, BookOpen, Clock, Calendar, ChevronDown, ChevronUp, 
  Award, FileText, Code2, Shield, Brain, Lock, Target
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CertificateProgress from '../components/CertificateProgress';
import ShareCourseButton from '../components/ShareCourseButton';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import api from '../utils/api';
import { courseProgress } from '../utils/courseProgress';
import React from 'react';

// Expandable Module Card Component
const ModuleCard = ({ moduleDoc, moduleIndex, courseId }: { moduleDoc: any, moduleIndex: number, courseId: string }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(moduleIndex === 0);
  
  const totalLessons = moduleDoc.lessons?.length || 0;
  const completedLessons = moduleDoc.lessons?.filter((l: any) => l.completedAt)?.length || 0;
  const progress = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
  const isCompleted = progress === 100;

  // Determine current lesson index (first uncompleted lesson)
  const currentLessonIndex = moduleDoc.lessons?.findIndex((l: any) => !l.completedAt);
  const activeLessonIdx = currentLessonIndex === -1 ? totalLessons - 1 : currentLessonIndex;

  return (
    <Card className="overflow-hidden border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-primary/30 transition-all duration-300">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left focus-visible:outline-none focus-visible:bg-muted/50"
      >
        <div className="flex items-center gap-4">
          <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border shadow-inner ${isCompleted ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
            {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : String(moduleIndex + 1).padStart(2, '0')}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Module {moduleIndex + 1}</span>
            </div>
            <h3 className="font-extrabold text-lg text-foreground line-clamp-1">{moduleDoc.title}</h3>
          </div>
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="hidden sm:block text-right">
            <div className="text-sm font-bold text-foreground">{completedLessons} / {totalLessons} Lessons</div>
            <div className="text-xs font-medium text-muted-foreground">{progress}% Complete</div>
          </div>
          
          <div className="flex-1 sm:hidden">
            <div className="h-1.5 w-full bg-muted/60 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
            </div>
          </div>
          
          <div className="shrink-0 h-8 w-8 rounded-full bg-background/80 border border-border/50 flex items-center justify-center text-muted-foreground shadow-sm">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="px-5 sm:px-6 pb-6 pt-2">
              <div className="relative pl-4 border-l-2 border-border/60 ml-4 space-y-6 py-2">
                {moduleDoc.lessons?.map((lesson: any, lessonIndex: number) => {
                  const isLessonCompleted = !!lesson.completedAt;
                  const isCurrent = lessonIndex === activeLessonIdx;
                  const isLocked = lessonIndex > activeLessonIdx;

                  let nodeColor = 'bg-muted-foreground border-background';
                  let textColor = 'text-muted-foreground';
                  let icon = <Lock className="h-3 w-3" />;
                  
                  if (isLessonCompleted) {
                    nodeColor = 'bg-emerald-500 border-background';
                    textColor = 'text-foreground';
                    icon = <CheckCircle2 className="h-3.5 w-3.5 text-white" />;
                  } else if (isCurrent) {
                    nodeColor = 'bg-primary border-primary/30 ring-4 ring-primary/10';
                    textColor = 'text-foreground font-semibold';
                    icon = <PlayCircle className="h-3 w-3 text-white fill-white/20" />;
                  }

                  return (
                    <button
                      key={lesson._id}
                      disabled={isLocked}
                      onClick={() => navigate(`/course/${courseId}/lesson/${lesson._id}`)}
                      className={`relative w-full flex items-start sm:items-center gap-4 text-left group/lesson focus-visible:outline-none ${isLocked ? 'cursor-not-allowed opacity-60' : 'hover:-translate-y-0.5 transition-transform'}`}
                    >
                      <div className={`absolute -left-[27px] sm:-left-[27px] top-1 sm:top-1/2 sm:-translate-y-1/2 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors shadow-sm ${nodeColor}`}>
                        {icon}
                      </div>
                      
                      <Card className={`flex-1 p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm border transition-colors ${isCurrent ? 'bg-card border-primary/30 shadow-primary/5' : 'bg-card/40 border-border/40 hover:bg-card/80 hover:border-border/60'}`}>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className={`text-sm truncate ${textColor} ${!isLocked && 'group-hover/lesson:text-primary transition-colors'}`}>
                            {lessonIndex + 1}. {lesson.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 opacity-70">
                            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> ~15m
                            </span>
                          </div>
                        </div>

                        {!isLocked && (
                          <div className="flex items-center gap-3 shrink-0">
                            {lesson.bookmarked && <Bookmark className="h-4 w-4 text-primary fill-primary/20" />}
                            {lesson.quizBestScore > 0 && (
                              <span className="text-[10px] font-bold text-foreground bg-foreground/10 px-2 py-0.5 rounded-full border border-border/50">
                                {lesson.quizBestScore}/5 Score
                              </span>
                            )}
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center border shadow-sm transition-colors ${isLessonCompleted ? 'bg-background border-border/50 text-emerald-500' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                              <PlayCircle className="h-4 w-4" />
                            </div>
                          </div>
                        )}
                      </Card>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

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
      <PageContainer className="pt-8 pb-24 max-w-6xl mx-auto space-y-8">
        <Skeleton className="w-40 h-10 rounded-lg mb-4" />
        <Skeleton className="w-full h-[400px] rounded-[32px]" />
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
        <div className="h-20 w-20 bg-muted border border-border/50 rounded-3xl flex items-center justify-center mb-6 shadow-sm">
          <BookOpen className="h-10 w-10 text-muted-foreground/60" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight mb-3">Course not found</h2>
        <p className="text-muted-foreground font-medium mb-8 leading-relaxed">The course you are looking for does not exist or was deleted. Please check your library.</p>
        <Button size="lg" className="rounded-xl shadow-sm" onClick={() => navigate('/courses')}>Return to Library</Button>
      </div>
    </PageContainer>
  );

  const progress = courseProgress(course);
  
  // Calculate mock duration
  const totalLessons = progress.totalLessons || 0;
  const estimatedHours = Math.max(1, Math.round((totalLessons * 15) / 60)); // Assuming 15 mins per lesson
  
  const difficulty = course.difficulty || 'Intermediate';

  // Mock skills for premium feel
  const skills = [
    { name: course.title.split(' ')[0] || 'Fundamentals', icon: Code2 },
    { name: 'System Design', icon: Layers3 },
    { name: 'Best Practices', icon: Shield },
    { name: 'Problem Solving', icon: Brain },
    { name: 'Architecture', icon: BookOpen }
  ].slice(0, Math.max(3, Math.min(5, Math.ceil(totalLessons / 3))));

  // Find the first uncompleted lesson globally
  let nextLessonId = null;
  for (const mod of (course.modules || [])) {
    const uncompleted = mod.lessons?.find((l: any) => !l.completedAt);
    if (uncompleted) {
      nextLessonId = uncompleted._id;
      break;
    }
  }
  if (!nextLessonId && course.modules?.[0]?.lessons?.[0]) {
    nextLessonId = course.modules[0].lessons[0]._id; // Fallback to first lesson
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
        <Button
          variant="ghost" 
          onClick={() => navigate('/courses')} 
          className="flex items-center gap-2 text-sm font-bold text-muted-foreground hover:text-foreground mb-6 -ml-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Library
        </Button>

        {/* 1. Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="relative w-full rounded-[32px] border border-border/40 bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
            <div className="flex-1 max-w-3xl space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-primary shadow-sm border border-border/50">
                  <Sparkles className="h-3.5 w-3.5" /> AI Generated
                </span>
                <span className="inline-flex items-center rounded-md bg-background/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-foreground shadow-sm border border-border/50">
                  {difficulty}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-md bg-background/80 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground shadow-sm border border-border/50">
                  <Clock className="h-3.5 w-3.5" /> ~{estimatedHours} hours
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] drop-shadow-sm">
                {course.title}
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground font-medium leading-relaxed max-w-2xl">
                {course.description || `A comprehensive AI-generated learning experience covering the fundamentals and advanced concepts of ${course.title}.`}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="h-12 px-8 rounded-xl text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98]" 
                  onClick={() => nextLessonId && navigate(`/course/${id}/lesson/${nextLessonId}`)}
                >
                  {progress.percentage === 0 ? 'Start Course' : progress.percentage === 100 ? 'Review Course' : 'Continue Learning'}
                  <PlayCircle className="ml-2 h-5 w-5" />
                </Button>
                
                {progress.percentage === 100 && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="h-12 px-6 rounded-xl text-sm font-bold border border-border/50 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] hover:-translate-y-0.5" 
                    onClick={() => navigate(`/course/${id}/certificate`)}
                  >
                    <Award className="mr-2 h-4 w-4 text-emerald-500" />
                    View Certificate
                  </Button>
                )}
                <ShareCourseButton course={course} onUpdate={setCourse} />
              </div>
            </div>

            {/* Hero Progress Widget */}
            <div className="w-full lg:w-[320px] shrink-0 bg-background/60 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-bold text-foreground">Course Progress</span>
                  <span className="text-xl font-extrabold text-primary">{progress.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${progress.percentage === 100 ? 'bg-emerald-500' : 'bg-primary'}`} 
                    style={{ width: `${progress.percentage}%` }} 
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Completed</div>
                  <div className="text-lg font-bold text-foreground">{progress.completedLessons} <span className="text-sm font-medium text-muted-foreground">/ {progress.totalLessons}</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Remaining</div>
                  <div className="text-lg font-bold text-foreground">{progress.totalLessons - progress.completedLessons} <span className="text-sm font-medium text-muted-foreground">lessons</span></div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Time Studied</div>
                  <div className="text-sm font-bold text-foreground mt-1.5">~{Math.round(progress.completedLessons * 15 / 60 * 10) / 10} hours</div>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">Last Opened</div>
                  <div className="text-sm font-bold text-foreground mt-1.5">{new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8 lg:gap-12 items-start">
          
          <div className="space-y-12">
            {/* 3. Modules Timeline */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
                  <Layers3 className="h-6 w-6 text-primary" /> Curriculum
                </h2>
              </div>
              <div className="space-y-4">
                {course.modules?.map((moduleDoc: any, moduleIndex: number) => (
                  <ModuleCard key={moduleDoc._id} moduleDoc={moduleDoc} moduleIndex={moduleIndex} courseId={id || ''} />
                ))}
              </div>
            </motion.section>

            {/* Standard Certificate Component Integration (Kept functional but visually segmented) */}
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

          <div className="space-y-8 sticky top-24">
            {/* 4. Skills You'll Learn */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.2 }}
            >
              <Card className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" /> Skills You'll Learn
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <div key={i} className="inline-flex items-center gap-2 bg-background/80 border border-border/50 rounded-lg px-3 py-2 shadow-sm transition-colors hover:border-primary/30">
                      <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center text-primary">
                        <skill.icon className="h-3.5 w-3.5" />
                      </div>
                      <span className="text-sm font-semibold text-foreground">{skill.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.section>

            {/* 5. Course Metadata */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.25 }}
            >
              <Card className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" /> Course Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4" /> Difficulty
                    </span>
                    <span className="text-sm font-bold text-foreground">{difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" /> Estimated Time
                    </span>
                    <span className="text-sm font-bold text-foreground">~{estimatedHours} hours</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Language
                    </span>
                    <span className="text-sm font-bold text-foreground">English</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Generated On
                    </span>
                    <span className="text-sm font-bold text-foreground">{new Date(course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-border/40">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Last Updated
                    </span>
                    <span className="text-sm font-bold text-foreground">{new Date(course.updatedAt || course.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Brain className="h-4 w-4" /> AI Model
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-wider bg-foreground/10 px-2 py-0.5 rounded text-foreground">
                      Gemini Pro
                    </span>
                  </div>
                </div>
              </Card>
            </motion.section>
            
            {/* 6. Continue Learning Quick CTA */}
            {progress.percentage < 100 && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                <Button 
                  size="lg" 
                  className="w-full h-12 rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base" 
                  onClick={() => nextLessonId && navigate(`/course/${id}/lesson/${nextLessonId}`)}
                >
                  {progress.percentage === 0 ? 'Start Learning' : 'Continue Learning'}
                  <PlayCircle className="ml-2 h-5 w-5" />
                </Button>
              </motion.section>
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
