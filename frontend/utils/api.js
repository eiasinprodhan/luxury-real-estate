import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to safely get localStorage
const getToken = (key) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setToken = (key, value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeToken = (key) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = getToken('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = getToken('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        setToken('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (refreshError) {
        removeToken('access_token');
        removeToken('refresh_token');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login/', credentials),
  register: (userData) => api.post('/users/register/', userData),
  getProfile: () => api.get('/users/profile/'),
  updateProfile: (data) => api.patch('/users/profile/', data),
  logout: () => {
    removeToken('access_token');
    removeToken('refresh_token');
  },
};

// Properties API
export const propertiesAPI = {
  getAll: (params) => api.get('/properties/', { params }),
  getOne: (slug) => api.get(`/properties/${slug}/`),
  getSimilar: (slug) => api.get(`/properties/${slug}/similar/`),
  getFeatured: () => api.get('/properties/', { params: { is_featured: true, status: 'active' } }),
};

// Bookings API
export const bookingsAPI = {
  create: (data) => api.post('/bookings/', data),
  getAll: () => api.get('/bookings/'),
  getOne: (id) => api.get(`/bookings/${id}/`),
  cancel: (id) => api.post(`/bookings/${id}/cancel/`),
  update: (id, data) => api.patch(`/bookings/${id}/`, data),
};

// Payments API
export const paymentsAPI = {
  // Create payment intent
  create: (data) => api.post('/payments/create/', data),
  
  // Confirm payment
  confirm: (paymentId) => api.post(`/payments/${paymentId}/confirm/`),
  
  // Get payment status
  getStatus: (paymentId) => api.get(`/payments/${paymentId}/`),
  
  // Get all payments
  getAll: () => api.get('/payments/'),
  
  // Stripe specific
  createStripeIntent: (data) => api.post('/payments/stripe/create-intent/', data),
  confirmStripe: (data) => api.post('/payments/stripe/confirm/', data),
  
  // bKash specific
  initiateBkash: (data) => api.post('/payments/bkash/initiate/', data),
  executeBkash: (paymentId) => api.post('/payments/bkash/execute/', { payment_id: paymentId }),
  bkashCallback: (data) => api.post('/payments/bkash/callback/', data),
};