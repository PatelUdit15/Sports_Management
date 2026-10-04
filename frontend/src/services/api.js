/**
 * Axios Instance Configuration
 * Centralized API client with interceptors and module helpers
 */

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Request interceptor - Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('member_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      const { status } = error.response;
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/signup') ||
        error.config?.url?.includes('/auth/me') ||
        error.config?.url?.includes('/public/');
      const isPublicOrAuthPage =
        typeof window !== 'undefined' &&
        (window.location.pathname === '/' ||
         window.location.pathname === '/get-started' ||
         window.location.pathname.startsWith('/user/') ||
         window.location.pathname === '/payment' ||
         window.location.pathname.startsWith('/member/') ||
         window.location.pathname === '/login' ||
         window.location.pathname === '/signup' ||
         window.location.pathname === '/onboarding');

      if (status === 401 && !isAuthEndpoint && !isPublicOrAuthPage) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('club');
        localStorage.removeItem('enabledModules');
        window.location.href = '/login';
      }

      // Return the error response for handling in components
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response received
      const targetUrl = (error.config?.baseURL || '') + (error.config?.url || '');
      console.warn('Network error targeting:', targetUrl, error);
      return Promise.reject({
        success: false,
        message: `Network error. Could not connect to API server at ${targetUrl || 'http://localhost:5000/api'}. Please ensure the backend is running.`,
        error: 'NETWORK_ERROR',
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        message: error.message || 'An unexpected error occurred.',
        error: 'UNKNOWN_ERROR',
      });
    }
  }
);

// Attach helper methods directly to api instance for seamless component integration
api.getDashboard = async () => {
  const res = await api.get('/dashboard');
  return res.data;
};

api.getEmployees = async () => {
  const res = await api.get('/staff/employees');
  return res.data;
};

api.getDepartments = async () => {
  const res = await api.get('/staff/departments');
  return res.data;
};

api.getLeaves = async () => {
  const res = await api.get('/staff/leaves');
  return res.data;
};

api.punchAttendance = async (employeeId, type) => {
  const res = await api.post('/staff/attendance/punch', { employeeId, type });
  return res.data;
};

api.updateLeaveStatus = async (leaveId, status, note = '') => {
  const res = await api.patch(`/staff/leaves/${leaveId}/status`, { status, note });
  return res.data;
};

api.createEmployee = async (employeeData) => {
  const res = await api.post('/staff/employees', employeeData);
  return res.data;
};

// Enquiry CRM endpoints
api.getEnquiries = async (params) => {
  const res = await api.get('/enquiries', { params });
  return res.data;
};

api.createEnquiry = async (enquiryData) => {
  const res = await api.post('/enquiries', enquiryData);
  return res.data;
};

api.updateEnquiryStatus = async (id, status, notes) => {
  const res = await api.patch(`/enquiries/${id}/status`, { status, notes });
  return res.data;
};

api.deleteEnquiry = async (id) => {
  const res = await api.delete(`/enquiries/${id}`);
  return res.data;
};

// Court Management endpoints
api.getCourts = async (params) => {
  const res = await api.get('/courts', { params });
  return res.data;
};

api.getCourt = async (id) => {
  const res = await api.get(`/courts/${id}`);
  return res.data;
};

api.createCourt = async (courtData) => {
  const res = await api.post('/courts', courtData);
  return res.data;
};

api.updateCourt = async (id, courtData) => {
  const res = await api.put(`/courts/${id}`, courtData);
  return res.data;
};

api.deleteCourt = async (id) => {
  const res = await api.delete(`/courts/${id}`);
  return res.data;
};

api.getCourtOccupancy = async () => {
  const res = await api.get('/courts/occupancy/utilization');
  return res.data;
};

// Booking & Reservation endpoints
api.getBookings = async (params) => {
  const res = await api.get('/bookings', { params });
  return res.data;
};

api.createBooking = async (bookingData) => {
  const res = await api.post('/bookings', bookingData);
  return res.data;
};

api.updateBookingStatus = async (id, status) => {
  const res = await api.patch(`/bookings/${id}/status`, { status });
  return res.data;
};

api.deleteBooking = async (id) => {
  const res = await api.delete(`/bookings/${id}`);
  return res.data;
};

api.getDailyLedger = async (params) => {
  const res = await api.get('/bookings/daily-ledger', { params });
  return res.data;
};

// Audit Trail endpoints
api.getAuditLogs = async (params) => {
  const res = await api.get('/audit-trail', { params });
  return res.data;
};

// Finance & Accounts endpoints
api.getFinanceSummary = async (params) => {
  const res = await api.get('/finance/summary', { params });
  return res.data;
};

api.getFinanceTransactions = async (params) => {
  const res = await api.get('/finance/transactions', { params });
  return res.data;
};

api.createFinanceTransaction = async (data) => {
  const res = await api.post('/finance/transactions', data);
  return res.data;
};

api.updateFinanceTransactionStatus = async (id, status) => {
  const res = await api.patch(`/finance/transactions/${id}/status`, { status });
  return res.data;
};

api.deleteFinanceTransaction = async (id) => {
  const res = await api.delete(`/finance/transactions/${id}`);
  return res.data;
};

api.getFinanceInvoices = async (params) => {
  const res = await api.get('/finance/invoices', { params });
  return res.data;
};

api.createFinanceInvoice = async (data) => {
  const res = await api.post('/finance/invoices', data);
  return res.data;
};

api.updateFinanceInvoiceStatus = async (id, status, paymentMethod) => {
  const res = await api.patch(`/finance/invoices/${id}/status`, { status, paymentMethod });
  return res.data;
};

api.deleteFinanceInvoice = async (id) => {
  const res = await api.delete(`/finance/invoices/${id}`);
  return res.data;
};

// Member Dashboard endpoints
export const getMemberProfile = async () => {
  const res = await api.get('/member-dashboard/me');
  return res.data;
};

export const getCourtMatrix = async (date) => {
  const res = await api.get('/member-dashboard/courts/matrix', {
    params: date ? { date } : {}
  });
  return res.data;
};

export const memberBookCourt = async (bookingData) => {
  const res = await api.post('/member-dashboard/courts/book', bookingData);
  return res.data;
};

api.getMemberProfile = getMemberProfile;
api.getCourtMatrix = getCourtMatrix;
api.memberBookCourt = memberBookCourt;

export { api };
export default api;


