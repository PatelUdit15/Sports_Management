import { useState } from 'react'
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Download, Filter } from 'lucide-react'

const summaryCards = [
  { label: 'Total Revenue', value: '₹12,45,800', change: '+14%', up: true, color: '#16A34A', period: 'This Month' },
  { label: 'Total Expenses', value: '₹4,32,100', change: '+6%', up: true, color: '#DC2626', period: 'This Month' },
  { label: 'Net Profit', value: '₹8,13,700', change: '+18%', up: true, color: '#714B67', period: 'This Month' },
  { label: 'Outstanding Dues', value: '₹1,23,450', change: '-8%', up: false, color: '#F59E0B', period: 'Pending' },
]

const recentTransactions = [
  { id: 'TXN-001', description: 'Membership Fee - Arjun Mehta (Gold)', type: 'Income', amount: 15000, date: '03 Oct 2026', category: 'Membership' },
  { id: 'TXN-002', description: 'Court Booking - Priya Sharma', type: 'Income', amount: 500, date: '03 Oct 2026', category: 'Bookings' },
  { id: 'TXN-003', description: 'Electricity Bill - October', type: 'Expense', amount: -18500, date: '02 Oct 2026', category: 'Utilities' },
  { id: 'TXN-004', description: 'Staff Salary - September', type: 'Expense', amount: -226000, date: '01 Oct 2026', category: 'Payroll' },
  { id: 'TXN-005', description: 'Shop Sale - Training Shoes x2', type: 'Income', amount: 6400, date: '01 Oct 2026', category: 'Shop' },
  { id: 'TXN-006', description: 'Cafe Revenue - 30 Sep', type: 'Income', amount: 4850, date: '30 Sep 2026', category: 'Cafe' },
  { id: 'TXN-007', description: 'Court Maintenance - Court 4', type: 'Expense', amount: -8000, date: '30 Sep 2026', category: 'Maintenance' },
  { id: 'TXN-008', description: 'Membership Fee - Karan Singh (Silver)', type: 'Income', amount: 8000, date: '29 Sep 2026', category: 'Membership' },
]

const invoices = [
  { id: 'INV-2026-042', client: 'Arjun Mehta', amount: 15000, status: 'Paid', dueDate: '15 Oct 2026' },
  { id: 'INV-2026-041', client: 'Vanguard Corp', amount: 45000, status: 'Overdue', dueDate: '28 Sep 2026' },
  { id: 'INV-2026-040', client: 'Sneha Patel', amount: 5000, status: 'Pending', dueDate: '10 Oct 2026' },
  { id: 'INV-2026-039', client: 'Metro Fitness LLC', amount: 32000, status: 'Paid', dueDate: '25 Sep 2026' },
  { id: 'INV-2026-038', client: 'Rahul Verma', amount: 15000, status: 'Paid', dueDate: '20 Sep 2026' },
]

const monthlyRevenue = [
  { month: 'Apr', value: 680 },
  { month: 'May', value: 720 },
  { month: 'Jun', value: 850 },
  { month: 'Jul', value: 920 },
  { month: 'Aug', value: 1050 },
  { month: 'Sep', value: 1120 },
  { month: 'Oct', value: 1245 },
]

const invoiceStatusBadge = (status) => ({
  Paid: 'badge-success', Pending: 'badge-warning', Overdue: 'badge-danger',
}[status])

export default function Finance() {
  const [activeTab, setActiveTab] = useState('overview')
  const maxRevenue = Math.max(...monthlyRevenue.map(m => m.value))
  const tabs = ['Overview', 'Transactions', 'Invoices']

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="kpi-card" style={{ borderLeftColor: card.color }}>
            <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">{card.label}</div>
            <div className="text-2xl font-bold mt-1">{card.value}</div>
            <div className="flex items-center justify-between mt-1">
              <span className={`flex items-center gap-1 text-[12px] font-medium ${card.up && card.label !== 'Total Expenses' ? 'text-[var(--color-success)]' : card.label === 'Total Expenses' ? 'text-[var(--color-danger)]' : 'text-[var(--color-success)]'}`}>
                {card.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {card.change}
              </span>
              <span className="text-[11px] text-[var(--color-text-muted)]">{card.period}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.toLowerCase()
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Revenue Chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold">Monthly Revenue (₹ in thousands)</h3>
              <button className="btn-secondary text-[11px] py-1 px-3"><Download size={12} /> Export</button>
            </div>
            <div className="flex items-end gap-4 h-48">
              {monthlyRevenue.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-[var(--color-text)]">₹{m.value}k</span>
                  <div
                    className="w-full rounded-t bg-[var(--color-primary-light)] hover:bg-[var(--color-primary)] transition-colors cursor-pointer"
                    style={{ height: `${(m.value / maxRevenue) * 100}%` }}
                  />
                  <span className="text-[11px] text-[var(--color-text-muted)]">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="card p-5">
            <h3 className="text-[15px] font-semibold mb-4">Revenue Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Memberships', value: '₹6,80,000', pct: 55, color: '#714B67' },
                { label: 'Court Bookings', value: '₹2,24,000', pct: 18, color: '#00A09D' },
                { label: 'Shop Sales', value: '₹1,56,000', pct: 13, color: '#F59E0B' },
                { label: 'Cafe Revenue', value: '₹1,12,000', pct: 9, color: '#16A34A' },
                { label: 'Other', value: '₹73,800', pct: 5, color: '#6B7280' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-[13px] mb-1">
                    <span className="text-[var(--color-text)]">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                  <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Description</th><th>Category</th><th>Date</th><th>Amount</th></tr></thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id}>
                  <td className="text-[var(--color-primary)] font-medium">{txn.id}</td>
                  <td>{txn.description}</td>
                  <td><span className="badge badge-primary">{txn.category}</span></td>
                  <td className="text-[var(--color-text-secondary)]">{txn.date}</td>
                  <td className={`font-semibold ${txn.amount >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
                    <span className="flex items-center gap-1">
                      {txn.amount >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      ₹{Math.abs(txn.amount).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'invoices' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>Client</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="text-[var(--color-primary)] font-medium">{inv.id}</td>
                  <td>{inv.client}</td>
                  <td className="font-medium">₹{inv.amount.toLocaleString()}</td>
                  <td className="text-[var(--color-text-secondary)]">{inv.dueDate}</td>
                  <td><span className={`badge ${invoiceStatusBadge(inv.status)}`}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
