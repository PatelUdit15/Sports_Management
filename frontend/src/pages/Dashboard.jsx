import { Link } from 'react-router-dom'
import {
  TrendingUp, TrendingDown, Users, Trophy, IndianRupee, HelpCircle,
  MoreVertical, ChevronRight, ArrowRight, UserPlus, Printer, Pencil,
  Download, Calendar, Search, Plus,
} from 'lucide-react'

/* ── KPI data ─────────────────────────────────────────────── */
const kpis = [
  { label: 'TOTAL MEMBERS',   value: '1,247',      badge: '+12% vs last month', badgeUp: true,  sub: '48 new registrations this week',            icon: Users,       iconBg: '#f3eeff', iconColor: '#6b3fa0', accent: '#6b3fa0' },
  { label: 'ACTIVE BOOKINGS', value: '89',          badge: '+5% vs yesterday',  badgeUp: true,  sub: '92% court occupancy recorded',              icon: Trophy,      iconBg: '#e0f7f6', iconColor: '#00897b', accent: '#00897b' },
  { label: 'REVENUE',         value: '₹4,52,300',  badge: '+8% vs last month', badgeUp: true,  sub: 'Ledger cleared • 0 pending settlements',    icon: IndianRupee, iconBg: '#dcfce7', iconColor: '#16a34a', accent: '#16a34a' },
  { label: 'ENQUIRIES',       value: '23',          badge: '-3% open',          badgeUp: false, sub: '4 urgent VIP trial requests pending',       icon: HelpCircle,  iconBg: '#fef9c3', iconColor: '#ca8a04', accent: '#f59e0b' },
]

/* ── Revenue sparkline (30 days) ──────────────────────────── */
const sparkPoints = [8,9,10,10,12,13,14,14,15,17,18,20,21,22,24,26,28,30,34,38,42,47,50,55,58,62,65,70,75,82]

function buildPath(pts, W, H, pad = 8) {
  const max = Math.max(...pts), min = Math.min(...pts), range = max - min || 1
  const coords = pts.map((v, i) => [
    pad + (i / (pts.length - 1)) * (W - pad * 2),
    pad + (1 - (v - min) / range) * (H - pad * 2),
  ])
  const line = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `${line} L${(W - pad).toFixed(1)},${(H - pad).toFixed(1)} L${pad},${(H - pad).toFixed(1)} Z`
  return { line, area, coords }
}

/* ── Recent members ────────────────────────────────────────── */
const recentMembers = [
  { initials: 'AK', name: 'Aarav Kapoor', when: 'Today, 10:30 AM', plan: 'VIP GOLD',       planStyle: { bg: '#fef3c7', color: '#92400e' }, avatarBg: '#6b3fa0' },
  { initials: 'PS', name: 'Priya Sharma', when: 'Yesterday',       plan: 'ANNUAL PRO',     planStyle: { bg: '#dcfce7', color: '#15803d' }, avatarBg: '#059669' },
  { initials: 'RN', name: 'Rohan Nair',   when: 'Oct 22',          plan: 'REGULAR TENNIS', planStyle: { bg: '#dbeafe', color: '#1e40af' }, avatarBg: '#3b82f6' },
  { initials: 'TM', name: 'Tanvi Mehta',  when: 'Oct 21',          plan: 'SQUASH PASS',    planStyle: { bg: '#fce7f3', color: '#9d174d' }, avatarBg: '#ec4899' },
]

/* ── Bookings table ────────────────────────────────────────── */
const bookings = [
  { id: '#BK-9481', member: 'Karan Singhania', verified: true,  facility: 'Court 1 - Indoor Tennis', dot: '#16a34a', slot: '08:00 – 09:30 AM', fee: '₹1,200', status: 'Confirmed',       ss: { bg: '#dcfce7', color: '#15803d' } },
  { id: '#BK-9482', member: 'Ananya Sen',       verified: false, facility: 'Court 4 - Squash',        dot: '#3b82f6', slot: '10:00 – 11:30 AM', fee: '₹800',   status: 'In Progress',    ss: { bg: '#dbeafe', color: '#1e40af' } },
  { id: '#BK-9483', member: 'Vikram Joshi',     verified: false, facility: 'Court 2 - Padel Beta',    dot: '#6b7280', slot: '06:30 – 08:00 AM', fee: '₹1,500', status: 'Completed',      ss: { bg: '#f3f4f6', color: '#374151' } },
  { id: '#BK-9484', member: 'Devika Pillai',    verified: false, facility: 'Court 3 - Badminton',     dot: '#f59e0b', slot: '11:45 – 01:15 PM', fee: '₹750',   status: 'Pending Payment',ss: { bg: '#fef3c7', color: '#92400e' } },
  { id: '#BK-9485', member: 'Sameer Varma',     verified: false, facility: 'Court 5 - Clay Tennis',   dot: '#16a34a', slot: '02:00 – 03:30 PM', fee: '₹1,000', status: 'Confirmed',      ss: { bg: '#dcfce7', color: '#15803d' } },
]

