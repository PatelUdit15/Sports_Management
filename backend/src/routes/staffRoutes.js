/**
 * Staff & HR Routes
 */

import express from "express";
import { StaffController } from "../controllers/staffController.js";
import { authenticate } from "../middleware/authenticate.js";

const router = express.Router();

// All staff endpoints require authentication
router.use(authenticate);

// 1. Employees directory & management
router.get("/employees", StaffController.getEmployees);
router.post("/employees", StaffController.createEmployee);
router.get("/my-profile", StaffController.getMyProfile);

// 2. Department roster
router.get("/departments", StaffController.getDepartments);

// 3. Leave management
router.get("/leaves", StaffController.getLeaves);
router.post("/leaves/apply", StaffController.applyLeave);
router.get("/my-leaves", StaffController.getMyLeaves);
router.patch("/leaves/:id/status", StaffController.updateLeaveStatus);

// 4. Payslip & Wage management
router.get("/payslips", StaffController.getPayslips);
router.get("/my-payslips", StaffController.getMyPayslips);
router.post("/payslips/generate", StaffController.generatePayslip);

// 5. Attendance punch-clock
router.post("/attendance/punch", StaffController.punchAttendance);

export default router;
