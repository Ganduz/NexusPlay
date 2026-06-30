import api from './axios';

export const reviewsApi = {
  getByGame: (slug, params) => api.get(`/games/${slug}/reviews`, { params }),
  create: (slug, data) => api.post(`/games/${slug}/reviews`, data),
  update: (reviewId, data) => api.put(`/reviews/${reviewId}`, data),
  delete: (reviewId) => api.delete(`/reviews/${reviewId}`),
  vote: (reviewId, voteType) => api.post(`/reviews/${reviewId}/vote`, { voteType }),
};
