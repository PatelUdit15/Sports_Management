/**
 * Public & Member Routes
 */

import express from "express";
import { PublicController } from "../controllers/publicController.js";

const router = express.Router();

// Clubs list with Gold/Silver/Bronze memberships
router.get("/clubs", PublicController.getClubs);

// Member Authentication & Registration
router.post("/member/register", PublicController.registerMember);
router.post("/member/login", PublicController.loginMember);

// Payment confirmation & Member ID generation
router.post("/member/confirm-payment", PublicController.confirmPayment);

// Member Digital Pass
router.get("/member/pass/:memberId", PublicController.getMemberPass);

export default router;
