import { api } from './api';

const API_BASE = '/products';

export const productService = {
  /**
   * Fetch products catalog with filters and summary metrics
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'All') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    if (params.stockStatus && params.stockStatus !== 'All') query.append('stockStatus', params.stockStatus);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await api.get(`${API_BASE}${queryString}`);
    return res.data;
  },

  /**
   * Fetch single product
   */
  async getProductById(id) {
    const res = await api.get(`${API_BASE}/${id}`);
    return res.data;
  },

  /**
   * Create a new product (Product Manager flow)
   * Details: Product Name, Product Photo, Product Price, Product Quantity, Product Min Quantity
   */
  async createProduct(data) {
    const res = await api.post(API_BASE, data);
    return res.data;
  },

  /**
   * Update product details
   */
  async updateProduct(id, data) {
    const res = await api.put(`${API_BASE}/${id}`, data);
    return res.data;
  },

  /**
   * Quick Stock Adjustment (Sell stock or Restock inventory)
   */
  async adjustStock(id, adjustment) {
    const res = await api.patch(`${API_BASE}/${id}/stock`, adjustment);
    return res.data;
  },

  /**
   * Delete product
   */
  async deleteProduct(id) {
    const res = await api.delete(`${API_BASE}/${id}`);
    return res.data;
  },

  /**
   * Get active low stock notifications for the Product Manager
   */
  async getNotifications(unreadOnly = false) {
    const res = await api.get(`${API_BASE}/notifications/low-stock?unread=${unreadOnly}`);
    return res.data;
  },

  /**
   * Dismiss or mark a notification as read
   */
  async markNotificationRead(notificationId) {
    const res = await api.patch(`${API_BASE}/notifications/${notificationId}/read`, {});
    return res.data;
  },
};

