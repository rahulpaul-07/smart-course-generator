import { useEffect, useId, useState, type RefObject } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Adapted from Magic UI's Animated Beam (MIT, magicui.design). Changes: uses
 * framer-motion (already a dependency) instead of the `motion` package, takes
 * its colours from the theme, and draws a static path under reduced motion.
 */
export interface AnimatedBeamProps {
  className?: string;
  containerRef: RefObject<HTMLElement | null>;
  fromRef: RefObject<HTMLElement | null>;
  toRef: RefObject<HTMLElement | null>;
  curvature?: number;
  reverse?: boolean;
  /** Draw only the resting path, no travelling highlight. */
  idle?: boolean;
  duration?: number;
  delay?: number;
  pathWidth?: number;
}

export function AnimatedBeam({
  className,
  containerRef,
  fromRef,
  toRef,
  curvature = 0,
  reverse = false,
  idle = false,
  duration = 3,
  delay = 0,
  pathWidth = 2,
}: AnimatedBeamProps) {
  const id = useId();
  const reduce = useReducedMotion();
  const [pathD, setPathD] = useState('');
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updatePath = () => {
      if (!fromRef.current || !toRef.current) return;
      const box = container.getBoundingClientRect();
      const a = fromRef.current.getBoundingClientRect();
      const b = toRef.current.getBoundingClientRect();
      setSize({ width: box.width, height: box.height });

      const startX = a.left - box.left + a.width / 2;
      const startY = a.top - box.top + a.height / 2;
      const endX = b.left - box.left + b.width / 2;
      const endY = b.top - box.top + b.height / 2;
      setPathD(`M ${startX},${startY} Q ${(startX + endX) / 2},${startY - curvature} ${endX},${endY}`);
    };

    const observer = new ResizeObserver(updatePath);
    observer.observe(container);
    updatePath();
    return () => observer.disconnect();
  }, [containerRef, fromRef, toRef, curvature]);

  const x1 = reverse ? ['90%', '-10%'] : ['10%', '110%'];
  const x2 = reverse ? ['100%', '0%'] : ['0%', '100%'];
  const animate = !idle && !reduce;

  return (
    <svg
      aria-hidden
      fill="none"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      className={cn('pointer-events-none absolute left-0 top-0', className)}
    >
      <path d={pathD} className="stroke-border" strokeWidth={pathWidth} strokeLinecap="round" />
      {animate && (
        <>
          <path d={pathD} stroke={`url(#${id})`} strokeWidth={pathWidth} strokeLinecap="round" />
          <defs>
            <motion.linearGradient
              id={id}
              gradientUnits="userSpaceOnUse"
              initial={{ x1: '0%', x2: '0%', y1: '0%', y2: '0%' }}
              animate={{ x1, x2, y1: ['0%', '0%'], y2: ['0%', '0%'] }}
              transition={{ delay, duration, ease: [0.16, 1, 0.3, 1], repeat: Infinity }}
            >
              <stop stopColor="hsl(var(--primary))" stopOpacity="0" />
              <stop stopColor="hsl(var(--primary))" />
              <stop offset="32.5%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </>
      )}
    </svg>
  );
}
