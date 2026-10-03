/**
 * Booking Controller
 * HTTP handlers for court bookings, matrix data, and daily ledger
 */

import { BookingService } from "../services/bookingService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class BookingController {
  /**
   * GET /api/bookings
   */
  static async getBookings(req, res, next) {
    try {
      const { date, courtId, status, search } = req.query;
      const bookings = await BookingService.getBookings(req.clubId, {
        date,
        courtId,
        status,
        search,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Bookings retrieved successfully",
        data: { bookings },
        bookings,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bookings/:id
   */
  static async getBookingById(req, res, next) {
    try {
      const booking = await BookingService.getBookingById(req.clubId, req.params.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { booking },
        booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/bookings
   */
  static async createBooking(req, res, next) {
    try {
      const newBooking = await BookingService.createBooking(
        req.clubId,
        req.body,
        req.user
      );

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Booking confirmed successfully",
        data: { booking: newBooking },
        booking: newBooking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/bookings/:id/status
   */
  static async updateBookingStatus(req, res, next) {
    try {
      const { status } = req.body;
      const updated = await BookingService.updateBookingStatus(
        req.clubId,
        req.params.id,
        status,
        req.user
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Booking status updated to ${status}`,
        data: { booking: updated },
        booking: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/bookings/:id
   */
  static async deleteBooking(req, res, next) {
    try {
      const deleted = await BookingService.deleteBooking(
        req.clubId,
        req.params.id,
        req.user
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Booking cancelled and removed",
        data: { booking: deleted },
        booking: deleted,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/bookings/daily-ledger
   */
  static async getDailyLedger(req, res, next) {
    try {
      const { date } = req.query;
      const ledger = BookingService.getDailyLedger(req.clubId, { date });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Daily ledger calculated successfully",
        data: ledger,
        ...ledger,
      });
    } catch (error) {
      next(error);
    }
  }
}
