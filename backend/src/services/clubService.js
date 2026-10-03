/**
 * Club Service
 * Business logic for club and module management
 */

import prisma from "../config/database.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES } from "../config/constants.js";

export class ClubService {
  /**
   * Get club profile
   */
  static async getClubProfile(clubId) {
    const club = await prisma.club.findUnique({
      where: { clubId },
      include: {
        moduleConfiguration: true,
      },
    });

    if (!club) {
      throw new AppError(
        "Club not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.CLUB_NOT_FOUND
      );
    }

    return club;
  }

  /**
   * Update club profile
   */
  static async updateClubProfile(clubId, updateData) {
    const { name, address, email, phone, website, sport, country } = updateData;

    const club = await prisma.club.update({
      where: { clubId },
      data: {
        ...(name && { name }),
        ...(address !== undefined && { address }),
        ...(email && { email }),
        ...(phone !== undefined && { phone }),
        ...(website !== undefined && { website }),
        ...(sport !== undefined && { sport }),
        ...(country !== undefined && { country }),
      },
    });

    return club;
  }

  /**
   * Get module configuration
   */
  static async getModuleConfiguration(clubId) {
    const moduleConfig = await prisma.moduleConfiguration.findUnique({
      where: { clubId },
    });

    if (!moduleConfig) {
      throw new AppError(
        "Module configuration not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.CLUB_NOT_FOUND
      );
    }

    return moduleConfig;
  }

  /**
   * Update module configuration
   */
  static async updateModuleConfiguration(clubId, moduleUpdates) {
    const { membership, courtBooking, shop, bar, hr, accounting } = moduleUpdates;

    // Check if any users will lose access due to disabled modules
    const warnings = await this.checkModuleDisableImpact(clubId, moduleUpdates);

    // Update module configuration
    const moduleConfig = await prisma.moduleConfiguration.update({
      where: { clubId },
      data: {
        ...(membership !== undefined && { membership }),
        ...(courtBooking !== undefined && { courtBooking }),
        ...(shop !== undefined && { shop }),
        ...(bar !== undefined && { bar }),
        ...(hr !== undefined && { hr }),
        ...(accounting !== undefined && { accounting }),
      },
    });

    return { moduleConfig, warnings };
  }

  /**
   * Check impact of disabling modules on existing users
   */
  static async checkModuleDisableImpact(clubId, moduleUpdates) {
    const warnings = [];

    // Module to role mapping for checks
    const moduleRoleMap = {
      membership: ["RECEPTIONIST"],
      courtBooking: ["RECEPTIONIST"],
      shop: ["SHOP_INVENTORY_MANAGER"],
      bar: ["BAR_CAFETERIA_STAFF"],
      hr: ["HR_MANAGER"],
      accounting: ["ACCOUNTANT"],
    };

    for (const [module, isEnabled] of Object.entries(moduleUpdates)) {
      if (isEnabled === false && moduleRoleMap[module]) {
        const affectedRoles = moduleRoleMap[module];
        
        const affectedUsers = await prisma.user.count({
          where: {
            clubId,
            role: { in: affectedRoles },
            isActive: true,
          },
        });

        if (affectedUsers > 0) {
          warnings.push({
            module,
            affectedRoles,
            affectedUserCount: affectedUsers,
            message: `${affectedUsers} user(s) with role(s) ${affectedRoles.join(", ")} will lose access to their primary module.`,
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Get club statistics
   */
  static async getClubStats(clubId) {
    const [
      totalUsers,
      activeUsers,
      moduleConfig,
      usersByRole,
    ] = await Promise.all([
      prisma.user.count({ where: { clubId } }),
      prisma.user.count({ where: { clubId, isActive: true } }),
      prisma.moduleConfiguration.findUnique({ where: { clubId } }),
      prisma.user.groupBy({
        by: ["role"],
        where: { clubId },
        _count: true,
      }),
    ]);

    // Count enabled modules
    const enabledModules = moduleConfig
      ? Object.entries(moduleConfig).filter(
          ([key, value]) => 
            key !== "id" && 
            key !== "clubId" && 
            key !== "updatedAt" && 
            value === true
        ).length
      : 0;

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      enabledModules,
      usersByRole: usersByRole.map((r) => ({
        role: r.role,
        count: r._count,
      })),
    };
  }
}
