/**
 * Club & Module Management Routes
 */

import express from "express";
import { ClubController } from "../controllers/clubController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Club profile routes
router.get("/profile", ClubController.getClubProfile);
router.patch(
  "/profile",
  authorizeRole(ROLES.SUPER_ADMIN),
  ClubController.updateClubProfile
);

// Module configuration routes
router.get("/modules", ClubController.getModules);
router.patch(
  "/modules",
  authorizeRole(ROLES.SUPER_ADMIN),
  ClubController.updateModules
);

// Club statistics
router.get("/stats", ClubController.getClubStats);

export default router;
