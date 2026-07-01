import { createRoot, type Root } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { AuthWrapper } from './AuthWrapper';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 60 * 5, refetchOnWindowFocus: false } } });
import './index.css';

declare global {
  interface Window {
    _reactRoot?: Root;
  }
}

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element #root not found');
}
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
