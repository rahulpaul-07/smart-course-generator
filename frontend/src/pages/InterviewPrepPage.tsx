import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, X } from 'lucide-react';
import { useInterviewSession } from '../hooks/useInterviewSession';
import { useInterviewTimer } from '../hooks/useInterviewTimer';
import { useInterviewAnswers } from '../hooks/useInterviewAnswers';
import { useInterviewResults } from '../hooks/useInterviewResults';
import { InterviewHeader } from '../components/interview/InterviewHeader';
import { InterviewSidebar } from '../components/interview/InterviewSidebar';
import { InterviewToolbar } from '../components/interview/InterviewToolbar';
import { QuestionNavigator } from '../components/interview/QuestionNavigator';
import { TimerPanel } from '../components/interview/TimerPanel';
import { MCQWorkspace } from '../components/interview/MCQWorkspace';
import { TheoryWorkspace } from '../components/interview/TheoryWorkspace';
import { CodingWorkspace } from '../components/interview/CodingWorkspace';
import { ResultsDashboard } from '../components/interview/ResultsDashboard';
import { FeedbackPanel } from '../components/interview/FeedbackPanel';

export default function InterviewPrepPage() {
  const {
    preps,
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
    deletePrep
  } = useInterviewSession();

  const { elapsedTime, formatTime } = useInterviewTimer(activePrep);
  const { readiness, strengths, weaknesses, aiRec } = useInterviewResults(activePrep);

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
    <div className="flex h-screen w-full bg-background overflow-hidden relative">
      <InterviewSidebar
        activePrep={activePrep}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setActivePrep={setActivePrep}
      />

      <main className="flex-1 overflow-y-auto bg-background/95 scroll-smooth relative flex flex-col">
        <InterviewToolbar
          activePrep={activePrep}
          setActivePrep={setActivePrep}
          formattedTime={formatTime(elapsedTime)}
          setIsMobileCoachOpen={setIsMobileCoachOpen}
        />

        <div className="flex-1 px-5 py-8 md:p-10 lg:p-16 w-full max-w-4xl mx-auto">
          {activePrep.status === 'completed' ? (
            <ResultsDashboard prep={activePrep} readiness={readiness} strengths={strengths} weaknesses={weaknesses} aiRec={aiRec} />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full"
              >
                <QuestionNavigator
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  status={activePrep.status}
                />

                <TimerPanel
                  status={activePrep.status}
                  formattedTime={formatTime(elapsedTime)}
                />

                <WorkspaceRouter
                  activeTab={activeTab}
                  prep={activePrep}
                  onUpdate={setActivePrep}
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </main>

      <aside className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[400px] lg:static lg:w-[400px] lg:flex flex-col border-l border-border/30 bg-card/20 backdrop-blur-3xl transition-transform duration-300 ${isMobileCoachOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
        <div className="h-full flex flex-col shadow-lg lg:shadow-none bg-background lg:bg-transparent">
          <div className="flex items-center justify-between px-6 py-5 border-b border-border/30 bg-card/50 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-lg shadow-primary/20">
                <Brain className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground leading-tight tracking-tight">AI Interview Coach</h3>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Active
                </p>
              </div>
            </div>
            <button onClick={() => setIsMobileCoachOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <FeedbackPanel prep={activePrep} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function WorkspaceRouter({ activeTab, prep, onUpdate }: any) {
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

  if (activeTab === 'mcq') {
    return (
      <MCQWorkspace
        prep={prep}
        mcqAnswers={mcqAnswers}
        setMcqAnswers={setMcqAnswers}
        submitted={submitted}
        submitting={submitting}
        submitAssessment={submitAssessment}
      />
    );
  }

  if (activeTab === 'theory') {
    return (
      <TheoryWorkspace
        prep={prep}
        theoryAnswers={theoryAnswers}
        setTheoryAnswers={setTheoryAnswers}
        submitted={submitted}
      />
    );
  }

  if (activeTab === 'coding') {
    return (
      <CodingWorkspace
        prep={prep}
        codingSolutions={codingSolutions}
        setCodingSolutions={setCodingSolutions}
        submitted={submitted}
      />
    );
  }

  return null;
}


