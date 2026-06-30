import api from './axios';

export const ordersApi = {
  create: () => api.post('/orders'),
  getAll: (params) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
};
