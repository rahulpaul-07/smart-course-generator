import { useQuery } from '@tanstack/react-query';
import { authService, type AuthConfig } from '../services/authService';

const FALLBACK: AuthConfig = { demo: false, google: false, auth0: false };

/** Which sign-in options this backend actually supports. */
export function useAuthConfig(): AuthConfig {
  const { data } = useQuery({
    queryKey: ['auth-config'],
    queryFn: async () => {
      const [config] = await authService.config();
      return config ?? FALLBACK;
    },
    staleTime: Infinity,
    retry: 1,
  });
  return data ?? FALLBACK;
}
