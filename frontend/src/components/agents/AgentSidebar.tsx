import React from 'react';
import { Bot, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export const tabs = [
  { id: 'reviewer', label: 'Course Reviewer', icon: CheckCircle2, desc: 'Evaluates a course for quality and gaps.' },
  { id: 'coach', label: 'Learning Coach', icon: Bot, desc: 'Analyzes your activity and provides guidance.' },
  { id: 'planner', label: 'Revision Planner', icon: RefreshCw, desc: 'Creates a custom study schedule for you.' },
  { id: 'recommend', label: 'Recommendations', icon: Send, desc: 'Suggests what you should learn next.' },
];

interface AgentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setResult: (result: any) => void;
}

export function AgentSidebar({ activeTab, setActiveTab, setResult }: AgentSidebarProps) {
  return (
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
                ? 'bg-brand-500/10 border border-brand-500/30 text-foreground shadow-lg'
                : 'bg-background/50 border border-transparent text-muted-foreground hover:bg-card hover:text-foreground'
            }`}
          >
            <div className={`mt-0.5 rounded-lg p-2 ${isActive ? 'bg-brand-500 text-foreground' : 'bg-foreground/10'}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <h3 className={`font-bold ${isActive ? 'text-brand-300' : 'text-foreground/90'}`}>{tab.label}</h3>
              <p className="mt-1 text-xs opacity-70 leading-relaxed">{tab.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
