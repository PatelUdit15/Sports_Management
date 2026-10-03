import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell, HelpCircle, Grid3x3, Plus, AlertTriangle, Check, PackageX, ExternalLink } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { productService } from '../services/productService'

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
  const navigate = useNavigate()
  const { user, club } = useAuth()
  const page = pageTitles[pathname] || 'Dashboard'

  const [notifications, setNotifications] = useState([])
  const [showNotifMenu, setShowNotifMenu] = useState(false)
  const notifRef = useRef(null)

  const fetchNotifications = async () => {
    try {
      const res = await productService.getNotifications(false);
      if (res && res.success && res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch {
      // Quiet fail if not authenticated yet or backend unavailable
    }
  }

  useEffect(() => {
    fetchNotifications();

    const handleInventoryUpdated = () => {
      fetchNotifications();
    };

    window.addEventListener('inventory-updated', handleInventoryUpdated);
    const interval = setInterval(fetchNotifications, 60000); // 1 min sync

    return () => {
      window.removeEventListener('inventory-updated', handleInventoryUpdated);
      clearInterval(interval);
    };
  }, []);

  // Close notifications menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifMenu(false);
      }
    };
    if (showNotifMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifMenu]);

  const handleDismissNotif = async (e, notifId) => {
    e.stopPropagation();
    try {
      await productService.markNotificationRead(notifId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notifId || n.notificationId === notifId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadNotifs = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadNotifs.length;

  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0 flex flex-col relative z-30">

      {/* ── Top row ── */}
      <div className="flex items-center gap-3 px-6 pt-3 pb-2">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[12px] flex-shrink-0">
          <span className="text-gray-400 font-medium">{club?.name || 'Skyline Sports'}</span>
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
          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu((prev) => !prev)}
              aria-label="Notifications"
              className={`relative p-2 rounded-md transition-colors ${
                showNotifMenu ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-3.5 h-3.5 bg-red-500 text-white text-[8px]
                                 font-bold rounded-full flex items-center justify-center leading-none animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown Popover */}
            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-84 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-50 animate-fade-in text-gray-800">
                <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-gray-900">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                        {unreadCount} low stock
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">Product Manager</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                        <Check size={18} />
                      </div>
                      <p className="text-xs font-semibold text-gray-700">All Stock Levels Healthy</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">No active low inventory notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => {
                      const id = notif.id || notif.notificationId;
                      return (
                        <div
                          key={id}
                          className={`p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                            notif.isRead ? 'opacity-60 bg-gray-50/50' : 'bg-amber-50/30'
                          }`}
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertTriangle size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-semibold text-gray-900 truncate">
                                {notif.productName || 'Low Stock Alert'}
                              </p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                {notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                              {notif.message}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setShowNotifMenu(false);
                                  navigate('/shop');
                                }}
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--color-primary)] hover:underline"
                              >
                                View in Shop <ExternalLink size={10} />
                              </button>
                              {!notif.isRead && (
                                <button
                                  onClick={(e) => handleDismissNotif(e, id)}
                                  className="text-[10px] text-gray-500 hover:text-gray-800 font-medium px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 transition-colors ml-auto"
                                >
                                  Dismiss
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/80 flex items-center justify-between">
                  <button
                    onClick={() => {
                      setShowNotifMenu(false);
                      navigate('/shop');
                    }}
                    className="text-[11px] font-semibold text-gray-700 hover:text-[var(--color-primary)] transition-colors"
                  >
                    Open Shop Inventory
                  </button>
                  <button
                    onClick={() => fetchNotifications()}
                    className="text-[10px] text-gray-500 hover:text-gray-700"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            )}
          </div>

          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
            <HelpCircle size={16} />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 text-gray-500 transition-colors">
            <Grid3x3 size={16} />
          </button>

          <button
            onClick={() => navigate('/court-bookings')}
            className="btn btn-primary ml-1 gap-1.5 px-3.5 py-1.5 text-[12px]"
          >
            <Plus size={14} />
            New Booking
          </button>

          {/* Avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px]
                       font-bold ml-1 flex-shrink-0 select-none"
            style={{ background: 'var(--color-primary)' }}
            title={user?.name}
          >
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'}
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
