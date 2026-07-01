import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { User } from '../types';

export interface AuthCredentials {
  email: string;
  password: string;
  name?: string;
}

export const authService = {
  getMe: () => handleApi<User>(api.get('/auth/me'), { showErrorToast: false }),
  login: (data: AuthCredentials) => handleApi<User>(api.post('/auth/login', data), { showErrorToast: true, fallbackMsg: 'Login failed' }),
  register: (data: AuthCredentials) => handleApi<User>(api.post('/auth/register', data), { showErrorToast: true, fallbackMsg: 'Registration failed' }),
  logout: () => handleApi<void>(api.post('/auth/logout'), { showErrorToast: false }),
  googleLogin: (token: string) => handleApi<User>(api.post('/auth/google', { token }), { showErrorToast: true, fallbackMsg: 'Google login failed' }),
  auth0Sync: () => handleApi<User>(api.post('/auth/auth0-sync', {}), { showErrorToast: false }),
};
