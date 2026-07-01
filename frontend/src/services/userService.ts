import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { User } from '../types';

export interface OnboardingPayload {
  skillLevel: string;
  learningInterests: string[];
}

export interface ProfilePayload {
  name: string;
  bio: string;
  isProfilePublic: boolean;
  skillLevel: string;
  learningInterests: string[];
}

export interface SettingsPayload {
  theme: string;
}

export const userService = {
  updateOnboarding: (data: OnboardingPayload) => handleApi<User>(api.put('/user/onboarding', data), { showErrorToast: true, fallbackMsg: 'Failed to save preferences' }),
  updateProfile: (data: ProfilePayload) => handleApi<User>(api.put('/user/profile', data), { showErrorToast: true, fallbackMsg: 'Failed to update profile' }),
  updateSettings: (data: SettingsPayload) => handleApi<User>(api.put('/user/settings', data), { showErrorToast: true, fallbackMsg: 'Failed to save settings' }),
};
