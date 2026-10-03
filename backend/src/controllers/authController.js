/**
 * Authentication Controller
 * Handle auth-related HTTP requests
 */

import { AuthService } from "../services/authService.js";
import { signupSchema, loginSchema } from "../utils/validation.js";
import { successResponse, formatUserData, formatClubData, formatModulesData } from "../utils/responseFormatter.js";
import { HTTP_STATUS } from "../config/constants.js";

export class AuthController {
  /**
   * POST /api/auth/signup
   * Create Super Admin and Club
   */
  static async signup(req, res, next) {
    try {
      // Validate request body
      const { error, value } = signupSchema.validate(req.body, { abortEarly: false });
      if (error) {
        error.isJoi = true;
        throw error;
      }

      // Call service
      const result = await AuthService.signup(value);

      // Format response
      const responseData = {
        user: formatUserData(result.user),
        club: formatClubData(result.club),
        enabledModules: formatModulesData(result.moduleConfig),
      };

      // Set token in cookie (optional)
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(
        res,
        HTTP_STATUS.CREATED,
        "Signup successful. Welcome to Champions Club!",
        {
          ...responseData,
          token: result.token,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/login
   * Authenticate user
   */
  static async login(req, res, next) {
    try {
      // Validate request body
      const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
      if (error) {
        error.isJoi = true;
        throw error;
      }

      // Call service
      const result = await AuthService.login(value);

      // Format response
      const responseData = {
        user: formatUserData(result.user),
        club: formatClubData(result.club),
        enabledModules: formatModulesData(result.moduleConfig),
      };

      // Set token in cookie (optional)
      res.cookie("token", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return successResponse(
        res,
        HTTP_STATUS.OK,
        "Login successful",
        {
          ...responseData,
          token: result.token,
        }
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/auth/logout
   * Clear authentication
   */
  static async logout(req, res, next) {
    try {
      // Clear cookie
      res.clearCookie("token");

      return successResponse(res, HTTP_STATUS.OK, "Logout successful");
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/auth/me
   * Get current user
   */
  static async getCurrentUser(req, res, next) {
    try {
      const result = await AuthService.getCurrentUser(req.user.userId);

      const responseData = {
        user: formatUserData(result.user),
        club: formatClubData(result.club),
        enabledModules: formatModulesData(result.moduleConfig),
      };

      return successResponse(res, HTTP_STATUS.OK, "User retrieved successfully", responseData);
    } catch (error) {
      next(error);
    }
  }
}
