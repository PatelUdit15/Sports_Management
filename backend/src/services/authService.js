/**
 * Authentication Service
 * Business logic for auth operations
 */

import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES, ROLES } from "../config/constants.js";
import { generateUserToken } from "../utils/jwt.js";
import env from "../config/env.js";

export class AuthService {
  /**
   * Signup - Create Super Admin and Club
   */
  static async signup(signupData) {
    const {
      firstName,
      lastName,
      email,
      password,
      clubName,
      clubAddress,
      clubEmail,
      clubPhone,
      clubWebsite,
      sport,
      country,
    } = signupData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(
        "User with this email already exists",
        HTTP_STATUS.CONFLICT,
        ERROR_CODES.USER_ALREADY_EXISTS
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS);

    // Generate unique club ID
    const clubId = `CLUB-${Date.now()}`;
    const userId = `USR-${Date.now()}`;

    // Create club, user, and module configuration in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create club
      const club = await tx.club.create({
        data: {
          clubId,
          name: clubName,
          address: clubAddress || "",
          email: clubEmail || email,
          phone: clubPhone || "",
          website: clubWebsite || "",
          sport: sport || "",
          country: country || "",
        },
      });

      // Create Super Admin user
      const user = await tx.user.create({
        data: {
          userId,
          clubId,
          name: `${firstName} ${lastName}`,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: ROLES.SUPER_ADMIN,
        },
      });

      // Create default module configuration (all modules enabled)
      const moduleConfig = await tx.moduleConfiguration.create({
        data: {
          clubId,
          membership: true,
          courtBooking: true,
          shop: true,
          bar: true,
          hr: true,
          accounting: true,
        },
      });

      return { club, user, moduleConfig };
    });

    // Generate JWT token
    const token = generateUserToken(result.user, result.club);

    return {
      user: result.user,
      club: result.club,
      moduleConfig: result.moduleConfig,
      token,
    };
  }

  /**
   * Login - Authenticate user
   */
  static async login(loginData) {
    const { email, password, role } = loginData;

    // Find user with club and modules
    const user = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        isActive: true,
      },
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
        "Invalid email or password",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new AppError(
        "Invalid email or password",
        HTTP_STATUS.UNAUTHORIZED,
        ERROR_CODES.INVALID_CREDENTIALS
      );
    }

    // If role is provided, verify it matches
    if (role && user.role !== role) {
      throw new AppError(
        `Invalid role. Your account role is ${user.role}`,
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.INVALID_ROLE
      );
    }

    // Check if club is active
    if (!user.club.isActive) {
      throw new AppError(
        "Your club account is inactive. Please contact support.",
        HTTP_STATUS.FORBIDDEN,
        ERROR_CODES.FORBIDDEN
      );
    }

    // Generate JWT token
    const token = generateUserToken(user, user.club);

    return {
      user,
      club: user.club,
      moduleConfig: user.club.moduleConfiguration,
      token,
    };
  }

  /**
   * Get current user
   */
  static async getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
      where: { userId },
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
        "User not found",
        HTTP_STATUS.NOT_FOUND,
        ERROR_CODES.USER_NOT_FOUND
      );
    }

    return {
      user,
      club: user.club,
      moduleConfig: user.club.moduleConfiguration,
    };
  }
}
