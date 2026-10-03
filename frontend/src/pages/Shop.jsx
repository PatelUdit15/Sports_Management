import { useState } from 'react'
import { Search, Plus, Pencil, Eye, Trash2, Package, AlertTriangle, XCircle, X, Filter } from 'lucide-react'

const productsData = [
  { id: 1, name: 'Premium Tennis Racket', category: 'Equipment', price: 4500, stock: 23, sku: 'EQ-001', image: '🎾' },
  { id: 2, name: 'Badminton Shuttlecock (Box)', category: 'Accessories', price: 350, stock: 45, sku: 'AC-012', image: '🏸' },
  { id: 3, name: 'Sports Water Bottle 750ml', category: 'Accessories', price: 299, stock: 8, sku: 'AC-023', image: '🍶' },
  { id: 4, name: 'Training Shoes Pro', category: 'Footwear', price: 3200, stock: 12, sku: 'FW-005', image: '👟' },
  { id: 5, name: 'Compression T-Shirt', category: 'Apparel', price: 899, stock: 34, sku: 'AP-008', image: '👕' },
  { id: 6, name: 'Gym Gloves (Pair)', category: 'Accessories', price: 450, stock: 3, sku: 'AC-031', image: '🧤' },
  { id: 7, name: 'Yoga Mat Premium', category: 'Equipment', price: 1200, stock: 0, sku: 'EQ-015', image: '🧘' },
  { id: 8, name: 'Squash Ball (Set of 3)', category: 'Accessories', price: 250, stock: 18, sku: 'AC-042', image: '⚫' },
  { id: 9, name: 'Sweatband Set', category: 'Accessories', price: 199, stock: 56, sku: 'AC-050', image: '💪' },
  { id: 10, name: 'Cricket Bat English Willow', category: 'Equipment', price: 8500, stock: 5, sku: 'EQ-022', image: '🏏' },
  { id: 11, name: 'Table Tennis Paddle Pro', category: 'Equipment', price: 1800, stock: 14, sku: 'EQ-030', image: '🏓' },
  { id: 12, name: 'Sports Bag Large', category: 'Accessories', price: 1500, stock: 7, sku: 'AC-060', image: '🎒' },
]

const ordersData = [
  { id: 'ORD-001', customer: 'Arjun Mehta', items: 3, total: 5049, status: 'Delivered', date: '02 Oct 2026' },
  { id: 'ORD-002', customer: 'Priya Sharma', items: 1, total: 4500, status: 'Processing', date: '02 Oct 2026' },
  { id: 'ORD-003', customer: 'Rahul Verma', items: 2, total: 1149, status: 'Delivered', date: '01 Oct 2026' },
  { id: 'ORD-004', customer: 'Sneha Patel', items: 1, total: 3200, status: 'Shipped', date: '01 Oct 2026' },
  { id: 'ORD-005', customer: 'Karan Singh', items: 4, total: 2098, status: 'Pending', date: '30 Sep 2026' },
  { id: 'ORD-006', customer: 'Walk-in Customer', items: 2, total: 649, status: 'Delivered', date: '30 Sep 2026' },
]

const stockColor = (stock) => {
  if (stock === 0) return 'text-[var(--color-danger)] bg-[var(--color-danger-light)]'
  if (stock <= 5) return 'text-[#92400E] bg-[var(--color-warning-light)]'
  if (stock <= 10) return 'text-[var(--color-warning)] bg-[var(--color-warning-light)]'
  return 'text-[var(--color-success)] bg-[var(--color-success-light)]'
}

const orderStatusBadge = (status) => ({
  Delivered: 'badge-success',
  Processing: 'badge-info',
  Shipped: 'badge-primary',
  Pending: 'badge-warning',
}[status] || 'badge-info')

