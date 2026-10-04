/**
 * Product & Inventory Service
 * Handles product catalog, stock adjustments, min-quantity threshold triggers,
 * and low-stock notifications for Product Managers
 */

import prisma from "../config/database.js";
import { HTTP_STATUS } from "../config/constants.js";

class AppError extends Error {
  constructor(message, statusCode = HTTP_STATUS.BAD_REQUEST) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
  }
}

export class ProductService {
  /**
   * Seed initial sports inventory items if empty for this club
   */
  static async seedInitialProductsIfEmpty(clubId) {
    try {
      const countRes = await prisma.$queryRawUnsafe(
        `SELECT COUNT(*)::int as count FROM products WHERE club_id = $1`,
        clubId
      );
      const count = countRes[0]?.count || 0;
      if (count === 0) {
        const defaultItems = [
          {
            name: "Pro Aero Carbon Tennis Racquet",
            category: "Equipment",
            photo: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&auto=format&fit=crop&q=80",
            price: 4999.00,
            quantity: 18,
            min_quantity: 4,
            description: "High-modulus carbon graphite frame offering explosive power and pinpoint control."
          },
          {
            name: "Championship Feather Shuttles (Pack of 12)",
            category: "Accessories",
            photo: "https://images.unsplash.com/photo-1613918108466-292b78a8ef95?w=500&auto=format&fit=crop&q=80",
            price: 1250.00,
            quantity: 35,
            min_quantity: 6,
            description: "Tournament grade goose feather shuttlecocks with durable composite cork base."
          },
          {
            name: "Club Elite Performance Dry-Fit Jersey",
            category: "Apparel",
            photo: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&auto=format&fit=crop&q=80",
            price: 1499.00,
            quantity: 25,
            min_quantity: 5,
            description: "Official club breathable polyester jersey with moisture-wicking technology."
          },
          {
            name: "Pro Court Grip Shoes (Non-Marking)",
            category: "Footwear",
            photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
            price: 3799.00,
            quantity: 14,
            min_quantity: 3,
            description: "Cushioned court shoes with gum rubber grip sole approved for all indoor & outdoor surfaces."
          },
          {
            name: "Whey Protein Isolate Recovery Powder (1kg)",
            category: "Nutrition",
            photo: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop&q=80",
            price: 2899.00,
            quantity: 22,
            min_quantity: 5,
            description: "27g ultra-pure protein per scoop enriched with BCAAs for fast muscle repair."
          },
          {
            name: "Heavy Duty Multi-Racket Kit Bag",
            category: "Accessories",
            photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
            price: 2199.00,
            quantity: 12,
            min_quantity: 3,
            description: "Thermal-guarded compartments holding up to 6 rackets, shoes, and apparel."
          }
        ];

        for (const item of defaultItems) {
          const catPrefix = (item.category.substring(0, 3) || 'PRD').toUpperCase();
          const pId = `PRD-${catPrefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
          await prisma.$executeRawUnsafe(
            `INSERT INTO products (product_id, club_id, name, category, photo, price, quantity, min_quantity, description, status, created_by, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'IN_STOCK', 'Club Pro Shop', NOW(), NOW())`,
            pId,
            clubId,
            item.name,
            item.category,
            item.photo,
            item.price,
            item.quantity,
            item.min_quantity,
            item.description
          );
        }
      }
    } catch (e) {
      console.warn("Could not seed products:", e.message);
    }
  }

  /**
   * Get all products with live stock status and catalog metrics
   */
  static async getProducts(clubId, query = {}) {
    await this.seedInitialProductsIfEmpty(clubId);
    const { category, search, stockStatus } = query;

    let sql = `SELECT * FROM products WHERE club_id = $1`;
    const params = [clubId];
    let paramIndex = 2;

    if (category && category !== 'All') {
      sql += ` AND LOWER(category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (search && search.trim()) {
      sql += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(product_id) LIKE $${paramIndex})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    if (stockStatus && stockStatus !== 'All') {
      sql += ` AND status = $${paramIndex}`;
      params.push(stockStatus);
      paramIndex++;
    }

    sql += ` ORDER BY updated_at DESC, id DESC`;

    const rawProducts = await prisma.$queryRawUnsafe(sql, ...params);

    const products = rawProducts.map((p) => {
      const qty = parseInt(p.quantity, 10);
      const minQty = parseInt(p.min_quantity, 10);
      let calculatedStatus = 'IN_STOCK';
      if (qty === 0) calculatedStatus = 'OUT_OF_STOCK';
      else if (qty <= minQty) calculatedStatus = 'LOW_STOCK';

      return {
        id: p.product_id,
        productId: p.product_id,
        clubId: p.club_id,
        name: p.name,
        category: p.category,
        photo: p.photo || 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&auto=format&fit=crop&q=80',
        price: parseFloat(p.price) || 0,
        quantity: qty,
        minQuantity: minQty,
        description: p.description || '',
        status: calculatedStatus,
        createdBy: p.created_by || 'Product Manager',
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      };
    });

    // Calculate aggregated inventory metrics for the club
    const allClubProducts = await prisma.$queryRawUnsafe(
      `SELECT price, quantity, min_quantity, status FROM products WHERE club_id = $1`,
      clubId
    );

    let totalProducts = allClubProducts.length;
    let totalStock = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalValuation = 0;

    for (const p of allClubProducts) {
      const q = parseInt(p.quantity, 10) || 0;
      const min = parseInt(p.min_quantity, 10) || 0;
      const price = parseFloat(p.price) || 0;
      totalStock += q;
      totalValuation += price * q;

      if (q === 0) outOfStockCount++;
      else if (q <= min) lowStockCount++;
    }

    return {
      products,
      metrics: {
        totalProducts,
        totalStock,
        lowStockCount,
        outOfStockCount,
        totalAlerts: lowStockCount + outOfStockCount,
        totalValuation: Math.round(totalValuation),
      },
    };
  }

  /**
   * Get single product by ID
   */
  static async getProductById(clubId, productId) {
    const records = await prisma.$queryRawUnsafe(
      `SELECT * FROM products WHERE club_id = $1 AND (product_id = $2 OR id::text = $2) LIMIT 1`,
      clubId,
      productId
    );

    if (!records || records.length === 0) {
      throw new AppError("Product not found", HTTP_STATUS.NOT_FOUND);
    }

    const p = records[0];
    const qty = parseInt(p.quantity, 10);
    const minQty = parseInt(p.min_quantity, 10);
    let status = 'IN_STOCK';
    if (qty === 0) status = 'OUT_OF_STOCK';
    else if (qty <= minQty) status = 'LOW_STOCK';

    return {
      id: p.product_id,
      productId: p.product_id,
      clubId: p.club_id,
      name: p.name,
      category: p.category,
      photo: p.photo,
      price: parseFloat(p.price) || 0,
      quantity: qty,
      minQuantity: minQty,
      description: p.description,
      status,
      createdBy: p.created_by,
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    };
  }

  /**
   * Add a new product
   * Validates required details: Product name, Product photo, Product price,
   * product quantity, product min quantity, and triggers low-stock alert if applicable.
   */
  static async createProduct(clubId, data, user = null) {
    const {
      name,
      photo,
      price,
      quantity = 0,
      minQuantity = 5,
      category = "Equipment",
      description = "",
    } = data;

    if (!name || !name.trim()) {
      throw new AppError("Product name is required.", HTTP_STATUS.BAD_REQUEST);
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      throw new AppError("Valid product price is required.", HTTP_STATUS.BAD_REQUEST);
    }

    const numQuantity = parseInt(quantity, 10);
    if (isNaN(numQuantity) || numQuantity < 0) {
      throw new AppError("Product quantity must be a non-negative number.", HTTP_STATUS.BAD_REQUEST);
    }

    const numMinQuantity = parseInt(minQuantity, 10);
    if (isNaN(numMinQuantity) || numMinQuantity < 0) {
      throw new AppError("Product minimum quantity threshold must be a non-negative number.", HTTP_STATUS.BAD_REQUEST);
    }

    // Default high-quality sports photos if not supplied
    const defaultPhotos = {
      Equipment: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&auto=format&fit=crop&q=80",
      Accessories: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&auto=format&fit=crop&q=80",
      Footwear: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&auto=format&fit=crop&q=80",
      Apparel: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&auto=format&fit=crop&q=80",
      Nutrition: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&auto=format&fit=crop&q=80",
    };
    const finalPhoto = photo?.trim() || defaultPhotos[category] || defaultPhotos.Equipment;

    // Determine initial status
    let status = 'IN_STOCK';
    if (numQuantity === 0) status = 'OUT_OF_STOCK';
    else if (numQuantity <= numMinQuantity) status = 'LOW_STOCK';

    // Unique Product ID
    const catPrefix = (category.substring(0, 3) || 'PRD').toUpperCase();
    const productId = `PRD-${catPrefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const creatorName = user?.name || 'Product Manager';

    // Insert Product
    await prisma.$executeRawUnsafe(
      `INSERT INTO products (product_id, club_id, name, category, photo, price, quantity, min_quantity, description, status, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      productId,
      clubId,
      name.trim(),
      category.trim() || 'Equipment',
      finalPhoto,
      numPrice,
      numQuantity,
      numMinQuantity,
      description.trim(),
      status,
      creatorName
    );

    // Check min_quantity condition: if product quantity drops/starts <= min_quantity, trigger notification!
    let notificationCreated = null;
    if (numQuantity <= numMinQuantity) {
      notificationCreated = await this._createLowStockNotification(
        clubId,
        productId,
        name.trim(),
        numQuantity,
        numMinQuantity
      );
    }

    return {
      productId,
      name: name.trim(),
      category,
      photo: finalPhoto,
      price: numPrice,
      quantity: numQuantity,
      minQuantity: numMinQuantity,
      status,
      description: description.trim(),
      notification: notificationCreated,
      message: numQuantity <= numMinQuantity
        ? `Product added successfully. ⚠️ Warning: Stock is at or below minimum threshold (${numQuantity}/${numMinQuantity})!`
        : "Product added successfully to inventory.",
    };
  }

  /**
   * Update product details
   */
  static async updateProduct(clubId, productId, data, user = null) {
    const existing = await this.getProductById(clubId, productId);

    const name = data.name !== undefined ? data.name.trim() : existing.name;
    const category = data.category !== undefined ? data.category.trim() : existing.category;
    const photo = data.photo !== undefined && data.photo.trim() ? data.photo.trim() : existing.photo;
    const price = data.price !== undefined ? parseFloat(data.price) : existing.price;
    const quantity = data.quantity !== undefined ? parseInt(data.quantity, 10) : existing.quantity;
    const minQuantity = data.minQuantity !== undefined ? parseInt(data.minQuantity, 10) : existing.minQuantity;
    const description = data.description !== undefined ? data.description.trim() : existing.description;

    let status = 'IN_STOCK';
    if (quantity === 0) status = 'OUT_OF_STOCK';
    else if (quantity <= minQuantity) status = 'LOW_STOCK';

    await prisma.$executeRawUnsafe(
      `UPDATE products 
       SET name = $1, category = $2, photo = $3, price = $4, quantity = $5, min_quantity = $6, description = $7, status = $8, updated_at = NOW()
       WHERE club_id = $9 AND product_id = $10`,
      name,
      category,
      photo,
      price,
      quantity,
      minQuantity,
      description,
      status,
      clubId,
      productId
    );

    // If stock dropped to or below minQuantity, trigger notification
    let notificationCreated = null;
    if (quantity <= minQuantity) {
      notificationCreated = await this._createLowStockNotification(
        clubId,
        productId,
        name,
        quantity,
        minQuantity
      );
    } else {
      // If restocked above threshold, clear old low stock notifications
      await prisma.$executeRawUnsafe(
        `UPDATE product_notifications SET is_read = TRUE WHERE club_id = $1 AND product_id = $2`,
        clubId,
        productId
      );
    }

    return {
      productId,
      name,
      category,
      photo,
      price,
      quantity,
      minQuantity,
      status,
      notification: notificationCreated,
      message: "Product updated successfully.",
    };
  }

  /**
   * Quick Stock Adjustment (Sell or Restock)
   * If stock drops below minQuantity, sends low stock notification immediately.
   */
  static async adjustStock(clubId, productId, adjustmentData) {
    const { type = 'SET', quantity, delta = 0, reason = "" } = adjustmentData;
    const product = await this.getProductById(clubId, productId);

    let newQuantity = product.quantity;

    if (type === 'SET') {
      newQuantity = Math.max(0, parseInt(quantity, 10) || 0);
    } else if (type === 'RESTOCK' || type === 'ADD') {
      newQuantity = product.quantity + Math.max(0, parseInt(delta, 10) || 0);
    } else if (type === 'SELL' || type === 'REDUCE') {
      const reduceBy = Math.max(0, parseInt(delta, 10) || 1);
      newQuantity = Math.max(0, product.quantity - reduceBy);
    }

    let status = 'IN_STOCK';
    if (newQuantity === 0) status = 'OUT_OF_STOCK';
    else if (newQuantity <= product.minQuantity) status = 'LOW_STOCK';

    await prisma.$executeRawUnsafe(
      `UPDATE products 
       SET quantity = $1, status = $2, updated_at = NOW()
       WHERE club_id = $3 AND product_id = $4`,
      newQuantity,
      status,
      clubId,
      productId
    );

    let notificationCreated = null;
    if (newQuantity <= product.minQuantity) {
      notificationCreated = await this._createLowStockNotification(
        clubId,
        productId,
        product.name,
        newQuantity,
        product.minQuantity
      );
    } else {
      // Restocked above minQuantity
      await prisma.$executeRawUnsafe(
        `UPDATE product_notifications SET is_read = TRUE WHERE club_id = $1 AND product_id = $2`,
        clubId,
        productId
      );
    }

    return {
      productId,
      name: product.name,
      previousQuantity: product.quantity,
      quantity: newQuantity,
      minQuantity: product.minQuantity,
      status,
      notification: notificationCreated,
      message: newQuantity <= product.minQuantity
        ? `Stock updated to ${newQuantity}. ⚠️ Low Stock Alert triggered!`
        : `Stock updated successfully to ${newQuantity} units.`,
    };
  }

  /**
   * Delete a product
   */
  static async deleteProduct(clubId, productId) {
    const targetIdStr = String(productId || '').trim();
    if (!targetIdStr) {
      throw new AppError("Product ID is required for deletion.", HTTP_STATUS.BAD_REQUEST);
    }

    // 1. Find product by product_id or numeric id
    let existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM products WHERE (club_id = $1 OR $1 IS NULL) AND (product_id = $2 OR id::text = $2) LIMIT 1`,
      clubId,
      targetIdStr
    );

    if (!existing || existing.length === 0) {
      // Fallback search without club constraint (e.g. for cross-club super admins)
      existing = await prisma.$queryRawUnsafe(
        `SELECT * FROM products WHERE product_id = $1 OR id::text = $1 LIMIT 1`,
        targetIdStr
      );
    }

    if (!existing || existing.length === 0) {
      throw new AppError("Product not found or already removed.", HTTP_STATUS.NOT_FOUND);
    }

    const target = existing[0];

    // Remove any related low stock notifications
    await prisma.$executeRawUnsafe(
      `DELETE FROM product_notifications WHERE product_id = $1`,
      target.product_id
    );

    // Delete the product by primary key id
    await prisma.$executeRawUnsafe(
      `DELETE FROM products WHERE id = $1`,
      target.id
    );

    return {
      success: true,
      productId: target.product_id,
      name: target.name,
      message: `Product "${target.name}" removed from inventory successfully.`,
    };
  }

  /**
   * Get all active low stock notifications for the Product Manager
   */
  static async getNotifications(clubId, unreadOnly = false) {
    let sql = `SELECT * FROM product_notifications WHERE club_id = $1`;
    if (unreadOnly) {
      sql += ` AND is_read = FALSE`;
    }
    sql += ` ORDER BY created_at DESC LIMIT 50`;

    const raw = await prisma.$queryRawUnsafe(sql, clubId);

    return raw.map((n) => ({
      id: n.notification_id,
      notificationId: n.notification_id,
      productId: n.product_id,
      productName: n.product_name,
      type: n.type,
      message: n.message,
      currentQuantity: parseInt(n.current_quantity, 10),
      minQuantity: parseInt(n.min_quantity, 10),
      isRead: Boolean(n.is_read),
      createdAt: n.created_at,
    }));
  }

  /**
   * Mark a notification as read / dismissed
   */
  static async markNotificationRead(clubId, notificationId) {
    await prisma.$executeRawUnsafe(
      `UPDATE product_notifications SET is_read = TRUE WHERE club_id = $1 AND notification_id = $2`,
      clubId,
      notificationId
    );

    return { success: true, message: "Notification marked as read." };
  }

  /**
   * Helper: create or update a low stock notification
   */
  static async _createLowStockNotification(clubId, productId, productName, currentQuantity, minQuantity) {
    const notifId = `NTF-${productId}-${Date.now().toString(36)}`;
    const msg = currentQuantity === 0
      ? `🚨 Out of Stock Alert: "${productName}" is completely out of stock (0 units). Immediate restocking required!`
      : `⚠️ Low Stock Alert: "${productName}" has dropped to ${currentQuantity} units (Min threshold: ${minQuantity}). Restock required!`;

    // Avoid duplicate unread notifications for the same product
    await prisma.$executeRawUnsafe(
      `DELETE FROM product_notifications WHERE club_id = $1 AND product_id = $2 AND is_read = FALSE`,
      clubId,
      productId
    );

    await prisma.$executeRawUnsafe(
      `INSERT INTO product_notifications (notification_id, club_id, product_id, product_name, type, message, current_quantity, min_quantity, is_read, created_at)
       VALUES ($1, $2, $3, $4, 'LOW_STOCK', $5, $6, $7, FALSE, NOW())`,
      notifId,
      clubId,
      productId,
      productName,
      msg,
      currentQuantity,
      minQuantity
    );

    return {
      notificationId: notifId,
      productId,
      productName,
      message: msg,
      currentQuantity,
      minQuantity,
      type: 'LOW_STOCK',
    };
  }
}
