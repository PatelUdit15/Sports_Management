import { useState } from 'react'
import { Plus, ChevronLeft, ChevronRight, X, Calendar, List } from 'lucide-react'

const courts = [
  { id: 1, name: 'Court 1', sport: 'Badminton', status: 'Available' },
  { id: 2, name: 'Court 2', sport: 'Badminton', status: 'Occupied' },
  { id: 3, name: 'Court 3', sport: 'Tennis', status: 'Available' },
  { id: 4, name: 'Court 4', sport: 'Squash', status: 'Maintenance' },
  { id: 5, name: 'Court 5', sport: 'Tennis', status: 'Available' },
  { id: 6, name: 'Court 6', sport: 'Badminton', status: 'Occupied' },
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const hours = Array.from({ length: 16 }, (_, i) => i + 6) // 6 AM to 9 PM

const bookings = [
  { day: 0, startHour: 6, endHour: 7, member: 'Arjun M.', court: 'Court 1', status: 'confirmed' },
  { day: 0, startHour: 8, endHour: 9.5, member: 'Priya S.', court: 'Court 3', status: 'confirmed' },
  { day: 1, startHour: 7, endHour: 8, member: 'Rahul V.', court: 'Court 2', status: 'pending' },
  { day: 1, startHour: 10, endHour: 11, member: 'Sneha P.', court: 'Court 1', status: 'confirmed' },
  { day: 2, startHour: 14, endHour: 15, member: 'Karan S.', court: 'Court 5', status: 'confirmed' },
  { day: 2, startHour: 18, endHour: 19, member: 'Vikram Y.', court: 'Court 3', status: 'pending' },
  { day: 3, startHour: 6, endHour: 7.5, member: 'Neha G.', court: 'Court 1', status: 'confirmed' },
  { day: 3, startHour: 16, endHour: 17, member: 'Rohan K.', court: 'Court 6', status: 'confirmed' },
  { day: 4, startHour: 9, endHour: 10, member: 'Ananya J.', court: 'Court 2', status: 'confirmed' },
  { day: 4, startHour: 19, endHour: 20, member: 'Divya N.', court: 'Court 4', status: 'pending' },
  { day: 5, startHour: 7, endHour: 9, member: 'Arjun M.', court: 'Court 1', status: 'confirmed' },
  { day: 5, startHour: 11, endHour: 12, member: 'Priya S.', court: 'Court 5', status: 'confirmed' },
  { day: 6, startHour: 8, endHour: 9, member: 'Rahul V.', court: 'Court 3', status: 'confirmed' },
  { day: 6, startHour: 15, endHour: 16, member: 'Sneha P.', court: 'Court 2', status: 'pending' },
]

const statusColor = (status) => ({
  Available: 'text-[var(--color-success)] bg-[var(--color-success-light)]',
  Occupied: 'text-[var(--color-danger)] bg-[var(--color-danger-light)]',
  Maintenance: 'text-[var(--color-text-muted)] bg-gray-100',
}[status])

export default function CourtBookings() {
  const [view, setView] = useState('calendar')
  const [showModal, setShowModal] = useState(false)

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          {/* Date Nav */}
          <div className="flex items-center gap-2">
            <button className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]">
              <ChevronLeft size={14} />
            </button>
            <span className="text-[13px] font-medium text-[var(--color-text)] min-w-[140px] text-center">
              29 Sep – 05 Oct 2026
            </span>
            <button className="p-1.5 rounded border border-[var(--color-border)] hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]">
              <ChevronRight size={14} />
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex rounded border border-[var(--color-border)] overflow-hidden">
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors ${
                view === 'calendar' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
              }`}
            >
              <Calendar size={12} /> Calendar
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium transition-colors ${
                view === 'list' ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]'
              }`}
            >
              <List size={12} /> List
            </button>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> New Booking
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Calendar Grid */}
        <div className="card lg:col-span-3 overflow-hidden">
          {view === 'calendar' ? (
            <div className="overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header Row */}
                <div className="grid grid-cols-8 border-b border-[var(--color-border)]">
                  <div className="p-3 text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider border-r border-[var(--color-border)]">
                    Time
                  </div>
                  {days.map((day) => (
                    <div key={day} className="p-3 text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider text-center border-r border-[var(--color-border)] last:border-r-0">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Time Rows */}
                {hours.map((hour) => (
                  <div key={hour} className="grid grid-cols-8 border-b border-[var(--color-border-light)] last:border-b-0">
                    <div className="p-2 text-[11px] text-[var(--color-text-muted)] border-r border-[var(--color-border)] flex items-start justify-end pr-3">
                      {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                    </div>
                    {days.map((_, dayIdx) => {
                      const booking = bookings.find(b => b.day === dayIdx && b.startHour === hour)
                      return (
                        <div key={dayIdx} className="p-1 border-r border-[var(--color-border-light)] last:border-r-0 min-h-[40px] relative">
                          {booking && (
                            <div
                              className={`rounded px-2 py-1 text-[10px] leading-tight cursor-pointer transition-opacity hover:opacity-80 ${
                                booking.status === 'confirmed'
                                  ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20'
                                  : 'bg-[var(--color-warning-light)] text-[#92400E] border border-[var(--color-warning)]/20'
                              }`}
                              style={{
                                height: `${(booking.endHour - booking.startHour) * 40 - 4}px`,
                              }}
                            >
                              <div className="font-medium truncate">{booking.member}</div>
                              <div className="truncate opacity-75">{booking.court}</div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* List View */
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Court</th>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b, i) => (
                    <tr key={i}>
                      <td className="font-medium">{b.member}</td>
                      <td>{b.court}</td>
                      <td>{days[b.day]}</td>
                      <td>{`${b.startHour > 12 ? b.startHour - 12 : b.startHour}${b.startHour >= 12 ? 'PM' : 'AM'} - ${b.endHour > 12 ? b.endHour - 12 : b.endHour}${b.endHour >= 12 ? 'PM' : 'AM'}`}</td>
                      <td>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-success' : 'badge-warning'}`}>
                          {b.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Court Status Panel */}
        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="text-[13px] font-semibold text-[var(--color-text)] mb-3">Court Status</h3>
            <div className="space-y-2">
              {courts.map((court) => (
                <div key={court.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border-light)] last:border-b-0">
                  <div>
                    <div className="text-[13px] font-medium text-[var(--color-text)]">{court.name}</div>
                    <div className="text-[11px] text-[var(--color-text-muted)]">{court.sport}</div>
                  </div>
                  <span className={`badge ${statusColor(court.status)}`}>
                    {court.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="card p-4">
            <h3 className="text-[13px] font-semibold text-[var(--color-text)] mb-3">This Week</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--color-text-secondary)]">Total Bookings</span>
                <span className="font-semibold">{bookings.length}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--color-text-secondary)]">Confirmed</span>
                <span className="font-semibold text-[var(--color-success)]">{bookings.filter(b => b.status === 'confirmed').length}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--color-text-secondary)]">Pending</span>
                <span className="font-semibold text-[var(--color-warning)]">{bookings.filter(b => b.status === 'pending').length}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-[var(--color-text-secondary)]">Courts Available</span>
                <span className="font-semibold">{courts.filter(c => c.status === 'Available').length}/{courts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="card w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)]">New Booking</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                <X size={16} />
              </button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false) }}>
              <div>
                <label className="form-label">Court</label>
                <select className="form-input">
                  {courts.filter(c => c.status === 'Available').map(c => (
                    <option key={c.id}>{c.name} ({c.sport})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Member</label>
                <input className="form-input" placeholder="Search member..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Date</label>
                  <input className="form-input" type="date" />
                </div>
                <div>
                  <label className="form-label">Start Time</label>
                  <input className="form-input" type="time" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">End Time</label>
                  <input className="form-input" type="time" />
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-input">
                    <option>Regular</option>
                    <option>Coaching</option>
                    <option>Tournament</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} placeholder="Optional notes..." />
              </div>
              <div className="flex items-center gap-3 pt-2 justify-end">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Book Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
