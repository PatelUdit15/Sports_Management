import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, CalendarDays, ShoppingBag,
  Coffee, UserCog, DollarSign, MessageSquare, Building2,
  BarChart3, Settings as SettingsIcon, ChevronLeft, ChevronRight
} from 'lucide-react'

const navGroups = [
  {
    label: 'Main',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/members', icon: Users, label: 'Members' },
      { to: '/court-bookings', icon: CalendarDays, label: 'Court Bookings' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { to: '/shop', icon: ShoppingBag, label: 'Shop & Inventory' },
      { to: '/cafe', icon: Coffee, label: 'Cafe / Bar' },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/staff', icon: UserCog, label: 'Staff & HR' },
      { to: '/finance', icon: DollarSign, label: 'Finance' },
      { to: '/enquiries', icon: MessageSquare, label: 'Enquiries' },
      { to: '/clients', icon: Building2, label: 'Business Clients' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { to: '/reports', icon: BarChart3, label: 'Reports' },
      { to: '/settings', icon: SettingsIcon, label: 'Settings' },
    ],
  },
]

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()

  return (
    <aside
      className="flex flex-col border-r border-[var(--color-border)] bg-white transition-all duration-200 ease-in-out"
      style={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
    >
      {/* Logo */}
      <div className="flex items-center h-14 px-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-8 h-8 rounded bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          {!collapsed && (
            <span className="text-[15px] font-semibold text-[var(--color-text)] whitespace-nowrap">
              Skyline Sports
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            {!collapsed && (
              <div className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = location.pathname === item.to
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-[13px] font-medium transition-colors mb-0.5 ${
                    isActive
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border-l-[3px] border-[var(--color-primary)]'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] hover:text-[var(--color-text)]'
                  }`}
                >
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Collapse Toggle */}
      <div className="border-t border-[var(--color-border)] p-2">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center py-2 rounded text-[var(--color-text-muted)] hover:bg-[var(--color-bg)] transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  )
}
