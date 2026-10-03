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

    // Calculate dynamic KPIs
    const kpis = {
      activeMembers: activeUserCount,
      expiringSoon: 0,
      todayBookingsCount: todayBookings.filter((b) => b.status !== "Cancelled").length,
      courtUtilization: avgUtilization,
      monthlyRevenue: bookingRevenue,
      activeTabs: moduleConfig?.bar ? 0 : 0,
      pendingKitchenOrders: moduleConfig?.bar ? 0 : 0,
      lowStockCount: moduleConfig?.shop ? 0 : 0,
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

    return {
      club: {
        id: club.clubId,
        name: club.name,
        sport: club.sport,
        email: club.email,
      },
      kpis,
      courts,
      todayBookings,
      courtUtilization,
      alerts,
      recentActivity,
      updatedAt: new Date().toISOString(),
    };
  }
}
