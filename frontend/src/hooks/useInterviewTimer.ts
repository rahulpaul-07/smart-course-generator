import { useState, useEffect } from 'react';

export function useInterviewTimer(activePrep: any) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (activePrep && activePrep.status === 'pending') {
      const saved = sessionStorage.getItem(`interview_timer_${activePrep._id}`);
      if (saved) setElapsedTime(Number(saved));
      
      const interval = setInterval(() => {
        setElapsedTime(prev => {
          const next = prev + 1;
          sessionStorage.setItem(`interview_timer_${activePrep._id}`, next.toString());
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activePrep]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return { elapsedTime, setElapsedTime, formatTime };
}
