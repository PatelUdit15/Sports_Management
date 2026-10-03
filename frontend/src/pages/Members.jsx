import { useState } from 'react'
import { Search, Plus, Pencil, Eye, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'

const membersData = [
  { id: 1, name: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+91 98765 43210', plan: 'Gold', status: 'Active', joinDate: '15 Jan 2026', initials: 'AM' },
  { id: 2, name: 'Priya Sharma', email: 'priya.sharma@email.com', phone: '+91 87654 32109', plan: 'Silver', status: 'Active', joinDate: '20 Feb 2026', initials: 'PS' },
  { id: 3, name: 'Rahul Verma', email: 'rahul.verma@email.com', phone: '+91 76543 21098', plan: 'Gold', status: 'Active', joinDate: '05 Mar 2026', initials: 'RV' },
  { id: 4, name: 'Sneha Patel', email: 'sneha.patel@email.com', phone: '+91 65432 10987', plan: 'Bronze', status: 'Expired', joinDate: '12 Apr 2026', initials: 'SP' },
  { id: 5, name: 'Karan Singh', email: 'karan.singh@email.com', phone: '+91 54321 09876', plan: 'Silver', status: 'Active', joinDate: '01 May 2026', initials: 'KS' },
  { id: 6, name: 'Ananya Joshi', email: 'ananya.joshi@email.com', phone: '+91 43210 98765', plan: 'Gold', status: 'Active', joinDate: '18 Jun 2026', initials: 'AJ' },
  { id: 7, name: 'Vikram Yadav', email: 'vikram.yadav@email.com', phone: '+91 32109 87654', plan: 'Bronze', status: 'Pending', joinDate: '25 Jul 2026', initials: 'VY' },
  { id: 8, name: 'Neha Gupta', email: 'neha.gupta@email.com', phone: '+91 21098 76543', plan: 'Silver', status: 'Active', joinDate: '02 Aug 2026', initials: 'NG' },
  { id: 9, name: 'Rohan Kumar', email: 'rohan.kumar@email.com', phone: '+91 10987 65432', plan: 'Gold', status: 'Active', joinDate: '10 Sep 2026', initials: 'RK' },
  { id: 10, name: 'Divya Nair', email: 'divya.nair@email.com', phone: '+91 09876 54321', plan: 'Silver', status: 'Expired', joinDate: '15 Sep 2026', initials: 'DN' },
]

const planBadge = (plan) => {
  const map = { Gold: 'badge-gold', Silver: 'badge-silver', Bronze: 'badge-bronze' }
  return map[plan] || 'badge-info'
}

const statusBadge = (status) => {
  const map = { Active: 'badge-success', Expired: 'badge-danger', Pending: 'badge-warning' }
  return map[status] || 'badge-info'
}

export default function Members() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [planFilter, setPlanFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)

  const filtered = membersData.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || m.status === statusFilter
    const matchPlan = planFilter === 'All' || m.plan === planFilter
    return matchSearch && matchStatus && matchPlan
  })

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input
              type="text"
              placeholder="Search members..."
              className="form-input pl-9 text-[13px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <select
            className="form-input w-auto text-[13px]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
            <option value="Pending">Pending</option>
          </select>

          <select
            className="form-input w-auto text-[13px]"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="All">All Plans</option>
            <option value="Gold">Gold</option>
            <option value="Silver">Silver</option>
            <option value="Bronze">Bronze</option>
          </select>
        </div>

        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Member
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
                        <span className="text-[10px] font-semibold text-[var(--color-primary)]">{member.initials}</span>
                      </div>
                      <span className="font-medium">{member.name}</span>
                    </div>
                  </td>
                  <td className="text-[var(--color-text-secondary)]">{member.email}</td>
                  <td className="text-[var(--color-text-secondary)]">{member.phone}</td>
                  <td><span className={`badge ${planBadge(member.plan)}`}>{member.plan}</span></td>
                  <td><span className={`badge ${statusBadge(member.status)}`}>{member.status}</span></td>
                  <td className="text-[var(--color-text-secondary)]">{member.joinDate}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-info)]" title="View">
                        <Eye size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-warning)]" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-danger)]" title="Delete">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
          <div className="text-[12px] text-[var(--color-text-muted)]">
            Showing 1-{filtered.length} of 156 members
          </div>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]">
              <ChevronLeft size={14} />
            </button>
            <button className="px-3 py-1 rounded text-[12px] font-medium bg-[var(--color-primary)] text-white">1</button>
            <button className="px-3 py-1 rounded text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]">2</button>
            <button className="px-3 py-1 rounded text-[12px] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]">3</button>
            <button className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="card w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)]">New Member</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                <X size={16} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false) }}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">First Name</label>
                  <input className="form-input" placeholder="Arjun" />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input className="form-input" placeholder="Mehta" />
                </div>
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="arjun@email.com" />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="form-input" type="tel" placeholder="+91 98765 43210" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Membership Plan</label>
                  <select className="form-input">
                    <option>Gold</option>
                    <option>Silver</option>
                    <option>Bronze</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Start Date</label>
                  <input className="form-input" type="date" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2 justify-end">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
