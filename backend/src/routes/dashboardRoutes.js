/**
 * Dashboard Routes
 */

import express from "express";
import { DashboardController } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

// All dashboard endpoints require authentication and SUPER_ADMIN role
router.use(authenticate);
router.use(authorizeRole(ROLES.SUPER_ADMIN));

// GET /api/dashboard
router.get("/", DashboardController.getDashboard);

export default router;
