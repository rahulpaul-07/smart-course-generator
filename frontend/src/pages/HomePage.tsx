import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Sparkles, Activity, PlayCircle, Layers, Brain, 
  MessageSquare, Clock, ArrowRight, Target, BarChart2, 
  TrendingUp, Award, Map, ChevronRight, Zap, Flame,
  FileText, Code, CheckCircle2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import api from '../utils/api';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import PromptForm from '../components/PromptForm';

// Animated Counter Component
const CountUp = ({ end, decimals = 0, suffix = "", duration = 1500 }: { end: number, decimals?: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * end);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);
  
  return <>{count.toFixed(decimals)}{suffix}</>;
};

export default function HomePage() {
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);

  async function generateCourse(topic: string) {
    setGenerating(true);
    try {
      const { data } = await api.post('/courses/generate', { prompt: topic });
      navigate(`/course/${data._id}`);
      return true;
    } catch {
      toast.error('Failed to generate course. Please try again.');
      return false;
    } finally {
      setGenerating(false);
    }
  }

  const { data, isLoading: loading, isError: error, refetch: fetchDashboard } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data;
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
          <div className="space-y-8 animate-pulse">
            <Skeleton className="h-[300px] w-full rounded-[24px]" />
            <Skeleton className="h-[120px] w-full rounded-2xl" />
            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              <Skeleton className="h-[400px] w-full rounded-[24px]" />
              <Skeleton className="h-[400px] w-full rounded-[24px]" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card/40 border border-border/40 rounded-3xl backdrop-blur-xl shadow-sm">
            <Activity className="h-12 w-12 text-rose-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground mb-6">There was an error fetching your summary.</p>
            <Button onClick={fetchDashboard} className="rounded-full">Try Again</Button>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {/* 1. Hero Banner */}
            <motion.section 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="relative w-full rounded-[32px] border border-border/40 bg-card/40 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl text-center md:text-left space-y-6">
                <div>
                  <span className="inline-block text-sm font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 ring-1 ring-primary/20">
                    Welcome back, Rahul
                  </span>
                  <h1 className="text-4xl md:text-5xl lg:text-[56px] font-extrabold tracking-tight text-foreground leading-[1.1] drop-shadow-sm">
                    Ready to continue learning?
                  </h1>
                  <p className="text-lg md:text-xl text-muted-foreground mt-4 font-medium leading-relaxed">
                    Pick up right where you left off, or generate a completely new AI course in seconds.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                  <Button size="lg" className="h-12 px-6 rounded-full text-sm font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_4px_20px_rgb(0,0,0,0.1)] shadow-primary/20 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background" onClick={() => { document.getElementById('course-generator')?.scrollIntoView({ behavior: 'smooth' }); }}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate New Course
                  </Button>
                  <Button variant="outline" size="lg" className="h-12 px-6 rounded-full text-sm font-bold border border-border/50 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5" onClick={() => navigate(data?.continueLearning?.url || '/courses')}>
                    Continue Learning
                  </Button>
                </div>
              </div>

              {/* Decorative AI Illustration built from UI cards */}
              <div className="relative z-10 w-full max-w-[320px] hidden lg:block aspect-square">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-cyan-400/20 rounded-full blur-[80px]" />
                <motion.div 
                  initial={{ y: 0 }}
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-4 left-4 right-12 bg-card border border-border/40 shadow-xl rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-3 mb-3 border-b border-border/40 pb-3">
                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <div className="h-2 w-20 bg-muted-foreground/30 rounded mb-1.5" />
                      <div className="h-2 w-12 bg-muted-foreground/20 rounded" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 w-full bg-muted/60 rounded" />
                    <div className="h-2 w-4/5 bg-muted/60 rounded" />
                    <div className="h-2 w-2/3 bg-muted/60 rounded" />
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ y: 0 }}
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-4 left-12 right-4 bg-background border border-border/50 shadow-2xl rounded-2xl p-4 backdrop-blur-xl ring-1 ring-white/5"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="h-2 w-16 bg-muted-foreground/30 rounded" />
                    <div className="h-4 w-12 bg-emerald-500/20 rounded-full flex items-center justify-center">
                      <div className="h-1.5 w-6 bg-emerald-500/50 rounded-full" />
                    </div>
                  </div>
                  <div className="h-24 w-full bg-muted/40 rounded-lg border border-border/40 flex items-end p-2 gap-1">
                    {[40, 70, 45, 90, 65, 100].map((h, i) => (
                      <div key={i} className="flex-1 bg-primary/40 rounded-t-sm transition-all" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </motion.div>
              </div>
            </motion.section>

            {/* Course Generator Section */}
            <motion.section 
              id="course-generator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="scroll-mt-24"
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> Generate New Course
                </h2>
              </div>
              <PromptForm onSubmit={generateCourse} isLoading={generating} />
            </motion.section>

            {/* 2. Continue Learning */}
            {data?.continueLearning && (
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
              >
                <div className="flex items-center justify-between mb-4 px-2">
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-primary" /> Continue Learning
                  </h2>
                </div>
                <Card className="overflow-hidden border border-border/40 bg-card/40 backdrop-blur-xl shadow-[0_4px_20px_rgb(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 group">
                  <div className="p-4 md:p-6 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                    <div className="relative shrink-0 w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border/40">
                      <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-200" />
                      <BookOpen className="h-10 w-10 text-primary/40 group-hover:scale-105 transition-transform duration-200" />
                    </div>
                    
                    <div className="flex-1 min-w-0 w-full space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase">
                          {data.continueLearning.type}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Clock className="h-3 w-3" /> Updated {new Date(data.continueLearning.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground truncate">{data.continueLearning.title}</h3>
                      
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex-1 h-2 bg-muted/60 rounded-full overflow-hidden border border-border/20">
                          <div className="h-full bg-primary rounded-full w-[45%]" />
                        </div>
                        <span className="text-sm font-bold text-foreground w-12 text-right">45%</span>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground">
                        3 lessons remaining • ~45 mins left
                      </div>
                    </div>

                    <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                      <Button size="lg" className="w-full md:w-auto rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]" onClick={() => navigate(data.continueLearning.url)}>
                        Resume Course <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.section>
            )}

            {/* 3. Quick Actions */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" /> Quick Actions
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {quickActions.map((action, i) => (
                  <Link 
                    key={i}
                    to={action.url}
                    className={`group flex flex-col p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl hover:bg-card/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-200 relative overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${action.border}`}
                  >
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.color} blur-2xl -mr-16 -mt-16 rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-200`} />
                    <div className={`h-10 w-10 rounded-xl bg-background flex items-center justify-center mb-4 ${action.text} shadow-sm border border-border/40 group-hover:scale-105 transition-transform duration-200`}>
                      <action.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-sm text-foreground mb-1">{action.label}</h3>
                    <p className="text-[11px] font-medium text-muted-foreground line-clamp-1">{action.desc}</p>
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* Grid Layout for Stats, Progress, Activity, Recommended */}
            <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-8">
              
              <div className="space-y-10">
                {/* 4. Statistics */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      <BarChart2 className="h-5 w-5 text-primary" /> Overview
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {/* Streak Card (Spans 1 col but distinct) */}
                    <Card className="p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-border/80 transition-all duration-200 flex flex-col justify-between group overflow-hidden relative">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 blur-2xl rounded-full -mr-8 -mt-8 pointer-events-none" />
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Flame className="h-4 w-4 text-orange-500 group-hover:scale-110 transition-transform duration-200" />
                        </div>
                      </div>
                      <div className="relative z-10">
                        <div className="text-3xl font-extrabold text-foreground mb-1 tracking-tight">
                          <CountUp end={data?.streak?.current || 0} />
                        </div>
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Day Streak</div>
                      </div>
                    </Card>

                    {statsList.map((stat, i) => (
                      <Card key={i} className="p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-border/80 transition-all duration-200 flex flex-col justify-between group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center border border-border/40 group-hover:bg-background transition-colors duration-200">
                            <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
                          </div>
                        </div>
                        <div>
                          <div className="text-3xl font-extrabold text-foreground mb-1 tracking-tight">
                            <CountUp end={stat.value} />
                          </div>
                          <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </motion.section>

                {/* 5. Progress */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-500" /> Learning Progress
                    </h2>
                  </div>
                  <Card className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:border-border/80 transition-all duration-200">
                    <div className="space-y-8">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <p className="text-sm font-bold text-foreground">Weekly Goal</p>
                            <p className="text-xs font-medium text-muted-foreground">Keep up the momentum</p>
                          </div>
                          <span className="text-lg font-extrabold text-foreground">{data?.progress?.weeklyProgress || 0}%</span>
                        </div>
                        <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden border border-border/20 shadow-inner">
                          <motion.div 
                            className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${data?.progress?.weeklyProgress || 0}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <div>
                            <p className="text-sm font-bold text-foreground">Overall Completion</p>
                            <p className="text-xs font-medium text-muted-foreground">Across all generated courses</p>
                          </div>
                          <span className="text-lg font-extrabold text-foreground">{data?.progress?.overallCompletion || 0}%</span>
                        </div>
                        <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden border border-border/20 shadow-inner">
                          <motion.div 
                            className="bg-gradient-to-r from-blue-400 to-primary h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${data?.progress?.overallCompletion || 0}%` }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.section>
              </div>

              <div className="space-y-10">
                {/* 6. Recommended Actions */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.25 }}
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" /> Recommended
                    </h2>
                  </div>
                  <div className="flex flex-col gap-3">
                    {recommendations.map((rec, i) => (
                      <Card key={i} className="p-4 rounded-xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm hover:bg-card/80 hover:border-border/80 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex items-center gap-4 group">
                        <div className="h-10 w-10 shrink-0 rounded-lg bg-background border border-border/50 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                          <rec.icon className="h-4 w-4 text-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-foreground mb-0.5 truncate">{rec.label}</h4>
                          <p className="text-[11px] font-medium text-muted-foreground truncate">{rec.desc}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                      </Card>
                    ))}
                  </div>
                </motion.section>

                {/* 7. Recent Activity */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4 px-2">
                    <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                      <Activity className="h-5 w-5 text-muted-foreground" /> Recent Activity
                    </h2>
                  </div>
                  <Card className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl shadow-sm relative">
                    {data?.recentActivity?.length > 0 ? (
                      <div className="relative pl-6 border-l border-border/50 space-y-8 py-2">
                        {data.recentActivity.map((activity: any, i: number) => (
                          <div key={i} className="relative group">
                            <div className="absolute -left-[30px] top-1.5 h-2.5 w-2.5 rounded-full border border-background bg-muted-foreground group-hover:bg-primary group-hover:scale-125 transition-all duration-200" />
                            <Link 
                              to={activity.url}
                              className="block -mt-1 hover:-translate-y-0.5 transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                  {activity.type}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground">Just now</span>
                              </div>
                              <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{activity.title}</p>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 px-4">
                        <div className="h-12 w-12 rounded-full bg-muted border border-border/40 flex items-center justify-center mx-auto mb-3">
                          <Clock className="h-5 w-5 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-bold text-foreground">No recent activity</p>
                        <p className="text-xs font-medium text-muted-foreground mt-1">Start learning to see your timeline.</p>
                      </div>
                    )}
                  </Card>
                </motion.section>
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
