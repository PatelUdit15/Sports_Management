import { HelpCircle, Plus } from 'lucide-react'

const enquiries = [
  { id:'#ENQ-201', name:'Arjun Singh',    phone:'+91 99001 00001', sport:'Tennis',    type:'Trial Request',    date:'24 Oct 2026', status:'New'       },
  { id:'#ENQ-202', name:'Meera Iyer',     phone:'+91 99002 00002', sport:'Badminton', type:'Membership Query', date:'23 Oct 2026', status:'Contacted' },
  { id:'#ENQ-203', name:'Sahil Bose',     phone:'+91 99003 00003', sport:'Squash',    type:'Trial Request',    date:'22 Oct 2026', status:'Converted' },
  { id:'#ENQ-204', name:'Divya Reddy',    phone:'+91 99004 00004', sport:'Tennis',    type:'VIP Trial',        date:'24 Oct 2026', status:'New'       },
  { id:'#ENQ-205', name:'Karan Malhotra', phone:'+91 99005 00005', sport:'Padel',     type:'Membership Query', date:'21 Oct 2026', status:'Contacted' },
]
const ss = { New:{bg:'#dbeafe',color:'#1e40af'}, Contacted:{bg:'#fef3c7',color:'#b45309'}, Converted:{bg:'#dcfce7',color:'#15803d'}, Closed:{bg:'#f3f4f6',color:'#374151'} }

export default function Enquiries() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Enquiries</h1>
          <p className="text-[13px] text-gray-500 mt-1.5">Track and follow up on membership and trial enquiries.</p>
        </div>
        <button className="btn btn-primary gap-2 flex-shrink-0 mt-0.5"><Plus size={15} /> Log Enquiry</button>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        {[{label:'Total Enquiries',value:'23',color:'#6b3fa0'},{label:'New',value:'8',color:'#2563eb'},{label:'Contacted',value:'11',color:'#d97706'},{label:'Converted',value:'4',color:'#16a34a'}].map(s => (
          <div key={s.label} className="card p-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-[26px] font-bold" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <HelpCircle size={16} className="text-gray-400" />
          <h2 className="text-[15px] font-bold text-gray-900">All Enquiries</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Sport</th><th>Type</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {enquiries.map(e => (
                <tr key={e.id}>
                  <td className="font-mono text-[12px] text-gray-500">{e.id}</td>
                  <td className="font-semibold text-gray-900">{e.name}</td>
                  <td className="font-mono text-[12px] text-gray-600 whitespace-nowrap">{e.phone}</td>
                  <td className="text-gray-600">{e.sport}</td>
                  <td className="text-gray-600">{e.type}</td>
                  <td className="text-[12px] text-gray-500 whitespace-nowrap">{e.date}</td>
                  <td><span className="badge text-[10px] font-bold" style={ss[e.status]}>{e.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
