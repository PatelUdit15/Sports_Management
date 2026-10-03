/**
 * Audit Routes
 * Activity feed and security audit log endpoints
 */

import express from "express";
import { AuditController } from "../controllers/auditController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// All audit trail endpoints require authentication
router.use(authenticate);

// Get audit logs
router.get("/", AuditController.getAuditLogs);

export default router;
