import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { BookOpen, Sparkles, PlayCircle, Brain, MessageSquare, Award, Map, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { PageContainer } from '../components/layout/PageContainer';
import React, { useState, useRef, useEffect } from 'react';
import PromptForm from '../components/PromptForm';
import { courseService, type CourseGenerationStage } from '../services/courseService';
import { dashboardService } from '../services/dashboardService';
import { useAuth } from '../hooks/useAuth';
import { DashboardHero } from '../components/dashboard/DashboardHero';
import { DashboardContinueLearning } from '../components/dashboard/DashboardContinueLearning';
import { DashboardQuickActions } from '../components/dashboard/DashboardQuickActions';
import { DashboardOverview } from '../components/dashboard/DashboardOverview';
import { DashboardActivity } from '../components/dashboard/DashboardActivity';
import { DashboardSkeleton } from '../components/dashboard/DashboardSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';

export default function HomePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<CourseGenerationStage | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.trim().toLowerCase() || '';

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  function showCourseReadyToast(courseId: string) {
    toast.success((t) => (
      <span className="flex items-center gap-3">
        Course ready
        <button
          type="button"
          onClick={() => { navigate(`/course/${courseId}`); toast.dismiss(t.id); }}
          className="font-semibold text-primary underline underline-offset-2"
        >
          View it
        </button>
      </span>
    ));
  }

  async function generateCourse(topic: string) {
    setGenerating(true);
    setGenerationError(null);
    setGenerationStage('analyzing_topic');

    const [data, err] = await courseService.generateCourseStream({ prompt: topic }, (stage) => {
      if (mountedRef.current) setGenerationStage(stage);
    });

    if (!mountedRef.current) {
      // The user already navigated away; don't yank them back with a hard
      // redirect. Let them opt in via the toast's click-through instead.
      if (data) showCourseReadyToast(data._id);
      return true;
    }

    setGenerating(false);
    setGenerationStage(null);

    if (data) {
      showCourseReadyToast(data._id);
      navigate(`/course/${data._id}`);
      return true;
    }

    setGenerationError(err || 'Failed to generate course');
    return false;
  }

  const { data, isLoading: loading, isError: error, refetch: fetchDashboard } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const [res, err] = await dashboardService.getSummary();
      if (err) throw new Error(err);
      return res;
    }
  });

  useEffect(() => {
    if (!loading && data && location.hash === '#course-generator') {
      document.getElementById('course-generator')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading, data, location.hash]);

  const statsList = [
    { label: "Courses", value: data?.statistics?.coursesCreated || 0, icon: BookOpen },
    { label: "Lessons", value: data?.statistics?.lessonsCompleted || 0, icon: PlayCircle },
    { label: "Roadmaps", value: data?.statistics?.roadmapsCreated || 0, icon: Map },
    { label: "Interviews", value: data?.statistics?.interviewPacks || 0, icon: Brain },
    { label: "Certificates", value: data?.statistics?.certificatesEarned || 0, icon: Award }
  ];

  const quickActions = [
    { label: "Generate Course", icon: Sparkles, url: "#course-generator", desc: "Instantly create a new curriculum", color: "from-primary/20 to-primary/5", text: "text-primary", border: "group-hover:border-primary/50" },
    { label: "Generate Roadmap", icon: Map, url: "/roadmaps", desc: "Plan your learning path", color: "from-brand-400/20 to-brand-400/5", text: "text-brand-400", border: "group-hover:border-brand-400/50" },
    { label: "Interview Prep", icon: Brain, url: "/interview-prep", desc: "Practice with AI voice", color: "from-destructive/20 to-destructive/5", text: "text-destructive", border: "group-hover:border-destructive/50" },
    { label: "AI Insights", icon: MessageSquare, url: "/agents", desc: "Specialized agents for reviews & planning", color: "from-warning/20 to-warning/5", text: "text-warning", border: "group-hover:border-warning/50" },
    { label: "Certificates", icon: Award, url: "/certificates", desc: "View your achievements", color: "from-success/20 to-success/5", text: "text-success", border: "group-hover:border-success/50" }
  ];
  
  const recommendations = [
    ...(data?.continueLearning?.url
      ? [{ label: "Resume AI Course", icon: PlayCircle, desc: "Continue where you left off", url: data.continueLearning.url }]
      : []),
    { label: "Practice Interview", icon: Code, desc: "Ace your next technical round", url: "/interview-prep" },
    { label: "Generate Roadmap", icon: Map, desc: "Plan your long-term goals", url: "/roadmaps" }
  ];

  const filteredRecentActivity = (data?.recentActivity || []).filter((activity) =>
    !searchQuery || activity.title.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-foreground font-sans">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      </div>

      <PageContainer className="relative z-10 pt-8 pb-24 space-y-8 max-w-7xl mx-auto">
        {loading ? (
          <DashboardSkeleton />
        ) : error ? (
          <ErrorState 
            title="Unable to load dashboard" 
            description="Please check your connection and try again." 
            onRetry={fetchDashboard} 
          />
        ) : !data || Object.keys(data).length === 0 ? (
          <EmptyState 
            title="No Dashboard Data" 
            description="Your dashboard is currently empty. Generate a course to get started!" 
          />
        ) : (
          <div className="flex flex-col gap-10">
            {/* 1. Hero Banner */}
            <DashboardHero name={user?.name || 'there'} continueUrl={data?.continueLearning?.url} onNavigate={navigate} />

            {/* Course Generator Section */}
            <motion.section 
              id="course-generator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-xl font-semibold text-foreground flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" /> Generate New Course
                </h2>
              </div>
              <PromptForm
                onSubmit={generateCourse}
                isLoading={generating}
                stage={generationStage}
                error={generationError}
                onDismissError={() => setGenerationError(null)}
              />
            </motion.section>

            {/* 2. Continue Learning */}
            {data?.continueLearning && (!searchQuery || data.continueLearning.title.toLowerCase().includes(searchQuery)) && (
              <DashboardContinueLearning data={data.continueLearning} />
            )}

            {/* 3. Quick Actions */}
            <DashboardQuickActions actions={quickActions} />

            {/* Grid Layout for Stats, Progress, Activity, Recommended */}
            <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8">
              {/* 4 & 5: Overview and Progress */}
              <DashboardOverview 
                streak={data?.streak?.current || 0}
                statsList={statsList}
                weeklyProgress={data?.progress?.weeklyProgress || 0}
                overallCompletion={data?.progress?.overallCompletion || 0}
              />

              {/* 6 & 7: Activity and Recommended */}
              <DashboardActivity
                recommendations={recommendations}
                recentActivity={filteredRecentActivity}
              />
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
