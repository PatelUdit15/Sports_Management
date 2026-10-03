/**
 * Club Controller
 * Handle club and module management HTTP requests
 */

import { ClubService } from "../services/clubService.js";
import { moduleConfigSchema } from "../utils/validation.js";
import { successResponse, formatModulesData } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../config/constants.js";

export class ClubController {
  /**
   * GET /api/club/profile
   * Get club profile
   */
  static async getClubProfile(req, res, next) {
    try {
      const club = await ClubService.getClubProfile(req.clubId);

      return successResponse(res, HTTP_STATUS.OK, "Club profile retrieved successfully", {
        club: {
          id: club.clubId,
          name: club.name,
          address: club.address,
          email: club.email,
          phone: club.phone,
          website: club.website,
          sport: club.sport,
          country: club.country,
          isActive: club.isActive,
          createdAt: club.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/club/profile
   * Update club profile
   */
  static async updateClubProfile(req, res, next) {
    try {
      const club = await ClubService.updateClubProfile(req.clubId, req.body);

      return successResponse(res, HTTP_STATUS.OK, "Club profile updated successfully", {
        club: {
          id: club.clubId,
          name: club.name,
          address: club.address,
          email: club.email,
          phone: club.phone,
          website: club.website,
          sport: club.sport,
          country: club.country,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/club/modules
   * Get module configuration
   */
  static async getModules(req, res, next) {
    try {
      const moduleConfig = await ClubService.getModuleConfiguration(req.clubId);

      return successResponse(res, HTTP_STATUS.OK, "Module configuration retrieved successfully", {
        modules: {
          membership: moduleConfig.membership,
          courtBooking: moduleConfig.courtBooking,
          shop: moduleConfig.shop,
          bar: moduleConfig.bar,
          hr: moduleConfig.hr,
          accounting: moduleConfig.accounting,
        },
        enabledModules: formatModulesData(moduleConfig),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/club/modules
   * Update module configuration (Super Admin only)
   */
  static async updateModules(req, res, next) {
    try {
      // Validate request body
      const { error, value } = moduleConfigSchema.validate(req.body, { abortEarly: false });
      if (error) {
        error.isJoi = true;
        throw error;
      }

      const result = await ClubService.updateModuleConfiguration(req.clubId, value);

      const response = {
        modules: {
          membership: result.moduleConfig.membership,
          courtBooking: result.moduleConfig.courtBooking,
          shop: result.moduleConfig.shop,
          bar: result.moduleConfig.bar,
          hr: result.moduleConfig.hr,
          accounting: result.moduleConfig.accounting,
        },
        enabledModules: formatModulesData(result.moduleConfig),
      };

      if (result.warnings.length > 0) {
        response.warnings = result.warnings;
      }

      return successResponse(
        res,
        HTTP_STATUS.OK,
        "Module configuration updated successfully",
        response
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/club/stats
   * Get club statistics
   */
  static async getClubStats(req, res, next) {
    try {
      const stats = await ClubService.getClubStats(req.clubId);

      return successResponse(res, HTTP_STATUS.OK, "Club statistics retrieved successfully", stats);
    } catch (error) {
      next(error);
    }
  }
}
