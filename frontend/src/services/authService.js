/**
 * Authentication Service
 * API calls for authentication operations
 */

import api from './api';

export const authService = {
  /**
   * Signup - Create Super Admin and Club
   */
  signup: async (signupData) => {
    const response = await api.post('/auth/signup', signupData);
    return response.data;
  },

  /**
   * Login - Authenticate user
   */
  login: async (loginData) => {
    const response = await api.post('/auth/login', loginData);
    return response.data;
  },

  /**
   * Logout - Clear authentication
   */
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};
