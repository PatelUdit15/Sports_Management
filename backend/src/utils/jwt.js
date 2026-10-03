/**
 * JWT Token Utilities
 */

import jwt from "jsonwebtoken";
import env from "../config/env.js";

// Generate JWT token
export const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRE,
  });
};

// Verify JWT token
export const verifyToken = (token) => {
  return jwt.verify(token, env.JWT_SECRET);
};

// Generate token for user
export const generateUserToken = (user, club) => {
  const payload = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    clubId: user.clubId,
  };

  return generateToken(payload);
};
