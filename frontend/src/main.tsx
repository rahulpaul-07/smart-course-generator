import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { AuthProvider } from './hooks/useAuth';
import App from './App';
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

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthWrapper>
      <AuthProvider>
        <App />
      </AuthProvider>
    </AuthWrapper>
  </BrowserRouter>,
);

