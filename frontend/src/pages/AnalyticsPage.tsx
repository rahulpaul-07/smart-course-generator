import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, BookOpen, Brain, Clock, Flame, Target, TrendingDown, TrendingUp, Trophy, Zap, PlusCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyticsService, type AnalyticsDashboard, type CourseStat, type TopicScore } from '../services/analyticsService';
import type { LucideIcon } from 'lucide-react';

import { Button } from '../components/ui/button';
import { AnalyticsSkeleton } from '../components/dashboard/AnalyticsSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { Loader2 } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [exportingCsv, setExportingCsv] = useState(false);
  const navigate = useNavigate();

  const fetchAnalytics = () => {
    setLoading(true);
    setError(false);
    analyticsService.getDashboard()
      .then(([resData, err]) => {
        if (err || !resData) {
          setError(true);
          setData(null);
        } else {
          setData(resData);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) return <AnalyticsSkeleton />;
  if (error || !data) return (
    <div className="page-shell py-20">
      <ErrorState 
        title="Unable to load analytics" 
        description="We couldn't retrieve your learning data at this time." 
        onRetry={fetchAnalytics} 
      />
    </div>
  );

  if (data.courseStats.length === 0) {
    return (
      <div className="page-shell py-20">
        <EmptyState 
          icon={BarChart3}
          title="No analytics yet"
          description="Start learning and completing lessons to see your progress here."
          action={<Button onClick={() => navigate('/dashboard')}>Explore Courses</Button>}
        />
      </div>
    );
  }

  // Prepare chart data
  const chartData = data.courseStats.map((c: CourseStat) => ({
    name: c.title.length > 15 ? c.title.substring(0, 15) + '...' : c.title,
    Completion: c.completionPct,
    Lessons: c.completedLessons
  }));

  return (
    <div className="page-shell">
      {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow"><BarChart3 className="h-3.5 w-3.5" /> Learning Analytics</p>
            <h1 className="gradient-text mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Your Learning Journey
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">Track your progress, identify strengths, and improve weak areas.</p>
          </div>
          <Button
            disabled={exportingCsv}
            className={`shadow-sm ${exportingCsv ? 'cursor-progress' : ''}`}
            onClick={async () => {
              setExportingCsv(true);
              try {
                // Add a small synthetic delay if needed to show the button state, but the user requested no artificial delays.
                // However, since it's synchronous CSV generation, it might happen instantly.
                // We'll wrap in a Promise to allow React to render the disabled state briefly if it takes time.
                await new Promise(resolve => setTimeout(resolve, 0));
                const escapeCsv = (val: unknown) => {
                  if (val === null || val === undefined) return '""';
                  return '"' + String(val).replace(/"/g, '""') + '"';
                };
                const headers = ['Course', 'Completed Lessons', 'Total Lessons', 'Completion %'].map(escapeCsv);
                const rows = data.courseStats.map((c: CourseStat) => [c.title, c.completedLessons, c.totalLessons, c.completionPct].map(escapeCsv));
                const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'learning-analytics.csv';
                a.click();
              } finally {
                setExportingCsv(false);
              }
            }}
          >
            {exportingCsv ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Exporting...</> : 'Export CSV'}
          </Button>
        </div>

      {/* Stat Cards */}
      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7 animate-enter-delay">
        <StatCard icon={Zap} label="Total XP" value={data.xp || 0} color="from-yellow-400 to-amber-500" />
        <StatCard icon={Flame} label="Study Streak" value={`${data.studyStreak} days`} color="from-orange-500 to-amber-500" />
        <StatCard icon={Clock} label="Study Hours" value={`${data.totalStudyHours}h`} color="from-cyan-500 to-blue-500" />
        <StatCard icon={BookOpen} label="Courses" value={data.totalCourses} color="from-violet-500 to-purple-500" />
        <StatCard icon={Target} label="Completion" value={`${data.overallCompletion}%`} color="from-emerald-500 to-green-500" />
        <StatCard icon={Trophy} label="Lessons Done" value={`${data.completedLessons}/${data.totalLessons}`} color="from-pink-500 to-rose-500" />
        <StatCard icon={Brain} label="Avg Quiz" value={`${data.avgQuizScore}/${data.maxQuizScore}`} color="from-indigo-500 to-blue-500" />
      </section>

      {/* Charts Section */}
      {chartData.length > 0 && (
        <section className="mb-10 animate-enter-delay">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <BarChart3 className="h-5 w-5 text-indigo-400" /> Completion by Course
          </h2>
          <div className="glass-card rounded-2xl p-6 h-[300px] shadow-lg">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number) => `${value}%`} />
                <Tooltip 
                  cursor={{ fill: '#ffffff0a' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', color: '#fff' }}
                  itemStyle={{ color: '#38bdf8' }}
                />
                <Bar dataKey="Completion" fill="url(#colorCompletion)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <defs>
                  <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}

      {/* Course Progress */}
      <section className="mb-10 animate-enter-delay">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Target className="h-5 w-5 text-brand-300" /> Course Progress
        </h2>
        <div className="space-y-3">
          {data.courseStats.map((course: CourseStat) => (
            <div key={course._id} className="glass-card rounded-2xl p-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-foreground">{course.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground font-medium">
                    {course.completedLessons}/{course.totalLessons} lessons
                    {course.hasCertificate && <span className="ml-2 text-amber-500 font-bold tracking-wider">🏆 CERTIFIED</span>}
                  </p>
                </div>
                <span className="text-sm font-bold text-brand-300">{course.completionPct}%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/10 border border-border/20">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-400 transition-all duration-200 shadow-[0_0_10px_currentColor] opacity-80"
                  style={{ width: `${course.completionPct}%` }}
                />
              </div>
            </div>
          ))}
          {data.courseStats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center glass-card rounded-2xl border-dashed border-2 border-border/30 bg-card/30">
              <div className="mb-4 rounded-full bg-brand-500/10 p-4 ring-1 ring-brand-500/20 shadow-sm">
                <BookOpen className="h-8 w-8 text-brand-400" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-foreground">No Learning Data Yet</h3>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground font-medium">Generate your first course to start tracking your XP, streaks, and completion rates.</p>
              <Button variant="secondary" onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 h-11 px-6 rounded-xl font-bold shadow-md hover:-translate-y-0.5">
                <PlusCircle className="h-4 w-4" /> Start Learning
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Activity Calendar */}
      <section className="mb-10 animate-enter-delay">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
          <Flame className="h-5 w-5 text-orange-400" /> Activity Calendar
        </h2>
        <div className="glass-card rounded-2xl p-6 shadow-sm overflow-x-auto">
          <ActivityGrid activityHistory={data.activityHistory} />
        </div>
      </section>

      {/* Strong & Weak Topics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="animate-enter-delay">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <TrendingUp className="h-5 w-5 text-emerald-400" /> Strong Topics
          </h2>
          <div className="space-y-2">
            {data.strongTopics.length > 0 ? data.strongTopics.map((t: TopicScore, i: number) => (
              <div key={i} className="glass-card flex items-center gap-3 rounded-xl p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-xs font-bold text-emerald-400">
                  {t.score}/5
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{t.lesson}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.course}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-center glass-card rounded-2xl">
                <Brain className="mb-3 h-8 w-8 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">Complete quizzes to discover your strengths.</p>
              </div>
            )}
          </div>
        </section>

        <section className="animate-enter-delay">
          <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold text-foreground">
            <TrendingDown className="h-5 w-5 text-rose-400" /> Needs Improvement
          </h2>
          <div className="space-y-2">
            {data.weakTopics.length > 0 ? data.weakTopics.map((t: TopicScore, i: number) => (
              <div key={i} className="glass-card flex items-center gap-3 rounded-xl p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-rose-500/15 text-xs font-bold text-rose-400">
                  {t.score}/5
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground">{t.lesson}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.course}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-10 text-center glass-card rounded-2xl">
                <Trophy className="mb-3 h-8 w-8 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">No weak areas detected. Keep going!</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: LucideIcon; label: string; value: string | number; color: string }) {
  return (
    <div className="glass-card group rounded-2xl p-4 transition duration-300 hover:-translate-y-1 hover:border-brand-400/25">
      <span className={`grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
        <Icon className="h-5 w-5 text-foreground" />
      </span>
      <p className="mt-4 font-display text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function ActivityGrid({ activityHistory }: { activityHistory: string[] }) {
  const today = new Date();
  const days = [];

  // Generate last 91 days (13 weeks)
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      active: activityHistory.includes(dateStr),
      dayOfWeek: d.getDay(),
    });
  }

  // Group into weeks
  const weeks = [];
  let currentWeek = [];
  for (const day of days) {
    if (day.dayOfWeek === 0 && currentWeek.length > 0) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
    currentWeek.push(day);
  }
  if (currentWeek.length > 0) weeks.push(currentWeek);

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <div className="flex shrink-0 flex-col gap-[3px] pt-5">
        {dayLabels.map((label, i) => (
          <div key={i} className="flex h-[14px] items-center text-[10px] text-muted-foreground">{i % 2 === 1 ? label : ''}</div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {wi === 0 && (
            <div className="mb-0.5 text-center text-[9px] text-muted-foreground">
              {new Date(week[0].date).toLocaleDateString('en', { month: 'short' })}
            </div>
          )}
          {wi > 0 && new Date(week[0].date).getDate() <= 7 && (
            <div className="mb-0.5 text-center text-[9px] text-muted-foreground">
              {new Date(week[0].date).toLocaleDateString('en', { month: 'short' })}
            </div>
          )}
          {wi > 0 && new Date(week[0].date).getDate() > 7 && (
            <div className="mb-0.5 h-[11px]" />
          )}
          {wi === 0 && Array.from({ length: week[0].dayOfWeek }).map((_, pi) => (
            <div key={`pad-${pi}`} className="h-[14px] w-[14px]" />
          ))}
          {week.map((day) => (
            <div
              key={day.date}
              className={`h-[14px] w-[14px] rounded-[3px] transition-colors ${
                day.active
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                  : 'bg-foreground/10 hover:bg-foreground/10'
              }`}
              title={`${day.date}${day.active ? ' — Active' : ''}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
