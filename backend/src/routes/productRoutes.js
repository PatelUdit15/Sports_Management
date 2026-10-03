import { Router } from "express";
import { ProductController } from "../controllers/productController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = Router();

// All product endpoints require authentication
router.use(authenticate);

// Low Stock Notifications for Product Manager
router.get("/notifications/low-stock", ProductController.getNotifications);
router.patch("/notifications/:id/read", ProductController.markNotificationRead);

// Product Catalog & Stock Management
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProductById);
router.post("/", ProductController.createProduct);
router.put("/:id", ProductController.updateProduct);
router.patch("/:id/stock", ProductController.adjustStock);
router.delete("/:id", ProductController.deleteProduct);

export default router;
