/**
 * Court Routes
 * Facility court configuration endpoints
 */

import express from "express";
import { CourtController } from "../controllers/courtController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// All court endpoints require authentication
router.use(authenticate);

// List all courts
router.get("/", CourtController.getCourts);

// Facility utilization breakdown
router.get("/occupancy/utilization", CourtController.getOccupancy);

// Single court
router.get("/:id", CourtController.getCourtById);

// Create new court
router.post("/", CourtController.createCourt);

// Update court
router.put("/:id", CourtController.updateCourt);

// Delete court
router.delete("/:id", CourtController.deleteCourt);

export default router;
