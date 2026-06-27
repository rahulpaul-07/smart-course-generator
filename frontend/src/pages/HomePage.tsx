import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, Sparkles, Activity, PlayCircle, Layers, Brain, 
  MessageSquare, Clock, ArrowRight, Flame, Target, BarChart2, 
  CheckCircle, FlameKindling, Zap, TrendingUp, Award, Map, 
  ChevronRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import api from '../utils/api';

export default function HomePage() {
  const navigate = useNavigate();

  const { data, isLoading: loading, isError: error, refetch: fetchDashboard } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: async () => {
      const res = await api.get('/dashboard/summary');
      return res.data;
    }
  });

  const statsList = [
    { label: "Courses", value: data?.statistics?.coursesCreated || 0, icon: BookOpen, trend: "+2" },
    { label: "Lessons", value: data?.statistics?.lessonsCompleted || 0, icon: PlayCircle, trend: "+12" },
    { label: "Roadmaps", value: data?.statistics?.roadmapsCreated || 0, icon: Map, trend: "+1" },
    { label: "Interviews", value: data?.statistics?.interviewPacks || 0, icon: Brain, trend: "+3" },
    { label: "Labs", value: data?.statistics?.practiceLabsGenerated || 0, icon: CodeIcon, trend: "+5" },
    { label: "Flashcards", value: data?.statistics?.flashcardsGenerated || 0, icon: Layers, trend: "+24" },
    { label: "AI Qs", value: data?.statistics?.aiQuestionsAsked || 0, icon: MessageSquare, trend: "+45" },
    { label: "Hours", value: Math.round((data?.statistics?.lessonsCompleted || 0) * 0.5), icon: Clock, trend: "+4h" }
  ];

  const quickActions = [
    { label: "Generate Course", icon: Sparkles, url: "/community", desc: "Instantly create a new curriculum", color: "from-primary/20 to-primary/0", text: "text-primary" },
    { label: "Generate Roadmap", icon: Map, url: "/roadmaps", desc: "Plan your learning path", color: "from-blue-500/20 to-blue-500/0", text: "text-blue-500" },
    { label: "Interview Prep", icon: Brain, url: "/interview", desc: "Practice with AI voice", color: "from-rose-500/20 to-rose-500/0", text: "text-rose-500" },
    { label: "Ask AI Tutor", icon: MessageSquare, url: "/ai-agents", desc: "Get unstuck instantly", color: "from-amber-500/20 to-amber-500/0", text: "text-amber-500" },
    { label: "Certificates", icon: Award, url: "/certificates", desc: "View your achievements", color: "from-emerald-500/20 to-emerald-500/0", text: "text-emerald-500" }
  ];

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.08),transparent_50%)]" />
      </div>

      <PageContainer className="relative z-10 pt-8 pb-24 space-y-12">
        {loading ? (
          <div className="space-y-8">
            <Skeleton className="h-[400px] w-full rounded-[2rem]" />
            <Skeleton className="h-[120px] w-full rounded-2xl" />
            <div className="grid lg:grid-cols-[1fr_350px] gap-8">
              <Skeleton className="h-[400px] w-full rounded-[2rem]" />
              <Skeleton className="h-[400px] w-full rounded-[2rem]" />
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 bg-card/40 border border-border/50 rounded-3xl backdrop-blur-sm">
            <Activity className="h-12 w-12 text-rose-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Failed to load dashboard</h3>
            <p className="text-muted-foreground mb-6">There was an error fetching your summary.</p>
            <Button onClick={fetchDashboard}>Try Again</Button>
          </div>
        ) : (
          <>
            {/* 1. Top Hero */}
            <section>
              <div className="relative rounded-[2rem] border border-border/40 bg-card/20 backdrop-blur-xl overflow-hidden p-8 md:p-12 lg:p-16 flex flex-col md:flex-row items-center gap-12 shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-cyan-500/5 pointer-events-none" />
                
                <div className="relative z-10 flex-1 space-y-6 text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h1 className="text-4xl md:text-5xl lg:text-[56px] leading-[1.15] font-extrabold tracking-tight text-foreground mb-6 drop-shadow-sm">
                      Generate Your Next <br className="hidden md:block" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                        AI Course
                      </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">
                      Create complete AI-powered learning experiences in seconds. Personalized, interactive, and beautifully formatted.
                    </p>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-2"
                  >
                    <Button size="lg" className="rounded-xl h-14 px-8 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all" onClick={() => navigate('/community')}>
                      Generate Course <Sparkles className="ml-2 h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg" className="rounded-xl h-14 px-8 text-base border-border/60 hover:bg-card/80 backdrop-blur-sm" onClick={() => navigate('/community')}>
                      Explore Courses
                    </Button>
                  </motion.div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="relative z-10 flex-1 w-full max-w-md hidden lg:block"
                >
                  <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 to-cyan-400/20 blur-2xl rounded-full opacity-50" />
                  <div className="relative rounded-2xl border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 border-b border-border/50 pb-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center">
                        <Brain className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="h-4 w-24 bg-foreground/20 rounded mb-1" />
                        <div className="h-3 w-32 bg-foreground/10 rounded" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="h-3 w-full bg-muted/60 rounded" />
                      <div className="h-3 w-[85%] bg-muted/60 rounded" />
                      <div className="h-3 w-[60%] bg-muted/60 rounded" />
                    </div>
                    <div className="pt-4 flex gap-2">
                      <div className="h-8 flex-1 bg-primary/10 rounded-lg border border-primary/20" />
                      <div className="h-8 w-8 bg-muted/60 rounded-lg" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            {/* 2. Quick Actions */}
            <section>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {quickActions.map((action, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link 
                      to={action.url}
                      className="group flex flex-col p-5 rounded-2xl border border-border/40 bg-card/30 backdrop-blur-sm hover:bg-card/60 hover:shadow-md hover:border-border/80 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${action.color} blur-2xl -mr-16 -mt-16 rounded-full opacity-50 group-hover:opacity-100 transition-opacity`} />
                      <div className={`h-10 w-10 rounded-xl bg-background/50 flex items-center justify-center mb-4 ${action.text} shadow-sm group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-bold text-foreground mb-1">{action.label}</h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{action.desc}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* 3. Continue Learning */}
            {data?.continueLearning && (
              <section>
                <div className="flex items-center gap-2 mb-6">
                  <PlayCircle className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">Jump Back In</h2>
                </div>
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-border/50 bg-card/40 backdrop-blur-sm p-6 flex flex-col md:flex-row items-center gap-8 hover:bg-card/60 transition-colors shadow-sm"
                >
                  <div className="relative shrink-0 w-full md:w-48 aspect-video rounded-xl overflow-hidden bg-muted flex items-center justify-center border border-border/50 group">
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-colors" />
                    <BookOpen className="h-10 w-10 text-primary/50 group-hover:scale-110 transition-transform" />
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold tracking-wider uppercase">
                        {data.continueLearning.type}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> 
                        Updated {new Date(data.continueLearning.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3 truncate">{data.continueLearning.title}</h3>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full w-[45%]" />
                      </div>
                      <span className="text-sm font-medium text-muted-foreground w-12 text-right">45%</span>
                    </div>
                  </div>

                  <div className="w-full md:w-auto shrink-0 flex items-center justify-end">
                    <Button size="lg" className="w-full md:w-auto rounded-xl shadow-md group" onClick={() => navigate(data.continueLearning.url)}>
                      Resume <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.div>
              </section>
            )}

            <div className="grid xl:grid-cols-[1fr_380px] gap-8">
              
              <div className="space-y-12">
                {/* 4. Statistics */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart2 className="h-6 w-6 text-brand-400" />
                    <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {statsList.map((stat, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="p-5 rounded-2xl border border-border/40 bg-card/20 backdrop-blur-sm hover:bg-card/40 transition-colors group"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <stat.icon className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                          <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" /> {stat.trend}
                          </span>
                        </div>
                        <div className="text-3xl font-extrabold text-foreground tracking-tight mb-1">{stat.value}</div>
                        <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
                      </motion.div>
                    ))}
                  </div>
                </section>

                {/* 5. Progress Section */}
                <section>
                  <div className="flex items-center gap-2 mb-6">
                    <Target className="h-6 w-6 text-emerald-500" />
                    <h2 className="text-2xl font-bold tracking-tight">Your Progress</h2>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md p-8 shadow-sm flex flex-col md:flex-row gap-10 items-center relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
                    
                    <div className="flex flex-col items-center justify-center p-6 bg-background/50 rounded-2xl border border-border/40 min-w-[200px]">
                      <div className="flex items-center gap-2 text-muted-foreground mb-3 font-medium">
                        <Flame className={`h-5 w-5 ${data?.streak?.current > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                        Streak
                      </div>
                      <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-rose-500 mb-2">
                        {data?.streak?.current || 0}
                      </div>
                      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Days Active</div>
                    </div>

                    <div className="flex-1 w-full space-y-8">
                      <div>
                        <div className="flex justify-between items-end mb-3">
                          <div>
                            <p className="text-sm font-bold text-foreground">Weekly Goal</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Keep up the momentum</p>
                          </div>
                          <span className="text-xl font-extrabold text-foreground">{data?.progress?.weeklyProgress || 0}%</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden border border-border/50">
                          <motion.div 
                            className="bg-emerald-500 h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${data?.progress?.weeklyProgress || 0}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-end mb-3">
                          <div>
                            <p className="text-sm font-bold text-foreground">Overall Completion</p>
                            <p className="text-xs text-muted-foreground mt-0.5">Across all generated courses</p>
                          </div>
                          <span className="text-xl font-extrabold text-foreground">{data?.progress?.overallCompletion || 0}%</span>
                        </div>
                        <div className="w-full bg-muted/50 rounded-full h-3 overflow-hidden border border-border/50">
                          <motion.div 
                            className="bg-blue-500 h-full rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${data?.progress?.overallCompletion || 0}%` }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </section>
              </div>

              {/* 6. Recent Activity Timeline */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-6 w-6 text-brand-400" />
                    <h2 className="text-2xl font-bold tracking-tight">Timeline</h2>
                  </div>
                </div>

                <div className="rounded-3xl border border-border/50 bg-card/30 backdrop-blur-md p-6 shadow-sm sticky top-24">
                  {data?.recentActivity?.length > 0 ? (
                    <div className="relative pl-6 border-l-2 border-border/60 space-y-8 py-4">
                      {data.recentActivity.map((activity: any, i: number) => (
                        <div key={i} className="relative group">
                          <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full border-2 border-background bg-muted-foreground group-hover:bg-primary transition-colors" />
                          <Link 
                            to={activity.url}
                            className="block rounded-xl border border-transparent p-3 -mx-3 hover:bg-card/60 hover:border-border/50 hover:shadow-sm transition-all focus-visible:ring-2 focus-visible:outline-none"
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {activity.type}
                              </span>
                              <span className="text-xs text-muted-foreground font-medium">Just now</span>
                            </div>
                            <p className="text-sm font-semibold text-foreground mb-1 line-clamp-2">{activity.title}</p>
                            <div className="flex items-center text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                              View Details <ChevronRight className="h-3 w-3 ml-0.5" />
                            </div>
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 border border-dashed border-border/50 rounded-2xl bg-card/20">
                      <Clock className="h-8 w-8 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm font-medium text-foreground">No recent activity</p>
                      <p className="text-xs text-muted-foreground mt-1">Generate a course to start your journey.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </PageContainer>
    </div>
  );
}

const CodeIcon = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
)
