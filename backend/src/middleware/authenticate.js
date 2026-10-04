/**
 * Authentication Middleware
 * Verify JWT token and attach user to request
 */

import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES } from "../config/constants.js";
import prisma from "../config/database.js";

export const authenticate = async (req, res, next) => {
  try {
    // Get token from header or cookie
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new AppError(
        "Not authenticated. Please login.",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      throw new AppError(
        "Invalid session token for staff/admin operations",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { userId: decoded.userId },
      include: {
        club: {
          include: {
            moduleConfiguration: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(
        "User not found or has been deleted",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.UNAUTHORIZED
      );
    }

    if (!user.isActive) {
      throw new AppError(
        "User account is inactive",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    // Attach user and club to request
    req.user = user;
    req.clubId = user.clubId;
    req.modules = user.club.moduleConfiguration;

    next();
  } catch (error) {
    next(error);
  }
};
