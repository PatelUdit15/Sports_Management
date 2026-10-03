import { useState } from 'react'
import { Download, Filter, Calendar } from 'lucide-react'

const membershipData = [
  { plan: 'Gold', active: 456, expired: 34, revenue: 684000 },
  { plan: 'Silver', active: 523, expired: 67, revenue: 418400 },
  { plan: 'Bronze', active: 268, expired: 45, revenue: 134000 },
]

const courtUsage = [
  { court: 'Court 1 (Badminton)', bookings: 186, utilization: 78, revenue: 93000 },
  { court: 'Court 2 (Badminton)', bookings: 164, utilization: 69, revenue: 82000 },
  { court: 'Court 3 (Tennis)', bookings: 142, utilization: 60, revenue: 106500 },
  { court: 'Court 4 (Squash)', bookings: 98, utilization: 41, revenue: 49000 },
  { court: 'Court 5 (Tennis)', bookings: 155, utilization: 65, revenue: 116250 },
  { court: 'Court 6 (Badminton)', bookings: 171, utilization: 72, revenue: 85500 },
]

const monthlyTrend = [
  { month: 'Apr', members: 980, revenue: 680, bookings: 620 },
  { month: 'May', members: 1020, revenue: 720, bookings: 680 },
  { month: 'Jun', members: 1080, revenue: 850, bookings: 740 },
  { month: 'Jul', members: 1120, revenue: 920, bookings: 790 },
  { month: 'Aug', members: 1165, revenue: 1050, bookings: 860 },
  { month: 'Sep', members: 1210, revenue: 1120, bookings: 910 },
  { month: 'Oct', members: 1247, revenue: 1245, bookings: 940 },
]

export default function Reports() {
  const [activeReport, setActiveReport] = useState('membership')
  const [dateRange, setDateRange] = useState('this-month')

  const reports = [
    { id: 'membership', label: 'Membership Report' },
    { id: 'court', label: 'Court Utilization' },
    { id: 'growth', label: 'Growth Trends' },
  ]

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Report Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-1 border border-[var(--color-border)] rounded overflow-hidden">
          {reports.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className={`px-4 py-2 text-[13px] font-medium transition-colors ${
                activeReport === r.id ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <select className="form-input w-auto text-[13px]" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="this-month">This Month</option>
            <option value="last-month">Last Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-secondary text-[12px]"><Download size={12} /> Export CSV</button>
        </div>
      </div>

      {activeReport === 'membership' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="text-[15px] font-semibold">Membership Breakdown</h3>
            </div>
            <table className="data-table">
              <thead><tr><th>Plan</th><th>Active Members</th><th>Expired</th><th>Revenue Generated</th><th>% of Total</th></tr></thead>
              <tbody>
                {membershipData.map((m) => {
                  const totalActive = membershipData.reduce((s, x) => s + x.active, 0)
                  return (
                    <tr key={m.plan}>
                      <td><span className={`badge ${m.plan === 'Gold' ? 'badge-gold' : m.plan === 'Silver' ? 'badge-silver' : 'badge-bronze'}`}>{m.plan}</span></td>
                      <td className="font-medium">{m.active}</td>
                      <td className="text-[var(--color-text-secondary)]">{m.expired}</td>
                      <td className="font-medium">₹{m.revenue.toLocaleString()}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                            <div className="h-full bg-[var(--color-primary)] rounded-full" style={{ width: `${Math.round((m.active / totalActive) * 100)}%` }} />
                          </div>
                          <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">{Math.round((m.active / totalActive) * 100)}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]">
              <div className="flex items-center justify-between text-[13px] font-semibold">
                <span>Total</span>
                <span>Active: {membershipData.reduce((s, m) => s + m.active, 0)} · Revenue: ₹{membershipData.reduce((s, m) => s + m.revenue, 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeReport === 'court' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="text-[15px] font-semibold">Court Utilization Report</h3>
            </div>
            <table className="data-table">
              <thead><tr><th>Court</th><th>Total Bookings</th><th>Utilization</th><th>Revenue</th></tr></thead>
              <tbody>
                {courtUsage.map((c) => (
                  <tr key={c.court}>
                    <td className="font-medium">{c.court}</td>
                    <td>{c.bookings}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-[120px] h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${c.utilization}%`,
                              backgroundColor: c.utilization >= 70 ? 'var(--color-success)' : c.utilization >= 50 ? 'var(--color-warning)' : 'var(--color-danger)',
                            }}
                          />
                        </div>
                        <span className="text-[12px] font-medium">{c.utilization}%</span>
                      </div>
                    </td>
                    <td className="font-medium">₹{c.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Visual Chart */}
          <div className="card p-5">
            <h3 className="text-[15px] font-semibold mb-4">Utilization Comparison</h3>
            <div className="flex items-end gap-6 h-48">
              {courtUsage.map((c) => (
                <div key={c.court} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-semibold">{c.utilization}%</span>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${c.utilization}%`,
                      backgroundColor: c.utilization >= 70 ? 'var(--color-primary)' : c.utilization >= 50 ? 'var(--color-warning)' : '#E5E7EB',
                    }}
                  />
                  <span className="text-[10px] text-[var(--color-text-muted)] text-center leading-tight">{c.court.split('(')[0].trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeReport === 'growth' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-[15px] font-semibold mb-4">Growth Trends (Last 7 Months)</h3>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead><tr><th>Month</th><th>Total Members</th><th>Revenue (₹k)</th><th>Bookings</th><th>Member Growth</th></tr></thead>
                <tbody>
                  {monthlyTrend.map((m, i) => {
                    const prevMembers = i > 0 ? monthlyTrend[i - 1].members : m.members
                    const growth = i > 0 ? ((m.members - prevMembers) / prevMembers * 100).toFixed(1) : '—'
                    return (
                      <tr key={m.month}>
                        <td className="font-medium">{m.month} 2026</td>
                        <td>{m.members.toLocaleString()}</td>
                        <td>₹{m.revenue}k</td>
                        <td>{m.bookings}</td>
                        <td>
                          {growth === '—' ? (
                            <span className="text-[var(--color-text-muted)]">—</span>
                          ) : (
                            <span className="text-[var(--color-success)] font-medium">+{growth}%</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Revenue Growth Chart */}
          <div className="card p-5">
            <h3 className="text-[15px] font-semibold mb-4">Revenue Growth</h3>
            <div className="flex items-end gap-4 h-48">
              {monthlyTrend.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium">₹{m.revenue}k</span>
                  <div
                    className="w-full rounded-t bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] transition-colors"
                    style={{ height: `${(m.revenue / 1300) * 100}%` }}
                  />
                  <span className="text-[11px] text-[var(--color-text-muted)]">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
