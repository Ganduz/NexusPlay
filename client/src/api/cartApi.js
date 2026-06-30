import api from './axios';

export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (gamePlatformId, quantity = 1) => api.post('/cart', { gamePlatformId, quantity }),
  removeItem: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
  mergeCart: (items) => api.post('/cart/merge', { items }),
};
