import { useState } from 'react'
import { Search, Plus, Eye, Phone, Mail, X, ArrowRight, UserPlus } from 'lucide-react'

const enquiriesData = [
  { id: 1, name: 'Vikash Rathore', email: 'vikash@email.com', phone: '+91 99887 76655', interest: 'Badminton', source: 'Website', status: 'New', date: '03 Oct 2026', notes: 'Interested in Gold membership', initials: 'VR' },
  { id: 2, name: 'Pooja Deshmukh', email: 'pooja@email.com', phone: '+91 88776 65544', interest: 'Tennis', source: 'Walk-in', status: 'Contacted', date: '02 Oct 2026', notes: 'Wants to visit on weekend', initials: 'PD' },
  { id: 3, name: 'Sanjay Gupta', email: 'sanjay@email.com', phone: '+91 77665 54433', interest: 'Gym + Courts', source: 'Referral', status: 'Trial Scheduled', date: '01 Oct 2026', notes: 'Trial on 05 Oct, referred by Arjun Mehta', initials: 'SG' },
  { id: 4, name: 'Riya Kapoor', email: 'riya@email.com', phone: '+91 66554 43322', interest: 'Squash', source: 'Social Media', status: 'Converted', date: '30 Sep 2026', notes: 'Converted to Silver plan', initials: 'RK' },
  { id: 5, name: 'Manish Tiwari', email: 'manish@email.com', phone: '+91 55443 32211', interest: 'Swimming', source: 'Website', status: 'Lost', date: '28 Sep 2026', notes: 'Chose another club', initials: 'MT' },
  { id: 6, name: 'Nisha Agarwal', email: 'nisha@email.com', phone: '+91 44332 21100', interest: 'Yoga + Gym', source: 'Walk-in', status: 'New', date: '03 Oct 2026', notes: 'Asking about family membership', initials: 'NA' },
  { id: 7, name: 'Deepak Joshi', email: 'deepak.j@email.com', phone: '+91 33221 10099', interest: 'Cricket Nets', source: 'Phone Call', status: 'Contacted', date: '02 Oct 2026', notes: 'Wants group booking for team', initials: 'DJ' },
]

const statusBadge = (status) => ({
  New: 'badge-info',
  Contacted: 'badge-primary',
  'Trial Scheduled': 'badge-warning',
  Converted: 'badge-success',
  Lost: 'badge-danger',
}[status] || 'badge-info')

const statusFlow = ['New', 'Contacted', 'Trial Scheduled', 'Converted']

export default function Enquiries() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [selectedEnquiry, setSelectedEnquiry] = useState(null)

  const filtered = enquiriesData.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.interest.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'All' || e.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: enquiriesData.length,
    new: enquiriesData.filter(e => e.status === 'New').length,
    converted: enquiriesData.filter(e => e.status === 'Converted').length,
    conversionRate: Math.round((enquiriesData.filter(e => e.status === 'Converted').length / enquiriesData.length) * 100),
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card" style={{ borderLeftColor: '#714B67' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Total Enquiries</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#2563EB' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">New</div>
          <div className="text-2xl font-bold mt-1">{stats.new}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#16A34A' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Converted</div>
          <div className="text-2xl font-bold mt-1">{stats.converted}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#00A09D' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Conversion Rate</div>
          <div className="text-2xl font-bold mt-1">{stats.conversionRate}%</div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input type="text" placeholder="Search enquiries..." className="form-input pl-9 text-[13px]" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="form-input w-auto text-[13px]" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            {['New', 'Contacted', 'Trial Scheduled', 'Converted', 'Lost'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Enquiry
        </button>
      </div>

      {/* Pipeline View */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {statusFlow.map((stage) => {
          const items = enquiriesData.filter(e => e.status === stage)
          return (
            <div key={stage} className="space-y-2">
              <div className="flex items-center justify-between px-1 mb-2">
                <h3 className="text-[13px] font-semibold text-[var(--color-text)]">{stage}</h3>
                <span className="badge badge-primary">{items.length}</span>
              </div>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="card p-3 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedEnquiry(item)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                      <span className="text-[10px] font-semibold text-[var(--color-primary)]">{item.initials}</span>
                    </div>
                    <div>
                      <div className="text-[13px] font-medium">{item.name}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)]">{item.interest}</div>
                    </div>
                  </div>
                  <div className="text-[11px] text-[var(--color-text-secondary)] mb-1">{item.notes}</div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)]">
                    <span>{item.source}</span>
                    <span>{item.date}</span>
                  </div>
                </div>
              ))}
              {items.length === 0 && (
                <div className="card p-4 text-center text-[12px] text-[var(--color-text-muted)]">No enquiries</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Detail Sidebar */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold">Enquiry Details</h2>
              <button onClick={() => setSelectedEnquiry(null)} className="p-1 rounded hover:bg-[var(--color-bg)]"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                <span className="text-lg font-semibold text-[var(--color-primary)]">{selectedEnquiry.initials}</span>
              </div>
              <div>
                <div className="text-[15px] font-semibold">{selectedEnquiry.name}</div>
                <span className={`badge ${statusBadge(selectedEnquiry.status)}`}>{selectedEnquiry.status}</span>
              </div>
            </div>
            <div className="space-y-3 text-[13px]">
              <div className="flex items-center gap-2"><Mail size={14} className="text-[var(--color-text-muted)]" /> {selectedEnquiry.email}</div>
              <div className="flex items-center gap-2"><Phone size={14} className="text-[var(--color-text-muted)]" /> {selectedEnquiry.phone}</div>
              <div className="border-t border-[var(--color-border)] pt-3">
                <label className="form-label">Interest</label>
                <p>{selectedEnquiry.interest}</p>
              </div>
              <div>
                <label className="form-label">Source</label>
                <p>{selectedEnquiry.source}</p>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <p className="text-[var(--color-text-secondary)]">{selectedEnquiry.notes}</p>
              </div>
            </div>
            {selectedEnquiry.status !== 'Converted' && selectedEnquiry.status !== 'Lost' && (
              <div className="mt-6 space-y-2">
                <button className="btn-primary w-full justify-center">
                  <ArrowRight size={14} /> Move to Next Stage
                </button>
                <button className="btn-secondary w-full justify-center">
                  <UserPlus size={14} /> Convert to Member
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Enquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="card w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold">New Enquiry</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--color-bg)]"><X size={16} /></button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false) }}>
              <div><label className="form-label">Full Name</label><input className="form-input" placeholder="Full name" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Email</label><input className="form-input" type="email" /></div>
                <div><label className="form-label">Phone</label><input className="form-input" type="tel" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Interest</label><input className="form-input" placeholder="e.g. Tennis" /></div>
                <div><label className="form-label">Source</label>
                  <select className="form-input"><option>Website</option><option>Walk-in</option><option>Referral</option><option>Social Media</option><option>Phone Call</option></select>
                </div>
              </div>
              <div><label className="form-label">Notes</label><textarea className="form-input" rows={2} /></div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Enquiry</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
