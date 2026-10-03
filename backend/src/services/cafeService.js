/**
 * Cafe & Bar Service
 * Handles Cafe Menu (food items, beverages, combo meals),
 * Order Processing (status progression: PREPARING -> SERVED),
 * and Revenue & Order History Analytics
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

export class CafeService {
  /**
   * Initialize tables if not already existing
   */
  static async initTables() {
    try {
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS cafe_menu_items (
          id SERIAL PRIMARY KEY,
          item_id VARCHAR(100) UNIQUE NOT NULL,
          club_id VARCHAR(100) NOT NULL,
          name VARCHAR(150) NOT NULL,
          category VARCHAR(50) NOT NULL DEFAULT 'Beverages',
          type VARCHAR(20) NOT NULL DEFAULT 'SINGLE',
          combo_items TEXT DEFAULT '',
          price NUMERIC(10, 2) NOT NULL DEFAULT 0,
          image TEXT,
          description TEXT DEFAULT '',
          diet_tag VARCHAR(30) DEFAULT 'VEG',
          is_available BOOLEAN DEFAULT TRUE,
          created_by VARCHAR(100) DEFAULT 'Cafe Manager',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);

      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS cafe_orders (
          id SERIAL PRIMARY KEY,
          order_id VARCHAR(100) UNIQUE NOT NULL,
          club_id VARCHAR(100) NOT NULL,
          member_name VARCHAR(120) NOT NULL,
          member_id VARCHAR(100),
          delivery_location VARCHAR(100) DEFAULT 'Cafe Table',
          items JSONB DEFAULT '[]'::jsonb,
          subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0,
          tax NUMERIC(10, 2) NOT NULL DEFAULT 0,
          total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
          status VARCHAR(30) NOT NULL DEFAULT 'PREPARING',
          notes TEXT DEFAULT '',
          served_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );
      `);
    } catch (err) {
      console.error("Error creating cafe tables:", err);
    }
  }

  /**
   * Seed initial menu items & sample orders if empty for a club
   */
  static async seedInitialDataIfEmpty(clubId) {
    await this.initTables();

    const countRes = await prisma.$queryRawUnsafe(
      `SELECT COUNT(*)::int as count FROM cafe_menu_items WHERE club_id = $1`,
      clubId
    );
    const count = countRes[0]?.count || 0;

    if (count === 0) {
      // Seed default menu items (singles & combos)
      const initialItems = [
        {
          id: `CAFE-CMB-${Date.now().toString(36)}-1`,
          name: "Post-Workout Fuel Combo",
          category: "Combos & Deals",
          type: "COMBO",
          combo_items: "1x Cold Brew Coffee + 1x Grilled Chicken Avocado Wrap + 1x Whey Protein Energy Bar",
          price: 420.00,
          image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&auto=format&fit=crop&q=80",
          description: "High protein recovery combo designed for athletes right after court sessions.",
          diet_tag: "HIGH_PROTEIN",
        },
        {
          id: `CAFE-CMB-${Date.now().toString(36)}-2`,
          name: "Morning Match Breakfast Combo",
          category: "Combos & Deals",
          type: "COMBO",
          combo_items: "1x Sourdough Avocado Toast + 1x Fresh Orange Juice + 1x Greek Yogurt Parfait",
          price: 360.00,
          image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80",
          description: "Energizing pre-game breakfast bundle with whole grains and natural vitamins.",
          diet_tag: "VEG",
        },
        {
          id: `CAFE-ITM-${Date.now().toString(36)}-3`,
          name: "Signature Nitro Cold Brew",
          category: "Beverages",
          type: "SINGLE",
          combo_items: "",
          price: 180.00,
          image: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80",
          description: "Steeped for 20 hours with velvety micro-foam and low acidity.",
          diet_tag: "VEGAN",
        },
        {
          id: `CAFE-ITM-${Date.now().toString(36)}-4`,
          name: "Acai Superberry Protein Bowl",
          category: "Healthy Bowls",
          type: "SINGLE",
          combo_items: "",
          price: 290.00,
          image: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&auto=format&fit=crop&q=80",
          description: "Organic Amazonian acai topped with chia seeds, banana slices, and toasted granola.",
          diet_tag: "VEG",
        },
        {
          id: `CAFE-ITM-${Date.now().toString(36)}-5`,
          name: "Grilled Herb Chicken Sandwich",
          category: "Sandwiches & Snacks",
          type: "SINGLE",
          combo_items: "",
          price: 240.00,
          image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500&auto=format&fit=crop&q=80",
          description: "Herb-marinated chicken breast with baby spinach and garlic aioli on multi-grain ciabatta.",
          diet_tag: "NON_VEG",
        },
        {
          id: `CAFE-ITM-${Date.now().toString(36)}-6`,
          name: "Matcha Coconut Hydrator",
          category: "Beverages",
          type: "SINGLE",
          combo_items: "",
          price: 210.00,
          image: "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=500&auto=format&fit=crop&q=80",
          description: "Ceremonial grade Uji matcha whisked with pure tender coconut water.",
          diet_tag: "VEGAN",
        },
      ];

      for (const itm of initialItems) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO cafe_menu_items (item_id, club_id, name, category, type, combo_items, price, image, description, diet_tag, is_available, created_by, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE, 'System Setup', NOW(), NOW())`,
          itm.id,
          clubId,
          itm.name,
          itm.category,
          itm.type,
          itm.combo_items,
          itm.price,
          itm.image,
          itm.description,
          itm.diet_tag
        );
      }

      // Seed initial sample orders
      const sampleOrders = [
        {
          order_id: "#ORD-8101",
          member_name: "Aarav Kapoor",
          delivery_location: "Court 1 Side Bench",
          items: JSON.stringify([
            { name: "Post-Workout Fuel Combo", price: 420, qty: 1, type: "COMBO" },
            { name: "Signature Nitro Cold Brew", price: 180, qty: 1, type: "SINGLE" }
          ]),
          subtotal: 600,
          tax: 30,
          total_amount: 630,
          status: "PREPARING",
          notes: "Extra ice in Cold brew, deliver directly to Court 1",
          served_at: null,
          created_at: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        },
        {
          order_id: "#ORD-8102",
          member_name: "Priya Sharma",
          delivery_location: "Table 4 (Cafe Terrace)",
          items: JSON.stringify([
            { name: "Acai Superberry Protein Bowl", price: 290, qty: 1, type: "SINGLE" }
          ]),
          subtotal: 290,
          tax: 14.5,
          total_amount: 304.5,
          status: "PREPARING",
          notes: "No peanut toppings please",
          served_at: null,
          created_at: new Date(Date.now() - 7 * 60 * 1000), // 7 mins ago
        },
        {
          order_id: "#ORD-8098",
          member_name: "Rohan Nair",
          delivery_location: "Lounge Booth 2",
          items: JSON.stringify([
            { name: "Morning Match Breakfast Combo", price: 360, qty: 1, type: "COMBO" }
          ]),
          subtotal: 360,
          tax: 18,
          total_amount: 378,
          status: "SERVED",
          notes: "",
          served_at: new Date(Date.now() - 45 * 60 * 1000),
          created_at: new Date(Date.now() - 60 * 60 * 1000),
        },
        {
          order_id: "#ORD-8095",
          member_name: "Neha Verma",
          delivery_location: "Table 8",
          items: JSON.stringify([
            { name: "Grilled Herb Chicken Sandwich", price: 240, qty: 2, type: "SINGLE" },
            { name: "Matcha Coconut Hydrator", price: 210, qty: 2, type: "SINGLE" }
          ]),
          subtotal: 900,
          tax: 45,
          total_amount: 945,
          status: "SERVED",
          notes: "Served warm",
          served_at: new Date(Date.now() - 120 * 60 * 1000),
          created_at: new Date(Date.now() - 135 * 60 * 1000),
        },
      ];

      for (const ord of sampleOrders) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO cafe_orders (order_id, club_id, member_name, delivery_location, items, subtotal, tax, total_amount, status, notes, served_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10, $11, $12, NOW())`,
          ord.order_id,
          clubId,
          ord.member_name,
          ord.delivery_location,
          ord.items,
          ord.subtotal,
          ord.tax,
          ord.total_amount,
          ord.status,
          ord.notes,
          ord.served_at,
          ord.created_at
        );
      }
    }
  }

  // ==========================================
  // MENU & COMBO MANAGEMENT
  // ==========================================

  /**
   * Get all menu items with filters and metrics
   */
  static async getMenuItems(clubId, query = {}) {
    await this.seedInitialDataIfEmpty(clubId);

    const { category, type, search } = query;
    let sql = `SELECT * FROM cafe_menu_items WHERE club_id = $1`;
    const params = [clubId];
    let paramIndex = 2;

    if (category && category !== 'All') {
      sql += ` AND LOWER(category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    if (type && type !== 'All') {
      sql += ` AND UPPER(type) = UPPER($${paramIndex})`;
      params.push(type);
      paramIndex++;
    }

    if (search && search.trim()) {
      sql += ` AND (LOWER(name) LIKE $${paramIndex} OR LOWER(description) LIKE $${paramIndex} OR LOWER(combo_items) LIKE $${paramIndex})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    sql += ` ORDER BY type DESC, id DESC`;

    const raw = await prisma.$queryRawUnsafe(sql, ...params);

    const items = raw.map((i) => ({
      id: i.item_id,
      itemId: i.item_id,
      dbId: i.id,
      name: i.name,
      category: i.category,
      type: i.type, // 'SINGLE' | 'COMBO'
      comboItems: i.combo_items || '',
      price: parseFloat(i.price) || 0,
      image: i.image,
      description: i.description || '',
      dietTag: i.diet_tag || 'VEG',
      isAvailable: Boolean(i.is_available),
      createdBy: i.created_by,
      createdAt: i.created_at,
      updatedAt: i.updated_at,
    }));

    return items;
  }

  /**
   * Add a new food item or combo
   */
  static async createMenuItem(clubId, data, user = null) {
    await this.initTables();

    const {
      name,
      category = 'Beverages',
      type = 'SINGLE',
      comboItems = '',
      price,
      image,
      description = '',
      dietTag = 'VEG',
      isAvailable = true,
    } = data;

    if (!name || !name.trim()) {
      throw new AppError("Item name is required.", HTTP_STATUS.BAD_REQUEST);
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      throw new AppError("Please provide a valid price.", HTTP_STATUS.BAD_REQUEST);
    }

    if (type === 'COMBO' && !comboItems.trim()) {
      throw new AppError("Please specify what items are included in this combo deal.", HTTP_STATUS.BAD_REQUEST);
    }

    const isCombo = type === 'COMBO';
    const prefix = isCombo ? 'CAFE-CMB' : 'CAFE-ITM';
    const itemId = `${prefix}-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const fallbackImage = isCombo
      ? "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=500&auto=format&fit=crop&q=80";

    const finalImage = image?.trim() || fallbackImage;
    const creator = user?.name || "Cafe Manager";

    await prisma.$executeRawUnsafe(
      `INSERT INTO cafe_menu_items (item_id, club_id, name, category, type, combo_items, price, image, description, diet_tag, is_available, created_by, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())`,
      itemId,
      clubId,
      name.trim(),
      category,
      type,
      comboItems.trim(),
      numPrice,
      finalImage,
      description.trim(),
      dietTag,
      isAvailable !== false,
      creator
    );

    return {
      itemId,
      name,
      category,
      type,
      comboItems,
      price: numPrice,
      image: finalImage,
      description,
      dietTag,
      isAvailable: isAvailable !== false,
      message: `${isCombo ? 'Combo meal' : 'Menu item'} "${name}" added successfully.`,
    };
  }

  /**
   * Update an existing food item or combo
   */
  static async updateMenuItem(clubId, id, data, user = null) {
    await this.initTables();

    const targetIdStr = String(id || '').trim();
    const existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM cafe_menu_items WHERE (club_id = $1 OR $1 IS NULL) AND (item_id = $2 OR id::text = $2) LIMIT 1`,
      clubId,
      targetIdStr
    );

    if (!existing || existing.length === 0) {
      throw new AppError("Menu item not found.", HTTP_STATUS.NOT_FOUND);
    }

    const current = existing[0];
    const {
      name = current.name,
      category = current.category,
      type = current.type,
      comboItems = current.combo_items,
      price = current.price,
      image = current.image,
      description = current.description,
      dietTag = current.diet_tag,
      isAvailable = current.is_available,
    } = data;

    const numPrice = parseFloat(price);
    if (isNaN(numPrice) || numPrice < 0) {
      throw new AppError("Please provide a valid price.", HTTP_STATUS.BAD_REQUEST);
    }

    await prisma.$executeRawUnsafe(
      `UPDATE cafe_menu_items
       SET name = $1, category = $2, type = $3, combo_items = $4, price = $5, image = $6, description = $7, diet_tag = $8, is_available = $9, updated_at = NOW()
       WHERE id = $10`,
      name.trim(),
      category,
      type,
      comboItems || '',
      numPrice,
      image,
      description || '',
      dietTag,
      isAvailable !== false,
      current.id
    );

    return {
      itemId: current.item_id,
      name,
      category,
      type,
      comboItems,
      price: numPrice,
      image,
      description,
      dietTag,
      isAvailable: isAvailable !== false,
      message: `Menu item "${name}" updated successfully.`,
    };
  }

  /**
   * Delete a menu item or combo
   */
  static async deleteMenuItem(clubId, id) {
    await this.initTables();

    const targetIdStr = String(id || '').trim();
    let existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM cafe_menu_items WHERE (club_id = $1 OR $1 IS NULL) AND (item_id = $2 OR id::text = $2) LIMIT 1`,
      clubId,
      targetIdStr
    );

    if (!existing || existing.length === 0) {
      existing = await prisma.$queryRawUnsafe(
        `SELECT * FROM cafe_menu_items WHERE item_id = $1 OR id::text = $1 LIMIT 1`,
        targetIdStr
      );
    }

    if (!existing || existing.length === 0) {
      throw new AppError("Menu item not found or already removed.", HTTP_STATUS.NOT_FOUND);
    }

    const target = existing[0];
    await prisma.$executeRawUnsafe(
      `DELETE FROM cafe_menu_items WHERE id = $1`,
      target.id
    );

    return {
      success: true,
      itemId: target.item_id,
      name: target.name,
      message: `Menu item "${target.name}" removed from cafe menu.`,
    };
  }

  /**
   * Toggle item availability (Available vs Sold Out)
   */
  static async toggleAvailability(clubId, id) {
    await this.initTables();

    const targetIdStr = String(id || '').trim();
    const existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM cafe_menu_items WHERE (club_id = $1 OR $1 IS NULL) AND (item_id = $2 OR id::text = $2) LIMIT 1`,
      clubId,
      targetIdStr
    );

    if (!existing || existing.length === 0) {
      throw new AppError("Item not found.", HTTP_STATUS.NOT_FOUND);
    }

    const current = existing[0];
    const newStatus = !current.is_available;

    await prisma.$executeRawUnsafe(
      `UPDATE cafe_menu_items SET is_available = $1, updated_at = NOW() WHERE id = $2`,
      newStatus,
      current.id
    );

    return {
      itemId: current.item_id,
      name: current.name,
      isAvailable: newStatus,
      message: `"${current.name}" marked as ${newStatus ? 'Available' : 'Sold Out'}.`,
    };
  }

  // ==========================================
  // ORDERS, STATUS & REVENUE MANAGEMENT
  // ==========================================

  /**
   * Get orders list, filtered by status, and aggregated revenue metrics
   */
  static async getOrders(clubId, query = {}) {
    await this.seedInitialDataIfEmpty(clubId);

    const { status, search } = query;
    let sql = `SELECT * FROM cafe_orders WHERE club_id = $1`;
    const params = [clubId];
    let paramIndex = 2;

    if (status && status !== 'All') {
      sql += ` AND UPPER(status) = UPPER($${paramIndex})`;
      params.push(status);
      paramIndex++;
    }

    if (search && search.trim()) {
      sql += ` AND (LOWER(order_id) LIKE $${paramIndex} OR LOWER(member_name) LIKE $${paramIndex} OR LOWER(delivery_location) LIKE $${paramIndex})`;
      params.push(`%${search.trim().toLowerCase()}%`);
      paramIndex++;
    }

    sql += ` ORDER BY CASE WHEN status = 'PREPARING' THEN 1 ELSE 2 END, created_at DESC`;

    const raw = await prisma.$queryRawUnsafe(sql, ...params);

    const orders = raw.map((o) => {
      let parsedItems = [];
      try {
        parsedItems = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
      } catch (e) {
        parsedItems = [];
      }

      return {
        id: o.order_id,
        orderId: o.order_id,
        dbId: o.id,
        memberName: o.member_name,
        memberId: o.member_id,
        deliveryLocation: o.delivery_location || 'Cafe Counter',
        items: parsedItems,
        subtotal: parseFloat(o.subtotal) || 0,
        tax: parseFloat(o.tax) || 0,
        totalAmount: parseFloat(o.total_amount) || 0,
        status: o.status, // 'PREPARING' | 'SERVED' | 'CANCELLED'
        notes: o.notes || '',
        servedAt: o.served_at,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      };
    });

    // Calculate aggregated metrics for the club
    const allOrders = await prisma.$queryRawUnsafe(
      `SELECT total_amount, status, created_at FROM cafe_orders WHERE club_id = $1`,
      clubId
    );

    let totalRevenue = 0;
    let todayRevenue = 0;
    let preparingCount = 0;
    let servedCount = 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    for (const o of allOrders) {
      const amt = parseFloat(o.total_amount) || 0;
      const oDate = new Date(o.created_at);

      if (o.status === 'SERVED') {
        totalRevenue += amt;
        servedCount++;
        if (oDate >= todayStart) {
          todayRevenue += amt;
        }
      } else if (o.status === 'PREPARING') {
        preparingCount++;
      }
    }

    const averageOrderValue = servedCount > 0 ? (totalRevenue / servedCount).toFixed(2) : 0;

    return {
      orders,
      metrics: {
        totalRevenue: Math.round(totalRevenue),
        todayRevenue: Math.round(todayRevenue),
        preparingCount,
        servedCount,
        totalOrders: allOrders.length,
        averageOrderValue: Number(averageOrderValue),
      },
    };
  }

  /**
   * Update order status: e.g. PREPARING -> SERVED
   */
  static async updateOrderStatus(clubId, orderId, newStatus) {
    await this.initTables();

    const rawStr = decodeURIComponent(String(orderId || '')).trim();
    const cleanId = rawStr.replace(/^#/, '');
    const withHash = `#${cleanId}`;

    const existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM cafe_orders 
       WHERE (club_id = $1 OR $1 IS NULL) 
         AND (order_id = $2 OR order_id = $3 OR order_id = $4 OR id::text = $2) 
       LIMIT 1`,
      clubId,
      rawStr,
      cleanId,
      withHash
    );

    if (!existing || existing.length === 0) {
      throw new AppError("Order not found.", HTTP_STATUS.NOT_FOUND);
    }

    const current = existing[0];
    const upperStatus = newStatus.toUpperCase();
    const isServed = upperStatus === 'SERVED';

    await prisma.$executeRawUnsafe(
      `UPDATE cafe_orders
       SET status = $1, served_at = CASE WHEN $2 = TRUE THEN NOW() ELSE served_at END, updated_at = NOW()
       WHERE id = $3`,
      upperStatus,
      isServed,
      current.id
    );

    return {
      orderId: current.order_id,
      previousStatus: current.status,
      status: upperStatus,
      servedAt: isServed ? new Date() : current.served_at,
      message: `Order ${current.order_id} status updated to "${upperStatus}".`,
    };
  }

  /**
   * Simulate or place an incoming order (starts in PREPARING status)
   */
  static async simulateOrder(clubId, data = {}) {
    await this.initTables();

    // Default mock menu sample if none provided
    const items = data.items?.length
      ? data.items
      : [
          { name: "Post-Workout Fuel Combo", price: 420, qty: 1, type: "COMBO" },
          { name: "Signature Nitro Cold Brew", price: 180, qty: 1, type: "SINGLE" }
        ];

    let subtotal = 0;
    for (const it of items) {
      subtotal += (parseFloat(it.price) || 0) * (parseInt(it.qty, 10) || 1);
    }
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const totalAmount = subtotal + tax;

    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `#ORD-${orderNum}`;
    const memberName = data.memberName || "Vikram Malhotra";
    const deliveryLocation = data.deliveryLocation || "Court 3 Side Bench";
    const notes = data.notes || "Member order placed via mobile app / court kiosk";

    await prisma.$executeRawUnsafe(
      `INSERT INTO cafe_orders (order_id, club_id, member_name, delivery_location, items, subtotal, tax, total_amount, status, notes, served_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, 'PREPARING', $9, NULL, NOW(), NOW())`,
      orderId,
      clubId,
      memberName,
      deliveryLocation,
      JSON.stringify(items),
      subtotal,
      tax,
      totalAmount,
      notes
    );

    return {
      orderId,
      memberName,
      deliveryLocation,
      items,
      subtotal,
      tax,
      totalAmount,
      status: 'PREPARING',
      message: `New order ${orderId} received and sent to kitchen in "PREPARING" status.`,
    };
  }
}
