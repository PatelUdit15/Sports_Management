import { useState } from 'react'
import { Search, Plus, Eye, Pencil, X, Building2, FileText } from 'lucide-react'

const clientsData = [
  { id: 1, name: 'Vanguard Corporation', contact: 'Marcus Vance', email: 'marcus@vanguard.com', phone: '+91 98765 00001', plan: 'Enterprise', employees: 45, status: 'Active', totalBilled: 540000, initials: 'VC' },
  { id: 2, name: 'Metro Fitness LLC', contact: 'Samira Khan', email: 'samira@metrofitness.com', phone: '+91 98765 00002', plan: 'Corporate', employees: 28, status: 'Active', totalBilled: 336000, initials: 'MF' },
  { id: 3, name: 'TechPark Solutions', contact: 'Rajiv Malhotra', email: 'rajiv@techpark.in', phone: '+91 98765 00003', plan: 'Corporate', employees: 35, status: 'Active', totalBilled: 420000, initials: 'TS' },
  { id: 4, name: 'Greenfield Academy', contact: 'Dr. Priya Iyer', email: 'priya@greenfield.edu', phone: '+91 98765 00004', plan: 'Academic', employees: 60, status: 'Pending', totalBilled: 0, initials: 'GA' },
  { id: 5, name: 'Apex Industries', contact: 'Suresh Patel', email: 'suresh@apex.co.in', phone: '+91 98765 00005', plan: 'Enterprise', employees: 20, status: 'Expired', totalBilled: 240000, initials: 'AI' },
]

const clientInvoices = [
  { id: 'CI-001', client: 'Vanguard Corporation', amount: 45000, period: 'Oct 2026', status: 'Pending', dueDate: '15 Oct 2026' },
  { id: 'CI-002', client: 'Metro Fitness LLC', amount: 28000, period: 'Oct 2026', status: 'Pending', dueDate: '15 Oct 2026' },
  { id: 'CI-003', client: 'TechPark Solutions', amount: 35000, period: 'Sep 2026', status: 'Paid', dueDate: '15 Sep 2026' },
  { id: 'CI-004', client: 'Vanguard Corporation', amount: 45000, period: 'Sep 2026', status: 'Paid', dueDate: '15 Sep 2026' },
]

const statusBadge = (status) => ({ Active: 'badge-success', Pending: 'badge-warning', Expired: 'badge-danger', Paid: 'badge-success' }[status] || 'badge-info')
const planBadge = (plan) => ({ Enterprise: 'badge-primary', Corporate: 'badge-info', Academic: 'badge-warning' }[plan] || 'badge-info')

export default function Clients() {
  const [activeTab, setActiveTab] = useState('clients')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = clientsData.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.contact.toLowerCase().includes(search.toLowerCase()))

  const totalEmployees = clientsData.filter(c => c.status === 'Active').reduce((s, c) => s + c.employees, 0)
  const totalBilled = clientsData.reduce((s, c) => s + c.totalBilled, 0)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card" style={{ borderLeftColor: '#714B67' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Total Clients</div>
          <div className="text-2xl font-bold mt-1">{clientsData.length}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#16A34A' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Active</div>
          <div className="text-2xl font-bold mt-1">{clientsData.filter(c => c.status === 'Active').length}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#00A09D' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Total Employees</div>
          <div className="text-2xl font-bold mt-1">{totalEmployees}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#F59E0B' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Total Billed</div>
          <div className="text-2xl font-bold mt-1">₹{(totalBilled / 100000).toFixed(1)}L</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)]">
        {['Clients', 'Invoices'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.toLowerCase() ? 'border-[var(--color-primary)] text-[var(--color-primary)]' : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'clients' && (
        <>
          <div className="flex items-center gap-3 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input type="text" placeholder="Search clients..." className="form-input pl-9 text-[13px]" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={14} /> Add Client</button>
          </div>

          <div className="card overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Company</th><th>Contact Person</th><th>Plan</th><th>Employees</th><th>Status</th><th>Total Billed</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded bg-[var(--color-primary-light)] flex items-center justify-center">
                          <span className="text-[10px] font-bold text-[var(--color-primary)]">{client.initials}</span>
                        </div>
                        <div>
                          <div className="font-medium">{client.name}</div>
                          <div className="text-[11px] text-[var(--color-text-muted)]">{client.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{client.contact}</td>
                    <td><span className={`badge ${planBadge(client.plan)}`}>{client.plan}</span></td>
                    <td>{client.employees}</td>
                    <td><span className={`badge ${statusBadge(client.status)}`}>{client.status}</span></td>
                    <td className="font-medium">₹{client.totalBilled.toLocaleString()}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-info)]"><Eye size={14} /></button>
                        <button className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-warning)]"><Pencil size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'invoices' && (
        <div className="card overflow-hidden">
          <table className="data-table">
            <thead><tr><th>Invoice</th><th>Client</th><th>Period</th><th>Amount</th><th>Due Date</th><th>Status</th></tr></thead>
            <tbody>
              {clientInvoices.map((inv) => (
                <tr key={inv.id}>
                  <td className="font-medium text-[var(--color-primary)]">{inv.id}</td>
                  <td>{inv.client}</td>
                  <td>{inv.period}</td>
                  <td className="font-medium">₹{inv.amount.toLocaleString()}</td>
                  <td className="text-[var(--color-text-secondary)]">{inv.dueDate}</td>
                  <td><span className={`badge ${statusBadge(inv.status)}`}>{inv.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="card w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold">Add Business Client</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--color-bg)]"><X size={16} /></button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false) }}>
              <div><label className="form-label">Company Name</label><input className="form-input" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Contact Person</label><input className="form-input" /></div>
                <div><label className="form-label">Plan</label>
                  <select className="form-input"><option>Enterprise</option><option>Corporate</option><option>Academic</option></select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Email</label><input className="form-input" type="email" /></div>
                <div><label className="form-label">Phone</label><input className="form-input" type="tel" /></div>
              </div>
              <div><label className="form-label">Number of Employees</label><input className="form-input" type="number" /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
