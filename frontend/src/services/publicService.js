/**
 * Public Service - API calls for Public Club Showcase,
 * Member Auth, Sports Club Network Directory, and Payment / Pass Generation.
 */

import api from './api';

export const publicService = {
  /**
   * Fetch connected sports clubs with Gold/Silver/Bronze membership tiers
   */
  async getClubs() {
    const response = await api.get('/public/clubs');
    return response.data;
  },

  /**
   * Register a new user/member
   */
  async registerMember(data) {
    const response = await api.post('/public/member/register', data);
    return response.data;
  },

  /**
   * Authenticate a user/member
   */
  async loginMember(data) {
    const response = await api.post('/public/member/login', data);
    return response.data;
  },

  /**
   * Confirm membership payment and generate club Member ID in database
   */
  async confirmPayment(data) {
    const response = await api.post('/public/member/confirm-payment', data);
    return response.data;
  },

  /**
   * Fetch member pass details
   */
  async getMemberPass(memberId) {
    const response = await api.get(`/public/member/pass/${memberId}`);
    return response.data;
  },
};

export default publicService;
