import React from 'react';
import { Bot } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import { tabs } from './AgentSidebar';

interface AgentHeaderInputsProps {
  activeTab: string;
  courses: any[];
  selectedCourse: string;
  setSelectedCourse: (val: string) => void;
  goalsInput: string;
  setGoalsInput: (val: string) => void;
  interestsInput: string;
  setInterestsInput: (val: string) => void;
  handleRunAgent: () => void;
  loading: boolean;
}

export function AgentHeaderInputs({
  activeTab,
  courses,
  selectedCourse,
  setSelectedCourse,
  goalsInput,
  setGoalsInput,
  interestsInput,
  setInterestsInput,
  handleRunAgent,
  loading
}: AgentHeaderInputsProps) {
  return (
    <div className="border-b border-border/ bg-foreground/10 p-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground capitalize">{tabs.find(t => t.id === activeTab)?.label}</h2>
          
          <div className="mt-4">
            {activeTab === 'reviewer' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Select Course to Review</label>
                <select 
                  className="w-full rounded-xl border border-border/ bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-500"
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                >
                  {courses.map(c => <option key={c._id} value={c._id} className="bg-background text-foreground">{c.title}</option>)}
                </select>
              </div>
            )}
            {activeTab === 'planner' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Upcoming Goals (comma separated)</label>
                <input 
                  className="w-full rounded-xl border border-border/ bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-500"
                  placeholder="e.g. Pass interview next week, Build fullstack app"
                  value={goalsInput}
                  onChange={e => setGoalsInput(e.target.value)}
                />
              </div>
            )}
            {activeTab === 'recommend' && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Specific Interests (comma separated)</label>
                <input 
                  className="w-full rounded-xl border border-border/ bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-500"
                  placeholder="e.g. Machine Learning, System Design"
                  value={interestsInput}
                  onChange={e => setInterestsInput(e.target.value)}
                />
              </div>
            )}
            {activeTab === 'coach' && (
              <p className="text-sm text-muted-foreground">The learning coach will analyze your recent quiz scores, activity streaks, and completed modules automatically.</p>
            )}
          </div>
        </div>

        <button
          onClick={handleRunAgent}
          disabled={loading || (activeTab === 'reviewer' && !selectedCourse)}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-foreground transition-all hover:bg-brand-500 disabled:opacity-50 shadow-lg shadow-brand-500/20 shrink-0"
        >
          {loading ? <LoadingSpinner size="sm" /> : <Bot className="h-4 w-4" />}
          Run {activeTab}
        </button>
      </div>
    </div>
  );
}
