/**
 * User Service
 * Business logic for user management operations
 */

import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES, ROLES, ROLE_MODULE_MAP, MODULE_DB_MAP } from "../config/constants.js";
import env from "../config/env.js";

export class UserService {
  /**
   * Get all users for a club
   */
  static async getAllUsers(clubId, filters = {}) {
    const { role, isActive, search } = filters;

    const where = {
      clubId,
      ...(role && { role }),
      ...(isActive !== undefined && { isActive }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId, clubId) {
    const user = await prisma.user.findFirst({
      where: {
        userId,
        clubId,
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(
        "User not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    return user;
  }

  /**
   * Create new user
   */
  static async createUser(userData, clubId) {
    const { name, email, password, role } = userData;

    // Check if email already exists in this club
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        clubId,
      },
    });

    if (existingUser) {
      throw new AppError(
        "User with this email already exists in your club",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.USER_ALREADY_EXISTS
      );
    }

    // Validate role and check if required module is enabled
    await this.validateRoleAndModule(role, clubId);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Generate unique user ID
    const userId = `USR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create user
    const user = await prisma.user.create({
      data: {
        userId,
        clubId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
      },
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  static async updateUser(userId, updateData, clubId) {
    const { name, email, password, role, isActive } = updateData;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { userId, clubId },
    });

    if (!existingUser) {
      throw new AppError(
        "User not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    // If email is being changed, check for uniqueness
    if (email && email.toLowerCase() !== existingUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: email.toLowerCase(),
          clubId,
          userId: { not: userId },
        },
      });

      if (emailExists) {
        throw new AppError(
          "Email already in use by another user",
          HTTP_STATUS.CONFLICT,
          ERROR_CODES.USER_ALREADY_EXISTS
        );
      }
    }

    // If role is being changed, validate it
    if (role && role !== existingUser.role) {
      await this.validateRoleAndModule(role, clubId);
    }

    // Prepare update data
    const dataToUpdate = {
      ...(name && { name }),
      ...(email && { email: email.toLowerCase() }),
      ...(isActive !== undefined && { isActive }),
      ...(role && { role }),
    };

    // Hash new password if provided
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, env.BCRYPT_ROUNDS);
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { userId },
      data: dataToUpdate,
      select: {
        userId: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return updatedUser;
  }

  /**
   * Delete user
   */
  static async deleteUser(userId, clubId, requestingUserId) {
    // Check if user exists
    const user = await prisma.user.findFirst({
      where: { userId, clubId },
    });

    if (!user) {
      throw new AppError(
        "User not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    // Prevent user from deleting themselves
    if (userId === requestingUserId) {
      throw new AppError(
        "You cannot delete your own account",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    // Check if this is the last Super Admin
    if (user.role === ROLES.SUPER_ADMIN) {
      const superAdminCount = await prisma.user.count({
        where: {
          clubId,
          role: ROLES.SUPER_ADMIN,
          isActive: true,
        },
      });

      if (superAdminCount <= 1) {
        throw new AppError(
          "Cannot delete the last Super Admin. Please assign another Super Admin first.",
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.FORBIDDEN
        );
      }
    }

    // Delete user
    await prisma.user.delete({
      where: { userId },
    });

    return true;
  }

  /**
   * Validate role and check if required module is enabled
   */
  static async validateRoleAndModule(role, clubId) {
    // Super Admin doesn't need module validation
    if (role === ROLES.SUPER_ADMIN) {
      return true;
    }

    // Get required modules for this role
    const requiredModules = ROLE_MODULE_MAP[role];

    if (!requiredModules || requiredModules.length === 0) {
      throw new AppError(
        "Invalid role specified",
        HTTP_STATUS.BAD_REQUEST,
        ERROR_CODES.INVALID_ROLE
      );
    }

    // Get club's module configuration
    const moduleConfig = await prisma.moduleConfiguration.findUnique({
      where: { clubId },
    });

    if (!moduleConfig) {
      throw new AppError(
        "Module configuration not found for this club",
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.SERVER_ERROR
      );
    }

    // Check if all required modules are enabled
    for (const module of requiredModules) {
      const dbFieldName = MODULE_DB_MAP[module];
      if (!moduleConfig[dbFieldName]) {
        throw new AppError(
          `Cannot assign ${role} role. The ${module} module is not enabled for your club.`,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.MODULE_DISABLED
        );
      }
    }

    return true;
  }

  /**
   * Get user statistics
   */
  static async getUserStats(clubId) {
    const [totalUsers, activeUsers, roleDistribution] = await Promise.all([
      prisma.user.count({ where: { clubId } }),
      prisma.user.count({ where: { clubId, isActive: true } }),
      prisma.user.groupBy({
        by: ["role"],
        where: { clubId },
        _count: true,
      }),
    ]);

    return {
      totalUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      roleDistribution: roleDistribution.map((r) => ({
        role: r.role,
        count: r._count,
      })),
    };
  }
}
