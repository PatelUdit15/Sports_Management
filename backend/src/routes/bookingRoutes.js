/**
 * Booking Routes
 * Court reservations, slot matrix, and daily ledger endpoints
 */

import express from "express";
import { BookingController } from "../controllers/bookingController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// All booking endpoints require authentication
router.use(authenticate);

// Get bookings (supports ?date=YYYY-MM-DD&status=&courtId=&search=)
router.get("/", BookingController.getBookings);

// Daily financial ledger
router.get("/daily-ledger", BookingController.getDailyLedger);

// Single booking
router.get("/:id", BookingController.getBookingById);

// Create new reservation
router.post("/", BookingController.createBooking);

// Update status
router.patch("/:id/status", BookingController.updateBookingStatus);

// Delete / Cancel reservation
router.delete("/:id", BookingController.deleteBooking);

export default router;
