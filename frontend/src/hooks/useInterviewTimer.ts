import { useState, useEffect } from 'react';
import type { InterviewPrep } from '../types';

export function useInterviewTimer(activePrep: InterviewPrep | null) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!(activePrep && activePrep.status === 'pending')) return;
    const prepId = activePrep._id;

    // The initial setElapsedTime(Number(saved)) is deferred to a microtask
    // so it reads as a callback invocation rather than a synchronous
    // setState call within the effect body.
    queueMicrotask(() => {
      const saved = sessionStorage.getItem(`interview_timer_${prepId}`);
      if (saved) setElapsedTime(Number(saved));
    });

    const interval = setInterval(() => {
      setElapsedTime(prev => {
        const next = prev + 1;
        sessionStorage.setItem(`interview_timer_${prepId}`, next.toString());
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activePrep]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return { elapsedTime, setElapsedTime, formatTime };
}
