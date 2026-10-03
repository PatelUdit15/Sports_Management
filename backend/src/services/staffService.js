/**
 * Staff & HR Service
 * Comprehensive business logic for:
 * 1. Employee management by HR (Receptionist, Inventory Manager, Bar & Cafe Manager, etc.) with unique IDs.
 * 2. Setting email and password credentials for employee login.
 * 3. Employee self-service leave management (apply, track status, leave balances).
 * 4. HR leave management (approve / reject with remarks).
 * 5. Employee wage & payslip management (detailed breakdown, monthly payslips, digital download/print).
 */

import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ROLES } from "../config/constants.js";
import env from "../config/env.js";

// Department definitions
export const DEPARTMENTS = [
  { id: "dept-front", name: "Front Desk & Reception", code: "REC", head: "Head Receptionist" },
  { id: "dept-shop", name: "Pro Shop & Inventory", code: "INV", head: "Inventory Lead" },
  { id: "dept-cafe", name: "Cafe & Bar Operations", code: "BAR", head: "Cafe & Beverage Manager" },
  { id: "dept-courts", name: "Court Operations & Maintenance", code: "CRT", head: "Court Lead" },
  { id: "dept-finance", name: "Finance & Accounts", code: "ACC", head: "Senior Accountant" },
  { id: "dept-hr", name: "Human Resources & Payroll", code: "HRM", head: "HR Partner" },
  { id: "dept-coaching", name: "High Performance Coaching", code: "COA", head: "Head Coach" },
];

/**
 * Generate a unique employee code
 * e.g., EMP-REC-101, EMP-INV-102, EMP-BAR-103
 */
export const generateUniqueEmployeeId = (role = "RECEPTIONIST", count = 1) => {
  const rolePrefixes = {
    [ROLES.SUPER_ADMIN]: "ADM",
    [ROLES.RECEPTIONIST]: "REC",
    [ROLES.SHOP_INVENTORY_MANAGER]: "INV",
    [ROLES.BAR_CAFETERIA_STAFF]: "BAR",
    [ROLES.HR_MANAGER]: "HRM",
    [ROLES.ACCOUNTANT]: "ACC",
  };

  const prefix = rolePrefixes[role] || "EMP";
  const num = 100 + count;
  return `EMP-${prefix}-${num}`;
};

export class StaffService {
  /**
   * Helper: Ensure employees table has records for all existing club users
   */
  static async _syncUsersToEmployees(clubId) {
    const users = await prisma.user.findMany({ where: { clubId } });
    const existingEmployees = await prisma.$queryRawUnsafe(
      "SELECT email, employee_id FROM employees WHERE club_id = $1",
      clubId
    );

    const existingEmails = new Set(existingEmployees.map((e) => e.email.toLowerCase()));
    let count = existingEmployees.length;

    for (const u of users) {
      if (!existingEmails.has(u.email.toLowerCase())) {
        count++;
        const empId = generateUniqueEmployeeId(u.role, count);
        let dept = "Front Desk & Reception";
        let designation = "Front Desk Officer";
        let salary = 28000;

        if (u.role === ROLES.SHOP_INVENTORY_MANAGER) {
          dept = "Pro Shop & Inventory";
          designation = "Inventory Manager";
          salary = 32000;
        } else if (u.role === ROLES.BAR_CAFETERIA_STAFF) {
          dept = "Cafe & Bar Operations";
          designation = "Bar & Cafe Manager";
          salary = 30000;
        } else if (u.role === ROLES.ACCOUNTANT) {
          dept = "Finance & Accounts";
          designation = "Senior Accountant";
          salary = 38000;
        } else if (u.role === ROLES.HR_MANAGER) {
          dept = "Human Resources & Payroll";
          designation = "HR Manager";
          salary = 40000;
        } else if (u.role === ROLES.SUPER_ADMIN) {
          dept = "Executive Management";
          designation = "Club Operations Director";
          salary = 60000;
        }

        await prisma.$executeRawUnsafe(
          `INSERT INTO employees (employee_id, club_id, user_id, name, email, role, department, designation, phone, shift, salary, wage_type, status, leave_balance_casual, leave_balance_sick, leave_balance_annual, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'MONTHLY', 'Active', 12, 8, 15, NOW(), NOW())
           ON CONFLICT (employee_id) DO NOTHING`,
          empId,
          clubId,
          u.userId,
          u.name,
          u.email.toLowerCase(),
          u.role,
          dept,
          designation,
          "+91 98000 000" + String(count).padStart(2, "0"),
          "09:00 - 18:00",
          salary
        );

        // Also seed initial payslip for this employee
        await this._seedPayslipForEmployee(clubId, {
          employee_id: empId,
          name: u.name,
          role: u.role,
          department: dept,
          salary,
        });
      }
    }
  }

