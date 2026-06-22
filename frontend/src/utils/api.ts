import axios from 'axios';

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
    // Prevent React Error 31 (rendering objects as children) by ensuring error messages are always strings
    if (error.response?.data?.error) {
      if (typeof error.response.data.error === 'object') {
        error.response.data.error = error.response.data.error.message || 'An unexpected server error occurred';
      } else if (typeof error.response.data.error !== 'string') {
        error.response.data.error = String(error.response.data.error);
      }
    }
    return Promise.reject(error);
  }
);

export { baseURL };
export default api;

