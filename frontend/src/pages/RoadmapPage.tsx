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

export default function RoadmapPage() {
  const {
    roadmaps,
    loading,
    generating,
    activeRoadmap,
    setActiveRoadmap,
    generateRoadmap,
    viewRoadmap,
    deleteRoadmap,
    generateCourseFromTopic
  } = useRoadmap();
  
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goal: '', duration: '4 weeks', skillLevel: 'beginner' });

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await generateRoadmap(form);
    if (success) setShowForm(false);
  };

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><LoadingSpinner text="Loading roadmaps..." /></div>;

  return (
    <div className="min-h-screen bg-background">
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
            <RoadmapSidebar roadmaps={roadmaps} viewRoadmap={viewRoadmap} deleteRoadmap={deleteRoadmap} />
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
            <div className="lg:col-span-8 space-y-8">
              <RoadmapHero activeRoadmap={activeRoadmap} setActiveRoadmap={setActiveRoadmap} deleteRoadmap={deleteRoadmap} />
              <div className="rounded-3xl border border-border/50 bg-background/50 p-6 lg:p-10 shadow-sm relative">
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
