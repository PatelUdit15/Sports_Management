import { useState } from 'react'
import { Search, Plus, Pencil, Eye, X, Calendar, Clock, UserCheck, UserX } from 'lucide-react'

const staffData = [
  { id: 1, name: 'Amit Desai', role: 'Manager', department: 'Operations', email: 'amit@skyline.com', phone: '+91 98765 11111', status: 'Active', joinDate: '01 Jan 2024', salary: 45000, initials: 'AD' },
  { id: 2, name: 'Meera Iyer', role: 'Receptionist', department: 'Front Desk', email: 'meera@skyline.com', phone: '+91 98765 22222', status: 'Active', joinDate: '15 Mar 2024', salary: 22000, initials: 'MI' },
  { id: 3, name: 'Rajesh Nair', role: 'Court Manager', department: 'Operations', email: 'rajesh@skyline.com', phone: '+91 98765 33333', status: 'Active', joinDate: '10 Jun 2024', salary: 28000, initials: 'RN' },
  { id: 4, name: 'Sunita Rao', role: 'Trainer', department: 'Coaching', email: 'sunita@skyline.com', phone: '+91 98765 44444', status: 'Active', joinDate: '01 Aug 2024', salary: 35000, initials: 'SR' },
  { id: 5, name: 'Farhan Sheikh', role: 'Cafe Staff', department: 'Cafe', email: 'farhan@skyline.com', phone: '+91 98765 55555', status: 'On Leave', joinDate: '20 Sep 2024', salary: 18000, initials: 'FS' },
  { id: 6, name: 'Kavita Jain', role: 'Accountant', department: 'Finance', email: 'kavita@skyline.com', phone: '+91 98765 66666', status: 'Active', joinDate: '01 Nov 2024', salary: 32000, initials: 'KJ' },
  { id: 7, name: 'Deepak Pandey', role: 'Security', department: 'Facilities', email: 'deepak@skyline.com', phone: '+91 98765 77777', status: 'Active', joinDate: '15 Dec 2024', salary: 16000, initials: 'DP' },
  { id: 8, name: 'Anita Sharma', role: 'Trainer', department: 'Coaching', email: 'anita@skyline.com', phone: '+91 98765 88888', status: 'Inactive', joinDate: '01 Feb 2025', salary: 30000, initials: 'AS' },
]

const attendanceToday = [
  { name: 'Amit Desai', checkIn: '08:45 AM', checkOut: '-', status: 'Present' },
  { name: 'Meera Iyer', checkIn: '09:02 AM', checkOut: '-', status: 'Present' },
  { name: 'Rajesh Nair', checkIn: '08:30 AM', checkOut: '-', status: 'Present' },
  { name: 'Sunita Rao', checkIn: '07:00 AM', checkOut: '-', status: 'Present' },
  { name: 'Farhan Sheikh', checkIn: '-', checkOut: '-', status: 'On Leave' },
  { name: 'Kavita Jain', checkIn: '09:15 AM', checkOut: '-', status: 'Late' },
  { name: 'Deepak Pandey', checkIn: '06:00 AM', checkOut: '-', status: 'Present' },
  { name: 'Anita Sharma', checkIn: '-', checkOut: '-', status: 'Absent' },
]

const statusBadge = (status) => ({
  Active: 'badge-success', 'On Leave': 'badge-warning', Inactive: 'badge-danger',
  Present: 'badge-success', Late: 'badge-warning', Absent: 'badge-danger',
}[status] || 'badge-info')

