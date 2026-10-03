/**
 * Dashboard Service
 * API client methods for operational dashboard metrics and live schedules
 */

import api from './api';

export const dashboardService = {
  /**
   * Fetch club dashboard statistics and operational data
   */
  getDashboard: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default dashboardService;
