/**
 * Staff & HR Service
 * Business logic for staff directory, departments, attendance, and leave management
 */

import bcrypt from "bcryptjs";
import prisma from "../config/database.js";
import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS, ERROR_CODES, ROLES } from "../config/constants.js";
import env from "../config/env.js";

// In-memory runtime store for dynamic punches & leave statuses per club
const clubAttendanceState = new Map();
const clubLeavesState = new Map();

export class StaffService {
  /**
   * Helper to initialize initial leaves for a club
   */
  static _initLeaves(clubId, users) {
    if (!clubLeavesState.has(clubId)) {
      const firstUser = users[0] || { name: "Sunita Joshi" };
      const [fName, ...rest] = firstUser.name.split(" ");
      const lName = rest.join(" ") || "Joshi";

      clubLeavesState.set(clubId, [
        {
          id: "LV-101",
          employeeId: firstUser.userId || "USR-MGR",
          employee: {
            firstName: fName,
            lastName: lName,
            email: firstUser.email || "staff@sportsclub.com",
          },
          leaveType: "Annual Leave",
          startDate: "2026-10-12",
          endDate: "2026-10-15",
          daysCount: 4,
          reason: "Family vacation and travel",
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
        {
          id: "LV-102",
          employeeId: "EMP-R002",
          employee: {
            firstName: "Ramesh",
            lastName: "Kumar",
            email: "ramesh.court@sportsclub.com",
          },
          leaveType: "Medical / Sick Leave",
          startDate: "2026-10-06",
          endDate: "2026-10-07",
          daysCount: 2,
          reason: "Physiotherapy follow-up appointment",
          status: "APPROVED",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "LV-103",
          employeeId: "EMP-C003",
          employee: {
            firstName: "Anjali",
            lastName: "Patel",
            email: "anjali.fnb@sportsclub.com",
          },
          leaveType: "Casual Leave",
          startDate: "2026-10-20",
          endDate: "2026-10-21",
          daysCount: 1,
          reason: "Personal family commitment",
          status: "PENDING",
          createdAt: new Date().toISOString(),
        },
      ]);
    }
    return clubLeavesState.get(clubId);
  }

  /**
   * Get all employees for the club
   */
  static async getEmployees(clubId) {
    const dbUsers = await prisma.user.findMany({
      where: { clubId },
      orderBy: { createdAt: "asc" },
    });

    const punchMap = clubAttendanceState.get(clubId) || new Map();

    const roleMeta = {
      [ROLES.SUPER_ADMIN]: {
        dept: "Executive Management",
        designation: "Club Operations Director",
        shift: "09:00 - 18:00",
      },
      [ROLES.RECEPTIONIST]: {
        dept: "Front Desk & Member Relations",
        designation: "Front Desk Officer",
        shift: "07:00 - 15:30",
      },
      [ROLES.SHOP_INVENTORY_MANAGER]: {
        dept: "Pro Shop & Merchandising",
        designation: "Retail Inventory Lead",
        shift: "10:00 - 19:00",
      },
      [ROLES.BAR_CAFETERIA_STAFF]: {
        dept: "Cafe & F&B Operations",
        designation: "Cafe Barista & Shift Lead",
        shift: "08:00 - 16:30",
      },
      [ROLES.HR_MANAGER]: {
        dept: "Human Resources & Payroll",
        designation: "HR & People Partner",
        shift: "09:00 - 18:00",
      },
      [ROLES.ACCOUNTANT]: {
        dept: "Finance & Accounts",
        designation: "Senior Club Accountant",
        shift: "09:30 - 18:30",
      },
    };

    // Map database users to employee objects
    const employees = dbUsers.map((user, idx) => {
      const nameParts = (user.name || "Staff Member").trim().split(" ");
      const firstName = nameParts[0] || "Staff";
      const lastName = nameParts.slice(1).join(" ") || "";
      const meta = roleMeta[user.role] || {
        dept: "General Operations",
        designation: user.role.replace(/_/g, " "),
        shift: "09:00 - 18:00",
      };

      const customPunch = punchMap.get(user.userId);
      const status = customPunch?.status || (user.isActive ? "Active" : "Inactive");

      return {
        id: user.userId,
        userId: user.userId,
        employeeCode: `EMP-${String(idx + 1).padStart(3, "0")}`,
        firstName,
        lastName,
        name: user.name,
        email: user.email,
        phone: "+91 98000 000" + String(idx).padStart(2, "0"),
        department: {
          id: `dept-${user.role.toLowerCase()}`,
          name: meta.dept,
        },
        designation: meta.designation,
        role: user.role,
        shift: meta.shift,
        status,
        lastPunchTime: customPunch?.timestamp || null,
        lastPunchType: customPunch?.type || null,
        joinDate: user.createdAt.toISOString().split("T")[0],
      };
    });

    // If club has fewer than 4 users, append supplementary staff records
    if (employees.length < 4) {
      const supplementaryStaff = [
        {
          id: "EMP-R002",
          userId: "EMP-R002",
          employeeCode: `EMP-00${employees.length + 1}`,
          firstName: "Ramesh",
          lastName: "Kumar",
          name: "Ramesh Kumar",
          email: "ramesh.court@skylinesports.com",
          phone: "+91 98200 44101",
          department: { id: "dept-courts", name: "Court Operations & Maintenance" },
          designation: "Head Groundskeeper & Court Lead",
          role: "FACILITY_SUPERVISOR",
          shift: "06:00 - 14:30",
          status: punchMap.get("EMP-R002")?.status || "Active",
          joinDate: "2026-08-15",
        },
        {
          id: "EMP-C003",
          userId: "EMP-C003",
          employeeCode: `EMP-00${employees.length + 2}`,
          firstName: "Anjali",
          lastName: "Patel",
          name: "Anjali Patel",
          email: "anjali.fnb@skylinesports.com",
          phone: "+91 98300 77202",
          department: { id: "dept-cafe", name: "Cafe & F&B Operations" },
          designation: "Head Barista & Service Captain",
          role: "BAR_CAFETERIA_STAFF",
          shift: "08:00 - 16:30",
          status: punchMap.get("EMP-C003")?.status || "Active",
          joinDate: "2026-09-01",
        },
        {
          id: "EMP-H004",
          userId: "EMP-H004",
          employeeCode: `EMP-00${employees.length + 3}`,
          firstName: "Sunita",
          lastName: "Joshi",
          name: "Sunita Joshi",
          email: "sunita.coaching@skylinesports.com",
          phone: "+91 98111 88303",
          department: { id: "dept-training", name: "High Performance Coaching" },
          designation: "Head Tennis Professional (PTR Elite)",
          role: "HEAD_COACH",
          shift: "06:30 - 14:00",
          status: punchMap.get("EMP-H004")?.status || "Active",
          joinDate: "2026-07-10",
        },
      ];

      for (const supp of supplementaryStaff) {
        if (!employees.some((e) => e.email === supp.email)) {
          employees.push(supp);
        }
      }
    }

    return employees;
  }

  /**
   * Get all departments for a club
   */
  static async getDepartments(clubId) {
    const employees = await this.getEmployees(clubId);

    const deptDefinitions = [
      { id: "dept-exec", name: "Executive Management", code: "EXEC", head: "Marcus Vance" },
      { id: "dept-courts", name: "Court Operations & Maintenance", code: "COURT", head: "Ramesh Kumar" },
      { id: "dept-front", name: "Front Desk & Member Relations", code: "RECP", head: "Kaif Khan" },
      { id: "dept-shop", name: "Pro Shop & Merchandising", code: "SHOP", head: "Inventory Lead" },
      { id: "dept-cafe", name: "Cafe & F&B Operations", code: "CAFE", head: "Anjali Patel" },
      { id: "dept-training", name: "High Performance Coaching", code: "COACH", head: "Sunita Joshi" },
      { id: "dept-finance", name: "Finance & Accounts", code: "ACCT", head: "Finance Lead" },
    ];

    return deptDefinitions.map((dept) => {
      const count = employees.filter(
        (e) => e.department?.name?.toLowerCase().includes(dept.code.toLowerCase()) ||
               e.department?.name === dept.name
      ).length;

      return {
        ...dept,
        employeeCount: Math.max(count, 1),
      };
    });
  }

  /**
   * Get all leaves for a club
   */
  static async getLeaves(clubId) {
    const dbUsers = await prisma.user.findMany({
      where: { clubId },
      take: 2,
    });
    return this._initLeaves(clubId, dbUsers);
  }

  /**
   * Record attendance punch (Clock IN / Clock OUT)
   */
  static async punchAttendance(clubId, employeeId, type) {
    if (!["IN", "OUT"].includes(type.toUpperCase())) {
      throw new AppError("Invalid punch type. Must be IN or OUT.", HTTP_STATUS.BAD_REQUEST);
    }

    if (!clubAttendanceState.has(clubId)) {
      clubAttendanceState.set(clubId, new Map());
    }

    const punchMap = clubAttendanceState.get(clubId);
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    punchMap.set(employeeId, {
      status: type.toUpperCase() === "IN" ? "On Duty" : "Clocked Out",
      type: type.toUpperCase(),
      timestamp: now.toISOString(),
      timeFormatted,
    });

    return {
      success: true,
      message: `Employee successfully clocked ${type.toUpperCase()} at ${timeFormatted}`,
      employeeId,
      status: type.toUpperCase() === "IN" ? "On Duty" : "Clocked Out",
      time: timeFormatted,
    };
  }

  /**
   * Update leave request decision (APPROVED or REJECTED)
   */
  static async updateLeaveStatus(clubId, leaveId, status, decisionNote = "") {
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status.toUpperCase())) {
      throw new AppError("Invalid leave status.", HTTP_STATUS.BAD_REQUEST);
    }

