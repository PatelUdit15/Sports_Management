import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Users, Trophy, ShoppingBag, Coffee,
  BadgeCheck, CreditCard, HelpCircle, Building2, BarChart2,
  Settings, ChevronRight,
} from 'lucide-react'

const nav = [
  {
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/members',   label: 'Members',   icon: Users },
    ],
  },
  {
    items: [
      { to: '/court-bookings', label: 'Court Bookings', icon: Trophy },
      { to: '/shop',           label: 'Shop',           icon: ShoppingBag },
      { to: '/cafe',           label: 'Cafe/Bar',       icon: Coffee },
    ],
  },
  {
    items: [
      { to: '/staff',   label: 'Staff & HR', icon: BadgeCheck },
      { to: '/finance', label: 'Finance',    icon: CreditCard },
    ],
  },
  {
    items: [
      { to: '/enquiries', label: 'Enquiries', icon: HelpCircle },
      { to: '/clients',   label: 'Clients',   icon: Building2 },
      { to: '/reports',   label: 'Reports',   icon: BarChart2 },
    ],
  },
  {
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside
      className="flex flex-col bg-white border-r border-gray-200 flex-shrink-0 h-screen"
      style={{ width: 'var(--sidebar-width, 200px)' }}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-primary)' }}
        >
          <Trophy size={15} color="#fff" strokeWidth={2.2} />
        </div>
        <div className="leading-tight min-w-0">
          <div className="text-[13px] font-bold text-gray-900 leading-none truncate">Skyline Sports Club</div>
          <div className="text-[10px] text-gray-400 mt-0.5">Enterprise Operations</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3">
        {nav.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-1 pt-1 border-t border-gray-100' : ''}>
            {group.items.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || (to !== '/dashboard' && pathname.startsWith(to))
              return (
                <NavLink
                  key={to}
                  to={to}
                  title={label}
                  className={[
                    'flex items-center gap-2.5 mx-2 px-3 py-2.5 rounded-lg text-[13px] font-medium',
                    'transition-all duration-150 leading-none',
                    active
                      ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                  ].join(' ')}
                >
                  <Icon
                    size={16}
                    strokeWidth={active ? 2.2 : 1.75}
                    className={active ? 'text-[var(--color-primary)] flex-shrink-0' : 'text-gray-400 flex-shrink-0'}
                  />
                  <span className="truncate">{label}</span>
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      {/* ── User profile ── */}
      <div className="border-t border-gray-100 px-3 py-3">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                       text-white text-[11px] font-bold select-none"
            style={{ background: 'var(--color-primary)' }}
          >
            MV
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-gray-900 truncate leading-tight">Marcus Vance</div>
            <div className="text-[10px] text-gray-400 truncate mt-0.5">Ops Director</div>
          </div>
          <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </aside>
  )
}
