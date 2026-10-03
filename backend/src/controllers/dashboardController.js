/**
 * Dashboard Controller
 * HTTP handler for dashboard endpoints
 */

import { DashboardService } from "../services/dashboardService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class DashboardController {
  /**
   * GET /api/dashboard
   * Fetch club dashboard statistics and operational views
   */
  static async getDashboard(req, res, next) {
    try {
      const dashboard = await DashboardService.getDashboardData(req.clubId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dashboard,
        dashboard, // Dual-compatibility for direct res.dashboard access
      });
    } catch (error) {
      next(error);
    }
  }
}
