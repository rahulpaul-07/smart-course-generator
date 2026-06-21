import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

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
    api.get('/auth/me')
      .then(({ data }) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoadingSession(false));
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
      .then((token) => api.post('/auth/auth0-sync', {}, {
        headers: { Authorization: `Bearer ${token}` },
      }))
      .then(({ data }) => setUser(data))
      .catch((error) => {
        auth0SyncStarted.current = false;
        toast.error(error.response?.data?.error || 'Could not finish Google login');
      })
      .finally(() => setSyncingAuth0(false));
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
    await api.post('/auth/logout').catch(() => {});
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
      try {
        const { data } = await api.post('/auth/google', { token: googleToken });
        setUser(data);
        if (data?.token) {
          localStorage.setItem('token', data.token);
        }
        return data;
      } catch (error) {
        toast.error(error.response?.data?.error || 'Google login failed');
        throw error;
      }
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
