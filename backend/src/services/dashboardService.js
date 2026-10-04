/**
 * Dashboard Service
 * Aggregates club KPIs, live court bookings, live court utilization, alerts, and audit logs.
 * Uses real in-memory backend services (no hardcoded dummy bookings or fake courts).
 */

import prisma from "../config/database.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES } from "../config/constants.js";
import { CourtService } from "./courtService.js";
import { BookingService } from "./bookingService.js";
import { AuditService } from "./auditService.js";
import { CafeService } from "./cafeService.js";
import { ProductService } from "./productService.js";
import { StaffService } from "./staffService.js";

export class DashboardService {
  /**
   * Get operational dashboard data for a club
   */
  static async getDashboardData(clubId) {
    const [club, users, moduleConfig] = await Promise.all([
      prisma.club.findUnique({
        where: { clubId },
      }),
      prisma.user.findMany({
        where: { clubId },
        select: {
          userId: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.moduleConfiguration.findUnique({
        where: { clubId },
      }),
    ]);

    if (!club) {
      throw new AppError(
        "Club not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.CLUB_NOT_FOUND
      );
    }

    const activeUserCount = users.filter((u) => u.isActive).length;

    // Fetch live courts, live bookings, and live audit logs
    const courts = await CourtService.getCourts(clubId);
    const todayBookings = BookingService.getTodayBookings(clubId);
    const courtUtilization = CourtService.calculateUtilization(clubId, todayBookings);
    const recentActivity = AuditService.getAuditLogs(clubId, { limit: 15 });

    // Calculate live court utilization percentage across all courts
    const avgUtilization =
      courtUtilization.length > 0
        ? Math.round(
            courtUtilization.reduce((sum, c) => sum + c.utilization, 0) /
              courtUtilization.length
          )
        : 0;

    // Calculate revenue from today's bookings
    const bookingRevenue = todayBookings.reduce(
      (sum, b) => (b.status !== "Cancelled" ? sum + (Number(b.fee) || 0) : sum),
      0
    );

    // 1. Cafe metrics & revenue
    let cafeMetrics = {
      totalRevenue: 0,
      todayRevenue: 0,
      averageOrderValue: 0,
      preparingOrders: 0,
      servedOrders: 0,
      totalOrders: 0,
    };
    try {
      const cafeData = await CafeService.getOrders(clubId);
      if (cafeData?.metrics) {
        cafeMetrics = {
          totalRevenue: cafeData.metrics.totalRevenue || 0,
          todayRevenue: cafeData.metrics.todayRevenue || 0,
          averageOrderValue: cafeData.metrics.averageOrderValue || 0,
          preparingOrders: cafeData.metrics.preparingOrders || 0,
          servedOrders: cafeData.metrics.servedOrders || 0,
          totalOrders: cafeData.orders?.length || 0,
        };
      }
    } catch (e) {
      console.warn("Could not load cafe metrics for dashboard:", e.message);
    }

    // 2. Inventory / Shop metrics & valuation
    let inventoryMetrics = {
      totalProducts: 0,
      totalStock: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
      totalAlerts: 0,
      totalValuation: 0,
    };
    try {
      const productData = await ProductService.getProducts(clubId);
      if (productData?.metrics) {
        inventoryMetrics = productData.metrics;
      }
    } catch (e) {
      console.warn("Could not load inventory metrics for dashboard:", e.message);
    }

    // 3. HR & Staff workforce metrics
    let hrMetrics = {
      totalEmployees: 0,
      activeEmployees: 0,
      departmentsCount: 0,
      pendingLeavesCount: 0,
    };
    try {
      const employees = await StaffService.getEmployees(clubId);
      const leaves = await StaffService.getLeaves(clubId);
      const depts = await StaffService.getDepartments(clubId);
      hrMetrics = {
        totalEmployees: employees?.length || 0,
        activeEmployees: employees?.filter((e) => e.status === "ACTIVE")?.length || 0,
        departmentsCount: depts?.length || 0,
        pendingLeavesCount: leaves?.filter((l) => l.status === "PENDING")?.length || 0,
      };
    } catch (e) {
      console.warn("Could not load HR metrics for dashboard:", e.message);
    }

    // 4. Membership payments revenue
    let membershipRevenue = 0;
    try {
      const payments = await prisma.memberPayment.findMany({
        where: { clubId, status: "COMPLETED" },
        select: { amount: true },
      });
      membershipRevenue = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    } catch (e) {
      console.warn("Could not load member payment stats:", e.message);
    }

    // Total combined revenue
    const totalClubRevenue = bookingRevenue + cafeMetrics.totalRevenue + membershipRevenue;

    // Calculate dynamic KPIs for Super Admin
    const kpis = {
      activeMembers: activeUserCount,
      expiringSoon: 0,
      todayBookingsCount: todayBookings.filter((b) => b.status !== "Cancelled").length,
      courtUtilization: avgUtilization,
      monthlyRevenue: totalClubRevenue,
      totalClubRevenue,
      cafeRevenue: cafeMetrics.totalRevenue,
      cafeTodayRevenue: cafeMetrics.todayRevenue,
      inventoryValuation: inventoryMetrics.totalValuation,
      inventoryProductsCount: inventoryMetrics.totalProducts,
      lowStockCount: inventoryMetrics.lowStockCount,
      hrTotalStaff: hrMetrics.totalEmployees,
      hrPendingLeaves: hrMetrics.pendingLeavesCount,
      activeTabs: moduleConfig?.bar ? cafeMetrics.preparingOrders : 0,
      pendingKitchenOrders: cafeMetrics.preparingOrders,
      newLeadsCount: 0,
    };

    const alerts = [];
    if (courts.length === 0) {
      alerts.push({
        id: "alert-courts",
        level: "info",
        message: "No courts configured yet. Set up your courts in Court Bookings to enable reservations.",
      });
    }
    if (inventoryMetrics.lowStockCount > 0) {
      alerts.push({
        id: "alert-low-stock",
        level: "warning",
        message: `${inventoryMetrics.lowStockCount} inventory items have reached or fallen below minimum stock thresholds.`,
      });
    }
    if (hrMetrics.pendingLeavesCount > 0) {
      alerts.push({
        id: "alert-pending-leaves",
        level: "info",
        message: `${hrMetrics.pendingLeavesCount} employee leave application(s) awaiting HR review.`,
      });
    }

    return {
      club: {
        id: club.clubId,
        name: club.name,
        sport: club.sport,
        email: club.email,
      },
      kpis,
      cafeMetrics,
      inventoryMetrics,
      hrMetrics,
      courts,
      todayBookings,
      courtUtilization,
      alerts,
      recentActivity,
      updatedAt: new Date().toISOString(),
    };
  }
}
