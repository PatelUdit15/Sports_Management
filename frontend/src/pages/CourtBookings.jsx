import { useState } from 'react'
import { Plus, Search, Calendar, Printer, Pencil, ChevronRight, X } from 'lucide-react'

const bookings = [
  { id:'#BK-9481', member:'Karan Singhania', verified:true,  facility:'Court 1 - Indoor Tennis', dot:'#16a34a', slot:'08:00–09:30 AM', fee:'₹1,200', status:'Confirmed',       ss:{bg:'#dcfce7',color:'#15803d'} },
  { id:'#BK-9482', member:'Ananya Sen',       verified:false, facility:'Court 4 - Squash',        dot:'#3b82f6', slot:'10:00–11:30 AM', fee:'₹800',   status:'In Progress',    ss:{bg:'#dbeafe',color:'#1e40af'} },
  { id:'#BK-9483', member:'Vikram Joshi',     verified:false, facility:'Court 2 - Padel Beta',    dot:'#6b7280', slot:'06:30–08:00 AM', fee:'₹1,500', status:'Completed',      ss:{bg:'#f3f4f6',color:'#374151'} },
  { id:'#BK-9484', member:'Devika Pillai',    verified:false, facility:'Court 3 - Badminton',     dot:'#f59e0b', slot:'11:45–01:15 PM', fee:'₹750',   status:'Pending Payment',ss:{bg:'#fef3c7',color:'#92400e'} },
  { id:'#BK-9485', member:'Sameer Varma',     verified:false, facility:'Court 5 - Clay Tennis',   dot:'#16a34a', slot:'02:00–03:30 PM', fee:'₹1,000', status:'Confirmed',      ss:{bg:'#dcfce7',color:'#15803d'} },
]

export default function CourtBookings() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Court Bookings</h1>
          <p className="text-[13px] text-gray-500 mt-1.5">
            Manage court reservations, time slots, and payment verification.
          </p>
        </div>
        <button className="btn btn-primary gap-2 flex-shrink-0 mt-0.5" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Booking
        </button>
      </div>

      {/* ── Table card ── */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button className="btn btn-secondary text-[12px] px-3 py-1.5 gap-2">
              <Calendar size={13} /> Today - Oct 24, 2025
            </button>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Filter by court or player…"
              className="form-input pl-7 w-52 text-[12px]" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th><th>Member Name</th><th>Sport / Facility</th>
                <th>Time Slot</th><th>Payment / Fee</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id}>
                  <td className="font-mono text-[12px] text-gray-500 whitespace-nowrap">{b.id}</td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-900">{b.member}</span>
                      {b.verified && (
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">✓</span>
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
                  <td>
                    <span className="inline-flex px-2.5 py-1 rounded text-[11px] font-semibold" style={b.ss}>
                      {b.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Printer size={14} /></button>
                      <button className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"><Pencil size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <p className="text-[12px] text-gray-500">Showing 1 to 5 of 89 entries • Auto-refresh every 30s</p>
          <div className="flex items-center gap-1">
            <button className="btn btn-secondary text-[12px] px-3.5 py-1.5">Previous</button>
            <button className="btn btn-primary  text-[12px] px-3.5 py-1.5">1</button>
            <button className="btn btn-ghost   text-[12px] px-3.5 py-1.5 text-gray-600">2</button>
            <button className="btn btn-ghost   text-[12px] px-3.5 py-1.5 text-gray-600">3</button>
            <button className="btn btn-secondary text-[12px] px-3.5 py-1.5">Next</button>
          </div>
        </div>
      </div>

      {/* ── New Booking Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md shadow-xl animate-fade-in bg-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">New Booking</h2>
                <p className="text-[12px] text-gray-500 mt-0.5">Fill in slot and member details.</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded hover:bg-gray-100 text-gray-400 ml-4">
                <X size={16} />
              </button>
            </div>
            <form className="px-6 py-5 space-y-4" onSubmit={e => { e.preventDefault(); setShowModal(false) }}>
              <div><label className="form-label">Member Name</label><input className="form-input" placeholder="Search member…" required /></div>
              <div>
                <label className="form-label">Court</label>
                <select className="form-input">
                  <option>Court 1 - Indoor Tennis</option><option>Court 2 - Padel Beta</option>
                  <option>Court 3 - Badminton</option><option>Court 4 - Squash</option>
                  <option>Court 5 - Clay Tennis</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="form-label">Date</label><input className="form-input" type="date" defaultValue="2026-10-03" /></div>
                <div>
                  <label className="form-label">Time Slot</label>
                  <select className="form-input"><option>06:00–07:30</option><option>08:00–09:30</option><option>10:00–11:30</option></select>
                </div>
              </div>
              <div><label className="form-label">Fee (₹)</label><input className="form-input" type="number" placeholder="1200" /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" className="btn btn-secondary flex-1 justify-center py-2.5" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit"  className="btn btn-primary  flex-1 justify-center py-2.5">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
