/**
 * Staff & HR Service
 * API client methods for staff roster, operating departments, leave approvals,
 * employee self-service leaves, wage payslips, and punch clock.
 */

import api from './api';

export const staffService = {
  /**
   * Get all employees for the active club
   */
  getEmployees: async () => {
    const response = await api.get('/staff/employees');
    return response.data;
  },

  /**
   * Get operating departments list
   */
  getDepartments: async () => {
    const response = await api.get('/staff/departments');
    return response.data;
  },

  /**
   * Get staff leave requests (HR view)
   */
  getLeaves: async () => {
    const response = await api.get('/staff/leaves');
    return response.data;
  },

  /**
   * Employee self-service: apply for leave
   */
  applyLeave: async (leaveData) => {
    const response = await api.post('/staff/leaves/apply', leaveData);
    return response.data;
  },

  /**
   * Employee self-service: get own leaves
   */
  getMyLeaves: async () => {
    const response = await api.get('/staff/my-leaves');
    return response.data;
  },

  /**
   * Clock in or out for an employee
   */
  punchAttendance: async (employeeId, type) => {
    const response = await api.post('/staff/attendance/punch', { employeeId, type });
    return response.data;
  },

  /**
   * Update leave request decision (APPROVED or REJECTED)
   */
  updateLeaveStatus: async (leaveId, status, note = '') => {
    const response = await api.patch(`/staff/leaves/${leaveId}/status`, { status, note });
    return response.data;
  },

  /**
   * Create a new staff member / employee with unique ID, credentials and wage
   */
  createEmployee: async (employeeData) => {
    const response = await api.post('/staff/employees', employeeData);
    return response.data;
  },

  /**
   * Get payslips (all for HR, or own for employee)
   */
  getPayslips: async (myOnly = false) => {
    const response = await api.get(`/staff/payslips${myOnly ? '?myOnly=true' : ''}`);
    return response.data;
  },

  /**
   * Get own payslips
   */
  getMyPayslips: async () => {
    const response = await api.get('/staff/my-payslips');
    return response.data;
  },

  /**
   * Generate an employee payslip
   */
  generatePayslip: async (data) => {
    const response = await api.post('/staff/payslips/generate', data);
    return response.data;
  },

  /**
   * Get current logged-in employee profile
   */
  getMyProfile: async () => {
    const response = await api.get('/staff/my-profile');
    return response.data;
  },
};

export default staffService;
