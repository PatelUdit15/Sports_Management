/**
 * Enquiry Routes
 * CRM enquiry management — restricted to SUPER_ADMIN and RECEPTIONIST
 */

import express from "express";
import { EnquiryController } from "../controllers/enquiryController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";

const router = express.Router();

// All enquiry endpoints require authentication
router.use(authenticate);

// Only SUPER_ADMIN and RECEPTIONIST can access enquiries
router.use(authorizeRole("SUPER_ADMIN", "RECEPTIONIST"));

// List all enquiries (with optional ?status=New&search=term)
router.get("/", EnquiryController.getEnquiries);

// Create a new enquiry
router.post("/", EnquiryController.createEnquiry);

// Update enquiry status
router.patch("/:id/status", EnquiryController.updateEnquiryStatus);

// Delete an enquiry
router.delete("/:id", EnquiryController.deleteEnquiry);

export default router;
