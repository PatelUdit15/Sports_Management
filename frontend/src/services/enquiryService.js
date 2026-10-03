/**
 * Enquiry CRM Service
 * API client methods for enquiries, trials, membership leads, and status workflows
 */

import api from './api';

export const enquiryService = {
  /**
   * Get all enquiries with optional filters
   */
  getEnquiries: async (params = {}) => {
    const response = await api.get('/enquiries', { params });
    return response.data;
  },

  /**
   * Create a new enquiry lead
   */
  createEnquiry: async (enquiryData) => {
    const response = await api.post('/enquiries', enquiryData);
    return response.data;
  },

  /**
   * Update enquiry status with mandatory conversation description
   */
  updateStatus: async (enquiryId, status, notes = '') => {
    const response = await api.patch(`/enquiries/${enquiryId}/status`, {
      status,
      notes,
      description: notes,
    });
    return response.data;
  },

  /**
   * Delete an enquiry
   */
  deleteEnquiry: async (enquiryId) => {
    const response = await api.delete(`/enquiries/${enquiryId}`);
    return response.data;
  },
};

export default enquiryService;
