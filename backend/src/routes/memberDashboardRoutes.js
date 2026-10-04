import express from "express";
import { MemberDashboardController } from "../controllers/memberDashboardController.js";
import { authenticateMember } from "../middleware/authenticateMember.js";

const router = express.Router();

// All member dashboard endpoints require member authentication
router.use(authenticateMember);

// Member profile & club details
router.get("/me", MemberDashboardController.getMe);

// 1. Pro Shop & Inventory Purchases
router.get("/products", MemberDashboardController.getProducts);
router.post("/products/purchase", MemberDashboardController.purchaseProducts);

// 2. Cafe Food & Beverage Ordering
router.get("/cafe/menu", MemberDashboardController.getCafeMenu);
router.post("/cafe/order", MemberDashboardController.orderCafeFood);
router.get("/cafe/my-orders", MemberDashboardController.getMyCafeOrders);

// 3. Court Matrix & Bookings
router.get("/courts/matrix", MemberDashboardController.getCourtMatrix);
router.post("/courts/book", MemberDashboardController.bookCourt);
router.get("/courts/my-bookings", MemberDashboardController.getMyBookings);
router.delete("/courts/cancel/:bookingId", MemberDashboardController.cancelBooking);

export default router;
