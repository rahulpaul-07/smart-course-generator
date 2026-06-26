import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Sparkles, Activity, PlayCircle, Layers, Brain, MessageSquare, Clock, ArrowRight, Flame, Target, BarChart2, CheckCircle, FlameKindling, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
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
    { label: "Courses Created", value: data?.statistics?.coursesCreated || 0, icon: BookOpen },
    { label: "Courses Completed", value: data?.statistics?.coursesCompleted || 0, icon: CheckCircle },
    { label: "Lessons Completed", value: data?.statistics?.lessonsCompleted || 0, icon: PlayCircle },
    { label: "Roadmaps", value: data?.statistics?.roadmapsCreated || 0, icon: Layers },
    { label: "Practice Labs", value: data?.statistics?.practiceLabsGenerated || 0, icon: Zap },
    { label: "Flashcards", value: data?.statistics?.flashcardsGenerated || 0, icon: Sparkles },
    { label: "Interview Packs", value: data?.statistics?.interviewPacks || 0, icon: Brain },
    { label: "AI Questions", value: data?.statistics?.aiQuestionsAsked || 0, icon: MessageSquare }
  ];

  const ProgressBar = ({ label, value }: { label: string, value: number }) => (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-sm text-muted-foreground">{value}%</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <motion.div 
          className="bg-primary h-2.5 rounded-full" 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen opacity-50" />
      </div>

      <PageContainer className="relative z-10">
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Dashboard</h1>
          <p className="text-muted-foreground mt-2 text-lg">Welcome back. Here's your learning progress.</p>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-[1fr_350px] gap-8">
            <div className="space-y-8">
              <Skeleton className="h-48 w-full rounded-3xl" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </div>
              <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-96 w-full rounded-3xl" />
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
          <div className="grid lg:grid-cols-[1fr_350px] gap-8">
            <div className="space-y-8">
              {/* Continue Learning Widget */}
              {data?.continueLearning ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 p-8 relative overflow-hidden"
                >
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/20 blur-3xl rounded-full" />
                  <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <PlayCircle className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Continue Learning</span>
                      </div>
                      <h2 className="text-2xl font-bold text-foreground mb-2 line-clamp-1">{data.continueLearning.title}</h2>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-black/20">{data.continueLearning.type}</span>
                        <Clock className="h-4 w-4 ml-2" /> Last updated {new Date(data.continueLearning.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button 
                      size="lg" 
                      onClick={() => navigate(data.continueLearning.url)}
                      className="group"
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-3xl border border-border/50 bg-card/60 backdrop-blur-sm p-8 text-center flex flex-col items-center"
                >
                  <Sparkles className="h-10 w-10 text-primary mb-4" />
                  <h2 className="text-xl font-bold mb-2">Ready to start learning?</h2>
                  <p className="text-muted-foreground mb-6">You don't have any active courses yet. Generate one to get started.</p>
                  <Button onClick={() => navigate('/')}>Create a Course</Button>
                </motion.div>
              )}

              {/* Analytics Row 1: Streak and Weekly Goal */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Learning Streak */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 border-border/50 flex flex-col justify-between hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                      <Flame className={`h-5 w-5 ${data?.streak?.current > 0 ? 'text-orange-500' : 'text-muted-foreground'}`} />
                      Learning Streak
                    </h3>
                  </div>
                  
                  {data?.streak?.current > 0 ? (
                    <div className="flex items-end gap-3">
                      <motion.span 
                        initial={{ scale: 0.5 }}
                        animate={{ scale: 1 }}
                        className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-orange-400 to-rose-500"
                      >
                        {data.streak.current}
                      </motion.span>
                      <span className="text-muted-foreground pb-2 font-medium">Days</span>
                    </div>
                  ) : (
                    <div className="py-4 text-center border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                      <FlameKindling className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No active streak.<br/>Start a lesson today!</p>
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-border/50 flex justify-between text-sm">
                    <div>
                      <p className="text-muted-foreground">Longest Streak</p>
                      <p className="font-semibold text-foreground">{data?.streak?.longest || 0} Days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground">Last Active</p>
                      <p className="font-semibold text-foreground">
                        {data?.streak?.lastActive ? new Date(data.streak.lastActive).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Weekly Goal */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 border-border/50 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground mb-6">
                    <Target className="h-5 w-5 text-emerald-500" />
                    Weekly Goal
                  </h3>
                  
                  {data?.progress?.weeklyProgress > 0 ? (
                    <>
                      <div className="flex justify-between items-end mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Goal Completion</p>
                          <motion.span 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-3xl font-bold text-foreground"
                          >
                            {data.progress.weeklyProgress}%
                          </motion.span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Remaining Work</p>
                          <span className="text-lg font-semibold text-foreground">{100 - data.progress.weeklyProgress}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
                        <motion.div 
                          className="bg-emerald-500 h-3 rounded-full" 
                          initial={{ width: 0 }}
                          animate={{ width: `${data.progress.weeklyProgress}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-white/[0.02]">
                      <p className="text-sm text-muted-foreground font-medium">You haven't set a weekly goal or made progress this week.</p>
                      <Button variant="link" className="mt-2 text-emerald-500" onClick={() => navigate('/')}>Generate a course to start</Button>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Statistics & Progress Row */}
              <div className="grid md:grid-cols-[2fr_1fr] gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 border-border/50 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground mb-6">
                    <BarChart2 className="h-5 w-5 text-brand-400" />
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {statsList.map((stat, i) => (
                      <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 flex flex-col items-center justify-center text-center transition-colors hover:bg-white/[0.05]">
                        <stat.icon className="h-6 w-6 text-muted-foreground mb-2" />
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-2xl font-bold text-foreground mb-1"
                        >
                          {stat.value}
                        </motion.span>
                        <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-2xl p-6 border-border/50 hover:shadow-lg transition-shadow"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2 text-foreground mb-6">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Progress
                  </h3>
                  <div className="space-y-6">
                    <ProgressBar label="Overall Completion" value={data?.progress?.overallCompletion || 0} />
                    <ProgressBar label="Monthly Progress" value={data?.progress?.monthlyProgress || 0} />
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <div>
                <SectionHeader title="Quick Actions" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                  {data?.quickActions?.map((action: any, i: number) => (
                    <Link 
                      key={i} 
                      to={action.url}
                      className="flex flex-col items-center justify-center p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-primary/30 transition-all group focus-visible:ring-2 focus-visible:outline-none hover:-translate-y-1"
                    >
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        {action.icon === 'BookOpen' && <BookOpen className="h-6 w-6 text-primary" />}
                        {action.icon === 'Layers' && <Layers className="h-6 w-6 text-primary" />}
                        {action.icon === 'Brain' && <Brain className="h-6 w-6 text-primary" />}
                        {action.icon === 'PlayCircle' && <PlayCircle className="h-6 w-6 text-primary" />}
                        {action.icon === 'MessageSquare' && <MessageSquare className="h-6 w-6 text-primary" />}
                      </div>
                      <span className="text-sm font-medium text-center text-foreground">{action.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="glass-card rounded-2xl p-6 border-border/50 sticky top-24">
                <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-brand-400" />
                  Recent Activity
                </h3>
                
                {data?.recentActivity?.length > 0 ? (
                  <div className="space-y-4" role="list">
                    {data.recentActivity.map((activity: any, i: number) => (
                      <Link 
                        key={i}
                        to={activity.url}
                        role="listitem"
                        className="flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.03] transition-colors group focus-visible:ring-2 focus-visible:outline-none"
                      >
                        <div className="h-10 w-10 shrink-0 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                          {activity.type === 'Course' ? <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-primary" /> : 
                           activity.type.includes('Interview') ? <Brain className="h-5 w-5 text-slate-400 group-hover:text-primary" /> :
                           <Layers className="h-5 w-5 text-slate-400 group-hover:text-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{activity.type}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4 border border-dashed border-white/10 rounded-xl">
                    <p className="text-sm text-muted-foreground">No recent activity found. Start a course or interview to see it here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PageContainer>
    </div>
  );
}
