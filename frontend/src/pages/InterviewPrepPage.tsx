import { useEffect, useState, useRef, Suspense } from 'react';
import {
  Award, BookOpen, Brain, CheckCircle2, ChevronRight, Code2, MessageSquare,
  Sparkles, Trash2, Trophy, XCircle, Clock, AlertTriangle, Zap, Copy, Check, X, ArrowLeft, Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import api from '../utils/api';
import { PageContainer } from '../components/layout/PageContainer';
import LoadingSpinner from '../components/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import React from 'react';

const TABS = [
  { key: 'mcq', label: 'MCQs', icon: CheckCircle2 },
  { key: 'theory', label: 'Theory', icon: BookOpen },
  { key: 'coding', label: 'Coding', icon: Code2 }
];

export default function InterviewPrepPage() {
  const [preps, setPreps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  const [activePrep, setActivePrep] = useState<any>(() => {
    const saved = sessionStorage.getItem('interview_active_prep');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('interview_active_tab') || 'mcq';
  });
  
  const [topic, setTopic] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isMobileCoachOpen, setIsMobileCoachOpen] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: any) => {
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

  const formatTime = (seconds: number) => {
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

  async function generate(e: any) {
    e.preventDefault();
    if (!topic.trim()) return toast.error('Enter a topic');
    
    const pendingPrep = preps.find(p => p.status === 'pending');
    if (pendingPrep) {
      if (window.confirm('You have an interview in progress. Click OK to continue previous interview, or Cancel to start a new one.')) {
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

  async function viewPrep(id: string) {
    try {
      const { data } = await api.get(`/interviews/${id}`);
      setActivePrep(data);
      setActiveTab('mcq');
    } catch {
      toast.error('Failed to load interview prep');
    }
  }

  async function deletePrep(id: string) {
    if (!window.confirm('Delete this interview prep?')) return;
    try {
      await api.delete(`/interviews/${id}`);
      setPreps((p) => p.filter((x) => x._id !== id));
      if (activePrep?._id === id) setActivePrep(null);
    } catch { toast.error('Failed to delete'); }
  }

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><LoadingSpinner text="Loading interview workspace..." /></div>;

  if (!activePrep) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-12 selection:bg-primary/20">
        <div className="max-w-5xl mx-auto space-y-16">
          <section className="text-center space-y-6 max-w-2xl mx-auto pt-10">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 mb-2 shadow-2xl shadow-primary/10">
              <Brain className="h-10 w-10 text-primary" />
            </div>
            <h1 className="font-serif text-5xl font-extrabold tracking-tight text-foreground md:text-6xl drop-shadow-sm">
              AI Interview Platform
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl font-medium leading-relaxed max-w-xl mx-auto">
              Master your next technical interview. Generate comprehensive mock interviews with MCQs, coding challenges, and a live AI coach.
            </p>
          </section>

          <form onSubmit={generate} className="max-w-2xl mx-auto relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/30 via-cyan-400/30 to-primary/30 opacity-20 blur-xl transition duration-500 group-hover:opacity-40" />
            <div className="relative flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-2xl border border-border shadow-xl">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="E.g. Senior Frontend Engineer, System Design..."
                className="flex-1 h-12 bg-transparent px-5 text-[15px] font-medium text-foreground outline-none placeholder:text-muted-foreground"
                maxLength={100}
              />
              <button type="submit" disabled={generating} className="h-12 bg-primary text-primary-foreground px-8 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md disabled:opacity-70">
                {generating ? <><LoadingSpinner small /> Preparing...</> : <><Sparkles className="h-4 w-4" /> Generate Mock</>}
              </button>
            </div>
          </form>

          <div className="pt-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Your Active Sessions</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {preps.map((p) => (
                <div key={p._id} onClick={() => viewPrep(p._id)} className="group cursor-pointer rounded-2xl border border-border/60 bg-card/40 p-6 transition-all duration-300 hover:bg-card hover:border-primary/40 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1 flex flex-col justify-between min-h-[180px]">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {p.status}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); deletePrep(p._id); }} className="p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h4 className="font-bold text-lg text-foreground line-clamp-2 leading-snug">{p.topic}</h4>
                  </div>
                  {p.status === 'completed' && (
                    <div className="mt-6 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-emerald-500" />
                      <p className="text-sm text-muted-foreground font-semibold">Score: <span className="text-foreground">{p.overallScore}%</span></p>
                    </div>
                  )}
                </div>
              ))}
              {preps.length === 0 && (
                <div className="col-span-full">
                  <EmptyState
                    icon={BookOpen}
                    title="No interview sessions yet"
                    description="Generate your first mock interview above to start practicing."
                    className="min-h-[250px] bg-card/10 border-border/50"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Layout logic when activePrep exists ---
  const totalQuestions = (activePrep.mcqs?.length || 0) + (activePrep.theoryQuestions?.length || 0) + (activePrep.codingQuestions?.length || 0);

  return (
    <div className="grid h-[calc(100vh-4rem)] overflow-hidden lg:grid-cols-[280px_1fr_400px] bg-background selection:bg-primary/20">
      
      {/* Sidebar: Navigation (Left) */}
      <aside className="hidden lg:flex flex-col border-r border-border/50 bg-card/30 backdrop-blur-3xl overflow-y-auto">
        <div className="p-6 pb-4">
          <button 
            onClick={() => setActivePrep(null)} 
            className="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg text-[13px] font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors mb-8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="h-4 w-4" /> Exit Interview
          </button>
          
          <div className="space-y-4 mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary flex items-center gap-2">
              <Brain className="w-3.5 h-3.5" /> Technical Interview
            </p>
            <h2 className="font-serif text-2xl font-bold text-foreground leading-tight line-clamp-3">{activePrep.topic}</h2>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className={`px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-widest ${activePrep.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 shadow-sm' : 'bg-amber-500/10 border-amber-500/20 text-amber-500 shadow-sm'}`}>
                {activePrep.status}
              </span>
              <span className="px-2.5 py-1 rounded-md border border-border bg-background/50 text-[10px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
                {totalQuestions} Questions
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 flex-1">
          {activePrep.status === 'pending' && (
            <div className="mb-10 rounded-xl bg-background border border-border/60 p-4 shadow-sm flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"><Clock className="h-3.5 w-3.5" /> Time</span>
              <span className="font-mono text-sm font-bold text-primary">{formatTime(elapsedTime)}</span>
            </div>
          )}

          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 pl-1">Sections</p>
          <nav 
            className="space-y-1.5" 
            role="tablist"
            onKeyDown={(e) => {
              const keys = TABS.map(t => t.key);
              const currentIndex = keys.indexOf(activeTab);
              let nextIndex = currentIndex;
              
              if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                nextIndex = (currentIndex + 1) % keys.length;
                e.preventDefault();
              } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                nextIndex = (currentIndex - 1 + keys.length) % keys.length;
                e.preventDefault();
              } else if (e.key === 'Home') {
                nextIndex = 0;
                e.preventDefault();
              } else if (e.key === 'End') {
                nextIndex = keys.length - 1;
                e.preventDefault();
              }
              
              if (nextIndex !== currentIndex) {
                setActiveTab(keys[nextIndex]);
              }
            }}
          >
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                tabIndex={activeTab === tab.key ? 0 : -1}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full group flex items-center justify-between px-4 py-3 rounded-xl text-[13px] font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  activeTab === tab.key 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-card border border-transparent hover:border-border/50 hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.key ? 'text-primary-foreground/90' : 'text-muted-foreground group-hover:text-foreground'}`} />
                  {tab.label}
                </div>
                {activePrep.status === 'completed' && <CheckCircle2 className={`h-3.5 w-3.5 ${activeTab === tab.key ? 'opacity-80' : 'opacity-40'}`} />}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Workspace (Center) */}
      <main className="flex-1 overflow-y-auto bg-background/95 scroll-smooth relative flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setActivePrep(null)} className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></button>
            <span className="font-semibold text-foreground truncate text-sm">{activePrep.topic}</span>
          </div>
          <div className="flex items-center gap-2">
            {activePrep.status === 'pending' && <span className="font-mono text-xs font-bold text-primary mr-2">{formatTime(elapsedTime)}</span>}
            <button onClick={() => setIsMobileCoachOpen(true)} className="flex items-center justify-center h-8 w-8 rounded-lg bg-primary/10 text-primary">
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 px-5 py-8 md:p-10 lg:p-16 w-full max-w-4xl mx-auto">
          {activePrep.status === 'completed' ? (
            <ResultsSection prep={activePrep} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full"
              >
                {/* Mobile Tabs */}
                <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-border/50">
                  {TABS.map((tab) => (
                    <button 
                      key={tab.key} 
                      onClick={() => setActiveTab(tab.key)} 
                      className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                        activeTab === tab.key 
                          ? 'bg-primary text-primary-foreground shadow-sm' 
                          : 'bg-card border border-border/50 text-muted-foreground'
                      }`}
                    >
                      <tab.icon className="h-3.5 w-3.5" /> {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'mcq' && <MCQSection prep={activePrep} onUpdate={setActivePrep} />}
                {activeTab === 'theory' && <TheorySection prep={activePrep} />}
                {activeTab === 'coding' && <CodingSection prep={activePrep} />}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {/* AI Interview Coach (Right) */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] lg:static lg:w-[400px] lg:flex flex-col border-l border-border/50 bg-card/20 backdrop-blur-3xl transition-transform duration-300 ${isMobileCoachOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col shadow-2xl lg:shadow-none bg-background lg:bg-transparent">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/50 bg-card/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground leading-tight tracking-tight">AI Interview Coach</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
                </p>
              </div>
            </div>
            <button onClick={() => setIsMobileCoachOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <MockSection prep={activePrep} onUpdate={setActivePrep} />
          </div>
        </div>
      </aside>

    </div>
  );
}

