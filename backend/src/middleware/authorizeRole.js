/**
 * Role-Based Authorization Middleware
 * Check if user has required role
 */

import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES } from "../config/constants.js";

export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError(
          "Authentication required",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AppError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.INSUFFICIENT_PERMISSION
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
