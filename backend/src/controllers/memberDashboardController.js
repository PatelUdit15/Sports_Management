import prisma from "../config/database.js";
import { HTTP_STATUS } from "../config/constants.js";
import { successResponse } from "../utils/responseFormatter.js";
import { ProductService } from "../services/productService.js";
import { CafeService } from "../services/cafeService.js";
import { CourtService } from "../services/courtService.js";
import { BookingService } from "../services/bookingService.js";

export class MemberDashboardController {
  /**
   * GET /api/member-dashboard/me
   * Retrieve member profile, club configuration, and renewal alert
   */
  static async getMe(req, res, next) {
    try {
      const member = req.member;
      
      // Calculate renewal notification
      let requiresRenewalAlert = false;
      let daysUntilExpiry = null;

      if (member.endDate) {
        const today = new Date();
        const endDate = new Date(member.endDate);
        daysUntilExpiry = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
        requiresRenewalAlert = daysUntilExpiry <= 10 && daysUntilExpiry >= 0;
      }

      const responseData = {
        member: {
          id: member.id,
          memberId: member.memberId,
          fullName: member.fullName,
          email: member.email,
          phone: member.phone || "+91 98765 43210",
          membershipTier: member.membershipTier || "GOLD",
          startDate: member.startDate,
          endDate: member.endDate,
          status: member.status || "ACTIVE"
        },
        club: {
          clubId: member.club?.clubId || member.clubId || "CLUB-001",
          name: member.club?.name || "Champions Sports Club",
          sport: member.club?.sport || "All Sports & Fitness",
          address: member.club?.address || "Sports City Complex"
        },
        moduleConfig: req.modules || {
          courtBooking: true,
          shop: true,
          bar: true,
          membership: true
        },
        renewalInfo: {
          requiresRenewalAlert,
          daysUntilExpiry
        }
      };

      return successResponse(res, HTTP_STATUS.OK, "Member profile retrieved successfully", responseData);
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 1. BUY INVENTORY / PRO SHOP
  // ==========================================

  /**
   * GET /api/member-dashboard/products
   * Fetch inventory items for this member's sports club
   */
  static async getProducts(req, res, next) {
    try {
      const clubId = req.clubId;
      const result = await ProductService.getProducts(clubId, req.query);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Club inventory retrieved successfully",
        data: result,
        products: result.products,
        metrics: result.metrics,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/member-dashboard/products/purchase
   * Member purchase of club inventory items with stock reduction
   */
  static async purchaseProducts(req, res, next) {
    try {
      const clubId = req.clubId;
      const member = req.member;
      const { items = [], deliveryLocation = "Pro Shop Pickup", paymentMethod = "Member Balance" } = req.body;

      if (!items || items.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Please select at least one item to purchase."
        });
      }

      // Check and update stock for each item
      const purchasedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const prod = await ProductService.getProductById(clubId, item.productId || item.id);
        const qtyToBuy = parseInt(item.quantity || item.qty, 10) || 1;

        if (prod.quantity < qtyToBuy) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({
            success: false,
            message: `Insufficient stock for "${prod.name}". Available: ${prod.quantity}, Requested: ${qtyToBuy}`
          });
        }

        // Deduct inventory
        await ProductService.adjustStock(clubId, prod.productId, {
          type: "SELL",
          delta: qtyToBuy,
          reason: `Member purchase by ${member.fullName} (${member.memberId})`
        });

        const lineTotal = prod.price * qtyToBuy;
        subtotal += lineTotal;

        purchasedItems.push({
          productId: prod.productId,
          name: prod.name,
          category: prod.category,
          price: prod.price,
          quantity: qtyToBuy,
          total: lineTotal,
        });
      }

      // 15% Member Pro-Shop Privilege Discount
      const discount = Math.round(subtotal * 0.15 * 100) / 100;
      const totalAmount = Math.max(0, subtotal - discount);
      const purchaseRef = `PUR-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Purchase completed successfully! Items reserved for pickup.",
        data: {
          purchaseRef,
          memberId: member.memberId,
          memberName: member.fullName,
          deliveryLocation,
          paymentMethod,
          items: purchasedItems,
          subtotal,
          memberDiscount: discount,
          totalAmount,
          purchasedAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 2. CAFE FOOD ORDERING
  // ==========================================

  /**
   * GET /api/member-dashboard/cafe/menu
   * Fetch food and drink menu items for the member's club
   */
  static async getCafeMenu(req, res, next) {
    try {
      const clubId = req.clubId;
      const items = await CafeService.getMenuItems(clubId, req.query);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Cafe menu retrieved successfully",
        data: { items },
        items: items,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/member-dashboard/cafe/order
   * Member places a real food/beverage order with delivery to court or table
   */
  static async orderCafeFood(req, res, next) {
    try {
      const clubId = req.clubId;
      const member = req.member;
      const { items = [], deliveryLocation = "Court Side Bench", notes = "" } = req.body;

      if (!items || items.length === 0) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: "Please add at least one food or drink item to your order."
        });
      }

      await CafeService.initTables();

      let subtotal = 0;
      const formattedItems = [];

      for (const item of items) {
        const qty = parseInt(item.qty || item.quantity, 10) || 1;
        const price = parseFloat(item.price) || 0;
        subtotal += price * qty;
        formattedItems.push({
          name: item.name,
          price,
          qty,
          type: item.type || "SINGLE"
        });
      }

      // Member 20% discount on food & cafe items
      const discount = Math.round(subtotal * 0.20 * 100) / 100;
      const discountedSubtotal = subtotal - discount;
      const tax = Math.round(discountedSubtotal * 0.05 * 100) / 100;
      const totalAmount = discountedSubtotal + tax;

      const orderNum = Math.floor(1000 + Math.random() * 9000);
      const orderId = `#ORD-${orderNum}`;

      await prisma.$executeRawUnsafe(
        `INSERT INTO cafe_orders (order_id, club_id, member_name, member_id, delivery_location, items, subtotal, tax, total_amount, status, notes, served_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, 'PREPARING', $10, NULL, NOW(), NOW())`,
        orderId,
        clubId,
        member.fullName,
        member.memberId,
        deliveryLocation,
        JSON.stringify(formattedItems),
        discountedSubtotal,
        tax,
        totalAmount,
        notes ? `${notes} (Member 20% Privilege Discount Applied)` : "Member 20% Privilege Discount Applied"
      );

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: `Order ${orderId} placed successfully! Kitchen is preparing your order.`,
        data: {
          orderId,
          memberName: member.fullName,
          memberId: member.memberId,
          deliveryLocation,
          items: formattedItems,
          originalSubtotal: subtotal,
          memberDiscount: discount,
          subtotal: discountedSubtotal,
          tax,
          totalAmount,
          status: "PREPARING",
          createdAt: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/member-dashboard/cafe/my-orders
   * View member's recent cafe orders
   */
  static async getMyCafeOrders(req, res, next) {
    try {
      const clubId = req.clubId;
      const member = req.member;
      await CafeService.initTables();

      const rawOrders = await prisma.$queryRawUnsafe(
        `SELECT * FROM cafe_orders 
         WHERE club_id = $1 AND (member_id = $2 OR LOWER(member_name) = LOWER($3))
         ORDER BY created_at DESC LIMIT 20`,
        clubId,
        member.memberId,
        member.fullName
      );

      const orders = rawOrders.map((o) => {
        let items = [];
        try {
          items = typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []);
        } catch (e) {
          items = [];
        }
        return {
          orderId: o.order_id,
          deliveryLocation: o.delivery_location,
          items,
          subtotal: parseFloat(o.subtotal) || 0,
          tax: parseFloat(o.tax) || 0,
          totalAmount: parseFloat(o.total_amount) || 0,
          status: o.status,
          notes: o.notes,
          servedAt: o.served_at,
          createdAt: o.created_at,
        };
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { orders },
        orders
      });
    } catch (error) {
      next(error);
    }
  }

  // ==========================================
  // 3. COURT BOOKING
  // ==========================================

  /**
   * GET /api/member-dashboard/courts/matrix
   * Fetch live courts and reserved slots for the selected date
   */
  static async getCourtMatrix(req, res, next) {
    try {
      const clubId = req.clubId;
      const dateStr = req.query.date || new Date().toISOString().split("T")[0];

      // Fetch courts from CourtService
      const rawCourts = await CourtService.getCourts(clubId);

      // Fetch bookings for this club on this date
      const rawBookings = await BookingService.getBookings(clubId, { date: dateStr });

      const courts = rawCourts.map((c) => ({
        id: c.id,
        courtId: c.id,
        name: c.name,
        sportType: c.sportType,
        surface: c.surface,
        hourlyRate: c.hourlyRate || 1000,
        indoor: c.indoor,
      }));

      const bookings = rawBookings
        .filter((b) => b.status !== "Cancelled")
        .map((b) => ({
          id: b.id,
          bookingId: b.id,
          courtId: b.courtId || b.court?.id,
          startTime: b.startTime,
          endTime: b.endTime,
          slot: b.slot,
          status: b.status,
          guestName: b.guestName || b.member?.name,
        }));

      return successResponse(res, HTTP_STATUS.OK, "Court matrix retrieved", { courts, bookings });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/member-dashboard/courts/book
   * Reserve a court slot for the member
   */
  static async bookCourt(req, res, next) {
    try {
      const clubId = req.clubId;
      const member = req.member;
      const { courtId, courtName, startTime, endTime, date, slot, notes } = req.body;

      let bookingDateStr = date;
      let slotStr = slot;

      if (startTime && endTime) {
        const sTime = new Date(startTime);
        const eTime = new Date(endTime);
        bookingDateStr = bookingDateStr || sTime.toISOString().split("T")[0];
        const sH = sTime.getHours().toString().padStart(2, "0");
        const sM = sTime.getMinutes().toString().padStart(2, "0");
        const eH = eTime.getHours().toString().padStart(2, "0");
        const eM = eTime.getMinutes().toString().padStart(2, "0");
        slotStr = slotStr || `${sH}:${sM}-${eH}:${eM}`;
      } else if (!slotStr) {
        slotStr = "08:00-09:00";
      }

      const bookingData = {
        courtId,
        courtName,
        date: bookingDateStr || new Date().toISOString().split("T")[0],
        slot: slotStr,
        guestName: member.fullName,
        phone: member.phone || "+91 98765 43210",
        notes: notes || `Booked via Member Portal by ${member.fullName}`,
        paymentMethod: "Member Pass",
      };

      const newBooking = await BookingService.createBooking(clubId, bookingData, {
        name: member.fullName,
        role: "MEMBER"
      });

      return successResponse(res, HTTP_STATUS.CREATED, "Court booked successfully!", {
        booking: newBooking
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/member-dashboard/courts/my-bookings
   * Retrieve member's past and upcoming court reservations
   */
  static async getMyBookings(req, res, next) {
    try {
      const clubId = req.clubId;
      const member = req.member;

      const allBookings = await BookingService.getBookings(clubId);
      const myBookings = allBookings.filter(
        (b) =>
          b.guestName?.toLowerCase() === member.fullName?.toLowerCase() ||
          b.member?.name?.toLowerCase() === member.fullName?.toLowerCase()
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { bookings: myBookings },
        bookings: myBookings
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/member-dashboard/courts/cancel/:bookingId
   * Cancel an existing member reservation
   */
  static async cancelBooking(req, res, next) {
    try {
      const clubId = req.clubId;
      const member = req.member;
      const { bookingId } = req.params;

      const updated = await BookingService.updateBookingStatus(
        clubId,
        bookingId,
        "Cancelled",
        { name: member.fullName, role: "MEMBER" }
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Court booking cancelled successfully.",
        data: { booking: updated }
      });
    } catch (error) {
      next(error);
    }
  }
}
