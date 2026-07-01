import { useState } from 'react';
import toast from 'react-hot-toast';
import { interviewService } from '../services/interviewService';
import { useSessionStorage } from './useStorage';
import type { InterviewPrep } from '../types';

export function useInterviewAnswers(prep: InterviewPrep, onUpdate?: (prep: InterviewPrep) => void) {
  const [mcqAnswers, setMcqAnswers] = useSessionStorage<number[]>(
    `interview_mcq_${prep._id}`, 
    () => prep.mcqs?.map((q) => (q.userAnswer ?? -1) >= 0 ? q.userAnswer as number : -1) || []
  );
  
  const [theoryAnswers, setTheoryAnswers] = useSessionStorage<string[]>(
    `interview_theory_${prep._id}`, 
    () => prep.theoryQuestions?.map((q) => q.userAnswer || '') || []
  );

  const [codingSolutions, setCodingSolutions] = useSessionStorage<string[]>(
    `interview_coding_${prep._id}`, 
    () => prep.codingQuestions?.map((q) => q.userSolution || '') || []
  );

  const [submitted, setSubmitted] = useSessionStorage<boolean>(
    `interview_mcq_submitted_${prep._id}`, 
    () => prep.status === 'completed'
  );
  const [submitting, setSubmitting] = useState(false);

  async function submitAssessment() {
    setSubmitting(true);
    const [data, error] = await interviewService.submitAssessment(prep._id, {
      mcqAnswers,
      theoryAnswers,
      codingSolutions,
    });
    setSubmitting(false);

    if (!error && data) {
      setSubmitted(true);
      if (onUpdate) {
        onUpdate({ ...prep, ...data, status: 'completed', overallScore: data.overallScore });
      }
      toast.success(`Score: ${data.overallScore}%`);
    }
  }

  return {
    mcqAnswers,
    setMcqAnswers,
    theoryAnswers,
    setTheoryAnswers,
    codingSolutions,
    setCodingSolutions,
    submitted,
    submitting,
    submitAssessment
  };
}