  /**
   * Helper: Seed a realistic monthly payslip
   */
  static async _seedPayslipForEmployee(clubId, emp) {
    const payslipId = `PS-${emp.employee_id}-OCT2026`;
    const basic = Math.round(Number(emp.salary) * 0.7);
    const allowances = Math.round(Number(emp.salary) * 0.25); // HRA & Travel
    const deductions = Math.round(Number(emp.salary) * 0.05); // Tax / PF
    const net = basic + allowances - deductions;

    await prisma.$executeRawUnsafe(
      `INSERT INTO employee_payslips (payslip_id, club_id, employee_id, employee_name, role, department, month, pay_period, basic_salary, allowances, deductions, net_salary, payment_status, payment_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PAID', '2026-10-01'::date, NOW())
       ON CONFLICT (payslip_id) DO NOTHING`,
      payslipId,
      clubId,
      emp.employee_id,
      emp.name,
      emp.role,
      emp.department,
      "October 2026",
      "01 Oct 2026 – 31 Oct 2026",
      basic,
      allowances,
      deductions,
      net
    );
  }

  /**
   * Get all employees for the club
   */
  static async getEmployees(clubId) {
    await this._syncUsersToEmployees(clubId);

    const dbEmployees = await prisma.$queryRawUnsafe(
      `SELECT * FROM employees WHERE club_id = $1 ORDER BY id ASC`,
      clubId
    );

    return dbEmployees.map((e) => ({
      id: e.employee_id,
      userId: e.user_id,
      employeeCode: e.employee_id,
      employeeId: e.employee_id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      role: e.role,
      department: {
        id: `dept-${e.department.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        name: e.department,
      },
      designation: e.designation,
      shift: e.shift,
      salary: parseFloat(e.salary) || 25000,
      wageType: e.wage_type || "MONTHLY",
      status: e.status || "Active",
      leaveBalance: {
        casual: e.leave_balance_casual ?? 12,
        sick: e.leave_balance_sick ?? 8,
        annual: e.leave_balance_annual ?? 15,
      },
      joinDate: e.created_at ? new Date(e.created_at).toISOString().split("T")[0] : "2026-08-01",
    }));
  }

  /**
   * Get employee by email
   */
  static async getEmployeeByEmail(clubId, email) {
    if (!email) return null;
    await this._syncUsersToEmployees(clubId);

    const dbEmployees = await prisma.$queryRawUnsafe(
      `SELECT * FROM employees WHERE club_id = $1 AND LOWER(email) = $2 LIMIT 1`,
      clubId,
      email.toLowerCase().trim()
    );

    if (!dbEmployees || dbEmployees.length === 0) return null;
    const e = dbEmployees[0];

    return {
      id: e.employee_id,
      userId: e.user_id,
      employeeCode: e.employee_id,
      employeeId: e.employee_id,
      name: e.name,
      email: e.email,
      phone: e.phone,
      role: e.role,
      department: {
        id: `dept-${(e.department || "").toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
        name: e.department,
      },
      designation: e.designation,
      shift: e.shift,
      salary: parseFloat(e.salary) || 25000,
      wageType: e.wage_type || "MONTHLY",
      status: e.status || "Active",
      leaveBalance: {
        casual: e.leave_balance_casual ?? 12,
        sick: e.leave_balance_sick ?? 8,
        annual: e.leave_balance_annual ?? 15,
      },
      joinDate: e.created_at ? new Date(e.created_at).toISOString().split("T")[0] : "2026-08-01",
    };
  }

  /**
   * Get all departments for a club
   */
  static async getDepartments(clubId) {
    const employees = await this.getEmployees(clubId);

    return DEPARTMENTS.map((dept) => {
      const matching = employees.filter(
        (e) =>
          e.department?.name?.toLowerCase().includes(dept.code.toLowerCase()) ||
          e.department?.name?.toLowerCase().includes(dept.name.toLowerCase())
      );

      return {
        ...dept,
        employeeCount: matching.length,
        employees: matching.map((m) => ({ id: m.employeeId, name: m.name, role: m.role })),
      };
    });
  }

  /**
   * Create a new employee with unique ID, credentials (email + password), department, and wage
   */
  static async createEmployee(clubId, data) {
    const {
      name,
      email,
      password,
      role = ROLES.RECEPTIONIST,
      department,
      designation,
      employeeId,
      salary = 28000,
      shift = "09:00 - 18:00",
      phone = "",
    } = data;

    if (!name || !email) {
      throw new AppError("Full name and email are required.", HTTP_STATUS.BAD_REQUEST);
    }
    if (!password) {
      throw new AppError("Password is required for employee login credentials.", HTTP_STATUS.BAD_REQUEST);
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        clubId,
      },
    });

    if (existingUser) {
      throw new AppError("An employee with this email already exists in this club.", HTTP_STATUS.CONFLICT);
    }

    // Auto-generate unique ID if not provided
    const totalEmployees = await prisma.$queryRawUnsafe(
      "SELECT count(*) as count FROM employees WHERE club_id = $1",
      clubId
    );
    const count = parseInt(totalEmployees[0]?.count || 0, 10) + 1;
    const finalEmployeeId = employeeId?.trim() || generateUniqueEmployeeId(role, count);

    // Hash password for authentication
    const hashedPassword = await bcrypt.hash(password, env.BCRYPT_ROUNDS || 10);
    const userId = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    // Default department and designation based on role
    let finalDept = department;
    let finalDesignation = designation;

    if (!finalDept) {
      if (role === ROLES.RECEPTIONIST) finalDept = "Front Desk & Reception";
      else if (role === ROLES.SHOP_INVENTORY_MANAGER) finalDept = "Pro Shop & Inventory";
      else if (role === ROLES.BAR_CAFETERIA_STAFF) finalDept = "Cafe & Bar Operations";
      else if (role === ROLES.ACCOUNTANT) finalDept = "Finance & Accounts";
      else if (role === ROLES.HR_MANAGER) finalDept = "Human Resources & Payroll";
      else finalDept = "General Operations";
    }

    if (!finalDesignation) {
      if (role === ROLES.RECEPTIONIST) finalDesignation = "Front Desk Receptionist";
      else if (role === ROLES.SHOP_INVENTORY_MANAGER) finalDesignation = "Inventory Manager";
      else if (role === ROLES.BAR_CAFETERIA_STAFF) finalDesignation = "Bar & Cafe Manager";
      else if (role === ROLES.ACCOUNTANT) finalDesignation = "Club Accountant";
      else if (role === ROLES.HR_MANAGER) finalDesignation = "HR Manager";
      else finalDesignation = "Staff Associate";
    }

    // 1. Create User for Login
    const newUser = await prisma.user.create({
      data: {
        userId,
        clubId,
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: ROLES[role] ? role : ROLES.RECEPTIONIST,
        isActive: true,
      },
    });

    // 2. Create Employee Record
    await prisma.$executeRawUnsafe(
      `INSERT INTO employees (employee_id, club_id, user_id, name, email, role, department, designation, phone, shift, salary, wage_type, status, leave_balance_casual, leave_balance_sick, leave_balance_annual, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'MONTHLY', 'Active', 12, 8, 15, NOW(), NOW())
       ON CONFLICT (employee_id) DO UPDATE 
       SET name = $4, email = $5, role = $6, department = $7, designation = $8, phone = $9, shift = $10, salary = $11, updated_at = NOW()`,
      finalEmployeeId,
      clubId,
      userId,
      name.trim(),
      cleanEmail,
      newUser.role,
      finalDept,
      finalDesignation,
      phone.trim() || "+91 98000 000" + String(count).padStart(2, "0"),
      shift,
      parseFloat(salary) || 28000
    );

    // 3. Generate Initial Payslip for wage management
    await this._seedPayslipForEmployee(clubId, {
      employee_id: finalEmployeeId,
      name: name.trim(),
      role: newUser.role,
      department: finalDept,
      salary: parseFloat(salary) || 28000,
    });

    return {
      employeeId: finalEmployeeId,
      userId,
      name: name.trim(),
      email: cleanEmail,
      role: newUser.role,
      department: finalDept,
      designation: finalDesignation,
      salary: parseFloat(salary) || 28000,
      shift,
      status: "Active",
    };
  }

  /**
   * Get all leaves for the club (or for a specific employee)
   */
  static async getLeaves(clubId, userEmail = null) {
    let leaves;
    if (userEmail) {
      leaves = await prisma.$queryRawUnsafe(
        `SELECT * FROM employee_leaves WHERE club_id = $1 AND LOWER(employee_email) = $2 ORDER BY id DESC`,
        clubId,
        userEmail.toLowerCase().trim()
      );
    } else {
      leaves = await prisma.$queryRawUnsafe(
        `SELECT * FROM employee_leaves WHERE club_id = $1 ORDER BY id DESC`,
        clubId
      );
    }

    // If no leaves exist for club yet, seed sample leaves
    if ((!leaves || leaves.length === 0) && !userEmail) {
      const sampleLeaves = [
        {
          id: "LV-101",
          empId: "EMP-REC-101",
          name: "Sunita Joshi",
          email: "sunita.rec@skylinesports.com",
          dept: "Front Desk & Reception",
          type: "Annual / Paid Leave",
          start: "2026-10-12",
          end: "2026-10-15",
          days: 4,
          reason: "Family vacation and wedding attendance",
          status: "PENDING",
        },
        {
          id: "LV-102",
          empId: "EMP-INV-102",
          name: "Ramesh Kumar",
          email: "ramesh.inv@skylinesports.com",
          dept: "Pro Shop & Inventory",
          type: "Medical / Sick Leave",
          start: "2026-10-06",
          end: "2026-10-07",
          days: 2,
          reason: "Physiotherapy follow-up appointment",
          status: "APPROVED",
        },
        {
          id: "LV-103",
          empId: "EMP-BAR-103",
          name: "Anjali Patel",
          email: "anjali.bar@skylinesports.com",
          dept: "Cafe & Bar Operations",
          type: "Casual Leave",
          start: "2026-10-20",
          end: "2026-10-21",
          days: 1,
          reason: "Personal family commitment",
          status: "PENDING",
        },
      ];

      for (const sl of sampleLeaves) {
        await prisma.$executeRawUnsafe(
          `INSERT INTO employee_leaves (leave_id, club_id, employee_id, employee_name, employee_email, department, leave_type, start_date, end_date, days_count, reason, status, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9::date, $10, $11, $12, NOW())
           ON CONFLICT (leave_id) DO NOTHING`,
          sl.id,
          clubId,
          sl.empId,
          sl.name,
          sl.email,
          sl.dept,
          sl.type,
          sl.start,
          sl.end,
          sl.days,
          sl.reason,
          sl.status
        );
      }

      leaves = await prisma.$queryRawUnsafe(
        `SELECT * FROM employee_leaves WHERE club_id = $1 ORDER BY id DESC`,
        clubId
      );
    }

    return (leaves || []).map((l) => ({
      id: l.leave_id,
      leaveId: l.leave_id,
      employeeId: l.employee_id,
      employee: {
        name: l.employee_name,
        email: l.employee_email,
        department: l.department,
      },
      leaveType: l.leave_type,
      startDate: l.start_date instanceof Date ? l.start_date.toISOString().split("T")[0] : (l.start_date ? String(l.start_date).split("T")[0] : ""),
      endDate: l.end_date instanceof Date ? l.end_date.toISOString().split("T")[0] : (l.end_date ? String(l.end_date).split("T")[0] : ""),
      daysCount: l.days_count,
      reason: l.reason,
      status: l.status,
      decisionNote: l.decision_note,
      decidedBy: l.decided_by,
      createdAt: l.created_at,
    }));
  }

  /**
   * Employee applies for leave
   */
  static async applyLeave(clubId, user, leaveData) {
    const { leaveType, startDate, endDate, reason } = leaveData;

    if (!leaveType || !startDate || !endDate || !reason) {
      throw new AppError("Leave type, start date, end date, and reason are required.", HTTP_STATUS.BAD_REQUEST);
    }

    // Find employee record
    const empRecords = await prisma.$queryRawUnsafe(
      `SELECT * FROM employees WHERE club_id = $1 AND (LOWER(email) = $2 OR user_id = $3) LIMIT 1`,
      clubId,
      user.email.toLowerCase(),
      user.userId
    );

    const emp = empRecords[0] || {
      employee_id: `EMP-${user.userId.slice(-4)}`,
      name: user.name,
      email: user.email,
      department: "General Operations",
    };

    // Calculate days count
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const daysCount = Math.max(diffDays || 1, 1);

    const leaveId = `LV-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const cleanStartDate = isNaN(start.getTime()) ? startDate : start.toISOString().split("T")[0];
    const cleanEndDate = isNaN(end.getTime()) ? endDate : end.toISOString().split("T")[0];

    await prisma.$executeRawUnsafe(
      `INSERT INTO employee_leaves (leave_id, club_id, employee_id, employee_name, employee_email, department, leave_type, start_date, end_date, days_count, reason, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8::date, $9::date, $10, $11, 'PENDING', NOW())`,
      leaveId,
      clubId,
      emp.employee_id,
      emp.name,
      emp.email,
      emp.department,
      leaveType,
      cleanStartDate,
      cleanEndDate,
      daysCount,
      reason
    );

    return {
      leaveId,
      employeeId: emp.employee_id,
      employeeName: emp.name,
      leaveType,
      startDate,
      endDate,
      daysCount,
      status: "PENDING",
      message: "Leave application submitted successfully. Pending HR review.",
    };
  }

  /**
   * HR approves or rejects a leave request
   */
  static async updateLeaveStatus(clubId, leaveId, status, decisionNote = "", decidedBy = "HR Manager") {
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status.toUpperCase())) {
      throw new AppError("Invalid leave status. Must be APPROVED or REJECTED.", HTTP_STATUS.BAD_REQUEST);
    }

    const cleanStatus = status.toUpperCase();

    const existing = await prisma.$queryRawUnsafe(
      `SELECT * FROM employee_leaves WHERE club_id = $1 AND leave_id = $2 LIMIT 1`,
      clubId,
      leaveId
    );

    if (!existing || existing.length === 0) {
      throw new AppError("Leave request not found.", HTTP_STATUS.NOT_FOUND);
    }

    const leave = existing[0];

    await prisma.$executeRawUnsafe(
      `UPDATE employee_leaves 
       SET status = $1, decision_note = $2, decided_by = $3
       WHERE club_id = $4 AND leave_id = $5`,
      cleanStatus,
      decisionNote || `Leave decision: ${cleanStatus}`,
      decidedBy,
      clubId,
      leaveId
    );

    // If approved, update leave balance in employees table
    if (cleanStatus === "APPROVED") {
      const days = leave.days_count || 1;
      if (leave.leave_type.toLowerCase().includes("sick") || leave.leave_type.toLowerCase().includes("medical")) {
        await prisma.$executeRawUnsafe(
          `UPDATE employees SET leave_balance_sick = GREATEST(0, leave_balance_sick - $1) WHERE club_id = $2 AND employee_id = $3`,
          days,
          clubId,
          leave.employee_id
        );
      } else if (leave.leave_type.toLowerCase().includes("annual") || leave.leave_type.toLowerCase().includes("paid")) {
        await prisma.$executeRawUnsafe(
          `UPDATE employees SET leave_balance_annual = GREATEST(0, leave_balance_annual - $1) WHERE club_id = $2 AND employee_id = $3`,
          days,
          clubId,
          leave.employee_id
        );
      } else {
        await prisma.$executeRawUnsafe(
          `UPDATE employees SET leave_balance_casual = GREATEST(0, leave_balance_casual - $1) WHERE club_id = $2 AND employee_id = $3`,
          days,
          clubId,
          leave.employee_id
        );
      }
    }

    return {
      leaveId,
      status: cleanStatus,
      decisionNote,
      decidedBy,
    };
  }

  /**
   * Get employee payslips (either for all employees or logged-in employee)
   */
  static async getPayslips(clubId, userEmail = null) {
    let payslips;
    if (userEmail) {
      // Find employee ID first
      const emp = await prisma.$queryRawUnsafe(
        `SELECT employee_id FROM employees WHERE club_id = $1 AND LOWER(email) = $2 LIMIT 1`,
        clubId,
        userEmail.toLowerCase().trim()
      );
      const empId = emp[0]?.employee_id;

      if (empId) {
        payslips = await prisma.$queryRawUnsafe(
          `SELECT * FROM employee_payslips WHERE club_id = $1 AND employee_id = $2 ORDER BY id DESC`,
          clubId,
          empId
        );
      } else {
        payslips = [];
      }
    } else {
      payslips = await prisma.$queryRawUnsafe(
        `SELECT * FROM employee_payslips WHERE club_id = $1 ORDER BY id DESC`,
        clubId
      );
    }

    return (payslips || []).map((p) => ({
      id: p.payslip_id,
      payslipId: p.payslip_id,
      employeeId: p.employee_id,
      employeeName: p.employee_name,
      role: p.role,
      department: p.department,
      month: p.month,
      payPeriod: p.pay_period,
      basicSalary: parseFloat(p.basic_salary),
      allowances: parseFloat(p.allowances),
      deductions: parseFloat(p.deductions),
      netSalary: parseFloat(p.net_salary),
      paymentStatus: p.payment_status,
      paymentDate: p.payment_date,
      createdAt: p.created_at,
    }));
  }

  /**
   * HR generates a wage payslip
   */
  static async generatePayslip(clubId, data) {
    const { employeeId, month = "November 2026", bonus = 0, deductions = 0 } = data;

    const empRecords = await prisma.$queryRawUnsafe(
      `SELECT * FROM employees WHERE club_id = $1 AND employee_id = $2 LIMIT 1`,
      clubId,
      employeeId
    );

    if (!empRecords || empRecords.length === 0) {
      throw new AppError("Employee not found for payslip generation.", HTTP_STATUS.NOT_FOUND);
    }

    const emp = empRecords[0];
    const totalWage = parseFloat(emp.salary) || 28000;
    const basic = Math.round(totalWage * 0.7);
    const totalAllowances = Math.round(totalWage * 0.25) + parseFloat(bonus || 0);
    const totalDeductions = Math.round(totalWage * 0.05) + parseFloat(deductions || 0);
    const net = basic + totalAllowances - totalDeductions;

    const monthSlug = month.replace(/\s+/g, "").toUpperCase();
    const payslipId = `PS-${emp.employee_id}-${monthSlug}`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO employee_payslips (payslip_id, club_id, employee_id, employee_name, role, department, month, pay_period, basic_salary, allowances, deductions, net_salary, payment_status, payment_date, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PAID', CURRENT_DATE, NOW())
       ON CONFLICT (payslip_id) DO UPDATE
       SET basic_salary = $9, allowances = $10, deductions = $11, net_salary = $12, payment_status = 'PAID'`,
      payslipId,
      clubId,
      emp.employee_id,
      emp.name,
      emp.role,
      emp.department,
      month,
      `01 ${month.split(" ")[0]} 2026 – 30 ${month.split(" ")[0]} 2026`,
      basic,
      totalAllowances,
      totalDeductions,
      net
    );

    return {
      payslipId,
      employeeId: emp.employee_id,
      employeeName: emp.name,
      month,
      netSalary: net,
      status: "PAID",
    };
  }