/* ─── MCQ Section ─── */
function MCQSection({ prep, onUpdate }: any) {
  const [answers, setAnswers] = useState<number[]>(() => {
    const saved = sessionStorage.getItem(`interview_mcq_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.mcqs.map((q: any) => q.userAnswer >= 0 ? q.userAnswer : -1);
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
      const theoryAnswers = theorySaved ? JSON.parse(theorySaved) : prep.theoryQuestions.map((q: any) => q.userAnswer);

      const codingSaved = sessionStorage.getItem(`interview_coding_${prep._id}`);
      const codingSolutions = codingSaved ? JSON.parse(codingSaved) : prep.codingQuestions.map((q: any) => q.userSolution);

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
    <div className="space-y-8">
      <div className="mb-10 pb-6 border-b border-border/40">
        <h2 className="text-3xl font-extrabold font-serif tracking-tight text-foreground mb-2">Multiple Choice</h2>
        <p className="text-muted-foreground font-medium">Select the best answer for each question.</p>
      </div>
      
      {prep.mcqs.map((q: any, i: number) => {
        const userAns = submitted ? q.userAnswer : answers[i];
        return (
          <div key={i} className="rounded-3xl border border-border/60 bg-card/20 backdrop-blur-md p-8 shadow-sm transition-all hover:shadow-md">
            <p className="mb-6 text-[15px] font-semibold text-foreground leading-relaxed flex items-start gap-4">
              <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm mt-0.5">
                {i + 1}
              </span>
              <span className="pt-1.5">{q.question}</span>
            </p>
            <div className="space-y-3 pl-12">
              {q.options.map((opt: string, oi: number) => {
                let isSelected = userAns === oi;
                let isCorrect = submitted && oi === q.correctAnswer;
                let isWrong = submitted && oi === userAns && oi !== q.correctAnswer;
                
                let cls = 'border-border/50 bg-background hover:border-primary/40 hover:bg-muted/50 text-foreground';
                if (submitted) {
                  if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium';
                  else if (isWrong) cls = 'border-destructive bg-destructive/10 text-destructive font-medium';
                  else cls = 'border-border/30 bg-background/50 opacity-40';
                } else if (isSelected) {
                  cls = 'border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary/20 shadow-sm';
                }

                return (
                  <button
                    key={oi}
                    onClick={() => { if (!submitted) { const a = [...answers]; a[i] = oi; setAnswers(a); } }}
                    disabled={submitted}
                    className={`group relative flex w-full items-start gap-4 rounded-xl border p-4 text-left text-[14px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${cls}`}
                  >
                    <span className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold transition-colors ${isSelected && !submitted ? 'bg-primary border-primary text-primary-foreground' : 'border-border/80 text-muted-foreground'} ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-background' : ''} ${isWrong ? 'bg-destructive border-destructive text-background' : ''}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="pt-0.5 flex-1 leading-relaxed">{opt}</span>
                    {isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 absolute right-4 top-4" />}
                    {isWrong && <XCircle className="h-5 w-5 shrink-0 text-destructive absolute right-4 top-4" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 ml-12 rounded-xl border border-primary/20 bg-primary/5 p-5 text-[14px] leading-relaxed text-foreground/90">
                <span className="font-bold text-primary mb-2 block flex items-center gap-2"><BookOpen className="w-4 h-4" /> Explanation</span>
                {q.explanation}
              </motion.div>
            )}
          </div>
        );
      })}
      
      {!submitted && prep.mcqs.length > 0 && (
        <div className="pt-8 border-t border-border/40 sticky bottom-0 z-10 bg-background/95 backdrop-blur-xl pb-8 flex justify-end">
          <button onClick={submitMCQs} disabled={submitting} className="h-12 bg-foreground text-background px-8 rounded-xl font-bold hover:bg-foreground/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-70">
            {submitting ? <><LoadingSpinner small /> Evaluating...</> : <><Award className="h-5 w-5" /> Submit Assessment</>}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Theory Section ─── */
function TheorySection({ prep }: any) {
  const [answers, setAnswers] = useState<string[]>(() => {
    const saved = sessionStorage.getItem(`interview_theory_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.theoryQuestions.map((q: any) => q.userAnswer || '');
  });
  const submitted = prep.status === 'completed';

  useEffect(() => {
    sessionStorage.setItem(`interview_theory_${prep._id}`, JSON.stringify(answers));
  }, [answers, prep._id]);

  function updateAnswer(i: number, val: string) {
    const a = [...answers];
    a[i] = val;
    setAnswers(a);
  }

  return (
    <div className="space-y-10">
      <div className="mb-10 pb-6 border-b border-border/40">
        <h2 className="text-3xl font-extrabold font-serif tracking-tight text-foreground mb-2">Theory & Concepts</h2>
        <p className="text-muted-foreground font-medium">Provide detailed, comprehensive answers.</p>
      </div>

      {prep.theoryQuestions.map((q: any, i: number) => {
        const textValue = submitted ? (q.userAnswer || '') : answers[i];
        const wordCount = textValue.trim().split(/\s+/).filter(Boolean).length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));
        
        return (
          <div key={i} className="rounded-3xl border border-border/60 bg-card/20 backdrop-blur-md p-8 shadow-sm flex flex-col gap-6">
            <p className="text-[15px] font-semibold text-foreground leading-relaxed flex items-start gap-4">
              <span className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary text-sm mt-0.5">
                {i + 1}
              </span>
              <span className="pt-1.5">{q.question}</span>
            </p>
            <div className="relative pl-12">
              <textarea
                value={textValue}
                onChange={(e) => updateAnswer(i, e.target.value)}
                disabled={submitted}
                rows={8}
                className="w-full rounded-2xl border border-border bg-background/50 p-5 text-[15px] leading-relaxed text-foreground outline-none transition focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-inner resize-y disabled:opacity-70 disabled:cursor-not-allowed placeholder:text-muted-foreground/60"
                placeholder="Structure your answer clearly. Consider using bullet points or real-world examples..."
              />
              {!submitted && (
                <div className="absolute bottom-4 right-4 flex items-center gap-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-border/50 shadow-sm pointer-events-none">
                  <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> ~{readTime}m read</span>
                  <span className={`flex items-center gap-1.5 ${wordCount < 30 ? 'text-amber-500' : 'text-emerald-500'}`}>
                    <BookOpen className="w-3 h-3" /> {wordCount} words
                  </span>
                </div>
              )}
            </div>
            
            {submitted && q.feedback && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 ml-12 space-y-5 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-border/50 pb-4">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Evaluation</span>
                  <span className={`px-3 py-1 rounded-md text-xs font-bold ${q.score >= 7 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : q.score >= 4 ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-destructive/10 text-destructive border border-destructive/20'}`}>
                    Score: {q.score}/10
                  </span>
                </div>
                <p className="text-[15px] leading-relaxed text-foreground/90">{q.feedback}</p>
                {q.idealAnswer && (
                  <details className="group mt-6 border border-border rounded-xl bg-background/50 overflow-hidden">
                    <summary className="cursor-pointer text-[13px] font-bold uppercase tracking-wider text-primary p-4 hover:bg-muted/50 list-none flex justify-between items-center transition-colors focus-visible:outline-none focus-visible:bg-muted">
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> View Ideal Answer</span>
                      <ChevronRight className="h-4 w-4 transition-transform duration-200 group-open:rotate-90" />
                    </summary>
                    <div className="p-5 border-t border-border/50 text-[14px] leading-relaxed text-muted-foreground bg-background">
                      {q.idealAnswer}
                    </div>
                  </details>
                )}
              </motion.div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Coding Section ─── */
function CodingSection({ prep }: any) {
  const [solutions, setSolutions] = useState<string[]>(() => {
    const saved = sessionStorage.getItem(`interview_coding_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.codingQuestions.map((q: any) => q.userSolution || '');
  });
  const submitted = prep.status === 'completed';

  useEffect(() => {
    sessionStorage.setItem(`interview_coding_${prep._id}`, JSON.stringify(solutions));
  }, [solutions, prep._id]);

  function updateSolution(i: number, val: string) {
    const s = [...solutions];
    s[i] = val;
    setSolutions(s);
  }

  return (
    <div className="space-y-10">
      <div className="mb-10 pb-6 border-b border-border/40">
        <h2 className="text-3xl font-extrabold font-serif tracking-tight text-foreground mb-2">Coding Challenges</h2>
        <p className="text-muted-foreground font-medium">Write clean, optimized, and robust code.</p>
      </div>

      {prep.codingQuestions.map((q: any, i: number) => (
        <div key={i} className="rounded-3xl border border-border/60 bg-card/20 backdrop-blur-md shadow-sm overflow-hidden flex flex-col transition-all">
          <div className="border-b border-border/50 bg-muted/40 p-5 px-8 flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-foreground flex-1 tracking-tight">{q.title}</h3>
            <span className="rounded-lg border border-border/80 bg-background px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
              Problem {i + 1}
            </span>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="prose prose-sm prose-invert max-w-none text-foreground/90 leading-relaxed text-[15px]">
              <p>{q.problemStatement}</p>
            </div>
            
            {q.constraints && (
              <div className="rounded-xl border border-border bg-card/50 p-5 shadow-sm">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Constraints</h4>
                <p className="text-sm font-mono text-primary/90 bg-primary/5 p-2 rounded-lg border border-primary/10 inline-block">{q.constraints}</p>
              </div>
            )}
            
            {q.starterCode && (
              <div className="rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-[#0D0D0D]">
                <div className="bg-[#1a1a1a] px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground border-b border-white/5 flex items-center justify-between">
                  <span>Starter Code</span>
                  <span className="text-primary/70">JavaScript</span>
                </div>
                <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent' }}>
                  {q.starterCode}
                </SyntaxHighlighter>
              </div>
            )}
            
            <div className="relative rounded-2xl overflow-hidden border-2 border-border/60 shadow-inner group transition-colors focus-within:border-primary/50">
              <div className="absolute top-0 right-0 left-0 h-12 bg-[#1a1a1a] border-b border-white/5 flex items-center px-5 justify-between z-10">
                <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2"><Code2 className="w-3.5 h-3.5" /> Your Workspace</span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary font-bold">JS</span>
              </div>
              <textarea
                value={submitted ? (q.userSolution || '') : solutions[i]}
                onChange={(e) => updateSolution(i, e.target.value)}
                disabled={submitted}
                rows={12}
                className="w-full bg-[#0D0D0D] p-5 pt-16 text-[14px] font-mono leading-relaxed text-emerald-400 outline-none resize-y disabled:opacity-90 placeholder:text-muted-foreground/30 relative z-0"
                placeholder="// Write your optimized solution here..."
                spellCheck={false}
              />
            </div>
            
            {q.solutionHint && !submitted && (
              <details className="group border border-amber-500/30 bg-amber-500/5 rounded-xl overflow-hidden transition-all duration-300">
                <summary className="cursor-pointer text-[13px] font-bold uppercase tracking-wider text-amber-500 p-4 hover:bg-amber-500/10 transition-colors list-none flex items-center justify-between focus-visible:outline-none focus-visible:bg-amber-500/10">
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Need a hint?</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                </summary>
                <div className="px-5 pb-5 text-[14px] text-foreground/80 leading-relaxed border-t border-amber-500/10 pt-4">
                  {q.solutionHint}
                </div>
              </details>
            )}

            {submitted && q.feedback && (
              <div className="mt-8 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 border-b border-primary/10 pb-4">
                  <h4 className="font-bold text-[13px] uppercase tracking-widest text-primary flex items-center gap-2"><Brain className="w-4 h-4" /> Code Evaluation</h4>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-md shadow-sm">Score: {q.score}/10</span>
                </div>
                <p className="text-[14px] text-foreground/90 leading-relaxed mb-6">{q.feedback}</p>
                {q.idealSolution && (
                  <div className="rounded-2xl overflow-hidden border border-border/50 shadow-2xl bg-[#0D0D0D]">
                    <div className="bg-[#1a1a1a] px-5 py-3 text-[11px] font-mono font-bold uppercase tracking-widest text-emerald-500 border-b border-white/5 flex items-center justify-between">
                      <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5" /> Ideal Solution</span>
                      <span>JavaScript</span>
                    </div>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, padding: '1.25rem', background: 'transparent' }}>
                      {q.idealSolution}
                    </SyntaxHighlighter>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Mock Interview Section (Coach Sidebar) ─── */
const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-4 rounded-xl overflow-hidden bg-[#0D0D0D] border border-border/40 shadow-xl">
      <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-white/5">
        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{language || 'code'}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded">
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <div className="text-[12px] overflow-x-auto tab-size-4">
        <SyntaxHighlighter language={language || 'text'} style={vscDarkPlus} customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }} PreTag="div">
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

function MockSection({ prep }: any) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [chat, setChat] = useState<any[]>(() => {
    const saved = sessionStorage.getItem(`interview_mock_${prep._id}`);
    if (saved) return JSON.parse(saved);
    return prep.mockChat || [{ role: 'interviewer', content: `Hello! I'm your AI interviewer for the **${prep.topic}** role. Are you ready to begin?` }];
  });
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    sessionStorage.setItem(`interview_mock_${prep._id}`, JSON.stringify(chat));
    setTimeout(scrollToBottom, 50);
  }, [chat, prep._id]);

  async function sendMessage(e?: any) {
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

      if (!response.ok) throw new Error('Network error');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      
      setChat([...newChat, { role: 'interviewer', content: '' }]);

      while (true) {
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
            } catch (err) {}
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        toast.error('Failed to send message');
        setChat(prev => {
          const last = prev[prev.length - 1];
          if (last.role === 'interviewer' && !last.content) return prev.slice(0, -1);
          return prev;
        });
      }
    } finally {
      setSending(false);
      setAbortController(null);
    }
  }

  function stopGenerating() {
    if (abortController) abortController.abort();
  }

  return (
    <div className="flex h-full flex-col bg-background/50">
      <div className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth">
        <AnimatePresence initial={false}>
          {chat.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              key={i} 
              className={`flex w-full ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                msg.role === 'candidate'
                  ? 'rounded-br-sm bg-foreground text-background font-medium'
                  : 'rounded-tl-sm bg-card border border-border/60 text-foreground/90'
              }`}>
                {msg.role === 'candidate' ? (
                  msg.content
                ) : (
                  <div className="prose prose-sm prose-invert max-w-none prose-p:my-1.5 prose-p:leading-relaxed prose-pre:my-0 prose-pre:p-0 prose-pre:bg-transparent">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        code: ({ children, className, node, ...props }: any) => {
                          const match = /language-(\w+)/.exec(className || '');
                          if (match || String(children).includes('\n')) {
                            return <CodeBlock language={match?.[1] || 'text'} value={String(children).replace(/\n$/, '')} />;
                          }
                          return <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 font-mono text-[12px]" {...props}>{children}</code>;
                        },
                      }}
                    >
                      {msg.content || '...'}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {sending && chat[chat.length-1]?.role !== 'interviewer' && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex gap-1.5 items-center h-[46px]">
              <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
              <span className="w-1.5 h-1.5 bg-primary/70 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 border-t border-border/40 bg-card/80 backdrop-blur-xl">
        <form onSubmit={sendMessage} className="relative flex items-end gap-2">
          {sending ? (
            <button type="button" onClick={stopGenerating} className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm transition-colors hover:bg-destructive/20 shadow-sm">
              <XCircle className="h-4 w-4" /> Stop Generation
            </button>
          ) : (
            <div className="relative flex-1 flex items-end bg-background border border-border/60 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message your Coach..."
                className="w-full bg-transparent px-4 py-3.5 text-sm text-foreground outline-none resize-none max-h-32"
                rows={1}
                disabled={sending}
              />
              <button type="submit" disabled={!message.trim()} className="mb-1.5 mr-1.5 shrink-0 h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm">
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

/* ─── Results Dashboard ─── */
function ResultsSection({ prep }: any) {
  const readiness = prep.readiness || 'Evaluating...';
  const strengths = prep.strengths || [];
  const weaknesses = prep.weaknesses || [];
  const aiRec = prep.summary || 'Summary not available.';

  return (
    <div className="space-y-10 animate-enter pb-16">
      <div className="text-center space-y-4 mb-16 pt-4">
        <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-gradient-to-br from-primary to-cyan-500 shadow-2xl shadow-primary/20 mb-4 border border-white/10">
          <Trophy className="h-12 w-12 text-primary-foreground" />
        </div>
        <h2 className="text-5xl font-extrabold font-serif tracking-tight text-foreground drop-shadow-sm">Assessment Complete</h2>
        <p className="text-lg text-muted-foreground font-medium">Comprehensive evaluation and personalized feedback</p>
      </div>

      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div className="rounded-3xl border border-border/60 bg-card/30 backdrop-blur-xl p-10 flex flex-col justify-center items-center text-center shadow-xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-8 z-10">Overall Score</h3>
          <div className="relative flex h-48 w-48 items-center justify-center mb-8 z-10">
            <svg className="h-full w-full -rotate-90 drop-shadow-xl" viewBox="0 0 100 100">
              <circle className="text-muted/50 stroke-current" strokeWidth="6" cx="50" cy="50" r="44" fill="transparent" />
              <motion.circle
                className="text-primary stroke-current"
                strokeWidth="6" strokeLinecap="round" cx="50" cy="50" r="44" fill="transparent"
                initial={{ strokeDasharray: "276.46", strokeDashoffset: "276.46" }}
                animate={{ strokeDashoffset: 276.46 - (276.46 * prep.overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-foreground tracking-tighter">{prep.overallScore}<span className="text-2xl text-muted-foreground">%</span></span>
            </div>
          </div>
          <p className="text-3xl font-bold text-foreground mb-2 z-10 tracking-tight">{readiness}</p>
        </div>

        <div className="flex flex-col gap-4">
          <ScoreCard title="MCQ Accuracy" score={prep.mcqScore} icon={CheckCircle2} color="primary" />
          <ScoreCard title="Theory Depth" score={prep.theoryScore} icon={BookOpen} color="emerald" />
          <ScoreCard title="Code Quality" score={prep.codingQuestions?.reduce((s:any, q:any) => s + (q.score||0), 0) / (prep.codingQuestions?.length || 1) * 10} icon={Code2} color="cyan" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 pt-6">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-8 shadow-sm transition-all hover:shadow-md">
          <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-6"><Zap className="h-4 w-4" /> Demonstrated Strengths</h3>
          <ul className="space-y-4">
            {strengths.length > 0 ? strengths.map((s:string, i:number) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-foreground/90 font-medium leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> {s}
              </li>
            )) : <li className="text-muted-foreground text-[14px]">Not available</li>}
          </ul>
        </div>
        <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-8 shadow-sm transition-all hover:shadow-md">
          <h3 className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-destructive mb-6"><AlertTriangle className="h-4 w-4" /> Areas for Improvement</h3>
          <ul className="space-y-4">
            {weaknesses.length > 0 ? weaknesses.map((s:string, i:number) => (
              <li key={i} className="flex items-start gap-3 text-[14px] text-foreground/90 font-medium leading-relaxed">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> {s}
              </li>
            )) : <li className="text-muted-foreground text-[14px]">Not available</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-3xl border border-primary/20 bg-card/50 backdrop-blur-sm p-10 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <h3 className="flex items-center gap-3 text-xl font-bold text-foreground mb-6"><Brain className="h-6 w-6 text-primary" /> Comprehensive Evaluation</h3>
        <p className="text-[16px] text-muted-foreground font-medium leading-relaxed mb-10 max-w-4xl">{aiRec}</p>
        
        <div className="grid md:grid-cols-3 gap-8 pt-8 border-t border-border/50">
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Communication</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed">{prep.communicationFeedback || 'Not evaluated.'}</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Technical Depth</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed">{prep.technicalFeedback || 'Not evaluated.'}</p>
          </div>
          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-primary mb-3">Problem Solving</h4>
            <p className="text-[14px] font-medium text-foreground/80 leading-relaxed">{prep.problemSolvingFeedback || 'Not evaluated.'}</p>
          </div>
        </div>
      </div>

      {prep.nextSteps && prep.nextSteps.length > 0 && (
        <div className="rounded-3xl border border-border/60 bg-card/50 p-8 shadow-sm">
          <h4 className="text-[13px] font-bold uppercase tracking-widest text-foreground mb-6">Recommended Next Steps</h4>
          <ul className="space-y-3 text-[14px] font-medium text-muted-foreground list-disc pl-5">
            {prep.nextSteps.map((step:string, i:number) => <li key={i} className="pl-2">{step}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, score, icon: Icon, color }: any) {
  const displayScore = Math.round(score || 0);
  const colors: any = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    cyan: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20'
  };
  const barColors: any = {
    primary: 'bg-primary',
    emerald: 'bg-emerald-500',
    cyan: 'bg-cyan-500'
  };
  
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-6 shadow-sm flex flex-col justify-center hover:shadow-lg transition-all flex-1 group">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[12px] font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
        <span className={`p-2.5 rounded-xl border ${colors[color]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-extrabold text-foreground tracking-tight">{displayScore}</span>
        <span className="text-[13px] text-muted-foreground font-bold tracking-widest">/100</span>
      </div>
      <div className="mt-5 h-2 w-full bg-muted/50 rounded-full overflow-hidden border border-border/40" aria-hidden="true">
        <motion.div 
          className={`h-full rounded-full ${barColors[color]} shadow-[0_0_10px_currentColor] opacity-80`} 
          initial={{ width: 0 }}
          animate={{ width: `${displayScore}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        />
      </div>
    </div>
  );
}
