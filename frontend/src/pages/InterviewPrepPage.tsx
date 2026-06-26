import { useEffect, useState, useRef } from 'react';
import {
  Award, BookOpen, Brain, CheckCircle2, ChevronRight, Code2, MessageSquare,
  Plus, Send, Sparkles, Trash2, Trophy, XCircle, Clock, RefreshCcw, AlertTriangle, BarChart, Target, Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const TABS = [
  { key: 'mcq', label: 'MCQs', icon: CheckCircle2 },
  { key: 'theory', label: 'Theory', icon: BookOpen },
  { key: 'coding', label: 'Coding', icon: Code2 },
  { key: 'mock', label: 'Mock Interview', icon: MessageSquare },
];

export default function InterviewPrepPage() {
  const [preps, setPreps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activePrep, setActivePrep] = useState(() => {
    const saved = sessionStorage.getItem('interview_active_prep');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('interview_active_tab') || 'mcq';
  });
  const [topic, setTopic] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (activePrep && activePrep.status === 'pending') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activePrep]);

  useEffect(() => {
    if (activePrep && activePrep.status === 'pending') {
      const saved = sessionStorage.getItem(`interview_timer_${activePrep._id}`);
      if (saved) setElapsedTime(Number(saved));
      
      const interval = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          sessionStorage.setItem(`interview_timer_${activePrep._id}`, next.toString());
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activePrep]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  useEffect(() => {
    if (activePrep) sessionStorage.setItem('interview_active_prep', JSON.stringify(activePrep));
    else sessionStorage.removeItem('interview_active_prep');
  }, [activePrep]);

  useEffect(() => {
    sessionStorage.setItem('interview_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => { loadPreps(); }, []);

  async function loadPreps() {
    try {
      const { data } = await api.get('/interviews/mine');
      setPreps(data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  async function generate(e) {
    e.preventDefault();
    if (!topic.trim()) return toast.error('Enter a topic');
    
    const pendingPrep = preps.find(p => p.status === 'pending');
    if (pendingPrep) {
      if (window.confirm('You have an interview in progress. Click OK to continue previous interview, or Cancel to start a new one (previous progress will be kept in Your Packs).')) {
        viewPrep(pendingPrep._id);
        setTopic('');
        return;
      }
    }
    
    setGenerating(true);
    try {
      const { data } = await api.post('/interviews/generate', { topic: topic.trim() });
      setPreps((p) => [data, ...p]);
      setActivePrep(data);
      setActiveTab('mcq');
      setTopic('');
      setElapsedTime(0);
      toast.success('Interview pack generated!');
    } catch {
      toast.error('Failed to generate interview pack');
    } finally { setGenerating(false); }
  }

  async function regenerateInterview() {
    if (!window.confirm('Generate New Interview? This will replace your current progress.')) return;
    
    setGenerating(true);
    try {
      const { data } = await api.post('/interviews/generate', { topic: activePrep.topic });
      setPreps((p) => [data, ...p.filter(x => x._id !== activePrep._id)]);
      setActivePrep(data);
      setActiveTab('mcq');
      setElapsedTime(0);
      sessionStorage.removeItem(`interview_timer_${activePrep._id}`);
      toast.success('New interview generated!');
    } catch {
      toast.error('Failed to regenerate');
    } finally { setGenerating(false); }
  }

  async function viewPrep(id) {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      setActivePrep(data);
      setActiveTab('mcq');
    } catch {
      toast.error('Failed to load interview prep');
    }
  }

  async function deletePrep(id) {
    if (!window.confirm('Delete this interview prep?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      setPreps((p) => p.filter((x) => x._id !== id));
      if (activePrep?._id === id) setActivePrep(null);
    } catch { toast.error('Failed to delete'); }
  }

  if (loading) return <div className="page-shell py-20"><LoadingSpinner text="Loading interview preps..." /></div>;

  return (
    <div className="page-shell">
      {/* Header */}
      <section className="mb-8 animate-enter">
        <p className="eyebrow"><Brain className="h-3.5 w-3.5" /> Interview Preparation</p>
        <h1 className="gradient-text mt-3 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
          Interview Prep Studio
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          Generate dynamic MCQs, theory questions, coding challenges, and practice with an AI mock interviewer.
        </p>
      </section>

      {/* Generate Form */}
      <form onSubmit={generate} className="mb-8 flex gap-3 animate-enter-delay">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Enter a topic (e.g. React, System Design, DSA)"
          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50"
          maxLength={300}
        />
        <button type="submit" disabled={generating} className="btn-primary shrink-0">
          {generating ? <><LoadingSpinner small /> Preparing questions...</> : <><Plus className="h-4 w-4" /> Generate</>}
        </button>
      </form>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="animate-enter-delay">
          <h3 className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-500">Your Packs</h3>
          <div className="space-y-2">
            {preps.map((p) => (
              <div
                key={p._id}
                onClick={() => viewPrep(p._id)}
                className={`glass-card group cursor-pointer rounded-xl p-3 transition hover:border-brand-400/25 ${activePrep?._id === p._id ? 'border-brand-400/40 bg-brand-500/10' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{p.topic}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {p.status === 'completed' ? `Score: ${p.overallScore}%` : 'In progress'}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePrep(p._id); }}
                    className="shrink-0 text-slate-600 opacity-0 transition hover:text-rose-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {preps.length === 0 && (
              <div className="py-6 text-center text-slate-500">
                <Brain className="h-8 w-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm font-medium">No packs yet</p>
                <p className="text-xs mt-1">Generate one to start practicing</p>
              </div>
            )}
          </div>
        </aside>

        {/* Main Area */}
        <main>
          {activePrep ? (
            <div className="animate-enter">
              {/* Header inside main area */}
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card rounded-2xl p-4">
                <div>
                  <h2 className="text-lg font-bold text-white">{activePrep.topic}</h2>
                  <p className="text-sm text-slate-400">
                    {activePrep.status === 'completed' ? 'Interview Completed' : 'Interview in Progress'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {activePrep.status === 'pending' && (
                    <div className="flex items-center gap-2 rounded-lg bg-black/40 px-3 py-1.5 text-sm font-medium text-emerald-400" aria-live="polite">
                      <Clock className="h-4 w-4" />
                      {formatTime(elapsedTime)}
                    </div>
                  )}
                  {activePrep.status === 'pending' && (
                    <button 
                      onClick={regenerateInterview}
                      disabled={generating}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      <RefreshCcw className={`h-3.5 w-3.5 mr-1 ${generating ? 'animate-spin' : ''}`} />
                      Regenerate
                    </button>
                  )}
                </div>
              </div>

              {/* Progress Indicator */}
              {activePrep.status === 'pending' && (
                <div className="mb-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4" aria-label="Interview Progress">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">Progress</span>
                    <span className="text-xs text-brand-300">
                      Total: {(activePrep.mcqs?.length || 0) + (activePrep.theoryQuestions?.length || 0) + (activePrep.codingQuestions?.length || 0)} Questions
                    </span>
                  </div>
                  <div className="flex h-2 w-full overflow-hidden rounded-full bg-black/40" role="progressbar" aria-valuenow={activeTab === 'mcq' ? 25 : activeTab === 'theory' ? 50 : activeTab === 'coding' ? 75 : 100} aria-valuemin="0" aria-valuemax="100">
                    <div 
                      className="h-full bg-brand-500 transition-all duration-500"
                      style={{ width: `${
                        activeTab === 'mcq' ? 25 : 
                        activeTab === 'theory' ? 50 : 
                        activeTab === 'coding' ? 75 : 100
                      }%` }}
                    />
                  </div>
                </div>
              )}

              {activePrep.status === 'completed' ? (
                <ResultsSection prep={activePrep} />
              ) : (
                <>
                  {/* Tabs */}
                  <div 
                    role="tablist"
                    aria-label="Interview Prep Sections"
                    className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-1"
                    onKeyDown={(e) => {
                      const currentIndex = TABS.findIndex(t => t.key === activeTab);
                      let nextIndex = currentIndex;
                      if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % TABS.length;
                      if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + TABS.length) % TABS.length;
                      if (e.key === 'Home') nextIndex = 0;
                      if (e.key === 'End') nextIndex = TABS.length - 1;
                      
                      if (nextIndex !== currentIndex) {
                        e.preventDefault();
                        setActiveTab(TABS[nextIndex].key);
                        document.getElementById(`tab-${TABS[nextIndex].key}`)?.focus();
                      }
                    }}
                  >
                    {TABS.map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        id={`tab-${key}`}
                        role="tab"
                        aria-selected={activeTab === key}
                        aria-controls={`panel-${key}`}
                        tabIndex={activeTab === key ? 0 : -1}
                        onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition focus-visible:ring-2 focus-visible:outline-none ${
                          activeTab === key
                            ? 'bg-brand-500/20 text-brand-200 shadow'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" aria-hidden="true" /> {label}
                      </button>
                    ))}
                  </div>

                  <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
                  {activeTab === 'mcq' && <MCQSection prep={activePrep} onUpdate={setActivePrep} />}
                  {activeTab === 'theory' && <TheorySection prep={activePrep} onUpdate={setActivePrep} />}
                  {activeTab === 'coding' && <CodingSection prep={activePrep} />}
                  {activeTab === 'mock' && <MockSection prep={activePrep} onUpdate={setActivePrep} />}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-24 text-center border-dashed border-2 border-slate-700/50">
              <div className="h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                <Brain className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Ready to Ace Your Interview?</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-6">Select a saved prep pack from the sidebar or generate a new one to start answering questions.</p>
              <button onClick={() => document.querySelector('input')?.focus()} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" /> Generate Prep Pack
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── MCQ Section ─── */
function MCQSection({ prep, onUpdate }) {
  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem(`interview_mcq_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.mcqs.map((q) => q.userAnswer >= 0 ? q.userAnswer : -1);
  });
  const [submitted, setSubmitted] = useState(() => {
    const saved = sessionStorage.getItem(`interview_mcq_submitted_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.status === 'completed';
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(`interview_mcq_${prep._id}`, JSON.stringify(answers));
  }, [answers, prep._id]);

  useEffect(() => {
    sessionStorage.setItem(`interview_mcq_submitted_${prep._id}`, JSON.stringify(submitted));
  }, [submitted, prep._id]);

  async function submitMCQs() {
    setSubmitting(true);
    try {
      const theorySaved = sessionStorage.getItem(`interview_theory_${prep._id}`);
      const theoryAnswers = theorySaved ? JSON.parse(theorySaved) : prep.theoryQuestions.map((q) => q.userAnswer);

      const codingSaved = sessionStorage.getItem(`interview_coding_${prep._id}`);
      const codingSolutions = codingSaved ? JSON.parse(codingSaved) : prep.codingQuestions.map((q) => q.userSolution);

      const { data } = await api.post(`/interviews/${prep._id}/submit`, {
        mcqAnswers: answers,
        theoryAnswers,
        codingSolutions,
      });
      setSubmitted(true);
      onUpdate({ ...prep, ...data, status: 'completed', overallScore: data.overallScore });
      toast.success(`Score: ${data.overallScore}%`);
    } catch {
      toast.error('Failed to submit');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="space-y-4">
      {prep.mcqs.map((q, i) => {
        const userAns = submitted ? q.userAnswer : answers[i];
        return (
          <div key={i} className="glass-card rounded-2xl p-5">
            <p className="mb-3 text-sm font-medium text-white">
              <span className="mr-2 text-brand-300">Q{i + 1}.</span>{q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                let cls = 'border-white/[0.08] bg-white/[0.02] text-slate-300 hover:border-brand-400/30';
                if (submitted) {
                  if (oi === q.correctAnswer) cls = 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200';
                  else if (oi === userAns && oi !== q.correctAnswer) cls = 'border-rose-400/40 bg-rose-500/10 text-rose-200';
                } else if (userAns === oi) {
                  cls = 'border-brand-400/50 bg-brand-500/15 text-brand-200';
                }
                return (
                  <button
                    key={oi}
                    onClick={() => { if (!submitted) { const a = [...answers]; a[i] = oi; setAnswers(a); } }}
                    disabled={submitted}
                    className={`flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition ${cls}`}
                  >
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-current text-xs font-medium">
                      {String.fromCharCode(65 + oi)}
                    </span>
                    {opt}
                    {submitted && oi === q.correctAnswer && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />}
                    {submitted && oi === userAns && oi !== q.correctAnswer && <XCircle className="ml-auto h-4 w-4 text-rose-400" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <p className="mt-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-slate-400">
                💡 {q.explanation}
              </p>
            )}
          </div>
        );
      })}
      {!submitted && prep.mcqs.length > 0 && (
        <button onClick={submitMCQs} disabled={submitting} className="btn-primary">
          {submitting ? <LoadingSpinner small /> : <><Award className="h-4 w-4" /> Submit & Get Score</>}
        </button>
      )}
    </div>
  );
}

/* ─── Theory Section ─── */
function TheorySection({ prep, onUpdate }) {
  const [answers, setAnswers] = useState(() => {
    const saved = sessionStorage.getItem(`interview_theory_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.theoryQuestions.map((q) => q.userAnswer || '');
  });
  const submitted = prep.status === 'completed';

  useEffect(() => {
    sessionStorage.setItem(`interview_theory_${prep._id}`, JSON.stringify(answers));
  }, [answers, prep._id]);

  function updateAnswer(i, val) {
    const a = [...answers];
    a[i] = val;
    setAnswers(a);
  }

  return (
    <div className="space-y-4">
      {prep.theoryQuestions.map((q, i) => (
        <div key={i} className="glass-card rounded-2xl p-5">
          <p className="mb-3 text-sm font-medium text-white">
            <span className="mr-2 text-brand-300">Q{i + 1}.</span>{q.question}
          </p>
          <textarea
            value={submitted ? (q.userAnswer || '') : answers[i]}
            onChange={(e) => updateAnswer(i, e.target.value)}
            disabled={submitted}
            rows={4}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition focus:border-brand-400/50 disabled:opacity-60"
            placeholder="Type your answer..."
          />
          {submitted && q.feedback && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${q.score >= 7 ? 'bg-emerald-500/20 text-emerald-300' : q.score >= 4 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {q.score}/10
                </span>
                <span className="text-xs text-slate-500">AI Feedback</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-400">{q.feedback}</p>
              {q.idealAnswer && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-brand-300 hover:text-brand-200">View ideal answer</summary>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">{q.idealAnswer}</p>
                </details>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Coding Section ─── */
function CodingSection({ prep }) {
  const [solutions, setSolutions] = useState(() => {
    const saved = sessionStorage.getItem(`interview_coding_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.codingQuestions.map((q) => q.userSolution || '');
  });
  const submitted = prep.status === 'completed';

  useEffect(() => {
    sessionStorage.setItem(`interview_coding_${prep._id}`, JSON.stringify(solutions));
  }, [solutions, prep._id]);

  function updateSolution(i, val) {
    const s = [...solutions];
    s[i] = val;
    setSolutions(s);
  }

  return (
    <div className="space-y-4">
      {prep.codingQuestions.map((q, i) => (
        <div key={i} className="glass-card rounded-2xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" />
            <p className="text-sm font-bold text-white">{q.title}</p>
            <span className="ml-auto rounded-full border border-white/[0.08] px-2 py-0.5 text-[10px] text-slate-500">
              Challenge {i + 1}
            </span>
          </div>
          <p className="mb-3 text-sm leading-relaxed text-slate-300">{q.problemStatement}</p>
          {q.constraints && (
            <p className="mb-3 text-xs text-slate-500"><strong className="text-slate-400">Constraints:</strong> {q.constraints}</p>
          )}
          {q.starterCode && (
            <pre className="overflow-x-auto rounded-xl border border-white/[0.06] bg-black/40 p-4 text-xs text-emerald-300">
              <code>{q.starterCode}</code>
            </pre>
          )}
          <textarea
            value={submitted ? (q.userSolution || '') : solutions[i]}
            onChange={(e) => updateSolution(i, e.target.value)}
            disabled={submitted}
            rows={6}
            className="mt-3 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-sm font-mono text-emerald-300 outline-none transition focus:border-brand-400/50 disabled:opacity-60"
            placeholder="Write your code here..."
            spellCheck={false}
          />
          {q.solutionHint && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs text-amber-300 hover:text-amber-200">💡 Show hint</summary>
              <p className="mt-2 text-xs text-slate-400">{q.solutionHint}</p>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Mock Interview Section ─── */
function MockSection({ prep, onUpdate }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState(() => {
    const saved = sessionStorage.getItem(`interview_mock_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.mockChat || [];
  });
  const [abortController, setAbortController] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    sessionStorage.setItem(`interview_mock_${prep._id}`, JSON.stringify(chat));
    scrollToBottom();
  }, [chat, prep._id]);

  async function sendMessage(e) {
    e?.preventDefault();
    if (!message.trim() || sending) return;
    const text = message.trim();
    setMessage('');
    
    const newChat = [...chat, { role: 'candidate', content: text }];
    setChat(newChat);
    setSending(true);
    
    const controller = new AbortController();
    setAbortController(controller);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/interviews/${prep._id}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: text }),
        signal: controller.signal
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      
      setChat([...newChat, { role: 'interviewer', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) throw new Error(data.error);
              if (data.text) {
                assistantMessage += data.text;
                setChat(prev => {
                  const last = prev[prev.length - 1];
                  if (last.role === 'interviewer') {
                    return [...prev.slice(0, -1), { ...last, content: assistantMessage }];
                  }
                  return prev;
                });
              }
            } catch (err) {
              // Parsing error
            }
          }
        }
      }
    } catch (err) {
      if (err.name === 'AbortError') {
        toast.success('Generation stopped');
      } else {
        toast.error('Failed to send message');
        setChat(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'interviewer' && !last.content) {
            return prev.slice(0, -1);
          }
          return prev;
        });
      }
    } finally {
      setSending(false);
      setAbortController(null);
    }
  }

  function stopGenerating() {
    if (abortController) {
      abortController.abort();
    }
  }

  return (
    <div className="glass-card flex h-[600px] flex-col rounded-2xl">
      {/* Chat Header */}
      <div className="flex items-center gap-3 border-b border-white/[0.06] p-4">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg">
          <Brain className="h-4 w-4 text-white" />
        </span>
        <div>
          <p className="text-sm font-medium text-white">AI Technical Interviewer</p>
          <p className="text-xs text-slate-500">Topic: {prep.topic}</p>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {chat.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'candidate'
                ? 'rounded-br-md bg-brand-500/20 text-brand-100'
                : 'rounded-bl-md bg-white/[0.05] text-slate-300'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/[0.06] p-4">
        {sending ? (
          <button
            type="button"
            onClick={stopGenerating}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-sm font-medium text-rose-400 transition hover:bg-rose-500/20"
          >
            <XCircle className="h-4 w-4" /> Stop Generating
          </button>
        ) : (
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your answer..."
            className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50"
            disabled={sending}
          />
        )}
        <button type="submit" disabled={sending || !message.trim()} className="btn-primary shrink-0 px-4">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

function ResultsSection({ prep }) {
  const readiness = prep.readiness || 'Evaluating...';
  const strengths = prep.strengths || [];
  const weaknesses = prep.weaknesses || [];
  const recommendedTopics = prep.recommendedTopics || [];
  const aiRec = prep.summary || 'Summary not available.';

  return (
    <div className="space-y-6 animate-enter">
      {/* Overall Score */}
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="flex items-center gap-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-6 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center" aria-hidden="true">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
            <circle className="text-amber-500/20 stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
            <motion.circle
              className="text-amber-500 stroke-current drop-shadow-md"
              strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
              initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
              animate={{ strokeDashoffset: 251.2 - (251.2 * prep.overallScore) / 100 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold text-amber-400">{prep.overallScore}%</span>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="h-5 w-5 text-amber-400" />
            <p className="text-sm font-semibold uppercase tracking-wider text-amber-200/80">Overall Readiness</p>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{readiness}</h2>
          <p className="mt-1 text-sm text-slate-400 max-w-md">Based on your responses across all sections.</p>
        </div>
      </motion.div>

      {/* Breakdown */}
      <div className="grid gap-4 sm:grid-cols-3">
        <ScoreCard title="MCQ Score" score={prep.mcqScore} icon={CheckCircle2} color="brand" />
        <ScoreCard title="Theory Score" score={prep.theoryScore} icon={BookOpen} color="emerald" />
        <ScoreCard title="Coding Score" score={prep.codingQuestions?.reduce((s, q) => s + (q.score||0), 0) / (prep.codingQuestions?.length || 1) * 10} icon={Code2} color="cyan" />
      </div>

      {/* Insights */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card rounded-2xl p-5 border-emerald-500/20">
          <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-400 mb-4"><Zap className="h-4 w-4" /> Strengths</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {strengths.length > 0 ? strengths.map((s, i) => <li key={i} className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />{s}</li>) : <li className="text-slate-500">Not available</li>}
          </ul>
        </div>
        <div className="glass-card rounded-2xl p-5 border-rose-500/20">
          <h3 className="flex items-center gap-2 text-sm font-bold text-rose-400 mb-4"><AlertTriangle className="h-4 w-4" /> Weaknesses</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            {weaknesses.length > 0 ? weaknesses.map((s, i) => <li key={i} className="flex items-start gap-2"><XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />{s}</li>) : <li className="text-slate-500">Not available</li>}
          </ul>
        </div>
      </div>

      {/* Deep Feedback */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-2">Communication</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{prep.communicationFeedback || 'Not evaluated.'}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-2">Technical Depth</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{prep.technicalFeedback || 'Not evaluated.'}</p>
        </div>
        <div className="glass-card rounded-2xl p-5">
          <h3 className="text-sm font-bold text-slate-200 mb-2">Problem Solving</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{prep.problemSolvingFeedback || 'Not evaluated.'}</p>
        </div>
      </div>

      {/* AI Rec */}
      <div className="glass-card rounded-2xl p-5 border-brand-500/20">
        <h3 className="flex items-center gap-2 text-sm font-bold text-brand-400 mb-3"><Brain className="h-4 w-4" /> AI Summary & Recommendations</h3>
        <p className="text-sm text-slate-300 leading-relaxed">{aiRec}</p>
        
        {recommendedTopics.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {recommendedTopics.map((r, i) => (
              <span key={i} className="rounded-full bg-brand-500/10 border border-brand-500/20 px-3 py-1 text-xs text-brand-300">{r}</span>
            ))}
          </div>
        )}

        {prep.nextSteps && prep.nextSteps.length > 0 && (
          <div className="mt-6 border-t border-white/[0.06] pt-4">
            <h4 className="text-sm font-bold text-slate-200 mb-3">Actionable Next Steps</h4>
            <ul className="space-y-2 text-sm text-slate-400 list-disc pl-5">
              {prep.nextSteps.map((step, i) => <li key={i}>{step}</li>)}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreCard({ title, score, icon: Icon, color }) {
  const displayScore = Math.round(score || 0);
  const colors = {
    brand: 'text-brand-400 bg-brand-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/20',
    cyan: 'text-cyan-400 bg-cyan-500/20'
  };
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-300">{title}</span>
        <span className={`p-2 rounded-lg ${colors[color]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-bold text-white">{displayScore}</span>
        <span className="text-sm text-slate-500">/ 100</span>
      </div>
      <div className="mt-4 h-1.5 w-full bg-black/40 rounded-full overflow-hidden" aria-hidden="true">
        <div className={`h-full rounded-full transition-all duration-1000 ${colors[color].split(' ')[0].replace('text-', 'bg-')}`} style={{ width: `${displayScore}%` }} />
      </div>
    </div>
  );
}
