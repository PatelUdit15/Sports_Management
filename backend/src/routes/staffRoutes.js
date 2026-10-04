/**
 * Staff & HR Routes
 */

import express from "express";
import { StaffController } from "../controllers/staffController.js";
import { authenticate } from "../middleware/authenticate.js";

import { authorizeRole } from "../middleware/authorizeRole.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

// All staff endpoints require authentication
router.use(authenticate);

// 1. Employees directory & management (Only SUPER_ADMIN and HR_MANAGER can create employees)
router.get("/employees", StaffController.getEmployees);
router.post("/employees", authorizeRole(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER), StaffController.createEmployee);
router.get("/my-profile", StaffController.getMyProfile);

// 2. Department roster
router.get("/departments", StaffController.getDepartments);

// 3. Leave management (HR managers & Super admin manage all leaves; employees view their own & apply)
router.get("/leaves", authorizeRole(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER), StaffController.getLeaves);
router.post("/leaves/apply", StaffController.applyLeave);
router.get("/my-leaves", StaffController.getMyLeaves);
router.patch("/leaves/:id/status", authorizeRole(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER), StaffController.updateLeaveStatus);

// 4. Payslip & Wage management (HR managers & Super admin manage all payslips; employees view their own)
router.get("/payslips", authorizeRole(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER), StaffController.getPayslips);
router.get("/my-payslips", StaffController.getMyPayslips);
router.post("/payslips/generate", authorizeRole(ROLES.SUPER_ADMIN, ROLES.HR_MANAGER), StaffController.generatePayslip);

// 5. Attendance punch-clock
router.post("/attendance/punch", StaffController.punchAttendance);

export default router;
