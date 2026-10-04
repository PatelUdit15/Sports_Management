/**
 * Role-Based Access Control (RBAC) Constants & Route Definitions
 */

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  HR_MANAGER: 'HR_MANAGER',
  SHOP_INVENTORY_MANAGER: 'SHOP_INVENTORY_MANAGER',
  BAR_CAFETERIA_STAFF: 'BAR_CAFETERIA_STAFF',
  ACCOUNTANT: 'ACCOUNTANT',
  RECEPTIONIST: 'RECEPTIONIST',
  MEMBER: 'MEMBER',
};

export const ROLE_DISPLAY_NAMES = {
  SUPER_ADMIN: 'Super Admin',
  HR_MANAGER: 'HR Manager',
  SHOP_INVENTORY_MANAGER: 'Inventory Manager',
  BAR_CAFETERIA_STAFF: 'Cafe Management',
  ACCOUNTANT: 'Finance Manager',
  RECEPTIONIST: 'Receptionist',
  MEMBER: 'Club Member',
};

// Default Landing / Home Page per Role
export const ROLE_HOME_ROUTES = {
  SUPER_ADMIN: '/dashboard',
  HR_MANAGER: '/staff',
  SHOP_INVENTORY_MANAGER: '/shop',
  BAR_CAFETERIA_STAFF: '/cafe',
  ACCOUNTANT: '/finance',
  RECEPTIONIST: '/court-bookings',
  MEMBER: '/member/dashboard',
};

// Authorized routes per role
export const ROLE_ALLOWED_ROUTES = {
  SUPER_ADMIN: ['/dashboard', '/staff', '/shop', '/cafe', '/settings'],
  HR_MANAGER: ['/staff'],
  SHOP_INVENTORY_MANAGER: ['/shop'],
  BAR_CAFETERIA_STAFF: ['/cafe'],
  ACCOUNTANT: ['/finance'],
  RECEPTIONIST: ['/court-bookings', '/members', '/enquiries'],
  MEMBER: ['/member/dashboard'],
};

/**
 * Check if a role is permitted to access a given path
 */
export const isRouteAllowedForRole = (role, path) => {
  if (!role) return false;
  const allowed = ROLE_ALLOWED_ROUTES[role] || [];
  return allowed.some((r) => path === r || path.startsWith(`${r}/`));
};

/**
 * Get role landing route with fallback
 */
export const getRoleHomeRoute = (role) => {
  return ROLE_HOME_ROUTES[role] || '/dashboard';
};
