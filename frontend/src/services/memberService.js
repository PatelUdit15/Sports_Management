/**
 * Member Service
 * API client methods for Member Portal Dashboard, Profile, Court Bookings,
 * Club Inventory (Pro Shop), and Cafe Food Ordering
 */

import api from './api';

export const memberService = {
  /**
   * Fetch current authenticated member profile, club details, module config, and renewal alerts
   */
  getMemberProfile: async () => {
    const res = await api.get('/member-dashboard/me');
    return res.data;
  },

  // ==========================================
  // Pro Shop / Buy Inventory
  // ==========================================

  /**
   * Fetch sports club inventory products
   */
  getClubProducts: async (params = {}) => {
    const res = await api.get('/member-dashboard/products', { params });
    return res.data;
  },

  /**
   * Purchase inventory items
   */
  purchaseProducts: async (purchaseData) => {
    const res = await api.post('/member-dashboard/products/purchase', purchaseData);
    return res.data;
  },

  // ==========================================
  // Cafe & Bar Food Ordering
  // ==========================================

  /**
   * Fetch cafe menu items for this club
   */
  getCafeMenu: async (params = {}) => {
    const res = await api.get('/member-dashboard/cafe/menu', { params });
    return res.data;
  },

  /**
   * Place an order for cafe food & drinks
   */
  orderCafeFood: async (orderData) => {
    const res = await api.post('/member-dashboard/cafe/order', orderData);
    return res.data;
  },

  /**
   * Get member's active & past cafe orders
   */
  getMyCafeOrders: async () => {
    const res = await api.get('/member-dashboard/cafe/my-orders');
    return res.data;
  },

  // ==========================================
  // Court Booking & Matrix
  // ==========================================

  /**
   * Fetch court matrix & slot availability for the member's club
   */
  getCourtMatrix: async (date) => {
    const res = await api.get('/member-dashboard/courts/matrix', {
      params: date ? { date } : {},
    });
    return res.data;
  },

  /**
   * Book a court slot as a member
   */
  memberBookCourt: async (bookingData) => {
    const res = await api.post('/member-dashboard/courts/book', bookingData);
    return res.data;
  },

  /**
   * Get member's reserved courts list
   */
  getMyBookings: async () => {
    const res = await api.get('/member-dashboard/courts/my-bookings');
    return res.data;
  },

  /**
   * Cancel an existing member reservation
   */
  cancelBooking: async (bookingId) => {
    const res = await api.delete(`/member-dashboard/courts/cancel/${bookingId}`);
    return res.data;
  },
};

export default memberService;
