import { Building2, Plus } from 'lucide-react'

const clients = [
  { name:'TechCorp India Pvt Ltd',  contact:'Rajiv Nair',    members:12, plan:'Corporate Gold',   status:'Active'  },
  { name:'Apex Fitness Solutions',  contact:'Pooja Menon',   members:8,  plan:'Corporate Silver', status:'Active'  },
  { name:'Global Sports Academy',   contact:'Arun Mathews',  members:25, plan:'Academy Partner',  status:'Active'  },
  { name:'Metro School of Sports',  contact:'Lakshmi Iyer',  members:40, plan:'School Tie-up',    status:'Active'  },
  { name:'Prestige Wellness Club',  contact:'Harish Sharma', members:6,  plan:'Corporate Silver', status:'Expired' },
]
const ss = { Active:{bg:'#dcfce7',color:'#15803d'}, Expired:{bg:'#fee2e2',color:'#dc2626'} }

export default function Clients() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Clients</h1>
          <p className="text-[13px] text-gray-500 mt-1.5">Manage corporate clients, academies, and institutional partnerships.</p>
        </div>
        <button className="btn btn-primary gap-2 flex-shrink-0 mt-0.5"><Plus size={15} /> Add Client</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[{label:'Total Clients',value:'18',color:'#6b3fa0'},{label:'Corporate Members',value:'91',color:'#2563eb'},{label:'Renewals This Month',value:'4',color:'#d97706'}].map(s => (
          <div key={s.label} className="card p-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-[26px] font-bold" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <Building2 size={16} className="text-gray-400" />
          <h2 className="text-[15px] font-bold text-gray-900">Client Accounts</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Organisation</th><th>Contact Person</th><th>Members</th><th>Plan</th><th>Status</th></tr></thead>
            <tbody>
              {clients.map((c,i) => (
                <tr key={i}>
                  <td className="font-semibold text-gray-900">{c.name}</td>
                  <td className="text-gray-600">{c.contact}</td>
                  <td className="font-mono text-gray-600">{c.members}</td>
                  <td><span className="badge badge-purple">{c.plan}</span></td>
                  <td><span className="badge text-[10px] font-bold" style={ss[c.status]}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