const W = 460, H = 160

export default function Dashboard() {
  const { line, area, coords } = buildPath(sparkPoints, W, H)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">
            Executive Operations
          </h1>
          <p className="text-[13px] text-gray-500 mt-1.5">
            Real-time status for facilities, court occupancy, financial intake, and member throughput.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
          <button className="btn btn-secondary text-[12px] px-4 py-2">Live Matrix</button>
          <button className="btn btn-secondary text-[12px] px-4 py-2">Daily Audit</button>
          <button className="btn btn-secondary text-[12px] px-4 py-2">Facility Map</button>
          <button className="btn btn-ghost p-2 text-gray-400"><Download size={16} /></button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {kpis.map((k) => {
          const Icon = k.icon
          return (
            <div
              key={k.label}
              className="card flex flex-col gap-3 p-5"
              style={{ borderTop: `3px solid ${k.accent}` }}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-tight">
                  {k.label}
                </span>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: k.iconBg }}
                >
                  <Icon size={17} style={{ color: k.iconColor }} strokeWidth={2} />
                </div>
              </div>

              <div className="text-[28px] font-bold text-gray-900 leading-none tracking-tight">
                {k.value}
              </div>

              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded self-start"
                style={k.badgeUp
                  ? { background: '#dcfce7', color: '#15803d' }
                  : { background: '#fee2e2', color: '#dc2626' }}
              >
                {k.badgeUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                {k.badge}
              </span>

              <p className="text-[11px] text-gray-500 leading-relaxed">{k.sub}</p>
            </div>
          )
        })}
      </div>

      {/* ── Revenue + Recent Members ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* Revenue chart — spans 2 cols */}
        <div className="card xl:col-span-2 flex flex-col">

          {/* Card header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Revenue Trend</h2>
              <p className="text-[12px] text-gray-500 mt-1">
                30-day cumulative operational intake across facilities and pro-shop
              </p>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button className="btn btn-secondary text-[11px] px-3 py-1.5 gap-1">
                Last 30 Days <ChevronRight size={12} className="rotate-90" />
              </button>
              <button className="btn btn-ghost p-1.5 text-gray-400">
                <MoreVertical size={15} />
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 px-6 py-4 border-b border-gray-100">
            {[
              { label: 'Peak Day Intake',   value: '₹24,800', note: '(Oct 18)' },
              { label: 'Daily Average',     value: '₹15,076', note: '/ day' },
              { label: 'Subscription MRR', value: '₹3,12,000', note: '' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  {s.label}
                </div>
                <div className="text-[14px] font-bold text-gray-900">
                  {s.value}{' '}
                  {s.note && <span className="text-[11px] font-normal text-gray-500">{s.note}</span>}
                </div>
              </div>
            ))}
          </div>

          {/* SVG chart */}
          <div className="px-6 pt-4 pb-2">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 160 }} preserveAspectRatio="none">
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#6b3fa0" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#6b3fa0" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              <path d={area} fill="url(#revGrad)" />
              <path d={line} fill="none" stroke="#6b3fa0" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {coords.map(([x, y], i) => {
                const show = i % 5 === 0 || i === coords.length - 1
                if (!show) return null
                const isLast = i === coords.length - 1
                return (
                  <g key={i}>
                    {isLast && <circle cx={x} cy={y} r="6" fill="#6b3fa0" opacity="0.15" />}
                    <circle cx={x} cy={y} r={isLast ? 4 : 3} fill="#fff" stroke="#6b3fa0" strokeWidth={isLast ? 2 : 1.5} />
                  </g>
                )
              })}
            </svg>
          </div>

          {/* X-axis labels */}
          <div className="flex justify-between px-6 pb-4 text-[11px] text-gray-400">
            {['Sep 25', 'Oct 01', 'Oct 07', 'Oct 13', 'Oct 19', 'Today (Oct 24)'].map((l) => (
              <span key={l} className={l.startsWith('Today') ? 'font-semibold text-gray-600' : ''}>{l}</span>
            ))}
          </div>

          {/* Card footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-[12px] text-gray-500">
              Projection: Trending{' '}
              <span className="font-semibold text-emerald-600">+14.2% higher</span> than Q3 target
            </p>
            <Link to="/finance" className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--color-primary)] hover:underline">
              Detailed Ledger Breakdown <ChevronRight size={13} />
            </Link>
          </div>
        </div>

        {/* Recent Members — 1 col */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">Recent Members</h2>
              <p className="text-[12px] text-gray-500 mt-1">Newly issued active club access passes</p>
            </div>
            <Link to="/members" className="text-[12px] font-semibold text-[var(--color-primary)] hover:underline whitespace-nowrap ml-3">
              View All
            </Link>
          </div>

          <div className="flex-1 px-4 py-2">
            {recentMembers.map((m, idx) => (
              <div
                key={m.name}
                className={`flex items-center gap-3 py-3 ${idx < recentMembers.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0"
                  style={{ background: m.avatarBg }}
                >
                  {m.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-gray-900 truncate leading-tight">{m.name}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{m.when}</div>
                </div>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0"
                  style={{ background: m.planStyle.bg, color: m.planStyle.color }}
                >
                  {m.plan}
                </span>
                <ArrowRight size={13} className="text-gray-400 flex-shrink-0" />
              </div>
            ))}
          </div>

          <div className="px-4 pt-3 pb-5 border-t border-gray-100">
            <button className="btn btn-secondary w-full justify-center text-[12px] gap-2 py-2.5">
              <UserPlus size={14} />
              Register New Member
            </button>
          </div>
        </div>
      </div>

      {/* ── Today's Bookings ── */}
      <div className="card">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-bold text-gray-900">Today's Bookings</h2>
              <span className="badge badge-gray">5 Active Slots Shown</span>
            </div>
            <p className="text-[12px] text-gray-500 mt-1">
              Real-time scheduling grid with automatic payment verification
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="btn btn-secondary text-[12px] px-3 py-1.5 gap-2">
              <Calendar size={13} />
              Today - Oct 24, 2025
              <ChevronRight size={12} className="rotate-90" />
            </button>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter by court or player..."
                className="pl-7 pr-3 py-1.5 text-[12px] bg-gray-50 border border-gray-200 rounded-md
                           outline-none focus:border-[var(--color-primary)] w-44 transition-all"
              />
            </div>
            <button className="btn btn-primary text-[12px] px-3.5 py-1.5 gap-1.5">
              <Plus size={14} /> New Booking
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Member Name</th>
                <th>Sport / Facility</th>
                <th>Time Slot</th>
                <th>Payment / Fee</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id}>
                  <td className="font-mono text-[12px] text-gray-500 whitespace-nowrap">{b.id}</td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900">{b.member}</span>
                      {b.verified && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z"
                            stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.dot }} />
                      <span className="text-gray-700">{b.facility}</span>
                    </div>
                  </td>
                  <td className="font-mono text-[12px] text-gray-600 whitespace-nowrap">{b.slot}</td>
                  <td className="font-semibold text-gray-900 whitespace-nowrap">{b.fee}</td>
                  <td className="whitespace-nowrap">
                    <span
                      className="inline-flex items-center px-2.5 py-1 rounded text-[11px] font-semibold"
                      style={{ background: b.ss.bg, color: b.ss.color }}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Printer size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                        <Pencil size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <p className="text-[12px] text-gray-500">
            Showing 1 to 5 of 89 entries
            <span className="mx-2 text-gray-300">•</span>
            Auto-refresh every 30s
          </p>
          <div className="flex items-center gap-1">
            <button className="btn btn-secondary text-[12px] px-3.5 py-1.5">Previous</button>
            <button className="btn btn-primary  text-[12px] px-3.5 py-1.5">1</button>
            <button className="btn btn-ghost   text-[12px] px-3.5 py-1.5 text-gray-600">2</button>
            <button className="btn btn-ghost   text-[12px] px-3.5 py-1.5 text-gray-600">3</button>
            <button className="btn btn-secondary text-[12px] px-3.5 py-1.5">Next</button>
          </div>
        </div>
      </div>

      {/* ── System status ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 pb-3 text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Skyline Core Server: Online</span>
        </div>
        <span className="text-gray-200">|</span>
        <span>Sync Frequency: 500ms</span>
        <span className="text-gray-200">|</span>
        <span>Facility Gateway: Connected (Court 1-6)</span>
        <span className="ml-auto font-medium text-gray-500">ERP Build 18.4.1 (Stable Club Release)</span>
        <Link to="#" className="font-semibold text-[var(--color-primary)] hover:underline">Club Policy &amp; Log</Link>
      </div>

    </div>
  )
}
