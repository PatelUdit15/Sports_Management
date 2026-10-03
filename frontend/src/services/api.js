/**
 * Axios Instance Configuration
 * Centralized API client with interceptors
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
    const token = localStorage.getItem('token');
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

      if (status === 401) {
        // Unauthorized - clear auth and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Return the error response for handling in components
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        success: false,
        message: 'Network error. Please check your connection.',
        error: 'NETWORK_ERROR',
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        message: 'An unexpected error occurred.',
        error: 'UNKNOWN_ERROR',
      });
    }
  }
);

export default api;
