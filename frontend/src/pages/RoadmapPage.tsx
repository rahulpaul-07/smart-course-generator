import { useState } from 'react';
import { Map, Plus, Sparkles, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../components/LoadingSpinner';
import { useRoadmap } from '../hooks/useRoadmap';
import { RoadmapHero } from '../components/roadmap/RoadmapHero';
import { RoadmapSidebar } from '../components/roadmap/RoadmapSidebar';
import { RoadmapTimeline } from '../components/roadmap/RoadmapTimeline';
import { RoadmapStats } from '../components/roadmap/RoadmapStats';
import { RoadmapActions } from '../components/roadmap/RoadmapActions';
import { RoadmapSkeleton } from '../components/roadmap/RoadmapSkeleton';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';

export default function RoadmapPage() {
  const {
    roadmaps,
    loading,
    error,
    generating,
    activeRoadmap,
    setActiveRoadmap,
    generateRoadmap,
    viewRoadmap,
    deleteRoadmap,
    generateCourseFromTopic,
    refetch
  } = useRoadmap();
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goal: '', duration: '4 weeks', skillLevel: 'beginner' });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await generateRoadmap(form);
    if (success) setShowForm(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Map className="h-4 w-4" />
            </div>
            <h1 className="font-bold text-foreground tracking-tight text-lg">Career Roadmaps</h1>
          </div>
        </header>
        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
          <RoadmapSkeleton />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
              <Map className="h-4 w-4" />
            </div>
            <h1 className="font-bold text-foreground tracking-tight text-lg">Career Roadmaps</h1>
          </div>
        </header>
        <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10 flex items-center justify-center min-h-[60vh]">
          <ErrorState 
            title="Unable to load roadmap" 
            description="We couldn't load your roadmap. Please try again." 
            onRetry={refetch} 
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
            <Map className="h-4 w-4" />
          </div>
          <h1 className="font-bold text-foreground tracking-tight text-lg">Career Roadmaps</h1>
        </div>
        {!showForm && (
          <Button variant="outline" onClick={() => setShowForm(true)} className="flex items-center justify-center h-10 px-4 rounded-xl font-bold shadow-sm">
            <Plus className="h-4 w-4 mr-1.5" /> New Roadmap
          </Button>
        )}
      </header>

      <main className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-10">
        <AnimatePresence>
          {showForm && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              onSubmit={handleGenerate} 
              className="overflow-hidden"
            >
              <div className="bg-card/30 backdrop-blur-md mb-8 rounded-2xl border border-border/30 p-8 shadow-md">
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
                    <label htmlFor="goal-input" className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Target Role / Goal</label>
                    <input
                      id="goal-input"
                      value={form.goal}
                      onChange={(e) => setForm({ ...form, goal: e.target.value })}
                      placeholder="e.g. Senior Frontend Engineer, Full-Stack Web Development..."
                      className="w-full h-12 rounded-xl border-2 border-border/30 bg-background/50 px-5 text-[15px] font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-inner"
                      maxLength={150}
                    />
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label htmlFor="duration-select" className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Duration</label>
                    <select
                      id="duration-select"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      className="w-full h-12 rounded-xl border-2 border-border/30 bg-background/50 px-5 text-[15px] font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-inner appearance-none"
                    >
                      <option value="2 weeks">2 Weeks</option>
                      <option value="4 weeks">4 Weeks</option>
                      <option value="8 weeks">8 Weeks</option>
                      <option value="12 weeks">12 Weeks</option>
                      <option value="6 months">6 Months</option>
                    </select>
                  </div>
                  <div className="col-span-6 md:col-span-3">
                    <label htmlFor="skill-level-select" className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">Skill Level</label>
                    <select
                      id="skill-level-select"
                      value={form.skillLevel}
                      onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
                      className="w-full h-12 rounded-xl border-2 border-border/30 bg-background/50 px-5 text-[15px] font-medium text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-inner appearance-none"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>
                <div className="mt-8 flex gap-3">
                  <Button type="submit" disabled={generating} className={`h-12 px-8 rounded-xl font-bold shadow-lg ${generating ? 'cursor-progress' : ''}`}>
                    {generating ? <><LoadingSpinner small /> Architecting Roadmap...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Roadmap</>}
                  </Button>
                  <Button variant="ghost" type="button" onClick={() => setShowForm(false)} className="h-12 px-6 rounded-xl font-bold">
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {!activeRoadmap ? (
          <div className="grid lg:grid-cols-4 gap-8">
            <RoadmapSidebar roadmaps={roadmaps} viewRoadmap={viewRoadmap} deleteRoadmap={deleteRoadmap} />
            <div className="lg:col-span-3">
              {roadmaps.length === 0 && !showForm ? (
                <EmptyState
                  icon={Map}
                  title="No Roadmaps Yet"
                  description="Choose an existing roadmap from the sidebar or generate a new tailored learning path to accelerate your career."
                  action={<Button onClick={() => setShowForm(true)}>Generate Roadmap</Button>}
                />
              ) : (
                <div className="h-full min-h-[400px] border border-border/30 rounded-2xl bg-card/10 flex flex-col items-center justify-center text-center p-10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none" />
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center mb-6 shadow-lg z-10">
                    <Map className="h-10 w-10 text-primary" />
                  </div>
                  <h2 className="font-serif text-3xl font-extrabold text-foreground mb-3 z-10">Select a Roadmap</h2>
                  <p className="text-[15px] text-muted-foreground font-medium max-w-md z-10 mb-8">Choose an existing roadmap from the sidebar or generate a new tailored learning path to accelerate your career.</p>
                  {!showForm && (
                    <Button onClick={() => setShowForm(true)} className="h-12 px-8 rounded-xl font-bold shadow-lg z-10">
                      <Plus className="h-4 w-4 mr-2" /> Create Roadmap
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-8">
              <RoadmapHero activeRoadmap={activeRoadmap} setActiveRoadmap={setActiveRoadmap} deleteRoadmap={deleteRoadmap} />
              <div className="rounded-2xl border border-border/30 bg-background/50 p-6 lg:p-10 shadow-sm relative">
                <h3 className="text-xl font-bold text-foreground mb-8">Curriculum Timeline</h3>
                <RoadmapTimeline roadmap={activeRoadmap} onGenerateCourse={generateCourseFromTopic} />
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              <RoadmapStats activeRoadmap={activeRoadmap} />
              <RoadmapActions />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
