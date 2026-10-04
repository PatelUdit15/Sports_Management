import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Trophy, ShoppingBag, Coffee,
  BadgeCheck, CreditCard, HelpCircle,
  Settings, ChevronRight, LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { ROLE_DISPLAY_NAMES } from '../utils/rbac'

export default function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, club, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const role = user?.role || 'SUPER_ADMIN'

  // Build role-specific navigation according to exact RBAC rules
  const getNavItems = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { to: '/dashboard', label: 'Super Admin Dashboard', icon: LayoutDashboard },
          { to: '/staff',     label: 'HR Management',        icon: BadgeCheck },
          { to: '/shop',      label: 'Inventory Management', icon: ShoppingBag },
          { to: '/cafe',      label: 'Cafe Management',      icon: Coffee },
          { to: '/settings',  label: 'Settings',             icon: Settings },
        ]

      case 'HR_MANAGER':
        return [
          { to: '/staff', label: 'HR & Staff Management', icon: BadgeCheck },
        ]

      case 'SHOP_INVENTORY_MANAGER':
        return [
          { to: '/shop', label: 'Inventory Management', icon: ShoppingBag },
        ]

      case 'BAR_CAFETERIA_STAFF':
        return [
          { to: '/cafe', label: 'Cafe Management', icon: Coffee },
        ]

      case 'ACCOUNTANT':
        return [
          { to: '/finance', label: 'Finance Management', icon: CreditCard },
        ]

      case 'RECEPTIONIST':
        return [
          { to: '/court-bookings', label: 'Court Bookings', icon: Trophy },
          { to: '/members',        label: 'Members',        icon: Users },
          { to: '/enquiries',      label: 'Enquiries',      icon: HelpCircle },
        ]

      default:
        return [
          { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        ]
    }
  }

  const navItems = getNavItems()
  const roleDisplay = ROLE_DISPLAY_NAMES[role] || role.replace(/_/g, ' ')

  return (
    <aside
      className="flex flex-col bg-white border-r border-gray-200 flex-shrink-0 h-screen select-none"
      style={{ width: 'var(--sidebar-width, 220px)' }}
    >
      {/* ── Logo & Brand ── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs"
          style={{ background: 'var(--color-primary)' }}
        >
          <Trophy size={16} color="#fff" strokeWidth={2.2} />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-[13px] font-bold text-gray-900 leading-none truncate">
            {club?.name || 'Skyline Sports Club'}
          </div>
          <div className="text-[10px] text-gray-400 mt-1 font-medium truncate">
            Enterprise Portal
          </div>
        </div>
      </div>

      {/* ── Role Banner ── */}
      <div className="mx-3 mt-3 px-3 py-1.5 rounded-lg bg-[#f8f3f7] border border-[#714B67]/15 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-wider font-bold text-[#714B67]">
          {roleDisplay}
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
          return (
            <NavLink
              key={to}
              to={to}
              title={label}
              className={[
                'flex items-center gap-2.5 mx-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium',
                'transition-all duration-150 leading-none',
                active
                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-bold shadow-xs'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              ].join(' ')}
            >
              <Icon
                size={16}
                strokeWidth={active ? 2.4 : 1.75}
                className={active ? 'text-[var(--color-primary)] flex-shrink-0' : 'text-gray-400 flex-shrink-0'}
              />
              <span className="truncate">{label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* ── User profile & Logout ── */}
      <div className="border-t border-gray-100 p-3 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gray-50/70 border border-gray-100">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-[11px] font-bold select-none shadow-xs"
            style={{ background: 'var(--color-primary)' }}
          >
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-bold text-gray-900 truncate leading-tight">
              {user?.name || 'Operations Lead'}
            </div>
            <div className="text-[10px] text-gray-500 truncate mt-0.5">
              {roleDisplay}
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl border border-gray-200 hover:bg-red-50 text-gray-600 hover:text-red-600 hover:border-red-200 transition-colors text-[12px] font-medium"
        >
          <LogOut size={13} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
