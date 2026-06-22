import { useState, useEffect } from 'react';
import { Bot, RefreshCw, Send, CheckCircle2, ChevronRight, Star, ArrowRight, Target, Lightbulb, Map } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AiAgentsPage() {
  const [activeTab, setActiveTab] = useState('reviewer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  // Data for inputs
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [goalsInput, setGoalsInput] = useState('');
  const [interestsInput, setInterestsInput] = useState('');

  const tabs = [
    { id: 'reviewer', label: 'Course Reviewer', icon: CheckCircle2, desc: 'Evaluates a course for quality and gaps.' },
    { id: 'coach', label: 'Learning Coach', icon: Bot, desc: 'Analyzes your activity and provides guidance.' },
    { id: 'planner', label: 'Revision Planner', icon: RefreshCw, desc: 'Creates a custom study schedule for you.' },
    { id: 'recommend', label: 'Recommendations', icon: Send, desc: 'Suggests what you should learn next.' },
  ];

  useEffect(() => {
    // Fetch courses for reviewer
    api.get('/courses/mine').then(res => {
      setCourses(res.data);
      if (res.data.length > 0) setSelectedCourse(res.data[0]._id);
    }).catch(console.error);
  }, []);

  const handleRunAgent = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (activeTab === 'reviewer') {
        if (!selectedCourse) throw new Error("Please select a course");
        res = await api.post('/agents/reviewer', { courseId: selectedCourse });
      } else if (activeTab === 'coach') {
        res = await api.post('/agents/coach');
      } else if (activeTab === 'planner') {
        res = await api.post('/agents/planner', { 
          upcomingGoals: goalsInput ? goalsInput.split(',').map(s => s.trim()) : ["Improve overall score"] 
        });
      } else if (activeTab === 'recommend') {
        res = await api.post('/agents/recommend', { 
          interests: interestsInput ? interestsInput.split(',').map(s => s.trim()) : ["General Programming"] 
        });
      }
      setResult(res.data);
    } catch (err: any) {
      console.error(err);
      setResult({ error: err.response?.data?.error || err.message || "Failed to run agent." });
    } finally {
      setLoading(false);
    }
  };

  const renderResult = () => {
    if (!result) return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-500">
        <Bot className="h-12 w-12 mb-4 opacity-50" />
        <p>Configure the agent above and click Run to see AI insights.</p>
      </div>
    );

    if (result.error) return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-400">
        {result.error}
      </div>
    );

    if (activeTab === 'reviewer') {
      return (
        <div className="space-y-6 animate-enter">
          <div className="flex items-center gap-4 border-b border-white/5 pb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 text-2xl font-bold text-white shadow-lg">
              {result.rating}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Course Rating</h3>
              <p className="text-sm text-slate-400">Overall AI Assessment Score</p>
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-5">
              <h4 className="mb-3 font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Strengths
              </h4>
              <ul className="space-y-2">
                {result.strengths?.map((s: string, i: number) => (
                  <li key={i} className="text-sm text-emerald-100 flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5">
              <h4 className="mb-3 font-bold text-red-400 flex items-center gap-2">
                <Target className="h-4 w-4" /> Weaknesses
              </h4>
              <ul className="space-y-2">
                {result.weaknesses?.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-red-100 flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" /> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-5">
            <h4 className="mb-3 font-bold text-blue-400 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" /> Suggested Improvements
            </h4>
            <ul className="space-y-2">
              {result.suggestedImprovements?.map((s: string, i: number) => (
                <li key={i} className="text-sm text-blue-100 flex items-start gap-2">
                  <ArrowRight className="h-4 w-4 shrink-0 text-blue-400" /> {s}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (activeTab === 'coach') {
      return (
        <div className="space-y-6 animate-enter">
          <div className="rounded-xl border border-brand-500/20 bg-brand-500/10 p-6 text-center">
            <h3 className="text-2xl font-display font-bold text-white mb-2">{result.greeting}</h3>
            <p className="text-brand-200">{result.encouragement}</p>
          </div>
          
          <div className="rounded-xl bg-slate-800/50 border border-white/5 p-5">
            <h4 className="font-bold text-white mb-2">AI Analysis</h4>
            <p className="text-sm text-slate-300">{result.analysis}</p>
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-white/5 p-5">
            <h4 className="font-bold text-white mb-4">Actionable Advice</h4>
            <ul className="space-y-3">
              {result.actionableAdvice?.map((a: string, i: number) => (
                <li key={i} className="flex items-start gap-3 rounded-lg bg-white/5 p-3 text-sm text-slate-200">
                  <Target className="h-4 w-4 shrink-0 text-brand-400 mt-0.5" />
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }

    if (activeTab === 'planner') {
      return (
        <div className="space-y-6 animate-enter">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Map className="h-5 w-5 text-indigo-400" /> {result.planName || "Revision Plan"}
          </h3>
          <div className="space-y-3">
            {result.schedule?.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-xl border border-white/5 bg-slate-800/50 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20 font-bold text-indigo-400">
                    {item.day?.substring(0,3)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{item.topic}</p>
                    <p className="text-xs text-slate-400">{item.day}</p>
                  </div>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-slate-300">
                  {item.method}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === 'recommend') {
      return (
        <div className="space-y-4 animate-enter">
          <h3 className="text-xl font-bold text-white mb-6">Recommended For You</h3>
          {result.recommendations?.map((rec: any, i: number) => (
            <div key={i} className="flex gap-4 rounded-xl border border-white/5 bg-slate-800/50 p-5 transition hover:bg-slate-800">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-indigo-500 text-white shadow-lg">
                <Star className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-bold text-white text-lg">{rec.topic}</h4>
                <p className="text-sm text-slate-400 mt-1">{rec.reason}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return <pre className="whitespace-pre-wrap text-xs text-slate-400">{JSON.stringify(result, null, 2)}</pre>;
  };

  return (
    <div className="page-shell">
      <section className="mb-10">
        <p className="eyebrow"><Bot className="h-3.5 w-3.5" /> Multi-Agent System</p>
        <h1 className="gradient-text mt-3 font-display text-3xl font-extrabold">AI Assistant Hub</h1>
        <p className="mt-2 text-sm text-slate-400">Leverage specialized AI agents to accelerate your learning journey.</p>
      </section>

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setResult(null); }}
                className={`w-full flex items-start gap-4 rounded-xl p-4 text-left transition-all ${
                  isActive
                    ? 'bg-brand-500/10 border border-brand-500/30 text-white shadow-lg'
                    : 'bg-slate-900/50 border border-transparent text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <div className={`mt-0.5 rounded-lg p-2 ${isActive ? 'bg-brand-500 text-white' : 'bg-white/5'}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h3 className={`font-bold ${isActive ? 'text-brand-300' : 'text-slate-300'}`}>{tab.label}</h3>
                  <p className="mt-1 text-xs opacity-70 leading-relaxed">{tab.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="glass-card flex flex-col rounded-2xl overflow-hidden border border-white/5">
          {/* Agent Header & Inputs */}
          <div className="border-b border-white/5 bg-white/[0.02] p-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white capitalize">{tabs.find(t => t.id === activeTab)?.label}</h2>
                
                {/* Inputs based on active tab */}
                <div className="mt-4">
                  {activeTab === 'reviewer' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select Course to Review</label>
                      <select 
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                      >
                        {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                      </select>
                    </div>
                  )}
                  {activeTab === 'planner' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Upcoming Goals (comma separated)</label>
                      <input 
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                        placeholder="e.g. Pass interview next week, Build fullstack app"
                        value={goalsInput}
                        onChange={e => setGoalsInput(e.target.value)}
                      />
                    </div>
                  )}
                  {activeTab === 'recommend' && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Specific Interests (comma separated)</label>
                      <input 
                        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white outline-none focus:border-brand-500"
                        placeholder="e.g. Machine Learning, System Design"
                        value={interestsInput}
                        onChange={e => setInterestsInput(e.target.value)}
                      />
                    </div>
                  )}
                  {activeTab === 'coach' && (
                    <p className="text-sm text-slate-400">The learning coach will analyze your recent quiz scores, activity streaks, and completed modules automatically.</p>
                  )}
                </div>
              </div>

              <button
                onClick={handleRunAgent}
                disabled={loading || (activeTab === 'reviewer' && !selectedCourse)}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-brand-500 disabled:opacity-50 shadow-lg shadow-brand-500/20 shrink-0"
              >
                {loading ? <LoadingSpinner size="sm" /> : <Bot className="h-4 w-4" />}
                Run {activeTab}
              </button>
            </div>
          </div>

          {/* Results Area */}
          <div className="p-6 bg-slate-900/20 min-h-[400px]">
            {loading ? (
              <div className="flex h-full flex-col items-center justify-center text-slate-400 py-20">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm font-medium animate-pulse">AI is analyzing context and generating insights...</p>
              </div>
            ) : (
              renderResult()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
