import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BrainCircuit, Rocket, ArrowRight, ShieldCheck, 
  BookOpen, Code, FileText, CheckCircle2, PlayCircle, 
  Map, Award, MessageSquare, LayoutDashboard, Zap, 
  Check, X, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// --- Hero Mockup Component ---
const PreviewDashboard = () => (
  <div className="flex flex-col gap-4 h-full w-full">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-card rounded-xl p-4 border border-border/40 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Courses Completed</p>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Award className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="bg-card rounded-xl p-4 border border-border/40 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-1">Current Streak</p>
          <p className="text-2xl font-bold">5 Days</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center">
          <Zap className="h-5 w-5 text-amber-500" />
        </div>
      </div>
    </div>
    
    <div className="flex-1 bg-card rounded-xl p-5 border border-border/40 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-sm">Continue Learning</h3>
        <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">In Progress</span>
      </div>
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shrink-0 shadow-inner">
          <BrainCircuit className="h-6 w-6 text-white" />
        </div>
        <div>
          <h4 className="font-bold text-sm text-foreground">Advanced React Architecture</h4>
          <p className="text-xs text-muted-foreground mt-1">Module 4: Server Components</p>
        </div>
      </div>
      <div className="mt-auto">
        <div className="flex justify-between text-xs mb-1.5 font-medium">
          <span>Overall Progress</span>
          <span className="text-primary font-bold">68%</span>
        </div>
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "68%" }}
            transition={{ duration: 1 }}
            className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full" 
          />
        </div>
      </div>
    </div>
  </div>
);

