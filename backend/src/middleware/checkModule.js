/**
 * Module-Based Authorization Middleware
 * Check if required module is enabled for the club
 */

import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES, MODULES, MODULE_DB_MAP, ROLES } from "../config/constants.js";

export const checkModule = (requiredModule) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new AppError(
          "Authentication required",
          HTTP_STATUS.UNAUTHORIZED,
          ERROR_CODES.UNAUTHORIZED
        );
      }

      // Super Admin has access to all modules
      if (req.user.role === ROLES.SUPER_ADMIN) {
        return next();
      }

      // Validate module name
      if (!Object.values(MODULES).includes(requiredModule)) {
        throw new AppError(
          "Invalid module specified",
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_MODULE
        );
      }

      // Get module configuration
      const moduleConfig = req.modules;

      if (!moduleConfig) {
        throw new AppError(
          "Module configuration not found for this club",
          HTTP_STATUS.INTERNAL_SERVER_ERROR,
          ERROR_CODES.SERVER_ERROR
        );
      }

      // Check if module is enabled
      const dbFieldName = MODULE_DB_MAP[requiredModule];
      const isModuleEnabled = moduleConfig[dbFieldName];

      if (!isModuleEnabled) {
        throw new AppError(
          `The ${requiredModule} module is not enabled for your club. Please contact your administrator.`,
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.MODULE_DISABLED
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
