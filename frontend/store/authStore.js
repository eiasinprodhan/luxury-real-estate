import { create } from 'zustand';
import { authAPI } from '../utils/api';

const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,

  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await authAPI.login(credentials);
      const { access, refresh } = response.data;
      
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Get user profile
      const profileResponse = await authAPI.getProfile();
      
      set({ user: profileResponse.data, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.response?.data };
    }
  },

  register: async (userData) => {
    set({ loading: true });
    try {
      const response = await authAPI.register(userData);
      const { tokens, user } = response.data;
      
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);
      
      set({ user, isAuthenticated: true, loading: false });
      return { success: true };
    } catch (error) {
      set({ loading: false });
      return { success: false, error: error.response?.data };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      set({ isAuthenticated: false });
      return;
    }

    try {
      const response = await authAPI.getProfile();
      set({ user: response.data, isAuthenticated: true });
    } catch (error) {
      set({ isAuthenticated: false });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  },
}));

export default useAuthStore;