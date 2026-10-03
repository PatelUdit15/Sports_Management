/**
 * Staff & HR Controller
 * HTTP handlers for staff roster, departments, leaves, attendance, and wage payslips
 */

import { StaffService } from "../services/staffService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class StaffController {
  /**
   * GET /api/staff/employees
   */
  static async getEmployees(req, res, next) {
    try {
      const isHrOrAdmin = req.user.role === "SUPER_ADMIN" || req.user.role === "HR_MANAGER";
      if (!isHrOrAdmin) {
        const emp = await StaffService.getEmployeeByEmail(req.clubId, req.user.email);
        const employees = emp ? [emp] : [];
        return res.status(HTTP_STATUS.OK).json({
          success: true,
          message: "Employee profile retrieved successfully",
          data: { employees },
          employees,
        });
      }

      const employees = await StaffService.getEmployees(req.clubId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Employees retrieved successfully",
        data: { employees },
        employees,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/staff/employees
   */
  static async createEmployee(req, res, next) {
    try {
      const newEmployee = await StaffService.createEmployee(req.clubId, req.body);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Staff member added successfully with login credentials and wage setup",
        data: { employee: newEmployee },
        employee: newEmployee,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/staff/departments
   */
  static async getDepartments(req, res, next) {
    try {
      const departments = await StaffService.getDepartments(req.clubId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Departments retrieved successfully",
        data: { departments },
        departments,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/staff/leaves
   */
  static async getLeaves(req, res, next) {
    try {
      const isHrOrAdmin = req.user.role === "SUPER_ADMIN" || req.user.role === "HR_MANAGER";
      const userEmail = isHrOrAdmin && !req.query.myOnly ? null : req.user.email;
      const leaves = await StaffService.getLeaves(req.clubId, userEmail);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Leaves retrieved successfully",
        data: { leaves },
        leaves,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/staff/leaves/apply
   * Employee self-service: Apply for leave
   */
  static async applyLeave(req, res, next) {
    try {
      const result = await StaffService.applyLeave(req.clubId, req.user, req.body);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/staff/my-leaves
   * Employee self-service: View own leaves
   */
  static async getMyLeaves(req, res, next) {
    try {
      const leaves = await StaffService.getLeaves(req.clubId, req.user.email);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Your leave applications retrieved successfully",
        data: { leaves },
        leaves,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/staff/leaves/:id/status
   * HR manager: Approve or Reject leave
   */
  static async updateLeaveStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const decider = req.user?.name || "HR Manager";

      const updatedLeave = await StaffService.updateLeaveStatus(req.clubId, id, status, note, decider);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Leave request has been ${status}`,
        data: { leave: updatedLeave },
        leave: updatedLeave,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/staff/payslips
   * All payslips (HR) or own payslips (Employee)
   */
  static async getPayslips(req, res, next) {
    try {
      const isHrOrAdmin = req.user.role === "SUPER_ADMIN" || req.user.role === "HR_MANAGER";
      const userEmail = isHrOrAdmin && !req.query.myOnly ? null : req.user.email;

      const payslips = await StaffService.getPayslips(req.clubId, userEmail);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Payslips retrieved successfully",
        data: { payslips },
        payslips,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/staff/my-payslips
   */
  static async getMyPayslips(req, res, next) {
    try {
      const payslips = await StaffService.getPayslips(req.clubId, req.user.email);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Your payslips retrieved successfully",
        data: { payslips },
        payslips,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/staff/payslips/generate
   * HR generates a wage payslip
   */
  static async generatePayslip(req, res, next) {
    try {
      const result = await StaffService.generatePayslip(req.clubId, req.body);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Payslip generated successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/staff/my-profile
   */
  static async getMyProfile(req, res, next) {
    try {
      const profile = await StaffService.getEmployeeProfile(req.clubId, req.user.email);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Employee profile retrieved",
        data: profile,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/staff/attendance/punch
   */
  static async punchAttendance(req, res, next) {
    try {
      const { employeeId, type } = req.body;
      const targetId = employeeId || req.user.userId;
      const result = await StaffService.punchAttendance(req.clubId, targetId, type);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
