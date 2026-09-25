import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from './useAuth';

const SLOW_AFTER_MS = 4000;

/**
 * Start an ephemeral guest session and land on the dashboard.
 *
 * `waking` flips on if the request is still pending after a few seconds,
 * which on the free-tier API almost always means it is cold-starting, so the
 * button can say so instead of spinning silently for half a minute.
 */
export function useDemoLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);
  const [waking, setWaking] = useState(false);
  const slowTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(slowTimer.current), []);

  async function startDemo() {
    if (starting) return;
    setStarting(true);
    slowTimer.current = window.setTimeout(() => setWaking(true), SLOW_AFTER_MS);
    const [user] = await authService.demo();
    window.clearTimeout(slowTimer.current);
    setStarting(false);
    setWaking(false);
    if (user) {
      login(user);
      navigate('/dashboard');
    }
  }

  return { startDemo, starting, waking };
}
