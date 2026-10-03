import { useLocation } from 'react-router-dom'
import { Search, Bell, HelpCircle, Grid3x3, Plus } from 'lucide-react'

const tabs = [
  { label: 'Operations' },
  { label: 'Court Matrix' },
  { label: 'Daily Ledger' },
  { label: 'Audit Trail' },
]

const pageTitles = {
  '/dashboard':      'Dashboard',
  '/members':        'Members',
  '/court-bookings': 'Court Bookings',
  '/shop':           'Shop',
  '/cafe':           'Cafe/Bar',
  '/staff':          'Staff & HR',
  '/finance':        'Finance',
  '/enquiries':      'Enquiries',
  '/clients':        'Clients',
  '/reports':        'Reports',
  '/settings':       'Settings',
}

export default function Topbar() {
  const { pathname } = useLocation()
  const page = pageTitles[pathname] || 'Dashboard'

  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0 flex flex-col">

      {/* ── Top row ── */}
      <div className="flex items-center gap-3 px-6 pt-3 pb-2">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] flex-shrink-0">
          <span className="text-gray-400 font-medium">Skyline Sports</span>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-800">{page}</span>
        </div>

        {/* Search */}
        <div className="relative w-56 ml-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search members, bookings, co..."
            className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-gray-50 border border-gray-200 rounded-md outline-none
                       focus:border-[var(--color-primary)] focus:bg-white transition-all placeholder-gray-400"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right actions */}
        <div className="flex items-center gap-1.5">
          <button className="relative p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px]
                             font-bold rounded-full flex items-center justify-center leading-none">3</span>
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
            <HelpCircle size={16} />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
            <Grid3x3 size={16} />
          </button>

          <button className="btn btn-primary ml-1 gap-1.5 px-3.5 py-1.5 text-[12px]">
            <Plus size={14} />
            New Booking
          </button>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px]
                       font-bold ml-1 flex-shrink-0 select-none"
            style={{ background: 'var(--color-primary)' }}
          >
            MV
          </div>
        </div>
      </div>

      {/* ── Tab row ── */}
      <div className="flex items-end gap-0 px-6">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            className={[
              'px-4 py-2 text-[12px] font-medium border-b-2 transition-all whitespace-nowrap',
              i === 0
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  )
}
