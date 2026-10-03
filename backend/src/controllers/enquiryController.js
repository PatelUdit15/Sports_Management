/**
 * Enquiry Controller
 * HTTP handlers for CRM enquiry management
 */

import { EnquiryService } from "../services/enquiryService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class EnquiryController {
  /**
   * GET /api/enquiries
   * Query params: ?status=New&search=arjun
   */
  static async getEnquiries(req, res, next) {
    try {
      const { status, search } = req.query;
      const enquiries = await EnquiryService.getEnquiries(req.clubId, {
        status,
        search,
      });
      const stats = await EnquiryService.getStats(req.clubId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Enquiries retrieved successfully",
        data: { enquiries, stats },
        enquiries,
        stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/enquiries
   * Body: { name, phone, email?, sport?, type?, source?, notes? }
   */
  static async createEnquiry(req, res, next) {
    try {
      const author = req.user?.name || req.user?.role || "Staff";
      const newEnquiry = await EnquiryService.createEnquiry(
        req.clubId,
        req.body,
        author
      );

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Enquiry logged successfully",
        data: { enquiry: newEnquiry },
        enquiry: newEnquiry,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/enquiries/:id/status
   * Body: { status, notes?, description? }
   */
  static async updateEnquiryStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes, description } = req.body;
      const convDescription = notes !== undefined ? notes : description;
      const author = req.user?.name || req.user?.role || "Staff";

      const updated = await EnquiryService.updateEnquiryStatus(
        req.clubId,
        id,
        status,
        convDescription,
        author
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Enquiry status updated to ${status}`,
        data: { enquiry: updated },
        enquiry: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/enquiries/:id
   */
  static async deleteEnquiry(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await EnquiryService.deleteEnquiry(req.clubId, id);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Enquiry deleted successfully",
        data: { enquiry: deleted },
      });
    } catch (error) {
      next(error);
    }
  }
}

