import { useState } from 'react';
import { Bot, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function AiAgentsPage() {
  const [activeTab, setActiveTab] = useState('reviewer');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const tabs = [
    { id: 'reviewer', label: 'Course Reviewer', icon: CheckCircle2 },
    { id: 'coach', label: 'Learning Coach', icon: Bot },
    { id: 'planner', label: 'Revision Planner', icon: RefreshCw },
    { id: 'recommend', label: 'Recommendations', icon: Send },
  ];

  const handleRunAgent = async () => {
    setLoading(true);
    setResult(null);
    try {
      let res;
      if (activeTab === 'reviewer') {
        res = await api.post('/agents/reviewer', { courseContent: "Example content", userContext: "Beginner" });
      } else if (activeTab === 'coach') {
        res = await api.post('/agents/coach', { userActivity: ["Logged in today"], recentScores: [80, 90] });
      } else if (activeTab === 'planner') {
        res = await api.post('/agents/planner', { weakTopics: ["React Hooks"], upcomingGoals: ["Pass interview"] });
      } else if (activeTab === 'recommend') {
        res = await api.post('/agents/recommend', { completedCourses: ["JS Basics"], interests: ["Backend"] });
      }
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to run agent." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-shell">
      <section className="mb-10">
        <p className="eyebrow"><Bot className="h-3.5 w-3.5" /> Multi-Agent System</p>
        <h1 className="gradient-text mt-3 font-display text-3xl font-extrabold">AI Assistant Hub</h1>
        <p className="mt-2 text-sm text-slate-400">Leverage specialized AI agents to accelerate your learning journey.</p>
      </section>

      <div className="flex gap-4 border-b border-white/10 pb-4 mb-6 overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="glass-card rounded-2xl p-6">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white capitalize">{activeTab} Agent</h2>
          <button
            onClick={handleRunAgent}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-500 disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" /> : <Bot className="h-4 w-4" />}
            Run Agent
          </button>
        </div>

        <div className="min-h-[200px] rounded-xl bg-gray-900/50 p-6 border border-white/5 font-mono text-sm text-slate-300">
          {loading ? (
            <div className="flex h-full items-center justify-center text-slate-500">
              Agent is analyzing context...
            </div>
          ) : result ? (
            <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">
              Click 'Run Agent' to execute the selected AI persona.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
