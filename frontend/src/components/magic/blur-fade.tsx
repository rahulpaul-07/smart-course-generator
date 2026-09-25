import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
}

/** Fade + unblur + rise, once, when the element enters the viewport. */
export function BlurFade({ children, className, delay = 0, y = 12, immediate }: BlurFadeProps) {
  const reduce = useReducedMotion();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y, filter: 'blur(6px)' };
  const shown = reduce ? { opacity: 1 } : { opacity: 1, y: 0, filter: 'blur(0px)' };

  return (
    <motion.div
      className={className}
      initial={hidden}
      {...(immediate ? { animate: shown } : { whileInView: shown, viewport: { once: true, margin: '-60px' } })}
      transition={{ duration: 0.5, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    >
      {children}
    </motion.div>
  );
}
