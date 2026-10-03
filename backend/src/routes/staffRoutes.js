/**
 * Staff & HR Routes
 */

import express from "express";
import { StaffController } from "../controllers/staffController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// All staff endpoints require authentication
router.use(authenticate);

// Employees directory
router.get("/employees", StaffController.getEmployees);
router.post("/employees", StaffController.createEmployee);

// Department roster
router.get("/departments", StaffController.getDepartments);

// Leave management
router.get("/leaves", StaffController.getLeaves);
router.patch("/leaves/:id/status", StaffController.updateLeaveStatus);

// Attendance punch-clock
router.post("/attendance/punch", StaffController.punchAttendance);

export default router;
