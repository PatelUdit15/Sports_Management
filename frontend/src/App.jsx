import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Onboarding from './pages/Onboarding'
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
    <Routes>
      {/* Auth */}
      <Route path="/login"      element={<Login />} />
      <Route path="/signup"     element={<Signup />} />
      <Route path="/onboarding" element={<Onboarding />} />

      {/* Dashboard shell */}
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard"      element={<Dashboard />} />
        <Route path="members"        element={<Members />} />
        <Route path="court-bookings" element={<CourtBookings />} />
        <Route path="shop"           element={<Shop />} />
        <Route path="cafe"           element={<Cafe />} />
        <Route path="staff"          element={<Staff />} />
        <Route path="finance"        element={<Finance />} />
        <Route path="enquiries"      element={<Enquiries />} />
        <Route path="clients"        element={<Clients />} />
        <Route path="reports"        element={<Reports />} />
        <Route path="settings"       element={<Settings />} />
        <Route path="*"              element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  )
}

export default App

