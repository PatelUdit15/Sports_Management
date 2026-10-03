/**
 * Authentication Routes
 */

import express from "express";
import { AuthController } from "../controllers/authController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// Public routes
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

// Protected routes
router.get("/me", authenticate, AuthController.getCurrentUser);

export default router;
