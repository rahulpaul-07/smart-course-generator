import axios from 'axios';

let baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
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

export default api;

