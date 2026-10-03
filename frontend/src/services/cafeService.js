/**
 * Cafe & Bar API Service
 * Handles food & beverage menu items, combos, kitchen orders (PREPARING -> SERVED),
 * and revenue metrics
 */

import { api } from './api';

const API_BASE = '/cafe';

export const cafeService = {
  /**
   * Fetch menu items with optional category, type, and search filters
   */
  async getMenuItems(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`${API_BASE}/menu${queryString}`);
    return res.data;
  },

  /**
   * Add a new menu item or combo deal
   * Details: name, price, category, type ('SINGLE' | 'COMBO'), comboItems, image, description, dietTag
   */
  async createMenuItem(data) {
    const res = await api.post(`${API_BASE}/menu`, data);
    return res.data;
  },

  /**
   * Update existing menu item or combo
   */
  async updateMenuItem(id, data) {
    const res = await api.put(`${API_BASE}/menu/${id}`, data);
    return res.data;
  },

  /**
   * Delete menu item or combo
   */
  async deleteMenuItem(id) {
    const res = await api.delete(`${API_BASE}/menu/${id}`);
    return res.data;
  },

  /**
   * Toggle item availability (Available vs Sold Out)
   */
  async toggleAvailability(id) {
    const res = await api.patch(`${API_BASE}/menu/${id}/availability`, {});
    return res.data;
  },

  /**
   * Fetch orders and revenue analytics
   */
  async getOrders(params = {}) {
    const query = new URLSearchParams();
    if (params.status && params.status !== 'All') query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`${API_BASE}/orders${queryString}`);
    return res.data;
  },

  /**
   * Advance order status: e.g. PREPARING -> SERVED
   */
  async updateOrderStatus(orderId, status = 'SERVED') {
    const rawId = String(orderId || '').trim();
    // EncodeURIComponent prevents hash fragment '#' from cutting off URL path in browsers
    const safeParam = encodeURIComponent(rawId);
    const res = await api.patch(`${API_BASE}/orders/${safeParam}/status`, { status, orderId: rawId });
    return res.data;
  },

  /**
   * Simulate a member or walk-in order (comes into kitchen as PREPARING)
   */
  async simulateOrder(orderData = {}) {
    const res = await api.post(`${API_BASE}/orders/simulate`, orderData);
    return res.data;
  },
};