export default function Staff() {
  const [activeTab, setActiveTab] = useState('staff')
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const filtered = staffData.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase()))

  const tabs = ['Staff Directory', 'Attendance', 'Payroll']

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="kpi-card" style={{ borderLeftColor: '#714B67' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Total Staff</div>
          <div className="text-2xl font-bold mt-1">{staffData.length}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#16A34A' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Active</div>
          <div className="text-2xl font-bold mt-1">{staffData.filter(s => s.status === 'Active').length}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#F59E0B' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">On Leave</div>
          <div className="text-2xl font-bold mt-1">{staffData.filter(s => s.status === 'On Leave').length}</div>
        </div>
        <div className="kpi-card" style={{ borderLeftColor: '#00A09D' }}>
          <div className="text-[11px] text-[var(--color-text-muted)] uppercase tracking-wider">Departments</div>
          <div className="text-2xl font-bold mt-1">{new Set(staffData.map(s => s.department)).size}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[var(--color-border)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '-'))}
            className={`px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors -mb-px ${
              activeTab === tab.toLowerCase().replace(' ', '-')
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'staff' && (
        <>
          <div className="flex items-center gap-3 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
              <input type="text" placeholder="Search staff..." className="form-input pl-9 text-[13px]" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add Staff
            </button>
          </div>

          <div className="card overflow-hidden">
            <table className="data-table">
              <thead><tr><th>Name</th><th>Role</th><th>Department</th><th>Email</th><th>Status</th><th>Salary</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.map((staff) => (
                  <tr key={staff.id}>
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-primary-light)] flex items-center justify-center">
                          <span className="text-[10px] font-semibold text-[var(--color-primary)]">{staff.initials}</span>
                        </div>
                        <span className="font-medium">{staff.name}</span>
                      </div>
                    </td>
                    <td>{staff.role}</td>
                    <td className="text-[var(--color-text-secondary)]">{staff.department}</td>
                    <td className="text-[var(--color-text-secondary)]">{staff.email}</td>
                    <td><span className={`badge ${statusBadge(staff.status)}`}>{staff.status}</span></td>
                    <td className="font-medium">₹{staff.salary.toLocaleString()}</td>
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

      {activeTab === 'attendance' && (
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
            <h3 className="text-[14px] font-semibold">Today's Attendance — 03 Oct 2026</h3>
            <div className="flex items-center gap-3 text-[12px]">
              <span className="flex items-center gap-1"><UserCheck size={12} className="text-[var(--color-success)]" /> {attendanceToday.filter(a => a.status === 'Present').length} Present</span>
              <span className="flex items-center gap-1"><UserX size={12} className="text-[var(--color-danger)]" /> {attendanceToday.filter(a => a.status === 'Absent').length} Absent</span>
            </div>
          </div>
          <table className="data-table">
            <thead><tr><th>Name</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
            <tbody>
              {attendanceToday.map((a, i) => (
                <tr key={i}>
                  <td className="font-medium">{a.name}</td>
                  <td className="text-[var(--color-text-secondary)]">{a.checkIn}</td>
                  <td className="text-[var(--color-text-secondary)]">{a.checkOut}</td>
                  <td><span className={`badge ${statusBadge(a.status)}`}>{a.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'payroll' && (
        <div className="card p-6">
          <h3 className="text-[16px] font-semibold mb-2">Payroll Management</h3>
          <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">Monthly payroll overview and salary disbursement.</p>
          <div className="card p-4 border-l-4 border-l-[var(--color-info)]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[var(--color-text-muted)] uppercase">Total Monthly Payroll</div>
                <div className="text-2xl font-bold mt-1">₹{staffData.reduce((s, x) => s + x.salary, 0).toLocaleString()}</div>
              </div>
              <button className="btn-primary">Process Payroll</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="card w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]"><X size={16} /></button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false) }}>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Full Name</label><input className="form-input" placeholder="Full name" /></div>
                <div><label className="form-label">Role</label><input className="form-input" placeholder="e.g. Trainer" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Department</label>
                  <select className="form-input"><option>Operations</option><option>Coaching</option><option>Front Desk</option><option>Cafe</option><option>Finance</option><option>Facilities</option></select>
                </div>
                <div><label className="form-label">Monthly Salary (₹)</label><input className="form-input" type="number" placeholder="0" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Email</label><input className="form-input" type="email" /></div>
                <div><label className="form-label">Phone</label><input className="form-input" type="tel" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Staff</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
