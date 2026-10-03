/**
 * Global Error Handler Middleware
 */

import { HTTP_STATUS, ERROR_CODES } from "../config/constants.js";
import { errorResponse } from "./responseFormatter.js";

export const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err);

  // Joi validation error
  if (err.isJoi) {
    const errors = err.details.map((detail) => ({
      field: detail.path.join("."),
      message: detail.message,
    }));

    return errorResponse(
      res,
      HTTP_STATUS.BAD_REQUEST,
      "Validation failed",
      ERROR_CODES.VALIDATION_ERROR,
      errors
    );
  }

  // Prisma errors
  if (err.code === "P2002") {
    return errorResponse(
      res,
      HTTP_STATUS.CONFLICT,
      "A record with this information already exists",
      ERROR_CODES.USER_ALREADY_EXISTS
    );
  }

  if (err.code === "P2025") {
    return errorResponse(
      res,
      HTTP_STATUS.NOT_FOUND,
      "Record not found",
      ERROR_CODES.USER_NOT_FOUND
    );
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      "Invalid token",
      ERROR_CODES.UNAUTHORIZED
    );
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(
      res,
      HTTP_STATUS.UNAUTHORIZED,
      "Token expired",
      ERROR_CODES.UNAUTHORIZED
    );
  }

  // Custom error with statusCode
  if (err.statusCode) {
    return errorResponse(
      res,
      err.statusCode,
      err.message,
      err.errorCode || ERROR_CODES.SERVER_ERROR
    );
  }

  // Default server error
  return errorResponse(
    res,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    process.env.NODE_ENV === "development" ? err.message : "Internal server error",
    ERROR_CODES.SERVER_ERROR
  );
};

// Custom error class
export class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
