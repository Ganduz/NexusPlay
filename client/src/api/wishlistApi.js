import api from './axios';

export const wishlistApi = {
  getWishlist: () => api.get('/wishlist'),
  toggle: (gameId) => api.post(`/wishlist/${gameId}`),
  check: (gameId) => api.get(`/wishlist/check/${gameId}`),
};
