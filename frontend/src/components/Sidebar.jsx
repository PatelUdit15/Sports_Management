import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, Trophy, ShoppingBag, Coffee,
  BadgeCheck, CreditCard, HelpCircle, Building2, BarChart2,
  Settings, ChevronRight, LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

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
  const navigate = useNavigate()
  const { user, club, logout, hasModule } = useAuth()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const isExecutiveOrHr = user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';

  // Filter navigation based on role and enabled modules
  let filteredNav;
  if (!isExecutiveOrHr) {
    const employeeItems = [
      { to: '/dashboard', label: 'My Dashboard', icon: LayoutDashboard },
      { to: '/staff', label: 'My Leaves & Wages', icon: BadgeCheck },
    ];

    if (user?.role === 'RECEPTIONIST') {
      if (hasModule('COURT_BOOKING')) employeeItems.push({ to: '/court-bookings', label: 'Court Bookings', icon: Trophy });
      if (hasModule('MEMBERSHIP')) employeeItems.push({ to: '/members', label: 'Members', icon: Users });
      employeeItems.push({ to: '/enquiries', label: 'Enquiries', icon: HelpCircle });
    } else if (user?.role === 'SHOP_INVENTORY_MANAGER') {
      employeeItems.push({ to: '/shop', label: 'Pro Shop & Inventory', icon: ShoppingBag });
    } else if (user?.role === 'BAR_CAFETERIA_STAFF') {
      if (hasModule('BAR')) employeeItems.push({ to: '/cafe', label: 'Cafe/Bar', icon: Coffee });
    } else if (user?.role === 'ACCOUNTANT') {
      if (hasModule('ACCOUNTING')) employeeItems.push({ to: '/finance', label: 'Finance', icon: CreditCard });
    }

    filteredNav = [{ items: employeeItems }];
  } else {
    filteredNav = nav.map(group => ({
      ...group,
      items: group.items.filter(item => {
        // Always show dashboard and settings
        if (item.to === '/dashboard' || item.to === '/settings') return true;
        
        // Check module access for other items
        if (item.to === '/members') return hasModule('MEMBERSHIP');
        if (item.to === '/court-bookings') return hasModule('COURT_BOOKING');
        if (item.to === '/shop') return hasModule('SHOP');
        if (item.to === '/cafe') return hasModule('BAR');
        if (item.to === '/staff') return hasModule('HR');
        if (item.to === '/finance') return hasModule('ACCOUNTING');
        if (item.to === '/enquiries') return user?.role === 'SUPER_ADMIN' || user?.role === 'RECEPTIONIST';
        
        // Default: show item
        return true;
      })
    })).filter(group => group.items.length > 0);
  }

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
          <div className="text-[13px] font-bold text-gray-900 leading-none truncate">
            {club?.name || 'Sports Club'}
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">Enterprise Operations</div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto py-3">
        {filteredNav.map((group, gi) => (
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
      <div className="border-t border-gray-100 p-3 space-y-2">
        <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                       text-white text-[11px] font-bold select-none"
            style={{ background: 'var(--color-primary)' }}
          >
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] font-semibold text-gray-900 truncate leading-tight">
              {user?.name || 'User'}
            </div>
            <div className="text-[10px] text-gray-400 truncate mt-0.5">
              {user?.role?.replace(/_/g, ' ') || 'Staff'}
            </div>
          </div>
          <ChevronRight size={13} className="text-gray-400 flex-shrink-0" />
        </div>
        
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 w-full p-2 rounded-lg hover:bg-red-50 text-gray-600 hover:text-red-600 transition-colors text-[12px] font-medium"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
