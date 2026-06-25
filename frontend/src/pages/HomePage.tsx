import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BookOpen, Sparkles, X, PlusCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import CourseCard from '../components/CourseCard';
import LearningSummary from '../components/LearningSummary';
import PromptForm from '../components/PromptForm';
import ActivityFeed from '../components/ActivityFeed';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '../utils/api';

export default function HomePage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const search = searchParams.get('search')?.trim().toLowerCase() || '';

  useEffect(() => {
    api.get('/courses/mine')
      .then(({ data }) => setCourses(data))
      .catch(() => toast.error('Failed to load courses'))
      .finally(() => setLoading(false));
  }, []);

  async function generateCourse(prompt: string) {
    setGenerating(true);

    try {
      const { data } = await api.post('/courses/generate', { prompt });
      toast.success('Course generated successfully!');
      navigate(`/course/${data._id}`);
      return true;
    } catch (error: any) {
      if (error.isDuplicate) return false;
      toast.error(error.response?.data?.error || 'Failed to generate course');
      return false;
    } finally {
      setGenerating(false);
    }
  }

  async function deleteCourse(courseId: string) {
    if (!window.confirm('Delete this course?')) return;

    try {
      await api.delete(`/courses/${courseId}`);
      setCourses((current) => current.filter((course) => course._id !== courseId));
    } catch {
      toast.error('Failed to delete course');
    }
  }

  const visibleCourses = search
    ? courses.filter((course) => (
      course.title?.toLowerCase().includes(search)
      || course.description?.toLowerCase().includes(search)
    ))
    : courses;

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Glowing Background Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <PageContainer className="relative z-10">
        <div className="mb-10 flex flex-col md:flex-row gap-4 md:items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Dashboard</h1>
            <p className="text-muted-foreground mt-2 text-lg">Welcome back. Here's your learning progress.</p>
          </div>
          {search && (
            <Button variant="outline" onClick={() => setSearchParams({})}>
              <X className="mr-2 h-4 w-4" />
              Clear Search
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10"
          >
            <div className="md:col-span-2 lg:col-span-2">
              <Skeleton className="h-64 w-full" />
            </div>
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </motion.div>
        ) : courses.length === 0 && !search ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-10 bg-card/60 backdrop-blur-sm border border-border/50 rounded-3xl p-8 lg:p-12 text-center"
          >
            <div className="h-16 w-16 mx-auto bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Welcome to your Learning Hub! 🎉</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              You're just a few steps away from mastering any topic. Here's how to get started on your personalized learning journey:
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-left">
              <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Generate Course</h3>
                <p className="text-muted-foreground text-sm">Describe what you want to learn below, and our AI will build a personalized curriculum instantly.</p>
              </div>
              <div className="bg-cyan-500/5 p-6 rounded-2xl border border-cyan-500/10">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-cyan-500">2</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Complete Lessons</h3>
                <p className="text-muted-foreground text-sm">Read interactive content, pass quizzes, and build your daily learning streak.</p>
              </div>
              <div className="bg-amber-500/5 p-6 rounded-2xl border border-amber-500/10">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-amber-500">3</span>
                </div>
                <h3 className="font-bold text-lg mb-2 text-foreground">Earn Certificates</h3>
                <p className="text-muted-foreground text-sm">Take the final test to validate your knowledge and earn a verifiable certificate.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <LearningSummary courses={courses} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-[1fr_350px] xl:grid-cols-[1fr_400px] gap-10">
        <div>
          <SectionHeader 
            title={search ? 'Search Results' : 'My Courses'} 
            description={`You have ${visibleCourses.length} active learning journeys.`}
          />
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div className="grid sm:grid-cols-2 gap-6">
                {[1, 2].map((i) => <Skeleton key={i} className="h-72 w-full" />)}
              </motion.div>
            ) : visibleCourses.length ? (
              <motion.div 
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.1 }
                  }
                }}
                className="grid sm:grid-cols-2 gap-6"
              >
                {visibleCourses.map((course, index) => (
                  <motion.div 
                    key={course._id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                  >
                    <CourseCard course={course} onDelete={deleteCourse} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            ) : search ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden flex flex-col items-center justify-center p-14 text-center rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  <div className="h-20 w-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 relative z-10 animate-float">
                    <BookOpen className="h-10 w-10 text-primary" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">No matches found</h3>
                <p className="text-muted-foreground mb-8 max-w-md">
                  We couldn't find any courses matching your search terms. Try using different keywords.
                </p>
                <Button onClick={() => setSearchParams({})} className="btn-secondary">Clear Search</Button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary" />
              Generate New Course
            </h3>
            <PromptForm onSubmit={generateCourse} isLoading={generating} />
          </div>

          <div className="glass-card rounded-2xl p-5 border-border/50">
            <h3 className="text-lg font-display font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-brand-400" />
              Community Activity
            </h3>
            <ActivityFeed />
          </div>
        </div>
      </div>
      </PageContainer>
    </div>
  );
}
