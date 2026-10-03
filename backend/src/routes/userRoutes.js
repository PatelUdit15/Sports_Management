/**
 * User Management Routes
 */

import express from "express";
import { UserController } from "../controllers/userController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

// All user routes require authentication and Super Admin role
router.use(authenticate);
router.use(authorizeRole(ROLES.SUPER_ADMIN));

// User statistics (before :id route to avoid conflict)
router.get("/stats", UserController.getUserStats);

// User CRUD operations
router.get("/", UserController.getAllUsers);
router.post("/", UserController.createUser);
router.get("/:id", UserController.getUserById);
router.patch("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

export default router;
