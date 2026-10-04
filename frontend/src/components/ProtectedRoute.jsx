/**
 * Protected Route Component
 * Enforces authentication and Role-Based Access Control (RBAC)
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleHomeRoute, ROLES } from '../utils/rbac';

export default function ProtectedRoute({ children, allowedRoles = null }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    // Show loading spinner while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6FA]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[13px] font-medium text-gray-500">Checking permissions…</p>
        </div>
      </div>
    );
  }

  // Check if member session exists vs staff user session
  const storedUser = user || JSON.parse(localStorage.getItem('user') || 'null');
  const storedMember = JSON.parse(localStorage.getItem('currentMember') || 'null');
  const token = localStorage.getItem('token') || localStorage.getItem('member_token');

  // If completely unauthenticated
  if (!isAuthenticated && !storedUser && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a member tries to access staff/admin routes
  if (storedMember && !storedUser && location.pathname !== '/member/dashboard') {
    return <Navigate to="/member/dashboard" replace />;
  }

  // Check role-based authorization if allowedRoles are specified
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = storedUser?.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      // User is authenticated but does not possess the required role.
      // Redirect to their designated home route.
      const redirectTarget = getRoleHomeRoute(userRole);
      return <Navigate to={redirectTarget} replace />;
    }
  }

  return children;
}
