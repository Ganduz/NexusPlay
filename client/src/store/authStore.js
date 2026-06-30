import { create } from 'zustand';
import { authApi } from '../api/authApi';

const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      set({ isLoading: false });
      return;
    }

    try {
      const { data } = await authApi.me();
      set({ user: data.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data.data;
  },

  register: async (userData) => {
    const { data } = await authApi.register(userData);
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data.data;
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      //
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null,
  })),
}));

// Listen for forced logout from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}

export default useAuthStore;
