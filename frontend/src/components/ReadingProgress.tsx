import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import React from 'react';

export default function ReadingProgress({ containerRef }: { containerRef: React.RefObject<HTMLElement> }) {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const updateProgress = () => {
      const scrollableDistance = container.scrollHeight - container.clientHeight;

      if (scrollableDistance <= 0) {
        setVisible(false);
        setProgress(0);
        return;
      }

      setVisible(true);
      const nextProgress = container.scrollTop / scrollableDistance;
      setProgress(Math.max(0, Math.min(nextProgress, 1)));
    };

    const resizeObserver = new ResizeObserver(updateProgress);
    resizeObserver.observe(container);

    const readingContent = container.querySelector('[data-reading-content]');
    if (readingContent) resizeObserver.observe(readingContent);

    container.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => {
      container.removeEventListener('scroll', updateProgress);
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  if (!visible) return null;

  return (
    <div className="absolute top-0 left-0 right-0 z-50 h-[3px] bg-transparent pointer-events-none">
      <motion.div
        className="h-full origin-left bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: progress }}
        transition={{ duration: 0.1, ease: 'easeOut' }}
      />
    </div>
  );
}
