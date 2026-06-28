import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, Activity, PlayCircle, Brain, MessageSquare, Award, Map, Code, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '../utils/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import PromptForm from '../components/PromptForm';
import { courseService } from '../services/courseService';
import { dashboardService } from '../services/dashboardService';
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
  const [generating, setGenerating] = useState(false);

  async function generateCourse(topic: string) {
    setGenerating(true);
    const [data] = await courseService.generateCourse({ prompt: topic });
    setGenerating(false);
    if (data) {
      navigate(`/course/${data._id}`);
      return true;
    }
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

  const statsList = [
    { label: "Courses", value: data?.statistics?.coursesCreated || 0, icon: BookOpen },
    { label: "Lessons", value: data?.statistics?.lessonsCompleted || 0, icon: PlayCircle },
    { label: "Roadmaps", value: data?.statistics?.roadmapsCreated || 0, icon: Map },
    { label: "Interviews", value: data?.statistics?.interviewPacks || 0, icon: Brain },
    { label: "Certificates", value: data?.statistics?.certificatesEarned || 0, icon: Award }
  ];

  const quickActions = [
    { label: "Generate Course", icon: Sparkles, url: "/roadmaps", desc: "Instantly create a new curriculum", color: "from-primary/20 to-primary/5", text: "text-primary", border: "group-hover:border-primary/50" },
    { label: "Generate Roadmap", icon: Map, url: "/roadmaps", desc: "Plan your learning path", color: "from-blue-500/20 to-blue-500/5", text: "text-blue-500", border: "group-hover:border-blue-500/50" },
    { label: "Interview Prep", icon: Brain, url: "/interview", desc: "Practice with AI voice", color: "from-rose-500/20 to-rose-500/5", text: "text-rose-500", border: "group-hover:border-rose-500/50" },
    { label: "AI Tutor", icon: MessageSquare, url: "/ai-agents", desc: "Get unstuck instantly", color: "from-amber-500/20 to-amber-500/5", text: "text-amber-500", border: "group-hover:border-amber-500/50" },
    { label: "Certificates", icon: Award, url: "/certificates", desc: "View your achievements", color: "from-emerald-500/20 to-emerald-500/5", text: "text-emerald-500", border: "group-hover:border-emerald-500/50" }
  ];
  
  const recommendations = [
    { label: "Resume AI Course", icon: PlayCircle, desc: "Continue where you left off" },
    { label: "Practice Interview", icon: Code, desc: "Ace your next technical round" },
    { label: "Review Flashcards", icon: FileText, desc: "Spaced repetition due today" },
    { label: "Generate Roadmap", icon: Map, desc: "Plan your long-term goals" }
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
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
            <DashboardHero name="Rahul" continueUrl={data?.continueLearning?.url} onNavigate={navigate} />

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
              <PromptForm onSubmit={generateCourse} isLoading={generating} />
            </motion.section>

            {/* 2. Continue Learning */}
            {data?.continueLearning && (
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
                recentActivity={data?.recentActivity}
              />
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
