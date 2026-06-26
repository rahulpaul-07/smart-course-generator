import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false } } });
import './index.css';

import { GoogleOAuthProvider } from '@react-oauth/google';

const hasAuth0Config = !!(import.meta.env.VITE_AUTH0_DOMAIN && import.meta.env.VITE_AUTH0_CLIENT_ID);
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-google-client-id';

function AuthWrapper({ children }) {
  if (!hasAuth0Config) {
    return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
  }

  return (
    <Auth0Provider
      domain={import.meta.env.VITE_AUTH0_DOMAIN}
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <GoogleOAuthProvider clientId={googleClientId}>
        {children}
      </GoogleOAuthProvider>
    </Auth0Provider>
  );
}

const container = document.getElementById('root');
if (!window._reactRoot) {
  window._reactRoot = createRoot(container);
}

window._reactRoot.render(
  <BrowserRouter>
    <AuthWrapper>
      <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
      </QueryClientProvider>
    </AuthWrapper>
  </BrowserRouter>
);

