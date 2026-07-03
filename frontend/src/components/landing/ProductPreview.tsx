import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, BrainCircuit, ArrowRight, ShieldCheck, 
  BookOpen, Code, CheckCircle2, PlayCircle, 
  Award, MessageSquare, LayoutDashboard, Zap
} from 'lucide-react';

const PreviewDashboard = () => (
  <div className="flex flex-col gap-4 h-full w-full">
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-card rounded-xl p-4 border border-border/30 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Courses Completed</p>
          <p className="text-2xl font-bold">12</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Award className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="bg-card rounded-xl p-4 border border-border/30 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Current Streak</p>
          <p className="text-2xl font-bold">5 Days</p>
        </div>
        <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
          <Zap className="h-5 w-5 text-warning" />
        </div>
      </div>
    </div>
    
    <div className="flex-1 bg-card rounded-xl p-6 border border-border/30 shadow-sm flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold">Continue Learning</h3>
        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">In Progress</span>
      </div>
      <div className="flex items-start gap-4 mb-4">
        <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shrink-0 shadow-inner">
          <BrainCircuit className="h-6 w-6 text-primary-foreground" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">Advanced React Architecture</h4>
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
            className="h-full bg-gradient-to-r from-primary to-primary rounded-full" 
          />
        </div>
      </div>
    </div>
  </div>
);

const PreviewCourseViewer = () => (
  <div className="flex gap-5 h-full w-full">
    <div className="w-1/3 flex flex-col gap-2 border-r border-border/30 pr-5 hidden sm:flex">
      <div className="text-xs font-medium text-muted-foreground mb-2">Modules</div>
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
        <h2 className="text-lg font-semibold text-foreground tracking-tight">Advanced Patterns</h2>
        <p className="text-xs text-muted-foreground mt-1">Learn how to implement scalable state management.</p>
      </div>
      <div className="flex-1 bg-card rounded-xl border border-border/30 p-6 shadow-sm space-y-4">
        <div className="h-4 w-3/4 bg-muted/60 rounded" />
        <div className="h-4 w-full bg-muted/60 rounded" />
        <div className="h-4 w-5/6 bg-muted/60 rounded" />
        <div className="my-4 h-24 bg-muted/30 border border-border/30 rounded-lg p-4 space-y-2.5">
           <div className="h-3 w-1/3 bg-muted rounded" />
           <div className="h-3 w-1/2 bg-muted rounded" />
        </div>
        <div className="h-4 w-2/3 bg-muted/60 rounded" />
      </div>
      <div className="mt-4 flex justify-end">
        <div className="bg-primary text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 hover:opacity-90 cursor-pointer">
          Continue <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </div>
    </div>
  </div>
);

const PreviewAITutor = () => (
  <div className="flex flex-col h-full w-full bg-card/40 rounded-xl border border-border/30 overflow-hidden shadow-sm">
    <div className="p-3 border-b border-border/30 bg-muted/20 flex items-center justify-between">
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
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="self-start max-w-[90%] bg-card border border-border/30 text-foreground rounded-2xl rounded-tl-none px-4 py-3 text-sm shadow-sm space-y-3">
        <p>The <code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs font-mono">useEffect</code> dependency array tells React when to re-run your effect.</p>
        <div className="bg-muted/40 rounded-lg border border-border/30 p-3 relative">
          <div className="absolute top-2 right-2 text-[9px] font-medium bg-card border border-border/30 px-2 py-1 rounded text-muted-foreground flex items-center gap-1 cursor-pointer hover:text-foreground">
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
    <div className="p-3 border-t border-border/30 bg-card">
      <div className="bg-muted/30 border border-border/30 rounded-full px-4 py-2 text-xs text-muted-foreground flex justify-between items-center shadow-inner">
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
        <div className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">Question 3 of 10</div>
        <div className="text-xs font-mono font-medium flex items-center gap-2 bg-card border border-border/30 px-3 py-1 rounded-full text-foreground shadow-sm">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" /> 14:59
        </div>
      </div>
      <div className="bg-card flex-1 rounded-xl border border-border/30 shadow-sm p-6 flex flex-col">
        <h3 className="text-sm font-semibold mb-2 text-foreground">Implement a custom React Hook</h3>
        <p className="text-xs text-muted-foreground mb-4">
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
    
    <div className="w-[35%] bg-card/60 rounded-xl border border-border/30 shadow-sm p-6 hidden sm:flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-3 border-b border-border/30">
        <div className="h-7 w-7 rounded-lg bg-primary/20 flex items-center justify-center">
          <BrainCircuit className="h-4 w-4 text-primary" />
        </div>
        <span className="text-xs font-semibold">AI Coach</span>
      </div>
      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-muted/40 border border-border/30 rounded-lg p-3 text-xs text-muted-foreground space-y-2 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
        <p><strong className="text-foreground">Hint:</strong> Think about what built-in hook allows you to perform side effects, and how you can clean up timers when the value changes.</p>
      </motion.div>
      <div className="mt-auto pt-4 border-t border-border/30">
        <div className="w-full bg-foreground text-background py-2 rounded-lg flex items-center justify-center text-xs font-semibold cursor-pointer shadow-sm hover:opacity-90">
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
      className="relative w-full max-w-sm aspect-[1.414/1] bg-card rounded-sm shadow-lg border border-border/30 p-6 flex flex-col items-center text-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.06),transparent_70%)]" />
      <div className="absolute -inset-[1px] border-2 border-warning/20 rounded-sm pointer-events-none" />
      <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-warning/40 rounded-tl-sm pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-warning/40 rounded-br-sm pointer-events-none" />
      
      <Award className="h-10 w-10 text-warning mb-3 drop-shadow-md relative z-10" />
      <h2 className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground font-bold mb-1.5 relative z-10">Certificate of Completion</h2>
      <h1 className="text-lg font-display font-bold text-foreground mb-4 relative z-10">
        Advanced React Architecture
        <div className="absolute -bottom-2 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-warning/50 to-transparent" />
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
      <div className="flex-1 bg-primary text-primary-foreground text-xs font-semibold py-2.5 rounded-lg text-center shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
        Download PDF
      </div>
      <div className="flex-1 bg-card border border-border/30 text-foreground text-xs font-semibold py-2.5 rounded-lg text-center shadow-sm cursor-pointer hover:bg-muted/50 transition-colors flex items-center justify-center gap-1.5">
        <ShieldCheck className="h-3.5 w-3.5" /> Verify
      </div>
    </div>
  </div>
);

