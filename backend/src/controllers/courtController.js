/**
 * Court Controller
 * HTTP handlers for court facility management
 */

import { CourtService } from "../services/courtService.js";
import { BookingService } from "../services/bookingService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class CourtController {
  /**
   * GET /api/courts
   */
  static async getCourts(req, res, next) {
    try {
      const { sportType, status, search } = req.query;
      const courts = await CourtService.getCourts(req.clubId, {
        sportType,
        status,
        search,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Courts retrieved successfully",
        data: { courts },
        courts,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courts/:id
   */
  static async getCourtById(req, res, next) {
    try {
      const court = await CourtService.getCourtById(req.clubId, req.params.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { court },
        court,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/courts
   */
  static async createCourt(req, res, next) {
    try {
      const newCourt = await CourtService.createCourt(
        req.clubId,
        req.body,
        req.user
      );

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Court created successfully",
        data: { court: newCourt },
        court: newCourt,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/courts/:id
   */
  static async updateCourt(req, res, next) {
    try {
      const updated = await CourtService.updateCourt(
        req.clubId,
        req.params.id,
        req.body,
        req.user
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Court updated successfully",
        data: { court: updated },
        court: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/courts/:id
   */
  static async deleteCourt(req, res, next) {
    try {
      const deleted = await CourtService.deleteCourt(
        req.clubId,
        req.params.id,
        req.user
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Court deleted successfully",
        data: { court: deleted },
        court: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/courts/occupancy/utilization
   */
  static async getOccupancy(req, res, next) {
    try {
      const todayBookings = BookingService.getTodayBookings(req.clubId);
      const utilization = CourtService.calculateUtilization(req.clubId, todayBookings);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { courtUtilization: utilization },
        courtUtilization: utilization,
      });
    } catch (error) {
      next(error);
    }
  }
}
