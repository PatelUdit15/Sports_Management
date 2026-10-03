import { CreditCard } from 'lucide-react'

const transactions = [
  { id:'#TXN-5501', desc:'Membership Renewal - Gold', member:'Aarav Kapoor',   amount:'₹25,000', type:'Credit', date:'24 Oct 2026', status:'Settled' },
  { id:'#TXN-5502', desc:'Court Booking - Court 1',   member:'Karan Singhania',amount:'₹1,200',  type:'Credit', date:'24 Oct 2026', status:'Settled' },
  { id:'#TXN-5503', desc:'Pro Shop Purchase',          member:'Priya Sharma',  amount:'₹3,500',  type:'Credit', date:'23 Oct 2026', status:'Settled' },
  { id:'#TXN-5504', desc:'Cafe Order',                 member:'Rohan Nair',    amount:'₹380',    type:'Credit', date:'24 Oct 2026', status:'Settled' },
  { id:'#TXN-5505', desc:'Court Booking - Court 4',    member:'Devika Pillai', amount:'₹750',    type:'Credit', date:'24 Oct 2026', status:'Pending' },
]
const ss = { Settled:{bg:'#dcfce7',color:'#15803d'}, Pending:{bg:'#fef3c7',color:'#b45309'}, Failed:{bg:'#fee2e2',color:'#dc2626'} }

export default function Finance() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Finance</h1>
        <p className="text-[13px] text-gray-500 mt-1.5">Daily ledger, transactions, and financial reporting.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {[
          {label:"Today's Revenue",     value:'₹4,52,300',  color:'#16a34a'},
          {label:'Pending Settlements', value:'₹0',          color:'#6b3fa0'},
          {label:'Monthly Target',      value:'₹15,00,000', color:'#2563eb'},
          {label:'Expenses (MTD)',       value:'₹2,34,500',  color:'#d97706'},
        ].map(s => (
          <div key={s.label} className="card p-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-[24px] font-bold" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <CreditCard size={16} className="text-gray-400" />
          <h2 className="text-[15px] font-bold text-gray-900">Today's Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Txn ID</th><th>Description</th><th>Member</th><th>Amount</th><th>Type</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td className="font-mono text-[12px] text-gray-500">{t.id}</td>
                  <td className="font-semibold text-gray-900">{t.desc}</td>
                  <td className="text-gray-600">{t.member}</td>
                  <td className="font-semibold text-emerald-700">{t.amount}</td>
                  <td><span className="badge badge-info">{t.type}</span></td>
                  <td className="text-[12px] text-gray-500 whitespace-nowrap">{t.date}</td>
                  <td><span className="badge text-[10px] font-bold" style={ss[t.status]}>{t.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
