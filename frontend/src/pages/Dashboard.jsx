import { TrendingUp, TrendingDown, Users, CalendarDays, IndianRupee, MessageSquare } from 'lucide-react'

const kpis = [
  { label: 'Total Members', value: '1,247', change: '+12%', up: true, icon: Users, color: '#714B67' },
  { label: 'Active Bookings', value: '89', change: '+5%', up: true, icon: CalendarDays, color: '#00A09D' },
  { label: 'Revenue (Monthly)', value: '₹4,52,300', change: '+8%', up: true, icon: IndianRupee, color: '#16A34A' },
  { label: 'New Enquiries', value: '23', change: '-3%', up: false, icon: MessageSquare, color: '#F59E0B' },
]

const recentMembers = [
  { name: 'Arjun Mehta', plan: 'Gold', date: '30 Sep 2026', initials: 'AM' },
  { name: 'Priya Sharma', plan: 'Silver', date: '29 Sep 2026', initials: 'PS' },
  { name: 'Rahul Verma', plan: 'Gold', date: '28 Sep 2026', initials: 'RV' },
  { name: 'Sneha Patel', plan: 'Bronze', date: '27 Sep 2026', initials: 'SP' },
  { name: 'Karan Singh', plan: 'Silver', date: '26 Sep 2026', initials: 'KS' },
]

const todayBookings = [
  { member: 'Arjun Mehta', court: 'Court 1 (Badminton)', time: '06:00 - 07:00', status: 'Confirmed' },
  { member: 'Priya Sharma', court: 'Court 3 (Tennis)', time: '08:00 - 09:30', status: 'Confirmed' },
  { member: 'Vikram Joshi', court: 'Court 2 (Badminton)', time: '10:00 - 11:00', status: 'Pending' },
  { member: 'Neha Gupta', court: 'Court 4 (Squash)', time: '14:00 - 15:00', status: 'Confirmed' },
  { member: 'Rohan Kumar', court: 'Court 1 (Badminton)', time: '18:00 - 19:00', status: 'Pending' },
]

const revenueData = [18, 25, 22, 30, 28, 35, 32, 40, 38, 45, 42, 50, 48, 55, 52, 58, 55, 60, 58, 65, 62, 68, 65, 70, 68, 72, 70, 75, 73, 78]

const planBadge = (plan) => {
  const map = { Gold: 'badge-gold', Silver: 'badge-silver', Bronze: 'badge-bronze' }
  return map[plan] || 'badge-info'
}

export default function Dashboard() {
  const maxRevenue = Math.max(...revenueData)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className="kpi-card"
              style={{ borderLeftColor: kpi.color }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    {kpi.label}
                  </div>
                  <div className="text-2xl font-bold text-[var(--color-text)] mt-1">{kpi.value}</div>
                  <div className={`flex items-center gap-1 mt-1 text-[12px] font-medium ${kpi.up ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {kpi.change} from last month
                  </div>
                </div>
                <div
                  className="w-10 h-10 rounded flex items-center justify-center"
                  style={{ backgroundColor: kpi.color + '14' }}
                >
                  <Icon size={20} style={{ color: kpi.color }} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-[var(--color-text)]">Revenue Trend</h3>
            <span className="text-[12px] text-[var(--color-text-muted)]">Last 30 days</span>
          </div>
          <div className="h-48 flex items-end gap-[3px]">
            {revenueData.map((val, i) => (
              <div
                key={i}
                className="flex-1 rounded-t transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${(val / maxRevenue) * 100}%`,
                  backgroundColor: i === revenueData.length - 1 ? 'var(--color-primary)' : 'var(--color-primary-light)',
                }}
                title={`Day ${i + 1}: ₹${val}k`}
              />
            ))}
          </div>
        </div>

        {/* Recent Members */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-semibold text-[var(--color-text)]">Recent Members</h3>
            <a href="/members" className="text-[12px] font-medium text-[var(--color-primary)] hover:underline">View all</a>
          </div>
          <div className="space-y-3">
            {recentMembers.map((member) => (
              <div key={member.name} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-semibold text-[var(--color-primary)]">{member.initials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium text-[var(--color-text)] truncate">{member.name}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">{member.date}</div>
                </div>
                <span className={`badge ${planBadge(member.plan)}`}>{member.plan}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Today's Bookings */}
      <div className="card">
        <div className="flex items-center justify-between p-5 pb-0">
          <h3 className="text-[15px] font-semibold text-[var(--color-text)]">Today's Bookings</h3>
          <a href="/court-bookings" className="text-[12px] font-medium text-[var(--color-primary)] hover:underline">View all</a>
        </div>
        <div className="overflow-x-auto mt-3">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Court</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {todayBookings.map((booking, i) => (
                <tr key={i}>
                  <td className="font-medium">{booking.member}</td>
                  <td>{booking.court}</td>
                  <td>{booking.time}</td>
                  <td>
                    <span className={`badge ${booking.status === 'Confirmed' ? 'badge-success' : 'badge-warning'}`}>
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
