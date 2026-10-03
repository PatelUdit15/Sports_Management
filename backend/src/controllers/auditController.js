/**
 * Audit Controller
 * HTTP handlers for system audit logs
 */

import { AuditService } from "../services/auditService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class AuditController {
  /**
   * GET /api/audit-trail
   */
  static async getAuditLogs(req, res, next) {
    try {
      const { entity, search, limit } = req.query;
      const logs = AuditService.getAuditLogs(req.clubId, {
        entity,
        search,
        limit: limit ? parseInt(limit, 10) : 50,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Audit trail retrieved successfully",
        data: { logs },
        logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
