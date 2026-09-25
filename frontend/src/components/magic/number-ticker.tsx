import { useEffect, useRef, useState } from 'react';
import { useInView, useReducedMotion } from 'framer-motion';

interface NumberTickerProps {
  value: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

/** Counts up to `value` the first time it scrolls into view. */
export function NumberTicker({ value, duration = 1400, decimals = 0, suffix = '', className }: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduce = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const start = performance.now();
    const total = reduce ? 1 : duration;
    const tick = (now: number) => {
      const t = Math.min((now - start) / total, 1);
      setCurrent(t >= 1 ? value : value * (1 - Math.pow(2, -10 * t)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {current.toFixed(decimals)}
      {suffix}
    </span>
  );
}
