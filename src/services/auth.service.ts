import api from '@/lib/api';
import { AuthResponse, LoginCredentials, User } from '@/types';

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    const authData = response.data.data;
    const { user, token, refreshToken } = authData;
    // Save tokens and user to localStorage
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    return authData;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from storage
   */
  getCurrentUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        return JSON.parse(userStr) as User;
      }
      return null;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Refresh auth token
   */
  refreshToken: async (): Promise<string> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await api.post<{ success: boolean; data: { token: string; refreshToken: string } }>('/auth/refresh', { refreshToken });
    const newToken = response.data.data.token;
    localStorage.setItem('auth_token', newToken);
    return newToken;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<User>('/auth/profile', data);
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.post('/auth/change-password', { currentPassword, newPassword });
  },
};

export default authService;
