/**
 * Product & Inventory Controller
 * HTTP handlers for catalog management, stock adjustments, and low-stock alerts
 */

import { ProductService } from "../services/productService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class ProductController {
  /**
   * GET /api/products
   */
  static async getProducts(req, res, next) {
    try {
      const result = await ProductService.getProducts(req.clubId, req.query);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Products retrieved successfully",
        data: result,
        products: result.products,
        metrics: result.metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   */
  static async getProductById(req, res, next) {
    try {
      const product = await ProductService.getProductById(req.clubId, req.params.id);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Product details retrieved",
        data: { product },
        product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products
   * Product Manager adds a new product: Name, Photo, Price, Quantity, Min Quantity
   */
  static async createProduct(req, res, next) {
    try {
      const newProduct = await ProductService.createProduct(req.clubId, req.body, req.user);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: newProduct.message || "Product created successfully",
        data: { product: newProduct },
        product: newProduct,
        notification: newProduct.notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id
   * Edit product details
   */
  static async updateProduct(req, res, next) {
    try {
      const updated = await ProductService.updateProduct(req.clubId, req.params.id, req.body, req.user);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: updated.message || "Product updated successfully",
        data: { product: updated },
        product: updated,
        notification: updated.notification,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/products/:id/stock
   * Quick stock adjustment (Sell / Restock)
   */
  static async adjustStock(req, res, next) {
    try {
      const result = await ProductService.adjustStock(req.clubId, req.params.id, req.body);

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
   * DELETE /api/products/:id
   */
  static async deleteProduct(req, res, next) {
    try {
      const result = await ProductService.deleteProduct(req.clubId, req.params.id);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/notifications/low-stock
   * Get low-stock notifications for Product Manager
   */
  static async getNotifications(req, res, next) {
    try {
      const unreadOnly = req.query.unread === 'true';
      const notifications = await ProductService.getNotifications(req.clubId, unreadOnly);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Notifications retrieved",
        data: { notifications },
        notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/products/notifications/:id/read
   */
  static async markNotificationRead(req, res, next) {
    try {
      const result = await ProductService.markNotificationRead(req.clubId, req.params.id);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
