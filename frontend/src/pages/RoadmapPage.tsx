import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen, ChevronDown, ChevronRight, Flag, Map, Plus, Rocket, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function RoadmapPage() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeRoadmap, setActiveRoadmap] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ goal: '', duration: '4 weeks', skillLevel: 'beginner' });
  const navigate = useNavigate();

  useEffect(() => {
    loadRoadmaps();
  }, []);

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

  async function generateRoadmap(e) {
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

  async function viewRoadmap(id) {
    try {
      const { data } = await api.get(`/roadmaps/${id}`);
      setActiveRoadmap(data);
    } catch {
      toast.error('Failed to load roadmap');
    }
  }

  async function deleteRoadmap(id) {
    if (!window.confirm('Delete this roadmap?')) return;
    try {
      await api.delete(`/roadmaps/${id}`);
      setRoadmaps((prev) => prev.filter((r) => r._id !== id));
      if (activeRoadmap?._id === id) setActiveRoadmap(null);
    } catch {
      toast.error('Failed to delete roadmap');
    }
  }

  async function generateCourseFromTopic(topic) {
    try {
      const { data } = await api.post('/courses/generate', { prompt: topic });
      navigate(`/course/${data._id}`);
    } catch {
      toast.error('Failed to generate course');
    }
  }

  if (loading) return <div className="page-shell py-20"><LoadingSpinner text="Loading roadmaps..." /></div>;

  return (
    <div className="page-shell">
      {/* Header */}
      <section className="mb-8 animate-enter">
        <p className="eyebrow"><Map className="h-3.5 w-3.5" /> AI Roadmap Generator</p>
        <h1 className="gradient-text mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Learning Roadmaps
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Define your goal, timeline, and skill level. Our AI builds a complete week-by-week learning plan with milestones and projects.
        </p>
      </section>

      {/* Toggle Form */}
      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-primary mb-8 animate-enter-delay">
          <Plus className="h-4 w-4" /> Create New Roadmap
        </button>
      ) : (
        <form onSubmit={generateRoadmap} className="glass-card mb-8 rounded-2xl p-6 animate-enter-delay">
          <h3 className="mb-4 font-display text-lg font-bold text-white">Configure Your Roadmap</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Learning Goal</label>
              <input
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
                placeholder="e.g. Full-Stack Web Development"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50"
                maxLength={300}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Duration</label>
              <select
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50"
              >
                <option value="2 weeks">2 Weeks</option>
                <option value="4 weeks">4 Weeks</option>
                <option value="6 weeks">6 Weeks</option>
                <option value="8 weeks">8 Weeks</option>
                <option value="12 weeks">12 Weeks</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">Skill Level</label>
              <select
                value={form.skillLevel}
                onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button type="submit" disabled={generating} className="btn-primary">
              {generating ? <><LoadingSpinner small /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Roadmap</>}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar: Saved Roadmaps */}
        <aside className="animate-enter-delay">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">Saved Roadmaps</h3>
          <div className="space-y-2">
            {roadmaps.map((r) => (
              <div
                key={r._id}
                className={`glass-card group cursor-pointer rounded-xl p-3 transition hover:border-brand-400/25 ${activeRoadmap?._id === r._id ? 'border-brand-400/40 bg-brand-500/10' : ''}`}
                onClick={() => viewRoadmap(r._id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{r.goal}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{r.duration} · {r.skillLevel}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteRoadmap(r._id); }}
                    className="shrink-0 text-slate-600 opacity-0 transition hover:text-rose-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {roadmaps.length === 0 && <p className="py-4 text-center text-xs text-slate-600">No roadmaps yet.</p>}
          </div>
        </aside>

        {/* Main: Active Roadmap Detail */}
        <main>
          {activeRoadmap ? (
            <RoadmapDetail roadmap={activeRoadmap} onGenerateCourse={generateCourseFromTopic} />
          ) : (
            <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-20 text-center">
              <Map className="h-12 w-12 text-slate-700" />
              <p className="mt-4 text-sm text-slate-500">Select a roadmap or create a new one</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function RoadmapDetail({ roadmap, onGenerateCourse }) {
  const [expandedWeeks, setExpandedWeeks] = useState(new Set([1]));

  function toggleWeek(num) {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      next.has(num) ? next.delete(num) : next.add(num);
      return next;
    });
  }

  return (
    <div className="animate-enter">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white">{roadmap.goal}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {roadmap.duration} · {roadmap.skillLevel}
        </p>
        {roadmap.summary && <p className="mt-3 text-sm leading-relaxed text-slate-300">{roadmap.summary}</p>}
      </div>

      <div className="relative space-y-4">
        {/* Timeline line */}
        <div className="absolute left-[19px] top-4 bottom-4 w-px bg-gradient-to-b from-brand-500/50 via-cyan-500/30 to-transparent" />

        {(roadmap.weeks || []).map((week) => {
          const isExpanded = expandedWeeks.has(week.weekNumber);
          return (
            <div key={week.weekNumber} className="relative pl-12">
              {/* Timeline dot */}
              <div className="absolute left-2.5 top-4 h-4 w-4 rounded-full border-2 border-brand-400 bg-[#0a0d1a] shadow-lg shadow-brand-500/20" />

              <div className="glass-card overflow-hidden rounded-2xl transition hover:border-brand-400/20">
                <button
                  onClick={() => toggleWeek(week.weekNumber)}
                  className="flex w-full items-center justify-between gap-3 p-4 text-left"
                >
                  <div>
                    <p className="text-xs font-medium text-brand-300">Week {week.weekNumber}</p>
                    <h3 className="mt-0.5 font-display text-base font-bold text-white">{week.title}</h3>
                  </div>
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronRight className="h-4 w-4 text-slate-500" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-white/[0.06] p-4 pt-3 space-y-4">
                    {/* Topics */}
                    {week.topics?.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Topics</p>
                        <div className="flex flex-wrap gap-2">
                          {week.topics.map((topic, i) => (
                            <button
                              key={i}
                              onClick={() => onGenerateCourse(topic)}
                              className="group/topic flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300 transition hover:border-brand-400/30 hover:bg-brand-500/10 hover:text-white"
                              title={`Generate a course on "${topic}"`}
                            >
                              <BookOpen className="h-3 w-3 opacity-50 transition group-hover/topic:opacity-100" />
                              {topic}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Milestones */}
                    {week.milestones?.length > 0 && (
                      <div>
                        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Milestones</p>
                        <ul className="space-y-1.5">
                          {week.milestones.map((m, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                              <Flag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Project */}
                    {week.project?.title && (
                      <div className="rounded-xl border border-amber-400/15 bg-amber-500/[0.05] p-3">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-amber-300">
                          <Rocket className="h-3.5 w-3.5" /> Weekly Project
                        </p>
                        <p className="mt-1 text-sm font-medium text-white">{week.project.title}</p>
                        {week.project.description && (
                          <p className="mt-1 text-xs leading-relaxed text-slate-400">{week.project.description}</p>
                        )}
                        <button
                          onClick={() => onGenerateCourse(week.project.title)}
                          className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-300 transition hover:text-brand-200"
                        >
                          Generate course <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
