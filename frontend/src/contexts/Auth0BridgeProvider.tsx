import type { ReactNode } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { Auth0BridgeContext } from './Auth0Bridge';

function Bridge({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect, logout } = useAuth0();
  return (
    <Auth0BridgeContext.Provider
      value={{ configured: true, isAuthenticated, isLoading, getAccessTokenSilently, loginWithRedirect, logout }}
    >
      {children}
    </Auth0BridgeContext.Provider>
  );
}

/** Loaded on demand, and only when Auth0 is configured. */
export default function Auth0BridgeProvider({ children }: { children: ReactNode }) {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <Bridge>{children}</Bridge>
    </Auth0Provider>
  );
}
