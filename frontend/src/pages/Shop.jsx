import { ShoppingBag, Plus } from 'lucide-react'

const products = [
  { name:'Badminton Racket Pro',      category:'Equipment',   stock:24, price:'₹3,500', status:'In Stock'     },
  { name:'Tennis Ball (Pack of 6)',   category:'Accessories', stock:80, price:'₹450',   status:'In Stock'     },
  { name:'Sports Grip Tape',          category:'Accessories', stock:5,  price:'₹120',   status:'Low Stock'    },
  { name:'Court Shoes - Size 9',      category:'Footwear',    stock:0,  price:'₹2,800', status:'Out of Stock' },
  { name:'Squash Racket Elite',       category:'Equipment',   stock:12, price:'₹4,200', status:'In Stock'     },
]
const ss = { 'In Stock':{bg:'#dcfce7',color:'#15803d'}, 'Low Stock':{bg:'#fef3c7',color:'#b45309'}, 'Out of Stock':{bg:'#fee2e2',color:'#dc2626'} }

export default function Shop() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">Pro Shop</h1>
          <p className="text-[13px] text-gray-500 mt-1.5">Manage sports equipment, accessories, and inventory stock.</p>
        </div>
        <button className="btn btn-primary gap-2 flex-shrink-0 mt-0.5"><Plus size={15} /> Add Product</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[{label:'Total Products',value:'48',color:'#6b3fa0'},{label:'Low Stock Items',value:'5',color:'#d97706'},{label:"Today's Sales",value:'₹12,400',color:'#16a34a'}].map(s => (
          <div key={s.label} className="card p-6">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{s.label}</div>
            <div className="text-[26px] font-bold" style={{color:s.color}}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-gray-100">
          <ShoppingBag size={16} className="text-gray-400" />
          <h2 className="text-[15px] font-bold text-gray-900">Product Inventory</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr><th>Product</th><th>Category</th><th>Stock</th><th>Price</th><th>Status</th></tr></thead>
            <tbody>
              {products.map((p,i) => (
                <tr key={i}>
                  <td className="font-semibold text-gray-900">{p.name}</td>
                  <td className="text-gray-600">{p.category}</td>
                  <td className="font-mono text-gray-600">{p.stock}</td>
                  <td className="font-semibold text-gray-900">{p.price}</td>
                  <td><span className="badge text-[10px] font-bold" style={ss[p.status]}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