const PreviewCourseViewer = () => (
  <div className="flex gap-5 h-full w-full">
    <div className="w-1/3 flex flex-col gap-2 border-r border-border/40 pr-5 hidden sm:flex">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Modules</div>
      {[
        { title: "Introduction", done: true },
        { title: "Core Concepts", done: true },
        { title: "Advanced Patterns", done: false, active: true },
        { title: "Final Project", done: false }
      ].map((m, i) => (
        <div key={i} className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-medium transition-colors ${m.active ? 'bg-primary/10 text-primary' : m.done ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
          {m.done ? <CheckCircle2 className="h-3.5 w-3.5" /> : m.active ? <PlayCircle className="h-3.5 w-3.5" /> : <div className="h-3.5 w-3.5 rounded-full border border-current opacity-40" />}
          {m.title}
        </div>
      ))}
    </div>
    
    <div className="flex-1 flex flex-col">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-foreground tracking-tight">Advanced Patterns</h2>
        <p className="text-xs text-muted-foreground mt-1">Learn how to implement scalable state management.</p>
      </div>
      <div className="flex-1 bg-card rounded-xl border border-border/40 p-5 shadow-sm space-y-4">
        <div className="h-4 w-3/4 bg-muted/60 rounded" />
        <div className="h-4 w-full bg-muted/60 rounded" />
        <div className="h-4 w-5/6 bg-muted/60 rounded" />
        <div className="my-4 h-24 bg-muted/30 border border-border/50 rounded-lg p-4 space-y-2.5">
           <div className="h-3 w-1/3 bg-muted rounded" />
           <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
        <div className="h-4 w-2/3 bg-muted/60 rounded" />
      </div>
      <div className="mt-4 flex justify-end">
        <div className="bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-lg shadow-md flex items-center gap-2 hover:opacity-90 cursor-pointer">
          Continue <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  </div>
);

const PreviewAITutor = () => (
  <div className="flex flex-col h-full w-full bg-card/40 rounded-xl border border-border/40 overflow-hidden shadow-sm">
    <div className="p-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
          <Sparkles className="h-3 w-3 text-primary" />
        </div>
        <span className="text-xs font-semibold">CourseAI Tutor</span>
      </div>
      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Online</span>
    </div>
    <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="self-end max-w-[85%] bg-primary/10 border border-primary/20 text-foreground rounded-2xl rounded-tr-none px-4 py-2.5 text-sm shadow-sm">
        Can you explain how useEffect dependencies work?
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="self-start max-w-[90%] bg-card border border-border/60 text-foreground rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm space-y-3">
        <p>The <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">useEffect</code> dependency array tells React when to re-run your effect.</p>
        <div className="bg-muted/40 rounded-lg border border-border/40 p-3 relative">
          <div className="absolute top-2 right-2 text-[9px] font-medium bg-card border border-border/40 px-2 py-1 rounded text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground">
            <Code className="h-3 w-3" /> Copy
          </div>
          <div className="h-2.5 w-1/2 bg-muted/80 rounded mb-2" />
          <div className="h-2.5 w-3/4 bg-muted/80 rounded" />
        </div>
        <div className="flex gap-1 items-center mt-2 px-1">
          <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="h-1.5 w-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </motion.div>
    </div>
    <div className="p-3 border-t border-border/40 bg-card">
      <div className="bg-muted/30 border border-border/50 rounded-full px-4 py-2 text-xs text-muted-foreground flex justify-between items-center shadow-inner">
        Ask a follow-up...
        <div className="h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
          <ArrowRight className="h-3 w-3" />
        </div>
      </div>
    </div>
  </div>
);

const PreviewInterviewPrep = () => (
  <div className="flex h-full w-full gap-5">
    <div className="flex-1 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Question 3 of 10</div>
        <div className="text-xs font-mono font-bold flex items-center gap-2 bg-card border border-border/50 px-3 py-1 rounded-full text-foreground shadow-sm">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> 14:59
        </div>
      </div>
      <div className="bg-card flex-1 rounded-xl border border-border/40 shadow-sm p-5 flex flex-col">
        <h3 className="font-bold text-sm mb-2 text-foreground">Implement a custom React Hook</h3>
        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
          Write a custom hook called <code className="text-foreground bg-muted px-1 py-0.5 rounded font-mono">useDebounce</code> that delays invoking a function until after wait milliseconds have elapsed.
        </p>
        <div className="flex-1 bg-[#0d1117] rounded-lg p-4 font-mono text-xs space-y-2 shadow-inner border border-white/5">
          <div className="text-blue-400">{'function useDebounce<T>(value: T, delay: number): T {'}</div>
          <div className="pl-4 h-2 w-1/3 bg-white/10 rounded" />
          <div className="pl-4 h-2 w-1/4 bg-white/10 rounded" />
          <div className="pl-4 flex items-center gap-1 mt-3"><div className="h-3 w-0.5 bg-blue-400 animate-pulse" /></div>
          <div className="text-blue-400">{'}'}</div>
        </div>
      </div>
    </div>
    
    <div className="w-[35%] bg-card/60 rounded-xl border border-border/40 shadow-sm p-4 hidden sm:flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border/40">
        <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
          <BrainCircuit className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-bold">AI Coach</span>
      </div>
      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-muted/40 border border-border/50 rounded-lg p-3 text-[11px] text-muted-foreground space-y-2 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
        <p><strong className="text-foreground">Hint:</strong> Think about what built-in hook allows you to perform side effects, and how you can clean up timers when the value changes.</p>
      </motion.div>
      <div className="mt-auto pt-4 border-t border-border/40">
        <div className="w-full bg-foreground text-background py-2 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer shadow-md hover:opacity-90">
          Run Code
        </div>
      </div>
    </div>
  </div>
);

const PreviewCertificate = () => (
  <div className="flex flex-col h-full w-full items-center justify-center p-2">
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="relative w-full max-w-sm aspect-[1.414/1] bg-card rounded-sm shadow-2xl border border-border/50 p-6 flex flex-col items-center text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.06),transparent_70%)]" />
      <div className="absolute -inset-[1px] border-2 border-amber-500/20 rounded-sm pointer-events-none" />
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-500/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-500/40 rounded-br-sm pointer-events-none" />
      
      <Award className="h-10 w-10 text-amber-500 mb-3 drop-shadow-md relative z-10" />
      <h2 className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1.5 relative z-10">Certificate of Completion</h2>
      <h1 className="text-lg font-serif font-bold text-foreground mb-4 relative z-10">
        Advanced React Architecture
        <div className="absolute -bottom-2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
      </h1>
      
      <p className="text-[9px] text-muted-foreground max-w-[85%] leading-relaxed relative z-10">
        This certifies that the user has successfully completed the AI-generated curriculum, including all interactive lessons, projects, and assessments.
      </p>
      
      <div className="mt-auto w-full flex justify-between items-end relative z-10">
        <div className="flex flex-col items-start">
          <div className="h-3 w-16 bg-muted/60 rounded mb-1.5" />
          <span className="text-[7px] text-muted-foreground font-bold uppercase tracking-wider">CourseAI Instructor</span>
        </div>
        
        <div className="bg-white p-1 rounded-sm shadow-md flex flex-wrap gap-0.5 border border-black/5" style={{ width: '42px', height: '42px' }}>
          {[...Array(16)].map((_, i) => (
            <div key={i} className={`w-[calc(25%-2px)] h-[calc(25%-2px)] ${[1, 3, 4, 6, 9, 11, 14, 15].includes(i) ? 'bg-black rounded-sm' : 'bg-transparent'}`} />
          ))}
        </div>
      </div>
    </motion.div>
    
    <div className="mt-6 flex gap-3 w-full max-w-sm">
      <div className="flex-1 bg-primary text-primary-foreground text-xs font-bold py-2.5 rounded-lg text-center shadow-md cursor-pointer hover:bg-primary/90 transition-colors">
        Download PDF
      </div>
      <div className="flex-1 bg-card border border-border/50 text-foreground text-xs font-bold py-2.5 rounded-lg text-center shadow-sm cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" /> Verify
      </div>
    </div>
  </div>
);

const ProductPreview = () => {
  const [activeTab, setActiveTab] = React.useState('Dashboard');

  // Prevent interval stale state by storing tabs outside or using functional update
  const tabs = React.useMemo(() => [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Course Viewer', icon: BookOpen },
    { id: 'AI Tutor', icon: Sparkles },
    { id: 'Interview Prep', icon: Code },
    { id: 'Certificate', icon: Award }
  ], []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabs.findIndex(t => t.id === current);
        return tabs[(currentIndex + 1) % tabs.length].id;
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [tabs]);

  return (
    <div className="relative rounded-2xl border border-border/60 bg-background/50 backdrop-blur-2xl shadow-2xl overflow-hidden flex flex-col h-[520px] ring-1 ring-white/10 dark:ring-white/5">
      {/* Floating Badge */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 border border-border/50 text-[10px] font-bold text-foreground uppercase tracking-wider backdrop-blur-md shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        Live Preview
      </div>

      {/* Browser-like Header with Tabs */}
      <div className="flex items-center gap-4 sm:gap-6 px-4 pt-4 pb-0 border-b border-border/40 bg-muted/20 overflow-x-auto no-scrollbar relative z-10">
        <div className="flex gap-1.5 shrink-0 pl-2 hidden sm:flex pb-3">
          <div className="h-3 w-3 rounded-full bg-rose-500/80" />
          <div className="h-3 w-3 rounded-full bg-amber-500/80" />
          <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
        </div>
        
        <div className="flex gap-1 shrink-0 pb-3 mt-0.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-card border border-border/60 shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent'
                }`}
              >
                <Icon className={`h-3 w-3 ${isActive ? 'text-primary' : ''}`} />
                {tab.id}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Body Area */}
      <div className="flex-1 overflow-hidden relative bg-background/30">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 flex flex-col p-5 w-full h-full"
          >
            {activeTab === 'Dashboard' && <PreviewDashboard />}
            {activeTab === 'Course Viewer' && <PreviewCourseViewer />}
            {activeTab === 'AI Tutor' && <PreviewAITutor />}
            {activeTab === 'Interview Prep' && <PreviewInterviewPrep />}
            {activeTab === 'Certificate' && <PreviewCertificate />}
          </motion.div>
        </AnimatePresence>
        
        {/* Ambient background glow inside preview */}
        <div className="absolute bottom-[-20%] right-[-10%] h-64 w-64 bg-primary/5 blur-[60px] rounded-full pointer-events-none" />
      </div>
    </div>
  )
};

// --- Sections ---

const CountUp = ({ end, decimals = 0, suffix = "", duration = 2000 }: { end: number, decimals?: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * end);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);
  
  return <>{count.toFixed(decimals)}{suffix}</>;
};
export default function LandingPage() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  const showcaseTabs = [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Course Viewer', icon: BookOpen },
    { id: 'AI Chat', icon: MessageSquare },
    { id: 'Roadmaps', icon: Map },
    { id: 'Interview Prep', icon: Code },
    { id: 'Flashcards', icon: FileText }
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/30 font-sans">
      
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
              <BrainCircuit className="h-5 w-5 text-primary-foreground" />
            </div>
            CourseAI Pro
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
            <Button asChild className="rounded-full shadow-sm shadow-primary/10 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
              <Link to="/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        
        {/* 1. Hero Section */}
        <section className="relative min-h-[calc(100vh-64px)] flex items-center overflow-hidden">
          
          {/* ── Layered Background ── */}
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,hsl(262_83%_57%/0.15),transparent_70%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_100%_100%,hsl(191_97%_77%/0.1),transparent_65%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_40%_40%_at_0%_100%,hsl(262_83%_57%/0.08),transparent_60%)]" />
          
          {/* Subtle grid texture */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(hsl(var(--foreground)) 1px,transparent 1px),linear-gradient(90deg,hsl(var(--foreground)) 1px,transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />
          
          <div className="container px-4 md:px-8 lg:px-12 w-full py-16 lg:py-0">
            <div className="grid lg:grid-cols-[60%_40%] gap-12 lg:gap-8 items-center min-h-[calc(100vh-64px)]">
              
              {/* ────────── LEFT: Marketing 60% ────────── */}
              <div className="flex flex-col justify-center space-y-8 text-center lg:text-left pt-10 lg:pt-0">
                
                {/* Badge */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary w-fit mx-auto lg:mx-0 shadow-sm backdrop-blur-sm hover:bg-primary/15 transition-colors"
                >
                  <Sparkles className="h-4 w-4" />
                  ✨ AI-Powered Learning Platform
                </motion.div>

                {/* Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                  className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold tracking-tight text-foreground leading-[1.1] max-w-[700px] mx-auto lg:mx-0"
                >
                  Generate Your Next <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-violet-400 to-cyan-400">
                    AI Course
                  </span>{' '}
                  <br className="hidden sm:block" />
                  in Minutes.
                </motion.h1>

                {/* Description */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="max-w-[600px] mx-auto lg:mx-0 text-lg md:text-xl text-muted-foreground leading-relaxed font-medium"
                >
                  CourseAI Pro generates complete personalized courses with interactive lessons, quizzes, practice projects, mock interviews, spaced-repetition flashcards, and verifiable certificates.
                </motion.p>

                {/* CTAs */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                >
                  <Button asChild size="lg" className="h-12 px-8 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ring-1 ring-inset ring-white/20">
                    <Link to="/signup">
                      Generate Your First Course
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-xl text-base font-bold border border-border/50 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5 hover:shadow-sm">
                    <Link to="/community">
                      <PlayCircle className="mr-2 h-5 w-5" />
                      Explore Demo
                    </Link>
                  </Button>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 }}
                  className="pt-6 flex flex-wrap gap-3 justify-center lg:justify-start"
                >
                  {[
                    { label: 'AI Generated', icon: BrainCircuit },
                    { label: 'Interactive Lessons', icon: BookOpen },
                    { label: 'Interview Prep', icon: Code },
                    { label: 'Certificates', icon: Award },
                  ].map(({ label, icon: Icon }) => (
                    <div key={label} className="flex items-center gap-1.5 rounded-full border border-border/50 bg-card/40 px-3 py-1.5 text-xs font-semibold text-muted-foreground backdrop-blur-sm hover:text-foreground transition-colors">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* ────────── RIGHT: Product Preview 40% ────────── */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.15 }}
                className="relative mx-auto w-full max-w-[600px] lg:max-w-none pt-10 lg:pt-0"
              >
                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/20 via-transparent to-cyan-400/15 opacity-60 blur-3xl -z-10" />
                <ProductPreview />
              </motion.div>

            </div>
          </div>
        </section>


        {/* 1. Trusted Technology */}
        <section className="py-12 border-y border-border/40 bg-muted/10 relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <p className="text-center text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">Powered by industry-leading technology</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
              {['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'Gemini', 'OpenAI', 'Groq', 'Vercel'].map((tech) => (
                <div key={tech} className="text-lg md:text-xl font-bold tracking-tight grayscale hover:grayscale-0 hover:text-foreground hover:opacity-100 transition-all duration-300 cursor-default">
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 2. Metrics */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1000px] aspect-square bg-gradient-to-tr from-primary/10 to-cyan-400/10 rounded-full blur-[120px] -z-10" />
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "AI Courses Generated", value: 100, suffix: "+" },
                { label: "Lessons Created", value: 2500, suffix: "+" },
                { label: "Interview Sessions", value: 500, suffix: "+" },
                { label: "Completion Rate", value: 98, suffix: "%" },
                { label: "User Satisfaction", value: 4.9, decimals: 1, suffix: "★" },
                { label: "AI Personalized", value: 100, suffix: "%" }
              ].map((metric, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="p-6 rounded-2xl bg-card/40 border border-border/40 backdrop-blur-xl shadow-sm hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:border-border/80 transition-all duration-200 flex flex-col items-center justify-center text-center group"
                >
                  <div className="text-3xl font-extrabold text-foreground mb-2 group-hover:text-primary transition-colors">
                    <CountUp end={metric.value} decimals={metric.decimals} suffix={metric.suffix} />
                  </div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-relaxed">{metric.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 3. Why CourseAI */}
        <section className="py-24 bg-muted/20 border-y border-border/40">
          <div className="container px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">Why CourseAI Pro?</h2>
              <p className="text-lg text-muted-foreground">Everything you need to master complex subjects, unified in one premium platform.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: BrainCircuit, title: "AI Course Generation", desc: "Instantly create structured curriculums from a single prompt." },
                { icon: BookOpen, title: "Interactive Lessons", desc: "Rich markdown, LaTeX math, and embedded video support." },
                { icon: FileText, title: "Flashcards", desc: "Spaced-repetition study tools automatically extracted." },
                { icon: Code, title: "Interview Preparation", desc: "Mock interviews with real-time AI voice and text feedback." },
                { icon: Map, title: "Roadmaps", desc: "AI-generated learning paths to guide you step-by-step." },
                { icon: Award, title: "Certificates", desc: "Earn verifiable certificates upon course completion." }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  className="group relative"
                >
                  <Card className="relative p-8 h-full bg-card/40 backdrop-blur-xl border border-border/40 hover:bg-card hover:border-border/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-1">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 text-primary group-hover:scale-105 group-hover:from-primary group-hover:to-primary/80 group-hover:text-primary-foreground transition-all duration-200 shadow-sm ring-1 ring-primary/10 group-hover:ring-primary/30">
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 tracking-tight text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Learning Journey */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -z-10" />
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-center mb-16 text-foreground">The Learning Journey</h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 max-w-5xl mx-auto">
              {[
                { title: "Topic", icon: Sparkles },
                { title: "AI Generation", icon: BrainCircuit },
                { title: "Interactive Lessons", icon: BookOpen },
                { title: "Practice", icon: Code },
                { title: "Interview Prep", icon: MessageSquare },
                { title: "Certificate", icon: Award }
              ].map((step, i, arr) => (
                <React.Fragment key={i}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: i * 0.1 }}
                    className="flex flex-col items-center gap-4"
                  >
                    <div className="h-16 w-16 rounded-2xl bg-card border border-border/40 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-center relative group hover:border-border/80 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-200">
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      <step.icon className="h-7 w-7 text-foreground group-hover:text-primary transition-colors duration-200 relative z-10" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">{step.title}</span>
                  </motion.div>
                  {i < arr.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.25, delay: i * 0.1 + 0.05 }}
                      className="hidden md:flex items-center justify-center"
                    >
                      <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                    </motion.div>
                  )}
                  {i < arr.length - 1 && (
                    <div className="md:hidden h-8 w-px bg-gradient-to-b from-border to-transparent" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Testimonials */}
        <section className="py-24 bg-muted/20 border-y border-border/40">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <div className="inline-block rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary mb-4 shadow-sm backdrop-blur-sm">
                Demo Feedback
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">Loved by professionals</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {[
                { name: "Sarah J.", role: "Software Engineer", quote: "I needed to learn Rust for a new project. CourseAI generated a complete interactive roadmap that got me up to speed in a week." },
                { name: "Michael T.", role: "Product Manager", quote: "The mock interview feature is insanely good. The voice feedback feels exactly like talking to a real hiring manager." },
                { name: "Elena R.", role: "Data Scientist", quote: "Being able to instantly generate flashcards and coding labs from my syllabus has transformed how I retain complex algorithms." }
              ].map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: i * 0.1 }}
                >
                  <Card className="p-8 bg-card/40 backdrop-blur-xl border border-border/40 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col justify-between h-full hover:shadow-[0_8px_30px_rgb(0,0,0,0.05)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.1)] hover:-translate-y-1 hover:border-border/80 transition-all duration-200">
                    <div className="mb-8">
                      <div className="flex gap-1 mb-5">
                        {[1,2,3,4,5].map(star => <Sparkles key={star} className="h-4 w-4 fill-amber-500 text-amber-500" />)}
                      </div>
                      <p className="text-foreground text-[15px] leading-relaxed font-medium">"{t.quote}"</p>
                    </div>
                    <div className="flex items-center gap-4 pt-5 border-t border-border/40 mt-auto">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-cyan-400/20 flex items-center justify-center font-bold text-foreground ring-1 ring-border shadow-sm">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">{t.role}</div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. CTA */}
        <section className="py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] aspect-square bg-gradient-to-r from-primary/30 to-cyan-400/30 rounded-full opacity-30 blur-[100px] pointer-events-none" />
          
          <div className="container relative z-10 px-4 md:px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl mx-auto bg-card/40 backdrop-blur-xl border border-border/40 p-12 md:p-16 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 text-foreground drop-shadow-sm relative z-10">
                Ready to Start Learning Smarter?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto font-medium relative z-10">
                Join thousands of learners generating personalized education instantly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
                <Button asChild size="lg" className="h-12 px-8 rounded-xl text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_8px_30px_rgb(0,0,0,0.12)] shadow-primary/20 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background ring-1 ring-inset ring-white/20 w-full sm:w-auto">
                  <Link to="/signup">
                    Generate Your First Course
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8 rounded-xl text-base font-bold border border-border/50 hover:bg-muted/50 backdrop-blur-sm transition-all duration-200 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:-translate-y-0.5 hover:shadow-sm w-full sm:w-auto">
                  <Link to="/community">
                    View Demo
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      {/* 8. Footer */}
      <footer className="border-t border-border/40 bg-background pt-16 pb-8">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-16">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl tracking-tight mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <BrainCircuit className="h-5 w-5 text-primary-foreground" />
                </div>
                CourseAI Pro
              </div>
              <p className="text-muted-foreground text-sm max-w-xs mb-6">
                The most advanced AI-powered platform for dynamic curriculum generation and interactive learning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/" className="hover:text-primary transition-colors">Features</Link></li>
                <li><Link to="/community" className="hover:text-primary transition-colors">Community</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/changelog" className="hover:text-primary transition-colors">Changelog</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link to="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link to="/guides" className="hover:text-primary transition-colors">Guides</Link></li>
                <li><Link to="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/40 text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} CourseAI Pro. All rights reserved.</p>
            <div className="flex items-center gap-2 mt-4 md:mt-0">
              <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              All systems operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