export default function Shop() {
  const [activeTab, setActiveTab] = useState('products')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const categories = ['All', ...new Set(productsData.map(p => p.category))]
  const filtered = productsData.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'All' || p.category === categoryFilter
    return matchSearch && matchCategory
  })

  const totalProducts = productsData.length
  const lowStock = productsData.filter(p => p.stock > 0 && p.stock <= 10).length
  const outOfStock = productsData.filter(p => p.stock === 0).length
  const totalValue = productsData.reduce((sum, p) => sum + p.price * p.stock, 0)

  const tabs = ['Products', 'Orders', 'Stock Alerts']

  return (
    <div className="space-y-4 animate-fade-in">
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

      {activeTab === 'products' && (
        <>
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="form-input pl-9 text-[13px]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="form-input w-auto text-[13px]"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              <Plus size={14} /> Add Product
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((product) => (
              <div key={product.id} className="card p-4 hover:shadow-md transition-shadow">
                <div className="w-full h-24 bg-[var(--color-bg)] rounded flex items-center justify-center text-4xl mb-3">
                  {product.image}
                </div>
                <div className="text-[11px] text-[var(--color-text-muted)] mb-1">{product.sku}</div>
                <div className="text-[13px] font-medium text-[var(--color-text)] mb-1 truncate">{product.name}</div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge badge-primary">{product.category}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[15px] font-bold text-[var(--color-text)]">₹{product.price.toLocaleString()}</span>
                  <span className={`badge ${stockColor(product.stock)}`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[var(--color-border-light)]">
                  <button className="flex-1 py-1.5 rounded text-[12px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors flex items-center justify-center gap-1">
                    <Eye size={12} /> View
                  </button>
                  <button className="flex-1 py-1.5 rounded text-[12px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors flex items-center justify-center gap-1">
                    <Pencil size={12} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Bar */}
          <div className="card p-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[var(--color-primary-light)] flex items-center justify-center">
                  <Package size={16} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">Total Products</div>
                  <div className="text-[15px] font-bold">{totalProducts}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[var(--color-warning-light)] flex items-center justify-center">
                  <AlertTriangle size={16} className="text-[var(--color-warning)]" />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">Low Stock</div>
                  <div className="text-[15px] font-bold">{lowStock}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[var(--color-danger-light)] flex items-center justify-center">
                  <XCircle size={16} className="text-[var(--color-danger)]" />
                </div>
                <div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">Out of Stock</div>
                  <div className="text-[15px] font-bold">{outOfStock}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[var(--color-success-light)] flex items-center justify-center">
                  <span className="text-[var(--color-success)] font-bold text-[13px]">₹</span>
                </div>
                <div>
                  <div className="text-[11px] text-[var(--color-text-muted)]">Total Value</div>
                  <div className="text-[15px] font-bold">₹{totalValue.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'orders' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ordersData.map((order) => (
                  <tr key={order.id}>
                    <td className="font-medium text-[var(--color-primary)]">{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td className="font-medium">₹{order.total.toLocaleString()}</td>
                    <td><span className={`badge ${orderStatusBadge(order.status)}`}>{order.status}</span></td>
                    <td className="text-[var(--color-text-secondary)]">{order.date}</td>
                    <td>
                      <button className="p-1.5 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-info)]">
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'stock-alerts' && (
        <div className="space-y-3">
          {productsData.filter(p => p.stock <= 10).map((product) => (
            <div key={product.id} className={`card p-4 border-l-4 ${product.stock === 0 ? 'border-l-[var(--color-danger)]' : 'border-l-[var(--color-warning)]'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{product.image}</span>
                  <div>
                    <div className="text-[13px] font-medium text-[var(--color-text)]">{product.name}</div>
                    <div className="text-[12px] text-[var(--color-text-muted)]">{product.sku} · {product.category}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`badge ${stockColor(product.stock)}`}>
                    {product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}
                  </span>
                  <div className="mt-2">
                    <button className="btn-secondary text-[11px] py-1 px-3">Reorder</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="card w-full max-w-lg p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[16px] font-semibold text-[var(--color-text)]">Add Product</h2>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]"><X size={16} /></button>
            </div>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowModal(false) }}>
              <div>
                <label className="form-label">Product Name</label>
                <input className="form-input" placeholder="e.g. Premium Tennis Racket" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input">
                    <option>Equipment</option>
                    <option>Accessories</option>
                    <option>Apparel</option>
                    <option>Footwear</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">SKU</label>
                  <input className="form-input" placeholder="EQ-001" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Price (₹)</label>
                  <input className="form-input" type="number" placeholder="0" />
                </div>
                <div>
                  <label className="form-label">Stock Quantity</label>
                  <input className="form-input" type="number" placeholder="0" />
                </div>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={2} placeholder="Product description..." />
              </div>
              <div className="flex items-center gap-3 pt-2 justify-end">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
