import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, BookOpen, ChevronDown, ChevronRight, Flag, Map, Plus, 
  Rocket, Sparkles, Trash2, CheckCircle2, Clock, Target, Calendar, 
  Flame, LayoutGrid, Layers, Zap, Brain, MessageSquare, TerminalSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [activeRoadmap, setActiveRoadmap] = useState<any>(() => {
    const saved = sessionStorage.getItem('roadmap_active');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goal: '', duration: '4 weeks', skillLevel: 'beginner' });
  const navigate = useNavigate();

  useEffect(() => {
    loadRoadmaps();
  }, []);

  useEffect(() => {
    if (activeRoadmap) sessionStorage.setItem('roadmap_active', JSON.stringify(activeRoadmap));
    else sessionStorage.removeItem('roadmap_active');
  }, [activeRoadmap]);

  async function loadRoadmaps() {
    try {
      const { data } = await api.get('/roadmaps/mine');
      setRoadmaps(data);
    } catch {
      toast.error('Failed to load roadmaps');
    } finally {
      setLoading(false);
    }
  }

  async function generateRoadmap(e: any) {
    e.preventDefault();
    if (!form.goal.trim()) return toast.error('Please enter a learning goal');
    setGenerating(true);
    try {
      const { data } = await api.post('/roadmaps/generate', form);
      setRoadmaps((prev) => [data, ...prev]);
      setActiveRoadmap(data);
      setShowForm(false);
      toast.success('Roadmap generated!');
    } catch {
      toast.error('Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  }

  async function viewRoadmap(id: string) {
    try {
      const { data } = await api.get(`/roadmaps/${id}`);
      setActiveRoadmap(data);
    } catch {
      toast.error('Failed to load roadmap');
    }
  }

  async function deleteRoadmap(id: string) {
    if (!window.confirm('Delete this roadmap?')) return;
    try {
      await api.delete(`/roadmaps/${id}`);
      setRoadmaps((prev) => prev.filter((r) => r._id !== id));
      if (activeRoadmap?._id === id) setActiveRoadmap(null);
    } catch {
      toast.error('Failed to delete roadmap');
    }
  }

  async function generateCourseFromTopic(topic: string) {
    try {
      const { data } = await api.post('/courses/generate', { prompt: topic });
      navigate(`/course/${data._id}`);
    } catch {
      toast.error('Failed to generate course');
    }
  }

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><LoadingSpinner text="Loading roadmaps..." /></div>;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Map className="h-4 w-4" />
          </div>
          <h1 className="font-bold text-foreground tracking-tight text-lg">Career Roadmaps</h1>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="flex items-center justify-center h-10 px-4 rounded-xl bg-foreground text-background text-sm font-bold shadow-sm hover:bg-foreground/90 transition-all">
            <Plus className="h-4 w-4 mr-1.5" /> New Roadmap
          </button>
        )}
      </header>

      <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Toggle Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onSubmit={generateRoadmap} 
              className="overflow-hidden"
            >
              <div className="bg-card/30 backdrop-blur-md mb-8 rounded-3xl border border-border/60 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="font-serif text-3xl font-extrabold tracking-tight text-foreground mb-2">Configure Your Path</h3>
                    <p className="text-muted-foreground font-medium">Define your goals, and our AI will build a comprehensive step-by-step journey.</p>
                  </div>
                  <button type="button" onClick={() => setShowForm(false)} className="text-muted-foreground hover:bg-muted p-2 rounded-full transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="grid gap-6 md:grid-cols-12">
                  <div className="col-span-12 md:col-span-6">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Role / Goal</label>
                    <input
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      placeholder="e.g. Senior Frontend Engineer, Full-Stack Web Development..."
                      className="w-full h-12 rounded-xl border-2 border-border/50 bg-background/50 px-5 text-[15px] font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-inner"
                      maxLength={150}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Duration</label>
                    <select
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full h-12 rounded-xl border-2 border-border/50 bg-background/50 px-5 text-[15px] font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-inner appearance-none"
                    >
                      <option value="2 weeks">2 Weeks</option>
                      <option value="4 weeks">4 Weeks</option>
                      <option value="8 weeks">8 Weeks</option>
                      <option value="12 weeks">12 Weeks</option>
                      <option value="6 months">6 Months</option>
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Skill Level</label>
                    <select
                      value={form.skillLevel}
                      onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
                      className="w-full h-12 rounded-xl border-2 border-border/50 bg-background/50 px-5 text-[15px] font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-inner appearance-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <button type="submit" disabled={generating} className="h-12 bg-primary text-primary-foreground px-8 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
                    {generating ? <><LoadingSpinner small /> Architecting Roadmap...</> : <><Sparkles className="h-4 w-4" /> Generate Roadmap</>}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="h-12 bg-muted text-muted-foreground px-6 rounded-xl font-bold hover:text-foreground transition-all">
                    Cancel
                  </button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {!activeRoadmap ? (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground px-1">Your Blueprints</h3>
              <div className="space-y-3">
                {roadmaps.map((r) => (
                  <div
                    key={r._id}
                    className="group cursor-pointer rounded-2xl border border-border/50 bg-card/30 p-4 transition-all hover:bg-card hover:border-primary/40 hover:shadow-lg flex flex-col justify-between min-h-[120px]"
                    onClick={() => viewRoadmap(r._id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[14px] font-bold text-foreground leading-snug line-clamp-2">{r.goal}</p>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRoadmap(r._id); }}
                        className="shrink-0 p-1.5 rounded-lg text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="px-2 py-1 rounded-md bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.duration}</span>
                      <span className="px-2 py-1 rounded-md bg-muted/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.skillLevel}</span>
                    </div>
                  </div>
                ))}
                {roadmaps.length === 0 && (
                  <EmptyState
                    icon={Layers}
                    title="No blueprints yet"
                    description="Create your first roadmap."
                    className="min-h-[160px] p-6 bg-card/10 border-border/60"
                  />
                )}
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="h-full min-h-[400px] border border-border/50 rounded-3xl bg-card/10 flex flex-col items-center justify-center text-center p-10 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-6 shadow-2xl z-10">
                  <Map className="h-10 w-10 text-primary" />
                </div>
                <h2 className="font-serif text-3xl font-extrabold text-foreground mb-3 z-10">Select a Roadmap</h2>
                <p className="text-[15px] text-muted-foreground font-medium max-w-md z-10 mb-8">Choose an existing roadmap from the sidebar or generate a new tailored learning path to accelerate your career.</p>
                {!showForm && (
                  <button onClick={() => setShowForm(true)} className="h-12 bg-primary text-primary-foreground px-8 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg z-10">
                    <Plus className="h-4 w-4" /> Create Roadmap
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Col: Roadmap Detail & Timeline */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* HERO */}
              <div className="rounded-3xl border border-border/60 bg-card/30 backdrop-blur-xl p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="flex items-center gap-3 mb-6 relative z-10">
                  <button onClick={() => setActiveRoadmap(null)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                  <span className="px-3 py-1 rounded-lg border border-primary/20 bg-primary/10 text-[10px] font-bold uppercase tracking-widest text-primary">
                    {activeRoadmap.skillLevel}
                  </span>
                  <span className="px-3 py-1 rounded-lg border border-border bg-background/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {activeRoadmap.duration}
                  </span>
                </div>
                
                <h2 className="font-serif text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground mb-4 leading-[1.1] relative z-10">
                  {activeRoadmap.goal}
                </h2>
                
                {activeRoadmap.summary && (
                  <p className="text-[16px] text-muted-foreground font-medium leading-relaxed max-w-3xl relative z-10">
                    {activeRoadmap.summary}
                  </p>
                )}

                <div className="mt-8 flex items-center gap-3 relative z-10">
                  <button className="h-11 bg-foreground text-background px-6 rounded-xl font-bold hover:bg-foreground/90 transition-all shadow-md text-sm">
                    Continue Learning
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteRoadmap(activeRoadmap._id); }} className="h-11 border border-destructive/20 text-destructive bg-destructive/5 hover:bg-destructive/10 px-6 rounded-xl font-bold transition-all text-sm">
                    Delete Roadmap
                  </button>
                </div>
              </div>

              {/* TIMELINE */}
              <div className="rounded-3xl border border-border/50 bg-background/50 p-6 lg:p-10 shadow-sm relative">
                <h3 className="text-xl font-bold text-foreground mb-8">Curriculum Timeline</h3>
                
                <RoadmapTimeline roadmap={activeRoadmap} onGenerateCourse={generateCourseFromTopic} />
                
              </div>
            </div>

            {/* Right Col: Progress & Quick Actions */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              
              {/* Progress Summary */}
              <div className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur-md p-6 shadow-lg">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-6">Progress Summary</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] font-bold text-foreground">Overall Completion</span>
                      <span className="text-[13px] font-bold text-primary">0%</span>
                    </div>
                    <div className="h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/40">
                      <div className="h-full bg-primary w-[0%]" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border/50 bg-background/50 p-4 shadow-sm flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Streak</span>
                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                      </div>
                      <span className="text-2xl font-extrabold text-foreground">0 <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">days</span></span>
                    </div>
                    <div className="rounded-2xl border border-border/50 bg-background/50 p-4 shadow-sm flex flex-col justify-center">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Milestones</span>
                        <Target className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                      <span className="text-2xl font-extrabold text-foreground">0<span className="text-lg text-muted-foreground">/{activeRoadmap.weeks?.reduce((acc: number, w: any) => acc + (w.milestones?.length || 0), 0) || 0}</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-3xl border border-border/60 bg-card/40 backdrop-blur-md p-6 shadow-lg">
                <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TerminalSquare className="h-4 w-4" />
                      </div>
                      <span className="text-[14px] font-bold text-foreground">Generate Practice Lab</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </button>
                  
                  <button onClick={() => navigate('/interview-prep')} className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Brain className="h-4 w-4" />
                      </div>
                      <span className="text-[14px] font-bold text-foreground">Interview Prep</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </button>
                  
                  <button className="w-full flex items-center justify-between p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted hover:border-cyan-500/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MessageSquare className="h-4 w-4" />
                      </div>
                      <span className="text-[14px] font-bold text-foreground">Ask AI Tutor</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </button>
                </div>
              </div>
              
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function RoadmapTimeline({ roadmap, onGenerateCourse }: any) {
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([1]));

  function toggleWeek(num: number) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }

  // Local state to simulate completion for visual purposes
  const [completedWeeks, setCompletedWeeks] = useState<Set<number>>(new Set());

  function toggleCompletion(e: any, num: number) {
    e.stopPropagation();
    setCompletedWeeks(prev => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }

  const weeks = roadmap.weeks || [];

  return (
    <div className="relative">
      {/* Absolute Timeline Line */}
      <div className="absolute left-[31px] top-8 bottom-8 w-[2px] bg-border/60" />

      <div className="space-y-6">
        {weeks.map((week: any, index: number) => {
          const isExpanded = expandedWeeks.has(week.weekNumber);
          const isCompleted = completedWeeks.has(week.weekNumber);
          const isCurrent = !isCompleted && (index === 0 || completedWeeks.has(weeks[index - 1]?.weekNumber));
          
          return (
            <div key={`${roadmap._id}-${index}`} className="relative pl-20">
              
              {/* Timeline Node */}
              <div 
                className={`absolute left-4 top-5 h-8 w-8 rounded-full border-2 flex items-center justify-center z-10 transition-colors shadow-sm ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-500 text-background shadow-emerald-500/20' 
                    : isCurrent 
                      ? 'bg-primary border-primary text-primary-foreground shadow-primary/20 ring-4 ring-primary/10' 
                      : 'bg-background border-border text-muted-foreground'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[12px] font-bold">{week.weekNumber}</span>}
              </div>

              {/* Expandable Card */}
              <div className={`rounded-3xl border-2 transition-all duration-300 overflow-hidden ${
                isCurrent 
                  ? 'border-primary/40 bg-card/60 shadow-lg shadow-primary/5 ring-1 ring-primary/10' 
                  : isCompleted 
                    ? 'border-border/40 bg-muted/20 opacity-80' 
                    : 'border-border/60 bg-card/30 hover:border-primary/30 hover:bg-card/50'
              }`}>
                
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="w-full flex items-center justify-between p-6 text-left focus-visible:outline-none focus-visible:bg-muted/50"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-1.5">
                      <p className={`text-[11px] font-bold uppercase tracking-widest ${isCurrent ? 'text-primary' : isCompleted ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                        Week {week.weekNumber}
                      </p>
                      <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded border border-border bg-background/50 flex items-center gap-1">
                        <LayoutGrid className="h-3 w-3" /> {week.topics?.length || 0} Topics
                      </span>
                    </div>
                    <h3 className={`font-serif text-xl font-bold truncate ${isCompleted ? 'text-foreground/70' : 'text-foreground'}`}>
                      {week.title}
                    </h3>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <button 
                      onClick={(e) => toggleCompletion(e, week.weekNumber)}
                      className={`h-9 px-3 rounded-lg text-xs font-bold transition-colors border shadow-sm flex items-center gap-2 ${
                        isCompleted 
                          ? 'bg-background border-border text-muted-foreground hover:bg-muted' 
                          : 'bg-background border-border text-foreground hover:border-primary/50 hover:text-primary'
                      }`}
                    >
                      {isCompleted ? 'Completed' : 'Mark Complete'}
                    </button>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isExpanded ? 'bg-muted rotate-180' : 'hover:bg-muted'}`}>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      key={`content-${roadmap._id}-${index}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="overflow-hidden bg-background/50 border-t border-border/50"
                    >
                      <div className="p-6 space-y-8">
                        
                        {/* Topics Section */}
                        {week.topics?.length > 0 && (
                          <div>
                            <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-foreground mb-4">
                              <BookOpen className="h-4 w-4 text-primary" /> Key Topics
                            </h4>
                            <div className="flex flex-wrap gap-2.5">
                              {week.topics.map((topic: string, i: number) => (
                                <button
                                  key={i}
                                  onClick={() => onGenerateCourse(topic)}
                                  className="group flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-2 text-[13px] font-medium text-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                  title={`Generate a course on "${topic}"`}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                  {topic}
                                  <ChevronRight className="h-3 w-3 opacity-0 -ml-1 text-primary group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Milestones */}
                          {week.milestones?.length > 0 && (
                            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
                              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">
                                <Flag className="h-4 w-4" /> Milestones
                              </h4>
                              <ul className="space-y-3">
                                {week.milestones.map((m: string, i: number) => (
                                  <li key={i} className="flex items-start gap-3 text-[14px] text-foreground/90 font-medium leading-relaxed">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                                    {m}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Project */}
                          {week.project?.title && (
                            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm flex flex-col h-full">
                              <h4 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-500 mb-3">
                                <Rocket className="h-4 w-4" /> Weekly Project
                              </h4>
                              <p className="text-[15px] font-bold text-foreground mb-2">{week.project.title}</p>
                              {week.project.description && (
                                <p className="text-[14px] leading-relaxed text-muted-foreground font-medium mb-5 flex-1">
                                  {week.project.description}
                                </p>
                              )}
                              <button
                                onClick={() => onGenerateCourse(week.project.title)}
                                className="mt-auto flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-background border border-amber-500/30 text-[13px] font-bold text-amber-600 dark:text-amber-500 hover:bg-amber-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                              >
                                Build Project <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
