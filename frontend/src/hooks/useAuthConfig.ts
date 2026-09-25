import { useQuery } from '@tanstack/react-query';
import { authService, type AuthConfig } from '../services/authService';

/**
 * Shown until the server answers. Demo mode is assumed on (unless the build
 * opts out with VITE_DEMO_MODE=false) because the API runs on a free tier that
 * sleeps: waiting for /auth/config meant a first-time visitor saw "Create a
 * free account" instead of "Try the demo" for the 20-60s the server took to
 * wake. The button is hidden only if the server explicitly says demo is off.
 */
const OPTIMISTIC: AuthConfig = {
  demo: import.meta.env.VITE_DEMO_MODE !== 'false',
  google: false,
  auth0: false,
};

/** Which sign-in options this backend actually supports. */
export function useAuthConfig(): AuthConfig {
  const { data } = useQuery({
    queryKey: ['auth-config'],
    queryFn: async () => {
      const [config] = await authService.config();
      // An unreachable server says nothing about demo mode; keep the default.
      if (!config) throw new Error('auth config unavailable');
      return config;
    },
    staleTime: Infinity,
    retry: 2,
    retryDelay: 5000,
  });
  return data ?? OPTIMISTIC;
}
