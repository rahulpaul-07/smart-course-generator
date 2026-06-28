import api from '../utils/api';
import { handleApi } from './apiHelper';

export const authService = {
  getMe: () => handleApi(api.get('/auth/me'), { showErrorToast: false }),
  login: (data: any) => handleApi(api.post('/auth/login', data), { showErrorToast: true, fallbackMsg: 'Login failed' }),
  register: (data: any) => handleApi(api.post('/auth/register', data), { showErrorToast: true, fallbackMsg: 'Registration failed' }),
  logout: () => handleApi(api.post('/auth/logout'), { showErrorToast: false }),
  googleLogin: (token: string) => handleApi(api.post('/auth/google', { token }), { showErrorToast: true, fallbackMsg: 'Google login failed' }),
  auth0Sync: () => handleApi(api.post('/auth/auth0-sync', {}), { showErrorToast: false }),
};
