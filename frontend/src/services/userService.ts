import api from '../utils/api';
import { handleApi } from './apiHelper';

export const userService = {
  updateOnboarding: (data: any) => handleApi(api.put('/user/onboarding', data), { showErrorToast: true, fallbackMsg: 'Failed to save preferences' }),
  updateProfile: (data: any) => handleApi(api.put('/user/profile', data), { showErrorToast: true, fallbackMsg: 'Failed to update profile' }),
  updateSettings: (data: any) => handleApi(api.put('/user/settings', data), { showErrorToast: true, fallbackMsg: 'Failed to save settings' }),
};