    const leaves = await this.getLeaves(clubId);
    const leaveIndex = leaves.findIndex((l) => String(l.id) === String(leaveId));

    if (leaveIndex === -1) {
      throw new AppError("Leave request not found.", HTTP_STATUS.NOT_FOUND);
    }

    leaves[leaveIndex].status = status.toUpperCase();
    leaves[leaveIndex].decisionNote = decisionNote;
    leaves[leaveIndex].decidedAt = new Date().toISOString();

    return leaves[leaveIndex];
  }

  /**
   * Create a new employee user in the club
   */
  static async createEmployee(clubId, data) {
    const { name, email, password, role = ROLES.RECEPTIONIST } = data;

    if (!name || !email) {
      throw new AppError("Name and email are required.", HTTP_STATUS.BAD_REQUEST);
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        clubId,
      },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists in this club.", HTTP_STATUS.CONFLICT);
    }

    const hashedPassword = await bcrypt.hash(password || "Staff@123", env.BCRYPT_ROUNDS);
    const userCount = await prisma.user.count({ where: { clubId } });
    const userId = `USR-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const newUser = await prisma.user.create({
      data: {
        userId,
        clubId,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: ROLES[role] ? role : ROLES.RECEPTIONIST,
        isActive: true,
      },
    });

    return newUser;
  }
}
