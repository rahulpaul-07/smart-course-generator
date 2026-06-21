import { useEffect, useState } from 'react';

export default function ReadingProgress({ containerRef }) {
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
    <div className="fixed left-0 right-0 top-[4.5rem] z-40 h-0.5 bg-white/[0.04]">
      <div
        className="h-full origin-left bg-gradient-to-r from-violet-500 via-brand-400 to-cyan-400 shadow-[0_0_12px_rgba(99,102,241,0.7)]"
        style={{ transform: `scaleX(${progress})` }}
      />
    </div>
  );
}
