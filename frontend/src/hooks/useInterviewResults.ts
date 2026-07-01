import type { InterviewPrep } from '../types';

export function useInterviewResults(prep: InterviewPrep | null) {
  const readiness = prep?.readiness || 'Evaluating...';
  const strengths = prep?.strengths || [];
  const weaknesses = prep?.weaknesses || [];
  const aiRec = prep?.summary || 'Summary not available.';

  return {
    readiness,
    strengths,
    weaknesses,
    aiRec
  };
}
