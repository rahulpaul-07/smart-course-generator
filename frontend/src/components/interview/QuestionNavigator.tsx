import React, { useRef } from 'react';
import { CheckCircle2, BookOpen, Code2, User } from 'lucide-react';

interface QuestionNavigatorProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  status: string;
}

export function QuestionNavigator({ activeTab, setActiveTab, status }: QuestionNavigatorProps) {
  const tabs = [
    { key: 'mcq', label: 'MCQs', icon: CheckCircle2 },
    { key: 'theory', label: 'Theory', icon: BookOpen },
    { key: 'coding', label: 'Coding', icon: Code2 },
    { key: 'results', label: 'Results', icon: User, hidden: status !== 'completed' }
  ].filter(t => !t.hidden);

  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(t => t.key === activeTab);
    let nextIndex = currentIndex;

    if (e.key === 'ArrowRight') {
      nextIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = tabs.length - 1;
    }

    if (nextIndex !== currentIndex) {
      e.preventDefault();
      const nextTab = tabs[nextIndex];
      setActiveTab(nextTab.key);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div 
      className="lg:hidden flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none border-b border-border/30"
      role="tablist"
      aria-label="Interview Navigation"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab, i) => {
        const isSelected = activeTab === tab.key;
        return (
          <button 
            key={tab.key} 
            ref={(el) => { tabRefs.current[i] = el; }}
            onClick={() => setActiveTab(tab.key)} 
            role="tab"
            aria-selected={isSelected}
            tabIndex={isSelected ? 0 : -1}
            className={`shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-colors ${
              isSelected 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'bg-card border border-border/30 text-muted-foreground hover:text-foreground'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" /> {tab.label}
          </button>
        );
      })}
    </div>
  );
}
