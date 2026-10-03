/**
 * Validation Schemas using Joi
 */

import Joi from "joi";
import { ROLES, MODULES } from "../config/constants.js";

// Signup validation
export const signupSchema = Joi.object({
  // Owner details
  firstName: Joi.string().trim().min(1).max(50).required().messages({
    "string.empty": "First name is required",
    "string.max": "First name cannot exceed 50 characters",
  }),
  lastName: Joi.string().trim().min(1).max(50).required().messages({
    "string.empty": "Last name is required",
    "string.max": "Last name cannot exceed 50 characters",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Passwords do not match",
  }),

  // Club details
  clubName: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Club name is required",
    "string.max": "Club name cannot exceed 100 characters",
  }),
  clubAddress: Joi.string().trim().allow("").max(500),
  clubEmail: Joi.string().trim().email().allow(""),
  clubPhone: Joi.string().trim().allow("").max(20),
  clubWebsite: Joi.string().trim().uri().allow(""),
  sport: Joi.string().trim().allow(""),
  country: Joi.string().trim().allow(""),
});

// Login validation
export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().required().messages({
    "string.empty": "Password is required",
  }),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .optional()
    .messages({
      "any.only": "Invalid role selected",
    }),
});

// User creation validation
export const createUserSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).required().messages({
    "string.empty": "Name is required",
    "string.max": "Name cannot exceed 100 characters",
  }),
  email: Joi.string().trim().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Please provide a valid email address",
  }),
  password: Joi.string().min(8).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 8 characters",
  }),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .required()
    .messages({
      "string.empty": "Role is required",
      "any.only": "Invalid role",
    }),
});

// User update validation
export const updateUserSchema = Joi.object({
  name: Joi.string().trim().min(1).max(100).optional(),
  email: Joi.string().trim().email().optional(),
  password: Joi.string().min(8).optional(),
  role: Joi.string()
    .valid(...Object.values(ROLES))
    .optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

// Module configuration validation
export const moduleConfigSchema = Joi.object({
  membership: Joi.boolean().optional(),
  courtBooking: Joi.boolean().optional(),
  shop: Joi.boolean().optional(),
  bar: Joi.boolean().optional(),
  hr: Joi.boolean().optional(),
  accounting: Joi.boolean().optional(),
}).min(1);
