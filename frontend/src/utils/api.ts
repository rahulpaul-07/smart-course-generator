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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      let msg = error.response.data?.error || 'An unexpected server error occurred';
      if (typeof msg === 'object') msg = msg.message || 'Error';
      
      // Global toasts for specific status codes
      if (status === 401) {
        toast.error('Your session has expired. Please log in again.');
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

