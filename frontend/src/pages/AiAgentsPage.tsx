import { Bot } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { useAiAgents } from '../hooks/useAiAgents';
import { AgentSidebar } from '../components/agents/AgentSidebar';
import { AgentHeaderInputs } from '../components/agents/AgentHeaderInputs';
import { AgentResultView } from '../components/agents/AgentResultView';
import { AgentsSkeleton } from '../components/agents/AgentsSkeleton';
import { ErrorState } from '../components/ui/ErrorState';

export default function AiAgentsPage() {
  const {
    activeTab,
    setActiveTab,
    loading,
    result,
    setResult,
    courses,
    selectedCourse,
    setSelectedCourse,
    goalsInput,
    setGoalsInput,
    interestsInput,
    setInterestsInput,
    handleRunAgent
  } = useAiAgents();

  return (
    <div className="page-shell">
      <PageHeader
        eyebrow={{ icon: Bot, label: 'Multi-agent system' }}
        title="AI insights"
        description="Specialised agents that review your courses, coach you and plan what to revise."
      />

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <AgentSidebar activeTab={activeTab} setActiveTab={setActiveTab} setResult={setResult} />

        <div className="glass-card flex flex-col rounded-2xl overflow-hidden border border-border/30">
          <AgentHeaderInputs 
            activeTab={activeTab}
            courses={courses}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            goalsInput={goalsInput}
            setGoalsInput={setGoalsInput}
            interestsInput={interestsInput}
            setInterestsInput={setInterestsInput}
            handleRunAgent={handleRunAgent}
            loading={loading}
          />

          <div className="p-6 bg-background/20 min-h-[400px]">
            {loading ? (
              <AgentsSkeleton />
            ) : result?.error ? (
              <div className="py-12">
                <ErrorState 
                  title="Agent execution failed" 
                  description={result.error || "The AI encountered an issue. Please try again."}
                  onRetry={handleRunAgent}
                />
              </div>
            ) : (
              <AgentResultView activeTab={activeTab} result={result} onRun={handleRunAgent} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
