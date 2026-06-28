import api from '../utils/api';
import { handleApi } from './apiHelper';

export const analyticsService = {
  getDashboard: () => handleApi(api.get('/analytics/dashboard'), { showErrorToast: true, fallbackMsg: 'Failed to load analytics' }),
};
