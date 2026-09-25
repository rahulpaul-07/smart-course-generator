import { lazy, Suspense, type ReactNode } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { hasAuth0Config } from './contexts/Auth0Bridge';

const Auth0BridgeProvider = lazy(() => import('./contexts/Auth0BridgeProvider'));

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Identity-provider wrappers, each mounted only when configured.
 *
 * Both used to wrap every page unconditionally with placeholder credentials:
 * the Auth0 SDK sat in the entry bundle, and GoogleOAuthProvider injected
 * Google's third-party GSI script into every page load -- even on deployments
 * where neither sign-in method was enabled.
 */
export function AuthWrapper({ children }: { children: ReactNode }) {
  let tree = children;
  if (googleClientId) {
    tree = <GoogleOAuthProvider clientId={googleClientId}>{tree}</GoogleOAuthProvider>;
  }
  if (hasAuth0Config) {
    tree = (
      <Suspense fallback={null}>
        <Auth0BridgeProvider>{tree}</Auth0BridgeProvider>
      </Suspense>
    );
  }
  return <>{tree}</>;
}
