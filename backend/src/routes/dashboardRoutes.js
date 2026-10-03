/**
 * Dashboard Routes
 */

import express from "express";
import { DashboardController } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// All dashboard endpoints require authentication
router.use(authenticate);

// GET /api/dashboard
router.get("/", DashboardController.getDashboard);

export default router;
