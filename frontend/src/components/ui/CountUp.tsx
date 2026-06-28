import React from 'react';

export const CountUp = ({ end, decimals = 0, suffix = "", duration = 1500 }: { end: number, decimals?: number, suffix?: string, duration?: number }) => {
  const [count, setCount] = React.useState(0);
  
  React.useEffect(() => {
    let startTime: number | null = null;
    let animationFrameId: number;

    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(easeProgress * end);
      
      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };
    
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [end, duration]);
  
  return <>{count.toFixed(decimals)}{suffix}</>;
};
