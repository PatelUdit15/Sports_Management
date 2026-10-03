import { Coffee, Plus } from 'lucide-react'

const orders = [
  { id:'#ORD-101', item:'Cold Brew Coffee + Sandwich', member:'Aarav Kapoor',  time:'09:15 AM', amount:'₹380', status:'Served'    },
  { id:'#ORD-102', item:'Protein Shake',               member:'Priya Sharma',  time:'10:02 AM', amount:'₹180', status:'Preparing' },
  { id:'#ORD-103', item:'Fruit Bowl + Green Tea',      member:'Rohan Nair',    time:'10:45 AM', amount:'₹220', status:'Served'    },
  { id:'#ORD-104', item:'Energy Bar Pack',             member:'Walk-in',       time:'11:20 AM', amount:'₹120', status:'Pending'   },
]
const ss = { Served:{bg:'#dcfce7',color:'#15803d'}, Preparing:{bg:'#dbeafe',color:'#1e40af'}, Pending:{bg:'#fef3c7',color:'#b45309'} }

export default function Cafe() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Cafe / Bar</h1>
          <p className="text-[13px] text-gray-500 mt-1.5">Manage food and beverage orders for club members.</p>
        </div>
        <button className="btn btn-primary gap-2 flex-shrink-0 mt-0.5"><Plus size={15} /> New Order</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[{label:"Today's Orders",value:'34',color:'#6b3fa0'},{label:"Today's Revenue",value:'₹8,640',color:'#16a34a'},{label:'Pending Orders',value:'3',color:'#d97706'}].map(s => (
          <div key={s.label} className="card p-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-[26px] font-bold" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <Coffee size={16} className="text-gray-400" />
          <h2 className="text-[15px] font-bold text-gray-900">Today's Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Order ID</th><th>Items</th><th>Member</th><th>Time</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td className="font-mono text-[12px] text-gray-500">{o.id}</td>
                  <td className="font-semibold text-gray-900">{o.item}</td>
                  <td className="text-gray-600">{o.member}</td>
                  <td className="font-mono text-[12px] text-gray-600">{o.time}</td>
                  <td className="font-semibold text-gray-900">{o.amount}</td>
                  <td><span className="badge text-[10px] font-bold" style={ss[o.status]}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
