import { Bot } from 'lucide-react';
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
      <section className="mb-10">
        <p className="eyebrow"><Bot className="h-3.5 w-3.5" /> Multi-Agent System</p>
        <h1 className="gradient-text mt-3 font-display text-3xl font-extrabold">AI Assistant Hub</h1>
        <p className="mt-2 text-sm text-muted-foreground">Leverage specialized AI agents to accelerate your learning journey.</p>
      </section>

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
