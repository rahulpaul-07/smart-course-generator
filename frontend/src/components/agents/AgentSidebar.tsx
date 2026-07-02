import React from 'react';
import type { AgentResult } from './AgentResultView';
import { tabs } from './agentTabs';

interface AgentSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setResult: (result: AgentResult | null) => void;
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
