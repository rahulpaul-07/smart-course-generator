import type { ReactNode } from 'react';
import { Auth0Provider } from '@auth0/auth0-react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id';

// Auth0Provider always wraps the tree -- even when Auth0 isn't configured --
// using inert placeholder values in that case. This keeps useAuth0() safe to
// call unconditionally in hooks/useAuth.tsx (React's Rules of Hooks forbid
// calling a hook only when a condition is true); actual Auth0 session state
// is simply ignored downstream when hasAuth0Config is false.
export function AuthWrapper({ children }: { children: ReactNode }) {
  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN || 'not-configured.auth0.com'}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID || 'dummy-auth0-client-id'}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    </Auth0Provider>
  );
}

