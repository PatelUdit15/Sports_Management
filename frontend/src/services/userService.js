/**
 * User Service
 * API calls for user management operations
 */

import api from './api';

export const userService = {
  /**
   * Get all users with optional filters
   */
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/users?${queryString}` : '/users';

    const response = await api.get(url);
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Create new user
   */
  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  /**
   * Update user
   */
  updateUser: async (userId, updateData) => {
    const response = await api.patch(`/users/${userId}`, updateData);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (userId) => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  /**
   * Get user statistics
   */
  getUserStats: async () => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};
