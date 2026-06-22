import { useEffect, useState } from 'react';
import {
  Award, BookOpen, Brain, CheckCircle2, ChevronRight, Code2, MessageSquare,
  Plus, Send, Sparkles, Trash2, Trophy, XCircle,
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
  const [activePrep, setActivePrep] = useState(null);
  const [activeTab, setActiveTab] = useState('mcq');
  const [topic, setTopic] = useState('');

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
    setGenerating(true);
    try {
      const { data } = await api.post('/interviews/generate', { topic: topic.trim() });
      setPreps((p) => [data, ...p]);
      setActivePrep(data);
      setActiveTab('mcq');
      setTopic('');
      toast.success('Interview pack generated!');
    } catch {
      toast.error('Failed to generate interview pack');
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
          {generating ? <LoadingSpinner small /> : <><Plus className="h-4 w-4" /> Generate</>}
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
            {preps.length === 0 && <p className="py-4 text-center text-xs text-slate-600">No packs yet.</p>}
          </div>
        </aside>

        {/* Main Area */}
        <main>
          {activePrep ? (
            <div className="animate-enter">
              {/* Tabs */}
              <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition ${
                      activeTab === key
                        ? 'bg-brand-500/20 text-brand-200 shadow'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" /> {label}
                  </button>
                ))}
              </div>

              {/* Score Banner */}
              {activePrep.status === 'completed' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className="mb-6 flex items-center gap-6 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-500/5 p-6 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                      <circle
                        className="text-amber-500/20 stroke-current"
                        strokeWidth="8"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                      ></circle>
                      <motion.circle
                        className="text-amber-500 stroke-current drop-shadow-md"
                        strokeWidth="8"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        initial={{ strokeDasharray: "251.2", strokeDashoffset: "251.2" }}
                        animate={{ strokeDashoffset: 251.2 - (251.2 * activePrep.overallScore) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      ></motion.circle>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-amber-400">{activePrep.overallScore}%</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="h-5 w-5 text-amber-400" />
                      <p className="text-sm font-semibold uppercase tracking-wider text-amber-200/80">Overall Score</p>
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {activePrep.overallScore >= 80 ? 'Outstanding Performance!' : 
                       activePrep.overallScore >= 60 ? 'Good Effort!' : 'Keep Practicing!'}
                    </h2>
                    <p className="mt-1 text-sm text-slate-400 max-w-md">
                      Based on your responses across MCQs, Theory, and Coding challenges.
                    </p>
                  </div>
                </motion.div>
              )}

              {activeTab === 'mcq' && <MCQSection prep={activePrep} onUpdate={setActivePrep} />}
              {activeTab === 'theory' && <TheorySection prep={activePrep} onUpdate={setActivePrep} />}
              {activeTab === 'coding' && <CodingSection prep={activePrep} />}
              {activeTab === 'mock' && <MockSection prep={activePrep} onUpdate={setActivePrep} />}
            </div>
          ) : (
            <div className="glass-card flex flex-col items-center justify-center rounded-2xl py-20 text-center">
              <Brain className="h-12 w-12 text-slate-700" />
              <p className="mt-4 text-sm text-slate-500">Select or generate an interview prep pack</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

/* ─── MCQ Section ─── */
function MCQSection({ prep, onUpdate }) {
  const [answers, setAnswers] = useState(prep.mcqs.map((q) => q.userAnswer >= 0 ? q.userAnswer : -1));
  const [submitted, setSubmitted] = useState(prep.status === 'completed');
  const [submitting, setSubmitting] = useState(false);

  async function submitMCQs() {
    setSubmitting(true);
    try {
      const { data } = await api.post(`/interviews/${prep._id}/submit`, {
        mcqAnswers: answers,
        theoryAnswers: prep.theoryQuestions.map((q) => q.userAnswer),
        codingSolutions: prep.codingQuestions.map((q) => q.userSolution),
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
  const [answers, setAnswers] = useState(prep.theoryQuestions.map((q) => q.userAnswer || ''));
  const submitted = prep.status === 'completed';

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
  const [chat, setChat] = useState(prep.mockChat || []);

  async function sendMessage(e) {
    e.preventDefault();
    if (!message.trim() || sending) return;
    const text = message.trim();
    setMessage('');
    setChat((c) => [...c, { role: 'candidate', content: text }]);
    setSending(true);
    try {
      const { data } = await api.post(`/interviews/${prep._id}/chat`, { message: text });
      setChat(data.chatHistory);
    } catch {
      toast.error('Failed to send message');
    } finally { setSending(false); }
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
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-md bg-white/[0.05] px-4 py-3 text-slate-500">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/[0.06] p-4">
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your answer..."
          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition focus:border-brand-400/50"
          disabled={sending}
        />
        <button type="submit" disabled={sending || !message.trim()} className="btn-primary shrink-0 px-4">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
