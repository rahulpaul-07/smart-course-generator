import { useEffect, useState, useRef, Suspense } from 'react';
import {
  Award, BookOpen, Brain, CheckCircle2, ChevronRight, Code2, MessageSquare,
  Plus, Send, Sparkles, Trash2, Trophy, XCircle, Clock, RefreshCcw, AlertTriangle, BarChart, Target, Zap, LayoutDashboard, Copy, Check, X, ArrowLeft
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
import LoadingSpinner from '../components/LoadingSpinner';

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

  if (loading) return <div className="min-h-[80vh] flex items-center justify-center"><LoadingSpinner text="Loading interview preps..." /></div>;

  if (!activePrep) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-12">
        <div className="max-w-6xl mx-auto space-y-12">
          <section className="text-center space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 mb-4 shadow-lg shadow-primary/5">
              <Brain className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-serif text-4xl font-extrabold tracking-tight sm:text-5xl">
              AI Interview Platform
            </h1>
            <p className="text-muted-foreground text-lg">
              Master your next technical interview. Generate comprehensive mock interviews with MCQs, coding challenges, and a live AI coach.
            </p>
          </section>

          <form onSubmit={generate} className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3">
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="E.g. Senior Frontend Engineer, System Design..."
              className="flex-1 h-14 rounded-xl border border-border/60 bg-card/50 px-5 text-base text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              maxLength={100}
            />
            <button type="submit" disabled={generating} className="h-14 bg-primary text-primary-foreground px-8 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-primary/20">
              {generating ? <><LoadingSpinner small /> Preparing...</> : <><Sparkles className="h-5 w-5" /> Generate</>}
            </button>
          </form>

          <div className="mt-16">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6 text-center">Your Active Sessions</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {preps.map((p) => (
                <div key={p._id} onClick={() => viewPrep(p._id)} className="group cursor-pointer rounded-2xl border border-border/50 bg-card/40 p-6 transition-all hover:bg-card hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[160px]">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'}`}>
                        {p.status}
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); deletePrep(p._id); }} className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <h4 className="font-bold text-lg text-foreground line-clamp-2 leading-snug">{p.topic}</h4>
                  </div>
                  {p.status === 'completed' && <p className="text-sm text-muted-foreground font-medium mt-4">Score: <span className="text-foreground">{p.overallScore}%</span></p>}
                </div>
              ))}
              {preps.length === 0 && (
                <div className="col-span-full py-16 text-center border border-dashed border-border/60 rounded-3xl bg-card/20 text-muted-foreground">
                  <p>No interview sessions yet.</p>
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
    <div className="grid h-[calc(100vh-4rem)] overflow-hidden lg:grid-cols-[280px_1fr_360px] bg-background">
      
      {/* Sidebar: Navigation */}
      <aside className="hidden lg:flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl py-6 overflow-y-auto">
        <div className="px-6 mb-6">
          <button onClick={() => setActivePrep(null)} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="h-4 w-4" /> Exit Interview
          </button>
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Technical Interview</p>
          <h2 className="font-serif text-2xl font-bold text-foreground leading-tight line-clamp-2">{activePrep.topic}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${activePrep.status === 'completed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>{activePrep.status}</span>
            <span className="px-2 py-1 rounded border border-border/50 bg-background/50 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{totalQuestions} Questions</span>
          </div>
        </div>

        {activePrep.status === 'pending' && (
          <div className="px-6 mb-8">
            <div className="flex items-center justify-between text-sm font-medium text-foreground mb-2">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-muted-foreground" /> Elapsed Time</span>
              <span className="font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{formatTime(elapsedTime)}</span>
            </div>
          </div>
        )}

        <div className="px-4 flex-1">
          <p className="px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Sections</p>
          <nav className="space-y-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </div>
                {activePrep.status === 'completed' && <CheckCircle2 className="h-3.5 w-3.5 opacity-50" />}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 overflow-y-auto bg-background/95 scroll-smooth relative flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-20 w-full bg-background/80 backdrop-blur-xl border-b border-border/50 px-4 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setActivePrep(null)} className="text-muted-foreground"><ArrowLeft className="h-5 w-5" /></button>
            <span className="font-semibold text-foreground truncate">{activePrep.topic}</span>
          </div>
          <button onClick={() => setIsMobileCoachOpen(true)} className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary">
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 p-4 md:p-8 lg:p-12 max-w-4xl mx-auto w-full">
          {activePrep.status === 'completed' ? (
            <ResultsSection prep={activePrep} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                {/* Mobile Tabs */}
                <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-none border-b border-border/50">
                  {TABS.map((tab) => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'bg-card border border-border/50 text-muted-foreground'}`}>
                      <tab.icon className="h-4 w-4" /> {tab.label}
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

      {/* AI Interview Coach */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] lg:static lg:w-auto lg:flex flex-col border-l border-border/40 bg-card/10 backdrop-blur-3xl transition-transform duration-300 ${isMobileCoachOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col shadow-[-10px_0_30px_rgba(0,0,0,0.2)] lg:shadow-none bg-background lg:bg-transparent">
          <div className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain className="h-5 w-5 text-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground leading-tight">AI Interview Coach</h3>
                <p className="text-[11px] text-muted-foreground">Always active</p>
              </div>
            </div>
            <button onClick={() => setIsMobileCoachOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:bg-muted rounded-full">
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
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-serif text-foreground">Multiple Choice Questions</h2>
        <p className="text-muted-foreground text-sm mt-1">Select the best answer for each question.</p>
      </div>
      
      {prep.mcqs.map((q: any, i: number) => {
        const userAns = submitted ? q.userAnswer : answers[i];
        return (
          <div key={i} className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 shadow-sm">
            <p className="mb-5 text-base font-medium text-foreground leading-relaxed">
              <span className="mr-3 text-primary font-bold">Q{i + 1}.</span>{q.question}
            </p>
            <div className="space-y-3">
              {q.options.map((opt: string, oi: number) => {
                let isSelected = userAns === oi;
                let isCorrect = submitted && oi === q.correctAnswer;
                let isWrong = submitted && oi === userAns && oi !== q.correctAnswer;
                
                let cls = 'border-border/50 bg-background hover:border-primary/50 hover:bg-card';
                if (submitted) {
                  if (isCorrect) cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                  else if (isWrong) cls = 'border-destructive bg-destructive/10 text-destructive';
                  else cls = 'border-border/30 bg-background/50 opacity-50';
                } else if (isSelected) {
                  cls = 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10';
                }

                return (
                  <button
                    key={oi}
                    onClick={() => { if (!submitted) { const a = [...answers]; a[i] = oi; setAnswers(a); } }}
                    disabled={submitted}
                    className={`group flex w-full items-start gap-4 rounded-xl border p-4 text-left text-sm transition-all duration-200 ${cls} ${!submitted && 'hover:shadow-md'}`}
                  >
                    <span className={`shrink-0 flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${isSelected && !submitted ? 'bg-primary border-primary text-primary-foreground' : 'border-border/80 text-muted-foreground'} ${isCorrect ? 'bg-emerald-500 border-emerald-500 text-foreground' : ''} ${isWrong ? 'bg-destructive border-destructive text-foreground' : ''}`}>
                      {String.fromCharCode(65 + oi)}
                    </span>
                    <span className="pt-0.5 flex-1 font-medium leading-relaxed">{opt}</span>
                    {isCorrect && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />}
                    {isWrong && <XCircle className="h-5 w-5 shrink-0 text-destructive" />}
                  </button>
                );
              })}
            </div>
            {submitted && q.explanation && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
                <span className="font-bold text-primary mb-1 block">Explanation:</span>
                {q.explanation}
              </motion.div>
            )}
          </div>
        );
      })}
      
      {!submitted && prep.mcqs.length > 0 && (
        <div className="pt-6 border-t border-border/50 sticky bottom-4 z-10 bg-background/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border flex justify-end">
          <button onClick={submitMCQs} disabled={submitting} className="h-12 bg-primary text-primary-foreground px-8 rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20">
            {submitting ? <><LoadingSpinner small /> Evaluating...</> : <><Award className="h-5 w-5" /> Submit Interview</>}
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
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-serif text-foreground">Theory & Concepts</h2>
        <p className="text-muted-foreground text-sm mt-1">Provide detailed, comprehensive answers.</p>
      </div>

      {prep.theoryQuestions.map((q: any, i: number) => {
        const textValue = submitted ? (q.userAnswer || '') : answers[i];
        const wordCount = textValue.trim().split(/\s+/).filter(Boolean).length;
        
        return (
          <div key={i} className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm p-6 shadow-sm flex flex-col gap-4">
            <p className="text-base font-medium text-foreground leading-relaxed">
              <span className="mr-3 text-primary font-bold">Q{i + 1}.</span>{q.question}
            </p>
            <div className="relative">
              <textarea
                value={textValue}
                onChange={(e) => updateAnswer(i, e.target.value)}
                disabled={submitted}
                rows={6}
                className="w-full rounded-xl border border-border/60 bg-background/50 p-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary shadow-inner resize-y disabled:opacity-70 disabled:cursor-not-allowed"
                placeholder="Structure your answer clearly. Consider using bullet points or examples..."
              />
              {!submitted && (
                <div className="absolute bottom-4 right-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                  <span className={wordCount < 20 ? 'text-amber-500' : 'text-emerald-500'}>{wordCount} words</span>
                </div>
              )}
            </div>
            
            {submitted && q.feedback && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 space-y-4 rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">AI Evaluation</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${q.score >= 7 ? 'bg-emerald-500/10 text-emerald-500' : q.score >= 4 ? 'bg-amber-500/10 text-amber-500' : 'bg-destructive/10 text-destructive'}`}>
                    Score: {q.score}/10
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{q.feedback}</p>
                {q.idealAnswer && (
                  <details className="group mt-4 border border-border/50 rounded-lg">
                    <summary className="cursor-pointer text-sm font-medium text-primary p-3 bg-muted/30 hover:bg-muted/50 rounded-lg list-none flex justify-between items-center transition-colors">
                      View Ideal Answer
                      <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="p-4 border-t border-border/50 text-sm leading-relaxed text-muted-foreground bg-background/50">
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
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold font-serif text-foreground">Coding Challenges</h2>
        <p className="text-muted-foreground text-sm mt-1">Write clean, optimized, and readable code.</p>
      </div>

      {prep.codingQuestions.map((q: any, i: number) => (
        <div key={i} className="rounded-2xl border border-border/50 bg-card/30 backdrop-blur-sm shadow-sm overflow-hidden flex flex-col">
          <div className="border-b border-border/50 bg-muted/30 p-5 flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-base font-bold text-foreground flex-1">{q.title}</h3>
            <span className="rounded-full border border-border/80 bg-background px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground shadow-sm">
              Problem {i + 1}
            </span>
          </div>
          
          <div className="p-6 space-y-5">
            <div className="prose prose-sm prose-invert max-w-none text-muted-foreground leading-relaxed">
              <p>{q.problemStatement}</p>
            </div>
            
            {q.constraints && (
              <div className="rounded-lg border border-border/40 bg-card/50 p-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Constraints</h4>
                <p className="text-sm font-mono text-foreground/80">{q.constraints}</p>
              </div>
            )}
            
            {q.starterCode && (
              <div className="rounded-xl overflow-hidden border border-border shadow-inner">
                <div className="bg-[#1e1e1e] px-4 py-2 text-xs font-mono text-muted-foreground border-b border-border/">Starter Code</div>
                <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, background: '#1e1e1e' }}>
                  {q.starterCode}
                </SyntaxHighlighter>
              </div>
            )}
            
            <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-inner group">
              <div className="absolute top-0 right-0 left-0 h-10 bg-muted/50 border-b border-border/50 flex items-center px-4">
                <span className="text-xs font-mono font-medium text-muted-foreground">Your Solution (JavaScript)</span>
              </div>
              <textarea
                value={submitted ? (q.userSolution || '') : solutions[i]}
                onChange={(e) => updateSolution(i, e.target.value)}
                disabled={submitted}
                rows={10}
                className="w-full bg-[#1e1e1e] p-4 pt-14 text-sm font-mono text-emerald-400 outline-none transition focus:border-primary disabled:opacity-90 resize-y"
                placeholder="// Write your code here..."
                spellCheck={false}
              />
            </div>
            
            {q.solutionHint && !submitted && (
              <details className="group border border-amber-500/20 bg-amber-500/5 rounded-xl">
                <summary className="cursor-pointer text-sm font-medium text-amber-500 p-4 hover:bg-amber-500/10 transition-colors list-none flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Need a hint?
                </summary>
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {q.solutionHint}
                </div>
              </details>
            )}

            {submitted && q.feedback && (
              <div className="mt-6 rounded-xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-sm text-primary">Code Evaluation</h4>
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded">Score: {q.score}/10</span>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">{q.feedback}</p>
                {q.idealSolution && (
                  <div className="rounded-xl overflow-hidden border border-border shadow-inner mt-4">
                    <div className="bg-[#1e1e1e] px-4 py-2 text-xs font-mono text-emerald-400 border-b border-border/">Ideal Solution</div>
                    <SyntaxHighlighter language="javascript" style={vscDarkPlus} customStyle={{ margin: 0, background: '#1e1e1e' }}>
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
    <div className="relative group my-3 rounded-lg overflow-hidden bg-[#1e1e1e] border border-border/50">
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/40 border-b border-border/">
        <span className="text-[10px] font-mono text-muted-foreground uppercase">{language || 'code'}</span>
        <button onClick={handleCopy} className="text-muted-foreground hover:text-foreground transition-colors">
          {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <div className="text-xs overflow-x-auto tab-size-4">
        <SyntaxHighlighter language={language || 'text'} style={vscDarkPlus} customStyle={{ margin: 0, padding: '0.75rem', background: 'transparent' }} PreTag="div">
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
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {chat.map((msg, i) => (
          <div key={i} className={`flex w-full ${msg.role === 'candidate' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-relaxed shadow-sm ${
              msg.role === 'candidate'
                ? 'rounded-br-sm bg-primary text-primary-foreground'
                : 'rounded-bl-sm bg-card border border-border/50 text-foreground'
            }`}>
              {msg.role === 'candidate' ? (
                msg.content
              ) : (
                <div className="prose prose-sm prose-invert max-w-none prose-p:my-1 prose-pre:my-0 prose-pre:p-0 prose-pre:bg-transparent">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code: ({ children, className, node, ...props }: any) => {
                        const match = /language-(\w+)/.exec(className || '');
                        if (match || String(children).includes('\n')) {
                          return <CodeBlock language={match?.[1] || 'text'} value={String(children).replace(/\n$/, '')} />;
                        }
                        return <code className="bg-primary/20 text-primary px-1 rounded" {...props}>{children}</code>;
                      },
                    }}
                  >
                    {msg.content || '...'}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && chat[chat.length-1]?.role !== 'interviewer' && (
          <div className="flex justify-start">
            <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex gap-1 items-center h-[46px]">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-md">
        <form onSubmit={sendMessage} className="relative flex items-end gap-2">
          {sending ? (
            <button type="button" onClick={stopGenerating} className="w-full h-[52px] flex items-center justify-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-bold text-sm transition-colors hover:bg-destructive/20">
              <XCircle className="h-4 w-4" /> Stop Generation
            </button>
          ) : (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Message your AI Coach..."
                className="w-full rounded-xl border border-border bg-card px-4 py-3.5 pr-12 text-sm text-foreground outline-none transition focus:border-primary focus:ring-1 focus:ring-primary shadow-inner resize-none max-h-32"
                rows={1}
                disabled={sending}
              />
              <button type="submit" disabled={!message.trim()} className="absolute right-2 bottom-2 h-9 w-9 flex items-center justify-center bg-primary text-primary-foreground rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shadow-sm">
                <Send className="h-4 w-4" />
              </button>
            </>
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
  const recommendedTopics = prep.recommendedTopics || [];
  const aiRec = prep.summary || 'Summary not available.';

  return (
    <div className="space-y-8 animate-enter pb-16">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-primary to-cyan-500 shadow-xl shadow-primary/20 mb-2">
          <Trophy className="h-10 w-10 text-foreground" />
        </div>
        <h2 className="text-4xl font-extrabold font-serif tracking-tight text-foreground">Interview Assessment</h2>
        <p className="text-lg text-muted-foreground">Comprehensive evaluation and feedback</p>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-6">
        <div className="rounded-3xl border border-border/50 bg-card/40 backdrop-blur-xl p-8 flex flex-col justify-center items-center text-center shadow-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">Overall Score</h3>
          <div className="relative flex h-40 w-40 items-center justify-center mb-6">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle className="text-muted stroke-current" strokeWidth="8" cx="50" cy="50" r="40" fill="transparent" />
              <motion.circle
                className="text-primary stroke-current drop-shadow-md"
                strokeWidth="8" strokeLinecap="round" cx="50" cy="50" r="40" fill="transparent"
                initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * prep.overallScore) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-foreground">{prep.overallScore}%</span>
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-2">{readiness}</p>
        </div>

        <div className="flex flex-col gap-4">
          <ScoreCard title="MCQ Accuracy" score={prep.mcqScore} icon={CheckCircle2} color="primary" />
          <ScoreCard title="Theory Depth" score={prep.theoryScore} icon={BookOpen} color="emerald" />
          <ScoreCard title="Code Quality" score={prep.codingQuestions?.reduce((s:any, q:any) => s + (q.score||0), 0) / (prep.codingQuestions?.length || 1) * 10} icon={Code2} color="cyan" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-bold text-emerald-600 dark:text-emerald-400 mb-5"><Zap className="h-5 w-5" /> Demonstrated Strengths</h3>
          <ul className="space-y-3">
            {strengths.length > 0 ? strengths.map((s:string, i:number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" /> {s}
              </li>
            )) : <li className="text-muted-foreground text-sm">Not available</li>}
          </ul>
        </div>
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-6 shadow-sm">
          <h3 className="flex items-center gap-2 text-base font-bold text-destructive mb-5"><AlertTriangle className="h-5 w-5" /> Areas for Improvement</h3>
          <ul className="space-y-3">
            {weaknesses.length > 0 ? weaknesses.map((s:string, i:number) => (
              <li key={i} className="flex items-start gap-3 text-sm text-foreground/80 leading-relaxed">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" /> {s}
              </li>
            )) : <li className="text-muted-foreground text-sm">Not available</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-8 shadow-sm">
        <h3 className="flex items-center gap-2 text-lg font-bold text-primary mb-4"><Brain className="h-5 w-5" /> Comprehensive Evaluation</h3>
        <p className="text-base text-foreground/90 leading-relaxed mb-8">{aiRec}</p>
        
        <div className="grid md:grid-cols-3 gap-6 pt-6 border-t border-primary/10">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Communication</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{prep.communicationFeedback || 'Not evaluated.'}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Technical Depth</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{prep.technicalFeedback || 'Not evaluated.'}</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2">Problem Solving</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{prep.problemSolvingFeedback || 'Not evaluated.'}</p>
          </div>
        </div>
      </div>

      {prep.nextSteps && prep.nextSteps.length > 0 && (
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
          <h4 className="text-base font-bold text-foreground mb-4">Recommended Next Steps</h4>
          <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
            {prep.nextSteps.map((step:string, i:number) => <li key={i}>{step}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

function ScoreCard({ title, score, icon: Icon, color }: any) {
  const displayScore = Math.round(score || 0);
  const colors: any = {
    primary: 'text-primary bg-primary/20',
    emerald: 'text-emerald-500 bg-emerald-500/20',
    cyan: 'text-cyan-500 bg-cyan-500/20'
  };
  return (
    <div className="rounded-2xl border border-border/50 bg-card/40 p-5 shadow-sm flex flex-col justify-center hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-muted-foreground">{title}</span>
        <span className={`p-2 rounded-xl ${colors[color]}`}><Icon className="h-4 w-4" /></span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-extrabold text-foreground">{displayScore}</span>
        <span className="text-sm text-muted-foreground font-medium">/ 100</span>
      </div>
      <div className="mt-4 h-1.5 w-full bg-muted rounded-full overflow-hidden" aria-hidden="true">
        <div className={`h-full rounded-full transition-all duration-1000 ${colors[color].split(' ')[0].replace('text-', 'bg-')}`} style={{ width: `${displayScore}%` }} />
      </div>
    </div>
  );
}
