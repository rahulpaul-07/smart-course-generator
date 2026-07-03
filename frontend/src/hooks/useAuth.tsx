import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { authService } from '../services/authService';
import { getApiError } from '../services/apiHelper';
import type { User } from '../types';

interface AuthContextValue {
  isAuthenticated: boolean;
  loading: boolean;
  user: User | null;
  hasAuth0Config: boolean;
  login: (userData?: User & { token?: string }) => void;
  loginWithGoogle: (googleToken: string) => Promise<User | undefined>;
  logout: () => Promise<void>;
  getToken: () => Promise<string | null>;
  loginWithAuth0: () => void;
  signupWithAuth0: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const hasAuth0Config = !!(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth0Provider always wraps the app (see AuthWrapper.tsx), using inert
  // placeholder values when Auth0 isn't configured -- so this hook is safe
  // to call unconditionally per React's Rules of Hooks. Actual Auth0 session
  // state below is ignored whenever hasAuth0Config is false.
  const {
    getAccessTokenSilently,
    isAuthenticated: auth0SessionFlag,
    isLoading: auth0LoadingFlag,
    loginWithRedirect,
    logout: logoutFromAuth0,
  } = useAuth0();

  const hasAuth0Session = hasAuth0Config && auth0SessionFlag;
  const auth0Loading = hasAuth0Config && auth0LoadingFlag;
  const [user, setUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [syncingAuth0, setSyncingAuth0] = useState(false);
  const auth0SyncStarted = useRef(false);

  useEffect(() => {
    authService.getMe().then(([data, error]) => {
      if (error) {
        setUser(null);
        localStorage.removeItem('token');
      } else {
        setUser(data);
      }
      setLoadingSession(false);
    });

    const handleUnauthorized = () => {
      setUser(null);
      localStorage.removeItem('token');
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    const theme = user?.theme || localStorage.getItem('theme') || 'system';

    localStorage.setItem('theme', theme);

    const applyTheme = (t: string) => {
      root.classList.remove('light', 'dark');
      if (t === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDark ? 'dark' : 'light');
      } else {
        root.classList.add(t);
      }
    };

    applyTheme(theme);
  }, [user?.theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => {
      const currentTheme = localStorage.getItem('theme') || 'system';
      if (currentTheme === 'system') {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!hasAuth0Session) {
      auth0SyncStarted.current = false;
      return;
    }
    if (loadingSession || user || auth0SyncStarted.current) return;

    auth0SyncStarted.current = true;
    setSyncingAuth0(true);

    getAccessTokenSilently()
      .then(async (token: string) => {
        // api interceptor pulls the token from localStorage, but Auth0 provides a
        // different token here, so we pass it explicitly for this one request.
        try {
          const { data } = await api.post<User>('/auth/auth0-sync', {}, { headers: { Authorization: `Bearer ${token}` } });
          setUser(data);
        } catch (error) {
          toast.error(getApiError(error) || 'Could not finish Google login');
        } finally {
          setSyncingAuth0(false);
          auth0SyncStarted.current = false;
        }
      })
      .catch((error) => {
        // getAccessTokenSilently itself can reject (stale session, revoked
        // consent, expired refresh token) before the .then above ever runs --
        // without this, syncingAuth0 (part of `loading`) would stay true
        // forever and strand the user on a full-screen spinner.
        console.warn('Auth0 silent token retrieval failed', error);
        setSyncingAuth0(false);
        auth0SyncStarted.current = false;
      });
  }, [getAccessTokenSilently, hasAuth0Session, loadingSession, user]);

  async function getToken(): Promise<string | null> {
    if (hasAuth0Session) {
      try {
        return await getAccessTokenSilently();
      } catch (err) {
        console.warn('Failed to get Auth0 token', err);
      }
    }
    return localStorage.getItem('token');
  }

  async function logout() {
    await authService.logout();
    setUser(null);
    localStorage.removeItem('token');

    if (hasAuth0Session) {
      logoutFromAuth0({ logoutParams: { returnTo: `${window.location.origin}/login` } });
    }
  }

  const value: AuthContextValue = {
    isAuthenticated: Boolean(user),
    loading: loadingSession || auth0Loading || syncingAuth0,
    user,
    hasAuth0Config,
    login: (userData) => {
      setUser(userData ?? null);
      if (userData?.token) {
        localStorage.setItem('token', userData.token);
      }
    },
    loginWithGoogle: async (googleToken: string) => {
      const [data, error] = await authService.googleLogin(googleToken);
      if (error) throw new Error(error);

      setUser(data);
      if (data?.token) {
        localStorage.setItem('token', data.token);
      }
      return data ?? undefined;
    },
    logout,
    getToken,
    loginWithAuth0: () => loginWithRedirect(),
    signupWithAuth0: () => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
