import { BadgeCheck, Plus } from 'lucide-react'

const staff = [
  { initials:'MV', name:'Marcus Vance',   role:'Ops Director',     dept:'Management', shift:'09:00–18:00', status:'On Duty'  },
  { initials:'SJ', name:'Sunita Joshi',   role:'Head Coach',       dept:'Training',   shift:'07:00–15:00', status:'On Duty'  },
  { initials:'RK', name:'Ramesh Kumar',   role:'Court Supervisor', dept:'Facilities', shift:'06:00–14:00', status:'On Duty'  },
  { initials:'AP', name:'Anjali Patel',   role:'Cafe Manager',     dept:'F&B',        shift:'08:00–17:00', status:'On Leave' },
  { initials:'VB', name:'Vivek Bhandari', role:'Front Desk',       dept:'Admin',      shift:'10:00–19:00', status:'On Duty'  },
]
const ss = { 'On Duty':{bg:'#dcfce7',color:'#15803d'}, 'On Leave':{bg:'#fef3c7',color:'#b45309'} }

export default function Staff() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Staff & HR</h1>
          <p className="text-[13px] text-gray-500 mt-1.5">Manage staff profiles, shifts, and attendance records.</p>
        </div>
        <button className="btn btn-primary gap-2 flex-shrink-0 mt-0.5"><Plus size={15} /> Add Staff</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[{label:'Total Staff',value:'18',color:'#6b3fa0'},{label:'On Duty Today',value:'14',color:'#16a34a'},{label:'On Leave',value:'4',color:'#d97706'}].map(s => (
          <div key={s.label} className="card p-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-[26px] font-bold" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <BadgeCheck size={16} className="text-gray-400" />
          <h2 className="text-[15px] font-bold text-gray-900">Staff Directory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Staff Member</th><th>Role</th><th>Department</th><th>Shift</th><th>Status</th></tr></thead>
            <tbody>
              {staff.map((s,i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                        style={{background:'var(--color-primary)'}}>{s.initials}</div>
                      <span className="font-semibold text-gray-900">{s.name}</span>
                    </div>
                  </td>
                  <td className="text-gray-600">{s.role}</td>
                  <td className="text-gray-600">{s.dept}</td>
                  <td className="font-mono text-[12px] text-gray-600">{s.shift}</td>
                  <td><span className="badge text-[10px] font-bold" style={ss[s.status]}>{s.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
