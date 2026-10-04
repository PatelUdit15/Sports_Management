import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import { ROLES } from './utils/rbac'

// Public & User Flow Pages
import SkylineLanding from './pages/public/SkylineLanding'
import PortalSelection from './pages/public/PortalSelection'
import UserLogin from './pages/public/UserLogin'
import UserRegister from './pages/public/UserRegister'
import ClubsDirectory from './pages/public/ClubsDirectory'
import PaymentGateway from './pages/public/PaymentGateway'
import MemberDashboard from './pages/MemberDashboard'

// Club Owner & Staff Management Pages
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'

// Dashboard & Operations
import DashboardLayout from './layouts/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import CourtBookings from './pages/CourtBookings'
import Shop from './pages/Shop'
import Cafe from './pages/Cafe'
import Staff from './pages/Staff'
import Finance from './pages/Finance'
import Enquiries from './pages/Enquiries'
import Clients from './pages/Clients'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* 1. Public Landing Page for Skyline Sports Club */}
        <Route path="/" element={<SkylineLanding />} />

        {/* 2. Portal Role Selection: User or Club Owner */}
        <Route path="/get-started" element={<PortalSelection />} />

        {/* 3. User / Member Auth & Registration Flow */}
        <Route path="/user/login" element={<UserLogin />} />
        <Route path="/user/register" element={<UserRegister />} />

        {/* 4. Connected Sports Clubs & Membership Plans Directory */}
        <Route path="/user/clubs" element={<ClubsDirectory />} />

        {/* 5. Payment Gateway & Member ID Generation */}
        <Route path="/payment" element={<PaymentGateway />} />
        
        {/* 6. Member Dashboard (Dedicated portal for club members) */}
        <Route path="/member/dashboard" element={<MemberDashboard />} />

        {/* 7. Club Owner & Staff Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* 8. Super Admin Dashboard (Exclusively for Super Admin) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
        </Route>

        {/* 9. Role-Protected Operational Modules */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* HR Management - Super Admin & HR Manager */}
          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.HR_MANAGER]}>
                <Staff />
              </ProtectedRoute>
            }
          />

          {/* Inventory Management - Super Admin & Inventory Manager */}
          <Route
            path="shop"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.SHOP_INVENTORY_MANAGER]}>
                <Shop />
              </ProtectedRoute>
            }
          />

          {/* Cafe Management - Super Admin & Cafe Staff */}
          <Route
            path="cafe"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.BAR_CAFETERIA_STAFF]}>
                <Cafe />
              </ProtectedRoute>
            }
          />

          {/* Finance Management - Super Admin & Finance Manager / Accountant */}
          <Route
            path="finance"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]}>
                <Finance />
              </ProtectedRoute>
            }
          />

          {/* Settings Section - Super Admin only */}
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Front Desk & Reception Operations */}
          <Route
            path="court-bookings"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.RECEPTIONIST]}>
                <CourtBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="members"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.RECEPTIONIST]}>
                <Members />
              </ProtectedRoute>
            }
          />
          <Route
            path="enquiries"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN, ROLES.RECEPTIONIST]}>
                <Enquiries />
              </ProtectedRoute>
            }
          />
          <Route
            path="clients"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
                <Reports />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
