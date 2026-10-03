import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

// Public & User Flow Pages
import SkylineLanding from './pages/public/SkylineLanding'
import PortalSelection from './pages/public/PortalSelection'
import UserLogin from './pages/public/UserLogin'
import UserRegister from './pages/public/UserRegister'
import ClubsDirectory from './pages/public/ClubsDirectory'
import PaymentGateway from './pages/public/PaymentGateway'

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

        {/* 6. Club Owner & Staff Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/onboarding" element={<Onboarding />} />

        {/* 7. Protected Club Owner / Staff Operations */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
        </Route>

        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="members" element={<Members />} />
          <Route path="court-bookings" element={<CourtBookings />} />
          <Route path="shop" element={<Shop />} />
          <Route path="cafe" element={<Cafe />} />
          <Route path="staff" element={<Staff />} />
          <Route path="finance" element={<Finance />} />
          <Route path="enquiries" element={<Enquiries />} />
          <Route path="clients" element={<Clients />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
