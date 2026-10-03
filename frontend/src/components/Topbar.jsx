import { useLocation } from 'react-router-dom'
import { Search, Bell, Menu, ChevronRight } from 'lucide-react'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/members': 'Members',
  '/court-bookings': 'Court Bookings',
  '/shop': 'Shop & Inventory',
  '/cafe': 'Cafe / Bar',
  '/staff': 'Staff & HR',
  '/finance': 'Finance',
  '/enquiries': 'Enquiries',
  '/clients': 'Business Clients',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

export default function Topbar({ onMenuToggle }) {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <header className="h-14 bg-white border-b border-[var(--color-border)] flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          onClick={onMenuToggle}
          className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors lg:hidden"
        >
          <Menu size={18} />
        </button>
        <nav className="flex items-center gap-1 text-[13px]">
          <span className="text-[var(--color-text-muted)]">Home</span>
          <ChevronRight size={12} className="text-[var(--color-text-muted)]" />
          <span className="font-medium text-[var(--color-text)]">{pageTitle}</span>
        </nav>
      </div>

      {/* Right: Search, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search..."
            className="form-input pl-9 pr-4 py-1.5 w-56 text-[13px]"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] transition-colors">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--color-danger)] rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-2 pl-3 border-l border-[var(--color-border)]">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
            <span className="text-[var(--color-primary)] font-semibold text-xs">RP</span>
          </div>
          <div className="hidden sm:block">
            <div className="text-[13px] font-medium text-[var(--color-text)]">Ritesh Patel</div>
            <div className="text-[11px] text-[var(--color-text-muted)]">Club Admin</div>
          </div>
        </div>
      </div>
    </header>
  )
}