export const ProductPreview = () => {
  const [activeTab, setActiveTab] = React.useState('Dashboard');

  const tabs = React.useMemo(() => [
    { id: 'Dashboard', icon: LayoutDashboard },
    { id: 'Curriculum', icon: BookOpen },
    { id: 'Tutor', icon: MessageSquare },
    { id: 'Interviews', icon: Code },
    { id: 'Certificates', icon: Award },
  ], []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = tabs.findIndex(t => t.id === current);
        const nextIndex = (currentIndex + 1) % tabs.length;
        return tabs[nextIndex].id;
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [tabs]);

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <PreviewDashboard />;
      case 'Curriculum': return <PreviewCourseViewer />;
      case 'Tutor': return <PreviewAITutor />;
      case 'Interviews': return <PreviewInterviewPrep />;
      case 'Certificates': return <PreviewCertificate />;
      default: return <PreviewDashboard />;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-20 relative z-10">
      <div className="absolute inset-0 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="relative rounded-[24px] border border-border/30 bg-background/80 backdrop-blur-2xl shadow-lg overflow-hidden ring-1 ring-white/10 flex flex-col">
        {/* Browser Header */}
        <div className="h-12 border-b border-border/30 bg-muted/20 flex items-center px-4 gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive/80 border border-destructive" />
            <div className="w-3 h-3 rounded-full bg-warning/80 border border-warning" />
            <div className="w-3 h-3 rounded-full bg-success/80 border border-success" />
          </div>
          <div className="flex-1 max-w-md mx-auto bg-background/50 border border-border/30 h-7 rounded-md flex items-center px-3 justify-center shadow-inner">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-success" /> app.courseai.com
            </span>
          </div>
          <div className="w-[52px]" />
        </div>
        
        {/* Main Interface */}
        <div className="flex h-[450px]">
          {/* Sidebar */}
          <div className="w-16 md:w-56 border-r border-border/30 bg-muted/10 p-3 flex flex-col gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center md:hidden mb-4 mx-auto">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="hidden md:flex items-center gap-2 px-2 mb-6 mt-1">
              <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center shrink-0">
                <Sparkles className="h-3 w-3 text-primary" />
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground">CourseAI</span>
            </div>
            
            {tabs.map((tab) => (
              <button 
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center md:justify-start gap-3 p-2 md:px-3 md:py-2.5 rounded-lg cursor-pointer transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 w-full ${
                  activeTab === tab.id 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-sm font-medium hidden md:block capitalize">{tab.id}</span>
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTabIndicator" className="absolute left-0 w-1 h-8 bg-primary rounded-r-full md:hidden" />
                )}
              </button>
            ))}
          </div>
          
          {/* Content Area */}
          <div className="flex-1 bg-background/40 p-4 md:p-8 relative overflow-hidden flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full flex flex-col"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
