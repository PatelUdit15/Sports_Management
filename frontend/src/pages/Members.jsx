import { useState } from 'react'
import { Search, Filter, UserPlus, Eye, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'

const membersData = [
  { id:1, initials:'AK', name:'Aarav Kapoor',  email:'aarav.k@email.com',  phone:'+91 98100 11001', plan:'Gold',   status:'Active',  joinDate:'01 Oct 2026' },
  { id:2, initials:'PS', name:'Priya Sharma',  email:'priya.s@email.com',  phone:'+91 98200 22002', plan:'Silver', status:'Active',  joinDate:'29 Sep 2026' },
  { id:3, initials:'RN', name:'Rohan Nair',    email:'rohan.n@email.com',  phone:'+91 98300 33003', plan:'Gold',   status:'Active',  joinDate:'22 Oct 2026' },
  { id:4, initials:'TM', name:'Tanvi Mehta',   email:'tanvi.m@email.com',  phone:'+91 98400 44004', plan:'Bronze', status:'Pending', joinDate:'21 Oct 2026' },
  { id:5, initials:'VJ', name:'Vikram Joshi',  email:'vikram.j@email.com', phone:'+91 98500 55005', plan:'Silver', status:'Expired', joinDate:'15 Sep 2026' },
  { id:6, initials:'DP', name:'Devika Pillai', email:'devika.p@email.com', phone:'+91 98600 66006', plan:'Gold',   status:'Active',  joinDate:'10 Oct 2026' },
]

const planStyle  = { Gold:{bg:'#fef3c7',color:'#92400e'}, Silver:{bg:'#f3f4f6',color:'#374151'}, Bronze:{bg:'#fed7aa',color:'#9a3412'} }
const statStyle  = { Active:{bg:'#dcfce7',color:'#15803d'}, Expired:{bg:'#fee2e2',color:'#dc2626'}, Pending:{bg:'#fef3c7',color:'#b45309'} }

export default function Members() {
  const [search,    setSearch]    = useState('')
  const [statusF,   setStatusF]   = useState('All')
  const [planF,     setPlanF]     = useState('All')
  const [showModal, setShowModal] = useState(false)

  const rows = membersData.filter(m => {
    const q = search.toLowerCase()
    return (m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
        && (statusF === 'All' || m.status === statusF)
        && (planF   === 'All' || m.plan   === planF)
  })

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Members Directory</h1>
          <p className="text-[13px] text-gray-500 mt-1.5">
            Manage registered club members, subscription tiers, and contact records.
          </p>
        </div>
        <button className="btn btn-primary gap-2 flex-shrink-0 mt-0.5" onClick={() => setShowModal(true)}>
          <UserPlus size={15} /> Add Member
        </button>
      </div>

      {/* ── Filter bar ── */}
      <div className="card px-5 py-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or email…"
              className="form-input pl-8"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Filter size={13} className="text-gray-400" />
            <select className="form-input w-36" value={statusF} onChange={e => setStatusF(e.target.value)}>
              <option value="All">All Statuses</option>
              <option>Active</option><option>Expired</option><option>Pending</option>
            </select>
            <select className="form-input w-32" value={planF} onChange={e => setPlanF(e.target.value)}>
              <option value="All">All Plans</option>
              <option>Gold</option><option>Silver</option><option>Bronze</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th><th>Email</th><th>Phone</th><th>Plan</th>
                <th>Status</th><th>Joined</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                        style={{ background: 'var(--color-primary)' }}
                      >
                        {m.initials}
                      </div>
                      <span className="font-semibold text-gray-900 whitespace-nowrap">{m.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-600">{m.email}</td>
                  <td className="font-mono text-[12px] text-gray-600 whitespace-nowrap">{m.phone}</td>
                  <td><span className="badge text-[10px] font-bold" style={planStyle[m.plan]}>{m.plan}</span></td>
                  <td><span className="badge text-[10px] font-bold" style={statStyle[m.status]}>{m.status}</span></td>
                  <td className="text-gray-500 text-[12px] whitespace-nowrap">{m.joinDate}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors"><Eye size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-amber-600 transition-colors"><Pencil size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <p className="text-[12px] text-gray-500">Showing 1–{rows.length} of 156 members</p>
          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"><ChevronLeft size={14} /></button>
            <button className="px-3 py-1.5 rounded text-[12px] font-semibold bg-[var(--color-primary)] text-white">1</button>
            <button className="px-3 py-1.5 rounded text-[12px] text-gray-600 hover:bg-gray-100 transition-colors">2</button>
            <button className="px-3 py-1.5 rounded text-[12px] text-gray-600 hover:bg-gray-100 transition-colors">3</button>
            <button className="p-1.5 rounded border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 transition-colors"><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {/* ── Add Member Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md shadow-xl animate-fade-in bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">Add New Member</h2>
                <p className="text-[12px] text-gray-500 mt-0.5">Enter details to create club credentials.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 ml-4">
                <X size={16} />
              </button>
            </div>
            <form className="px-6 py-5 space-y-4" onSubmit={e => { e.preventDefault(); setShowModal(false) }}>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">First Name</label><input className="form-input" placeholder="Aarav" required /></div>
                <div><label className="form-label">Last Name</label><input className="form-input" placeholder="Kapoor" required /></div>
              </div>
              <div><label className="form-label">Email</label><input className="form-input" type="email" placeholder="aarav@email.com" required /></div>
              <div><label className="form-label">Phone</label><input className="form-input" type="tel" placeholder="+91 98100 00000" required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Plan</label>
                  <select className="form-input"><option>Gold</option><option>Silver</option><option>Bronze</option></select>
                </div>
                <div><label className="form-label">Join Date</label><input className="form-input" type="date" defaultValue="2026-10-03" /></div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn btn-secondary flex-1 justify-center py-2.5" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit"  className="btn btn-primary  flex-1 justify-center py-2.5">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
