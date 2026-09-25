import { createContext, useContext } from 'react';

/**
 * The slice of Auth0 the app uses, behind a context with an inert default.
 *
 * useAuth() needs to call *something* unconditionally (Rules of Hooks), which
 * used to force an <Auth0Provider> with a placeholder domain around every page
 * and put the whole Auth0 SDK in the entry bundle for deployments that don't
 * use it. Now the real provider (Auth0BridgeProvider) is lazy-loaded only
 * when VITE_AUTH0_* is configured; otherwise this default is what useAuth sees.
 */
export interface Auth0Bridge {
  configured: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;
  getAccessTokenSilently: () => Promise<string>;
  loginWithRedirect: (options?: { authorizationParams?: Record<string, string> }) => Promise<void>;
  logout: (options?: { logoutParams?: { returnTo?: string } }) => void | Promise<void>;
}

const notConfigured = () => Promise.reject(new Error('Auth0 is not configured'));

export const INERT_AUTH0: Auth0Bridge = {
  configured: false,
  isAuthenticated: false,
  isLoading: false,
  getAccessTokenSilently: notConfigured,
  loginWithRedirect: notConfigured,
  logout: () => undefined,
};

export const Auth0BridgeContext = createContext<Auth0Bridge>(INERT_AUTH0);

export const useAuth0Bridge = () => useContext(Auth0BridgeContext);

export const hasAuth0Config = Boolean(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID);
