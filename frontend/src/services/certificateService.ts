import api from '../utils/api';
import { handleApi } from './apiHelper';

export const certificateService = {
  getCertificate: (id: string) => handleApi(api.get(`/certificates/${id}`), { showErrorToast: false }),
  getAllCertificates: () => handleApi(api.get('/certificates/mine/all'), { showErrorToast: false }),
  claimCertificate: (courseId: string) => handleApi(api.post('/certificates/claim', { courseId }), { showErrorToast: true, fallbackMsg: 'Failed to claim certificate' }),
};
