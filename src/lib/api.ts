import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/hooks/use-toast';

// API base URL - configure in .env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },
  setToken: (token: string): void => {
    localStorage.setItem('auth_token', token);
  },
  removeToken: (): void => {
    localStorage.removeItem('auth_token');
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },
  setRefreshToken: (token: string): void => {
    localStorage.setItem('refresh_token', token);
  },
  removeRefreshToken: (): void => {
    localStorage.removeItem('refresh_token');
  },
  clearAll: (): void => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
};

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors & token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to refresh token
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          const { token } = response.data.data;
          tokenManager.setToken(token);
          
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh failed - logout user
          tokenManager.clearAll();
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token - logout
        tokenManager.clearAll();
        window.location.href = '/login';
      }
    }

    // Handle other errors
    const message = (error.response?.data as { message?: string })?.message || error.message || 'An error occurred';
    
    if (error.response?.status !== 401) {
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }

    return Promise.reject(error);
  }
);

export default api;
