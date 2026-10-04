import { Router } from "express";
import { ProductController } from "../controllers/productController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { ROLES } from "../config/constants.js";

const router = Router();

// All product endpoints require authentication and SUPER_ADMIN or SHOP_INVENTORY_MANAGER role
router.use(authenticate);
router.use(authorizeRole(ROLES.SUPER_ADMIN, ROLES.SHOP_INVENTORY_MANAGER));

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
