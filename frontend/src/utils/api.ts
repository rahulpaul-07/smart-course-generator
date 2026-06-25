import axios from 'axios';
import toast from 'react-hot-toast';

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

const pendingRequests = new Map();

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
      } catch {}
    }

    if (pendingRequests.has(key)) {
      return Promise.reject({ isDuplicate: true, message: 'Request already in progress' });
    }
    pendingRequests.set(key, true);
    (config as any).metadata = { key };
    
    // Save active generation job for recovery
    sessionStorage.setItem('active_generation_job', JSON.stringify({ key, timestamp: Date.now() }));
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => {
    if ((response.config as any)?.metadata?.key) {
      pendingRequests.delete((response.config as any).metadata.key);
      sessionStorage.removeItem('active_generation_job');
    }
    return response;
  },
  (error) => {
    if (error.isDuplicate) return Promise.reject(error);
    
    if (error.config && (error.config as any).metadata?.key) {
      pendingRequests.delete((error.config as any).metadata.key);
      // We don't remove active_generation_job here because the browser might have just disconnected but the backend is still running
    }

    if (error.response) {
      const status = error.response.status;
      let msg = error.response.data?.error || 'An unexpected server error occurred';
      if (typeof msg === 'object') msg = msg.message || 'Error';
      
      // Global toasts for specific status codes
      if (status === 401) {
        toast.error('Your session has expired. Please log in again.');
        localStorage.removeItem('token');
        window.dispatchEvent(new Event('auth:unauthorized'));
      } else if (status === 403) {
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

