/**
 * Staff & HR Service
 * API client methods for staff roster, operating departments, leave approvals, and punch clock
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
   * Get staff leave requests
   */
  getLeaves: async () => {
    const response = await api.get('/staff/leaves');
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
   * Create a new staff member / employee
   */
  createEmployee: async (employeeData) => {
    const response = await api.post('/staff/employees', employeeData);
    return response.data;
  },
};

export default staffService;
