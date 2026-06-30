import api from './axios';

export const profileApi = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  updateAvatar: (formData) => api.put('/profile/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getDashboard: () => api.get('/profile/dashboard'),
  getLibrary: (params) => api.get('/profile/library', { params }),
  getMyReviews: (params) => api.get('/profile/reviews', { params }),
};
