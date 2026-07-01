import api from '../utils/api';
import { handleApi } from './apiHelper';
import type { Certificate } from '../types';

export const certificateService = {
  getCertificate: (id: string) => handleApi<Certificate>(api.get(`/certificates/${id}`), { showErrorToast: false }),
  getAllCertificates: () => handleApi<Certificate[]>(api.get('/certificates/mine/all'), { showErrorToast: false }),
  claimCertificate: (courseId: string) => handleApi<{ certificateId: string }>(api.post('/certificates/claim', { courseId }), { showErrorToast: true, fallbackMsg: 'Failed to claim certificate' }),
};
