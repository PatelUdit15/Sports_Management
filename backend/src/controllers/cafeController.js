/**
 * Cafe & Bar Controller
 * Handles HTTP requests for Cafe Menu, Kitchen Orders, and Revenue Analytics
 */

import { CafeService } from "../services/cafeService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class CafeController {
  /**
   * GET /api/cafe/menu
   */
  static async getMenuItems(req, res, next) {
    try {
      const items = await CafeService.getMenuItems(req.clubId, req.query);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Menu items retrieved successfully",
        data: { items },
        items,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cafe/menu
   * Add a new item or combo
   */
  static async createMenuItem(req, res, next) {
    try {
      const item = await CafeService.createMenuItem(req.clubId, req.body, req.user);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: item.message,
        data: { item },
        item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/cafe/menu/:id
   * Edit item or combo
   */
  static async updateMenuItem(req, res, next) {
    try {
      const item = await CafeService.updateMenuItem(req.clubId, req.params.id, req.body, req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: item.message,
        data: { item },
        item,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/cafe/menu/:id
   * Delete item or combo
   */
  static async deleteMenuItem(req, res, next) {
    try {
      const result = await CafeService.deleteMenuItem(req.clubId, req.params.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/cafe/menu/:id/availability
   * Toggle item availability
   */
  static async toggleAvailability(req, res, next) {
    try {
      const result = await CafeService.toggleAvailability(req.clubId, req.params.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cafe/orders
   * Retrieve orders and revenue metrics
   */
  static async getOrders(req, res, next) {
    try {
      const result = await CafeService.getOrders(req.clubId, req.query);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Cafe orders retrieved successfully",
        data: result,
        orders: result.orders,
        metrics: result.metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/cafe/orders/:id/status
   * Advance order status: e.g. PREPARING -> SERVED
   */
  static async updateOrderStatus(req, res, next) {
    try {
      const { status, orderId } = req.body || {};
      const targetId = req.params?.id || orderId;
      const result = await CafeService.updateOrderStatus(req.clubId, targetId, status || 'SERVED');
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cafe/orders/simulate
   * Simulate an incoming member order (arrives in PREPARING status)
   */
  static async simulateOrder(req, res, next) {
    try {
      const result = await CafeService.simulateOrder(req.clubId, req.body);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
