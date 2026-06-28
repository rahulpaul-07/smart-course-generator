import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { authService } from '../services/authService';

const AuthContext = createContext(null);
const hasAuth0Config = !!(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID);

export function AuthProvider({ children }) {
  const auth0 = hasAuth0Config
    ? useAuth0()
    : {
        getAccessTokenSilently: async () => '',
        isAuthenticated: false,
        isLoading: false,
        loginWithRedirect: () => {},
        logout: () => {},
      };

  const {
    getAccessTokenSilently,
    isAuthenticated: hasAuth0Session,
    isLoading: auth0Loading,
    loginWithRedirect,
    logout: logoutFromAuth0,
  } = auth0;
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [syncingAuth0, setSyncingAuth0] = useState(false);
  const auth0SyncStarted = useRef(false);

  useEffect(() => {
    authService.getMe().then(([data, error]) => {
      if (error) {
        setUser(null);
        localStorage.removeItem('token');
      } else {
        setUser(data as any);
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

    const applyTheme = (t) => {
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
    const listener = (e) => {
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
      .then(async (token) => {
        // Just setting the token on api defaults won't work perfectly for this specific request if it wasn't intercepted, 
        // but api interceptor pulls from localStorage. Auth0 provides a different token.
        // We'll need to keep this one api.post to pass the headers explicitly, OR update authService to accept a token.
        // Let's use api.post here for this exceptional case to avoid changing the method signature of authService.auth0Sync.
        try {
          const { data } = await api.post('/auth/auth0-sync', {}, { headers: { Authorization: `Bearer ${token}` } });
          setUser(data);
        } catch (error: any) {
          toast.error(error.response?.data?.error || 'Could not finish Google login');
        } finally {
          setSyncingAuth0(false);
          auth0SyncStarted.current = false;
        }
      });
  }, [getAccessTokenSilently, hasAuth0Session, loadingSession, user]);

  async function getToken() {
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

  const value = {
    isAuthenticated: Boolean(user),
    loading: loadingSession || auth0Loading || syncingAuth0,
    user,
    hasAuth0Config,
    login: (userData) => {
      setUser(userData);
      if (userData?.token) {
        localStorage.setItem('token', userData.token);
      }
    },
    loginWithGoogle: async (googleToken) => {
      const [data, error] = await authService.googleLogin(googleToken);
      if (error) throw new Error(error);
      
      setUser(data as any);
      if ((data as any)?.token) {
        localStorage.setItem('token', (data as any).token);
      }
      return data;
    },
    logout,
    getToken,
    loginWithAuth0: () => loginWithRedirect(),
    signupWithAuth0: () => loginWithRedirect({ authorizationParams: { screen_hint: 'signup' } }),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}

export function useAuth() {
  return useContext(AuthContext);
}
