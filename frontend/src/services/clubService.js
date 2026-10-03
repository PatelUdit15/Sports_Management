/**
 * Club Service
 * API calls for club and module management
 */

import api from './api';

export const clubService = {
  /**
   * Get club profile
   */
  getClubProfile: async () => {
    const response = await api.get('/club/profile');
    return response.data;
  },

  /**
   * Update club profile
   */
  updateClubProfile: async (profileData) => {
    const response = await api.patch('/club/profile', profileData);
    return response.data;
  },

  /**
   * Get module configuration
   */
  getModules: async () => {
    const response = await api.get('/club/modules');
    return response.data;
  },

  /**
   * Update module configuration
   */
  updateModules: async (moduleUpdates) => {
    const response = await api.patch('/club/modules', moduleUpdates);
    return response.data;
  },

  /**
   * Get club statistics
   */
  getClubStats: async () => {
    const response = await api.get('/club/stats');
    return response.data;
  },
};
