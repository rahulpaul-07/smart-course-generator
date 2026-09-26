import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, X } from 'lucide-react';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useInterviewTimer } from '../hooks/useInterviewTimer';
import { useInterviewAnswers } from '../hooks/useInterviewAnswers';
import { useInterviewResults } from '../hooks/useInterviewResults';
import type { InterviewPrep } from '../types';
import { InterviewHeader } from '../components/interview/InterviewHeader';
import { SessionHeader } from '../components/interview/SessionHeader';
import { SubmitBar } from '../components/interview/SubmitBar';
import { MCQWorkspace } from '../components/interview/MCQWorkspace';
import { TheoryWorkspace } from '../components/interview/TheoryWorkspace';
import { CodingWorkspace } from '../components/interview/CodingWorkspace';
import { ResultsDashboard } from '../components/interview/ResultsDashboard';
import { FeedbackPanel } from '../components/interview/FeedbackPanel';
import { InterviewPrepSkeleton } from '../components/interview/InterviewPrepSkeleton';
import { ErrorState } from '../components/ui/ErrorState';

export default function InterviewPrepPage() {
  const {
    preps,
    loading,
    error,
    generating,
    topic,
    setTopic,
    activePrep,
    setActivePrep,
    activeTab,
    setActiveTab,
    isMobileCoachOpen,
    setIsMobileCoachOpen,
    generate,
    viewPrep,
    deletePrep,
    refetch
  } = useInterviewSession();

  const { elapsedTime, formatTime } = useInterviewTimer(activePrep);
  const { readiness, strengths, weaknesses, aiRec } = useInterviewResults(activePrep);

  if (loading) {
    return <InterviewPrepSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6 lg:p-12 flex items-center justify-center">
        <ErrorState
          title="Unable to load interview data"
          description="Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!activePrep) {
    return (
      <InterviewHeader
        topic={topic}
        setTopic={setTopic}
        generate={(e) => generate(e, () => {})}
        generating={generating}
        preps={preps}
        viewPrep={viewPrep}
        deletePrep={deletePrep}
      />
    );
  }

  return (
    <div className="relative flex h-full min-h-0 w-full overflow-hidden bg-background">
      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        <SessionHeader
          prep={activePrep}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onExit={() => setActivePrep(null)}
          formattedTime={formatTime(elapsedTime)}
          onOpenCoach={() => setIsMobileCoachOpen(true)}
        />

        <div className="mx-auto w-full min-w-0 max-w-4xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {activePrep.status === 'completed' && activeTab === 'results' ? (
            <ResultsDashboard prep={activePrep} readiness={readiness} strengths={strengths} weaknesses={weaknesses} aiRec={aiRec} />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="w-full"
              >
                <WorkspaceRouter
                  activeTab={activeTab}
                  prep={activePrep}
                  onUpdate={(value) => {
                    setActivePrep(value);
                    const next = typeof value === 'function' ? value(activePrep) : value;
                    if (next?.status === 'completed') setActiveTab('results');
                  }}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      {isMobileCoachOpen && (
        <button
          type="button"
          aria-label="Close coach"
          onClick={() => setIsMobileCoachOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm xl:hidden"
        />
      )}
      <aside
        aria-label="AI interview coach"
        className={`fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-border bg-background transition-transform duration-300 sm:w-[400px] xl:static xl:z-auto xl:w-[360px] xl:translate-x-0 xl:shrink-0 2xl:w-[400px] ${isMobileCoachOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Brain className="h-4 w-4 text-primary" />
            </span>
            <div>
              <h2 className="text-sm font-semibold leading-tight">AI interviewer</h2>
              <p className="text-xs text-muted-foreground">Follow-ups, hints and mock rounds</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileCoachOpen(false)}
            aria-label="Close coach"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">
          <FeedbackPanel prep={activePrep} />
        </div>
      </aside>
    </div>
  );
}

interface WorkspaceRouterProps {
  activeTab: string;
  prep: InterviewPrep;
  onUpdate: (value: InterviewPrep | null | ((val: InterviewPrep | null) => InterviewPrep | null)) => void;
}

function WorkspaceRouter({ activeTab, prep, onUpdate }: WorkspaceRouterProps) {
  const {
    mcqAnswers,
    setMcqAnswers,
    theoryAnswers,
    setTheoryAnswers,
    codingSolutions,
    setCodingSolutions,
    submitted,
    submitting,
    submitAssessment
  } = useInterviewAnswers(prep, onUpdate);

  let workspace: React.ReactNode = null;
  if (activeTab === 'mcq') {
    workspace = <MCQWorkspace prep={prep} mcqAnswers={mcqAnswers} setMcqAnswers={setMcqAnswers} submitted={submitted} />;
  } else if (activeTab === 'theory') {
    workspace = <TheoryWorkspace prep={prep} theoryAnswers={theoryAnswers} setTheoryAnswers={setTheoryAnswers} submitted={submitted} />;
  } else if (activeTab === 'coding') {
    workspace = <CodingWorkspace prep={prep} codingSolutions={codingSolutions} setCodingSolutions={setCodingSolutions} submitted={submitted} />;
  }

  return (
    <>
      {workspace}
      {/* One submit for the whole assessment, visible from every section. It
          used to exist only at the bottom of the MCQ tab, so someone who
          finished on Coding had no visible way to hand in. */}
      {!submitted && (
        <SubmitBar
          counts={[
            { label: 'MCQ', done: mcqAnswers.filter((a) => a >= 0).length, total: prep.mcqs?.length ?? 0 },
            { label: 'Theory', done: theoryAnswers.filter((a) => a.trim()).length, total: prep.theoryQuestions?.length ?? 0 },
            { label: 'Coding', done: codingSolutions.filter((a) => a.trim()).length, total: prep.codingQuestions?.length ?? 0 },
          ]}
          submitting={submitting}
          onSubmit={submitAssessment}
        />
      )}
    </>
  );
}


