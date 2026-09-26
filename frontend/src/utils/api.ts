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

// The API is served same-origin under /api: Vite proxies it in dev and preview,
// and the host rewrites it in production (frontend/vercel.json). Same-origin is
// what lets the SameSite=Strict refresh cookie reach /api/auth/refresh; with the
// API on another site (e.g. *.onrender.com from *.vercel.app) the browser never
// sends it and every session ends when the access token expires.
// VITE_API_BASE_URL remains an override for setups without a proxy.
let baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
if (baseURL.startsWith('http') && !baseURL.endsWith('/api')) {
  baseURL = `${baseURL.replace(/\/+$/, '')}/api`;
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 180000,
});

const pendingRequests = new Map<string, boolean>();

// The SSE lesson-generation flow in useLessonProgress keeps its own lock under
// 'active_generation_job'. This interceptor used the same slot with a different
// value shape, so a POST /generate would overwrite a running stream's lock and
// the stream's finally block would then clear the POST's. Separate slots.
const AXIOS_GENERATION_JOB_KEY = 'axios_active_generation_job';

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Request Deduplication and Generation Recovery
  if (config.method === 'post' && config.url && (config.url.includes('/generate') || config.url.includes('/certificates/claim'))) {
    const key = `${config.method}:${config.url}:${JSON.stringify(config.data || {})}`;
    
    const activeStr = sessionStorage.getItem(AXIOS_GENERATION_JOB_KEY);
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
    sessionStorage.setItem(AXIOS_GENERATION_JOB_KEY, JSON.stringify({ key, timestamp: Date.now() }));
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Access-token refresh on 401 -------------------------------------------
// The long-lived credential is an httpOnly refresh cookie; the access token is
// short-lived. On a 401 we transparently hit /auth/refresh once, store the new
// access token, and retry the original request. Concurrent 401s -- from axios
// or from the streaming fetch() calls below -- share one in-flight refresh.
let refreshInFlight: Promise<string | null> | null = null;

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

export function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = requestAccessRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function expireSession() {
  // Only announce an expiry if there was a session to expire. The auth
  // bootstrap probes /auth/me on every page load, so anonymous visitors used
  // to be greeted on the landing page with "Your session has expired".
  if (localStorage.getItem('token')) {
    toast.error('Your session has expired. Please log in again.');
  }
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('auth:unauthorized'));
}

/**
 * fetch() with the same auth contract as the axios instance: Bearer token,
 * credentials, and one transparent refresh-and-retry on 401.
 *
 * The SSE endpoints (course/lesson generation, lesson and interview chat) need
 * a raw ReadableStream, so they can't go through axios -- and they used to
 * skip the refresh entirely. Once the 30-minute access token lapsed, clicking
 * "Generate" on a lesson you'd been reading failed with an auth error.
 */
export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const send = (token: string | null) =>
    fetch(`${baseURL}${path}`, {
      credentials: 'include',
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

  const response = await send(localStorage.getItem('token'));
  if (response.status !== 401) return response;

  const fresh = await refreshAccessToken();
  if (!fresh) {
    expireSession();
    return response;
  }
  return send(fresh);
}

function releaseDedupLock(config?: { metadata?: { key: string } }) {
  if (config?.metadata?.key) {
    pendingRequests.delete(config.metadata.key);
    sessionStorage.removeItem(AXIOS_GENERATION_JOB_KEY);
  }
}

api.interceptors.response.use(
  (response) => {
    releaseDedupLock(response.config);
    return response;
  },
  async (error) => {
    if (error.isDuplicate) return Promise.reject(error);

    // 401 -> attempt a one-shot token refresh, then replay the original request.
    const original = error.config;
    const url: string = original?.url || '';
    const isAuthRoute = url.includes('/auth/refresh') || url.includes('/auth/login') || url.includes('/auth/register');
    if (error.response?.status === 401 && original && !original._retry && !isAuthRoute) {
      original._retry = true;
      // The replay goes back through the request interceptor; without this the
      // retried /generate POST was rejected by its own duplicate guard.
      releaseDedupLock(original);
      const newToken = await refreshAccessToken();

      if (newToken) {
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      }
      expireSession();
      return Promise.reject(error);
    }

    if (error.response) {
      // The server answered, so nothing is still running for this request.
      releaseDedupLock(error.config);
    } else if (error.config?.metadata?.key) {
      // No response: the connection dropped but the backend may still be
      // generating, so keep the recovery lock and only free the in-memory slot.
      pendingRequests.delete(error.config.metadata.key);
    }

    if (error.response) {
      const status = error.response.status;
      const body = error.response.data;
      const rawMsg = (body && typeof body === 'object' && 'error' in body)
        ? (body as Record<string, unknown>).error
        : undefined;

      let msg: string;
      if (typeof rawMsg === 'string' && rawMsg) {
        msg = rawMsg;
      } else if (rawMsg && typeof rawMsg === 'object') {
        msg = (rawMsg as { message?: string }).message || 'Error';
      } else {
        msg = 'An unexpected server error occurred';
      }

      // Global toasts for specific status codes
      if (status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (status === 429) {
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      }

      // Normalize to a string so components can render it directly (React
      // throws error #31 on an object child). The body is only writable when
      // it is an object — a gateway HTML page or an empty 204 body is not,
      // and assigning onto those threw in strict mode.
      if (body && typeof body === 'object') {
        (body as Record<string, unknown>).error = msg;
      } else {
        error.response.data = { error: msg };
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    }
    return Promise.reject(error);
  }
);

export { baseURL };
export default api;

