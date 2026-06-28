import api from '../utils/api';
import { handleApi } from './apiHelper';

export const dashboardService = {
  getSummary: () => handleApi(api.get('/dashboard/summary'), { showErrorToast: true, fallbackMsg: 'Failed to load dashboard summary' }),
};
