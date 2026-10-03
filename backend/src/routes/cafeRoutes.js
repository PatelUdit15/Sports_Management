import { Router } from "express";
import { CafeController } from "../controllers/cafeController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// All cafe management endpoints require authentication
router.use(authenticate);

// Menu & Combo items
router.get("/menu", CafeController.getMenuItems);
router.post("/menu", CafeController.createMenuItem);
router.put("/menu/:id", CafeController.updateMenuItem);
router.delete("/menu/:id", CafeController.deleteMenuItem);
router.patch("/menu/:id/availability", CafeController.toggleAvailability);

// Orders, status workflow, and revenue
router.get("/orders", CafeController.getOrders);
router.patch("/orders/:id/status", CafeController.updateOrderStatus);
router.put("/orders/:id/status", CafeController.updateOrderStatus);
router.post("/orders/:id/status", CafeController.updateOrderStatus);
router.patch("/orders/status", CafeController.updateOrderStatus);
router.put("/orders/status", CafeController.updateOrderStatus);
router.post("/orders/status", CafeController.updateOrderStatus);
router.post("/orders/simulate", CafeController.simulateOrder);

export default router;