  /**
   * Record attendance punch (Clock IN / Clock OUT)
   */
  static async punchAttendance(clubId, employeeId, type) {
    if (!["IN", "OUT"].includes(type.toUpperCase())) {
      throw new AppError("Invalid punch type. Must be IN or OUT.", HTTP_STATUS.BAD_REQUEST);
    }

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newStatus = type.toUpperCase() === "IN" ? "On Duty" : "Clocked Out";

    await prisma.$executeRawUnsafe(
      `UPDATE employees SET status = $1, updated_at = NOW() WHERE club_id = $2 AND (employee_id = $3 OR user_id = $3)`,
      newStatus,
      clubId,
      employeeId
    );

    return {
      success: true,
      message: `Successfully clocked ${type.toUpperCase()} at ${timeFormatted}`,
      employeeId,
      status: newStatus,
      time: timeFormatted,
    };
  }

  /**
   * Get employee profile by email or user ID
   */
  static async getEmployeeProfile(clubId, userEmail) {
    const records = await prisma.$queryRawUnsafe(
      `SELECT * FROM employees WHERE club_id = $1 AND LOWER(email) = $2 LIMIT 1`,
      clubId,
      userEmail.toLowerCase().trim()
    );

    if (!records || records.length === 0) {
      return null;
    }

    const e = records[0];
    return {
      employeeId: e.employee_id,
      name: e.name,
      email: e.email,
      role: e.role,
      department: e.department,
      designation: e.designation,
      phone: e.phone,
      shift: e.shift,
      salary: parseFloat(e.salary),
      wageType: e.wage_type,
      status: e.status,
      leaveBalance: {
        casual: e.leave_balance_casual ?? 12,
        sick: e.leave_balance_sick ?? 8,
        annual: e.leave_balance_annual ?? 15,
      },
    };
  }
}
