import React, { useRef } from 'react';
import { ArrowLeft, CheckCircle2, MessageSquare, Code2, BookOpen, User } from 'lucide-react';

interface InterviewSidebarProps {
  activePrep: any;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActivePrep: (prep: any) => void;
}

export function InterviewSidebar({ activePrep, activeTab, setActiveTab, setActivePrep }: InterviewSidebarProps) {
  const tabs = [
    { id: 'mcq', label: 'MCQs', icon: CheckCircle2 },
    { id: 'theory', label: 'Theory', icon: BookOpen },
    { id: 'coding', label: 'Coding', icon: Code2 },
    { id: 'results', label: 'Results', icon: User, hidden: activePrep.status !== 'completed' },
  ].filter(t => !t.hidden);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      setActiveTab(nextTab.id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <aside className="w-80 border-r border-border/30 bg-card/30 backdrop-blur-xl flex flex-col hidden lg:flex relative z-10 shadow-[4px_0_24px_rgb(0,0,0,0.02)]">
      <div className="p-6 border-b border-border/30">
        <button onClick={() => setActivePrep(null)} className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-6 w-fit bg-muted/50 px-3 py-1.5 rounded-lg hover:bg-muted">
          <ArrowLeft className="h-4 w-4" /> Exit Session
        </button>
        <h2 className="font-serif text-xl font-bold tracking-tight text-foreground line-clamp-2">{activePrep.topic}</h2>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-border/30 bg-background/50 px-3 py-1 text-xs font-semibold text-muted-foreground shadow-sm">
          <div className={`h-2 w-2 rounded-full ${activePrep.status === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
          {activePrep.status === 'pending' ? 'In Progress' : 'Completed'}
        </div>
      </div>
      <nav 
        className="flex-1 overflow-y-auto p-4 space-y-2"
        role="tablist"
        aria-orientation="vertical"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {tabs.map((tab, i) => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={el => tabRefs.current[i] = el}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all duration-200 text-sm font-bold ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span className="flex items-center gap-3"><tab.icon className="h-4 w-4" /> {tab.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/30 bg-background/50 backdrop-blur-md">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <MessageSquare className="h-5 w-5 text-primary shrink-0 relative z-10" />
          <div className="relative z-10">
            <h4 className="text-[13px] font-bold text-foreground mb-1">AI Coach Available</h4>
            <p className="text-[12px] text-muted-foreground font-medium leading-relaxed">Ask questions or practice mock interviews anytime.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
