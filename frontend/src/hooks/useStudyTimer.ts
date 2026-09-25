import { useEffect } from 'react';
import api from '../utils/api';

const TICK_MS = 60_000;
const REPORT_EVERY_MIN = 5;
const IDLE_AFTER_MS = 3 * 60_000;

/**
 * Counts minutes of active reading and reports them in 5-minute batches.
 *
 * POST /analytics/study-time existed but nothing called it, so every user's
 * study time was 0: the analytics "hours studied" were always empty and
 * adaptive lesson difficulty treated everyone as a beginner. A minute only
 * counts while the tab is visible and the learner has interacted within the
 * last three minutes; the server also caps credit by real elapsed time.
 */
export function useStudyTimer(enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let lastActivity = Date.now();
    let pending = 0;

    const markActive = () => {
      lastActivity = Date.now();
    };
    const flush = () => {
      if (pending <= 0) return;
      const minutes = pending;
      pending = 0;
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      api.post('/analytics/study-time', { minutes, timezone }).catch(() => {
        // Best-effort: a dropped report only loses a few minutes of credit.
      });
    };

    const events: (keyof WindowEventMap)[] = ['scroll', 'keydown', 'pointerdown', 'pointermove'];
    events.forEach((e) => window.addEventListener(e, markActive, { passive: true }));

    const id = window.setInterval(() => {
      const visible = document.visibilityState === 'visible';
      if (visible && Date.now() - lastActivity < IDLE_AFTER_MS) pending += 1;
      if (pending >= REPORT_EVERY_MIN) flush();
    }, TICK_MS);

    const onHide = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', onHide);

    return () => {
      window.clearInterval(id);
      events.forEach((e) => window.removeEventListener(e, markActive));
      document.removeEventListener('visibilitychange', onHide);
      flush();
    };
  }, [enabled]);
}
