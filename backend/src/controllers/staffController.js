/**
 * Staff & HR Controller
 * HTTP handlers for staff roster, departments, leaves, and attendance
 */

import { StaffService } from "../services/staffService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class StaffController {
  /**
   * GET /api/staff/employees
   */
  static async getEmployees(req, res, next) {
    try {
      const employees = await StaffService.getEmployees(req.clubId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Employees retrieved successfully",
        data: { employees },
        employees, // Direct access for frontend compatibility
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
        departments, // Direct access for frontend compatibility
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
      const leaves = await StaffService.getLeaves(req.clubId);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Leaves retrieved successfully",
        data: { leaves },
        leaves, // Direct access for frontend compatibility
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
      const result = await StaffService.punchAttendance(req.clubId, employeeId, type);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/staff/leaves/:id/status
   */
  static async updateLeaveStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const updatedLeave = await StaffService.updateLeaveStatus(req.clubId, id, status, note);

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Leave status updated to ${status}`,
        data: { leave: updatedLeave },
        leave: updatedLeave,
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
        message: "Staff member added successfully",
        data: { employee: newEmployee },
        employee: newEmployee,
      });
    } catch (error) {
      next(error);
    }
  }
}
