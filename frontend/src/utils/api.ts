import axios from 'axios';
import toast from 'react-hot-toast';

// Augment axios's request config with the small piece of metadata we attach
// for request deduplication (see interceptor below).
declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: { key: string };
    _retry?: boolean;
  }
}

let baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
// In Render, the base URL is provided without /api (e.g. https://my-backend.onrender.com)
if (baseURL && !baseURL.endsWith('/api') && baseURL.startsWith('http')) {
  baseURL = `${baseURL}/api`;
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 180000,
});

const pendingRequests = new Map<string, boolean>();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Request Deduplication and Generation Recovery
  if (config.method === 'post' && config.url && (config.url.includes('/generate') || config.url.includes('/certificates/claim'))) {
    const key = `${config.method}:${config.url}:${JSON.stringify(config.data || {})}`;
    
    const activeStr = sessionStorage.getItem('active_generation_job');
    if (activeStr) {
      try {
        const activeJob = JSON.parse(activeStr);
        // If the same generation job was started less than 2 minutes ago, prevent duplicate
        if (activeJob.key === key && Date.now() - activeJob.timestamp < 120000) {
          toast.success('Generation is continuing in the background. Please wait...');
          return Promise.reject({ isDuplicate: true, message: 'Generation already in progress.' });
        }
      } catch {
        // Ignore malformed sessionStorage state; treat as no active job.
      }
    }

    if (pendingRequests.has(key)) {
      return Promise.reject({ isDuplicate: true, message: 'Request already in progress' });
    }
    pendingRequests.set(key, true);
    config.metadata = { key };
    
    // Save active generation job for recovery
    sessionStorage.setItem('active_generation_job', JSON.stringify({ key, timestamp: Date.now() }));
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Access-token refresh on 401 -------------------------------------------
// The long-lived credential is an httpOnly refresh cookie; the access token is
// short-lived. On a 401 we transparently hit /auth/refresh once, store the new
// access token, and retry the original request. Concurrent 401s share a single
// in-flight refresh.
let isRefreshing = false;
let refreshWaiters: Array<(token: string | null) => void> = [];

function onRefreshed(token: string | null) {
  refreshWaiters.forEach((cb) => cb(token));
  refreshWaiters = [];
}

async function requestAccessRefresh(): Promise<string | null> {
  try {
    const resp = await axios.post(
      `${baseURL}/auth/refresh`,
      {},
      { withCredentials: true }
    );
    const token = resp.data?.token || null;
    if (token) localStorage.setItem('token', token);
    return token;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (response) => {
    if (response.config?.metadata?.key) {
      pendingRequests.delete(response.config.metadata.key);
      sessionStorage.removeItem('active_generation_job');
    }
    return response;
  },
  async (error) => {
    if (error.isDuplicate) return Promise.reject(error);
    
    // 401 → attempt a one-shot token refresh, then replay the original request.
    const original = error.config;
    const url: string = original?.url || '';
    const isAuthRoute = url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      const newToken = isRefreshing
        ? await new Promise<string | null>((resolve) => refreshWaiters.push(resolve))
        : await (async () => {
            isRefreshing = true;
            const t = await requestAccessRefresh();
            isRefreshing = false;
            onRefreshed(t);
            return t;
          })();

      if (newToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      // Refresh failed → fall through to the normal unauthorized handling.
      toast.error('Your session has expired. Please log in again.');
      localStorage.removeItem('token');
      window.dispatchEvent(new Event('auth:unauthorized'));
      return Promise.reject(error);
    }

    if (error.config?.metadata?.key) {
      pendingRequests.delete(error.config.metadata.key);
      // We don't remove active_generation_job here because the browser might have just disconnected but the backend is still running
    }

    if (error.response) {
      const status = error.response.status;
      let msg = error.response.data?.error || 'An unexpected server error occurred';
      if (typeof msg === 'object') msg = msg.message || 'Error';
      
      // Global toasts for specific status codes
      if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      }

      // Prevent React Error 31 by ensuring error messages are always strings
      error.response.data.error = msg;
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

export { baseURL };
export default api;

