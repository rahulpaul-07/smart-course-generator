import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from './useAuth';

/** Start an ephemeral guest session and land on the dashboard. */
export function useDemoLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  async function startDemo() {
    if (starting) return;
    setStarting(true);
    const [user] = await authService.demo();
    setStarting(false);
    if (user) {
      login(user);
      navigate('/dashboard');
    }
  }

  return { startDemo, starting };
}
