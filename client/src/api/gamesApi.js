import api from './axios';

export const gamesApi = {
  getAll: (params) => api.get('/games', { params }),
  getHomepage: () => api.get('/games/homepage'),
  search: (params) => api.get('/games/search', { params }),
  getBySlug: (slug) => api.get(`/games/${slug}`),
  getScreenshots: (slug) => api.get(`/games/${slug}/screenshots`),
  getTrailers: (slug) => api.get(`/games/${slug}/trailers`),
  getSeries: (slug) => api.get(`/games/${slug}/series`),
  getPlatforms: (slug) => api.get(`/games/${slug}/platforms`),
  getGenres: () => api.get('/games/genres'),
};
