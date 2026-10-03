/**
 * User Controller
 * Handle user management HTTP requests
 */

import { UserService } from "../services/userService.js";
import { createUserSchema, updateUserSchema } from "../utils/validation.js";
import { successResponse } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../config/constants.js";

export class UserController {
  /**
   * GET /api/users
   * Get all users for the authenticated club
   */
  static async getAllUsers(req, res, next) {
    try {
      const { role, isActive, search } = req.query;

      const filters = {
        role,
        isActive: isActive !== undefined ? isActive === "true" : undefined,
        search,
      };

      const users = await UserService.getAllUsers(req.clubId, filters);

      return successResponse(res, HTTP_STATUS.OK, "Users retrieved successfully", {
        users,
        count: users.length,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await UserService.getUserById(id, req.clubId);

      return successResponse(res, HTTP_STATUS.OK, "User retrieved successfully", { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/users
   * Create new user
   */
  static async createUser(req, res, next) {
    try {
      // Validate request body
      const { error, value } = createUserSchema.validate(req.body, { abortEarly: false });
      if (error) {
        error.isJoi = true;
        throw error;
      }

      const user = await UserService.createUser(value, req.clubId);

      return successResponse(res, HTTP_STATUS.CREATED, "User created successfully", { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/users/:id
   * Update user
   */
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;

      // Validate request body
      const { error, value } = updateUserSchema.validate(req.body, { abortEarly: false });
      if (error) {
        error.isJoi = true;
        throw error;
      }

      const user = await UserService.updateUser(id, value, req.clubId);

      return successResponse(res, HTTP_STATUS.OK, "User updated successfully", { user });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete user
   */
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      await UserService.deleteUser(id, req.clubId, req.user.userId);

      return successResponse(res, HTTP_STATUS.OK, "User deleted successfully");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/users/stats
   * Get user statistics
   */
  static async getUserStats(req, res, next) {
    try {
      const stats = await UserService.getUserStats(req.clubId);

      return successResponse(res, HTTP_STATUS.OK, "User statistics retrieved successfully", stats);
    } catch (error) {
      next(error);
    }
  }
}
