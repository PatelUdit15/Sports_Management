import { useState } from 'react'
import { Search, Plus, X, Clock, ChefHat, UtensilsCrossed, CreditCard } from 'lucide-react'

const menuItems = [
  { id: 1, name: 'Chicken Club Sandwich', category: 'Snacks', price: 250, available: true, emoji: '🥪' },
  { id: 2, name: 'Margherita Pizza', category: 'Snacks', price: 350, available: true, emoji: '🍕' },
  { id: 3, name: 'Caesar Salad', category: 'Healthy', price: 200, available: true, emoji: '🥗' },
  { id: 4, name: 'Fresh Lime Soda', category: 'Beverages', price: 80, available: true, emoji: '🍋' },
  { id: 5, name: 'Cold Coffee', category: 'Beverages', price: 120, available: true, emoji: '☕' },
  { id: 6, name: 'Protein Shake', category: 'Beverages', price: 180, available: false, emoji: '🥤' },
  { id: 7, name: 'Paneer Tikka', category: 'Snacks', price: 280, available: true, emoji: '🧀' },
  { id: 8, name: 'Masala Chai', category: 'Beverages', price: 40, available: true, emoji: '🍵' },
  { id: 9, name: 'Grilled Chicken', category: 'Meals', price: 380, available: true, emoji: '🍗' },
  { id: 10, name: 'Veg Biryani', category: 'Meals', price: 220, available: true, emoji: '🍚' },
  { id: 11, name: 'Mango Smoothie', category: 'Beverages', price: 150, available: true, emoji: '🥭' },
  { id: 12, name: 'French Fries', category: 'Snacks', price: 120, available: true, emoji: '🍟' },
]

const tables = [
  { id: 1, name: 'Table 1', seats: 4, status: 'Available' },
  { id: 2, name: 'Table 2', seats: 4, status: 'Occupied' },
  { id: 3, name: 'Table 3', seats: 6, status: 'Available' },
  { id: 4, name: 'Table 4', seats: 2, status: 'Occupied' },
  { id: 5, name: 'Table 5', seats: 4, status: 'Reserved' },
  { id: 6, name: 'Table 6', seats: 8, status: 'Available' },
]

const kitchenOrders = [
  { id: 'KO-01', table: 'Table 2', items: ['Chicken Club Sandwich', 'Cold Coffee'], time: '5 min ago', status: 'Preparing' },
  { id: 'KO-02', table: 'Table 4', items: ['Margherita Pizza', 'Fresh Lime Soda x2'], time: '12 min ago', status: 'Ready' },
  { id: 'KO-03', table: 'Counter', items: ['Masala Chai x3'], time: '2 min ago', status: 'New' },
  { id: 'KO-04', table: 'Table 2', items: ['French Fries', 'Mango Smoothie'], time: '8 min ago', status: 'Preparing' },
]

const tableStatusColor = (status) => ({
  Available: 'badge-success',
  Occupied: 'badge-danger',
  Reserved: 'badge-warning',
}[status])

const orderStatusColor = (status) => ({
  New: 'badge-info',
  Preparing: 'badge-warning',
  Ready: 'badge-success',
}[status])

export default function Cafe() {
  const [activeTab, setActiveTab] = useState('menu')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [cart, setCart] = useState([])

  const categories = ['All', ...new Set(menuItems.map(i => i.category))]
  const filteredMenu = menuItems.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === 'All' || i.category === categoryFilter
    return matchSearch && matchCategory
  })

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id)
      if (existing) return prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(c => c.id !== id))
  }

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.qty, 0)

  const tabs = ['Menu', 'Tables', 'Kitchen Orders']

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

      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Menu Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                <input type="text" placeholder="Search menu..." className="form-input pl-9 text-[13px]" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <select className="form-input w-auto text-[13px]" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredMenu.map((item) => (
                <button
                  key={item.id}
                  onClick={() => item.available && addToCart(item)}
                  disabled={!item.available}
                  className={`card p-3 text-left transition-all hover:shadow-md ${!item.available ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="text-2xl mb-2">{item.emoji}</div>
                  <div className="text-[13px] font-medium text-[var(--color-text)] truncate">{item.name}</div>
                  <div className="text-[11px] text-[var(--color-text-muted)] mb-1">{item.category}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[var(--color-text)]">₹{item.price}</span>
                    {!item.available && <span className="badge badge-danger">Unavailable</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Cart / Order Panel */}
          <div className="card p-4 h-fit sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard size={16} className="text-[var(--color-primary)]" />
              <h3 className="text-[14px] font-semibold text-[var(--color-text)]">Current Order</h3>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-[var(--color-text-muted)]">
                <UtensilsCrossed size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-[13px]">No items added yet</p>
                <p className="text-[11px]">Tap menu items to add</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-[var(--color-border-light)]">
                      <div className="flex-1">
                        <div className="text-[13px] font-medium">{item.name}</div>
                        <div className="text-[11px] text-[var(--color-text-muted)]">₹{item.price} × {item.qty}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold">₹{item.price * item.qty}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)]">
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--color-border)] pt-3 mb-3">
                  <div className="flex justify-between text-[14px] font-bold">
                    <span>Total</span>
                    <span>₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <select className="form-input text-[13px]">
                    <option>Select Table</option>
                    {tables.filter(t => t.status !== 'Occupied').map(t => (
                      <option key={t.id}>{t.name} ({t.seats} seats)</option>
                    ))}
                    <option>Counter / Takeaway</option>
                  </select>
                  <button className="btn-primary w-full justify-center">Place Order</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {activeTab === 'tables' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {tables.map((table) => (
            <div key={table.id} className={`card p-4 text-center ${table.status === 'Occupied' ? 'border-[var(--color-danger)]/30' : ''}`}>
              <div className="text-3xl mb-2">🪑</div>
              <div className="text-[14px] font-semibold text-[var(--color-text)]">{table.name}</div>
              <div className="text-[12px] text-[var(--color-text-muted)] mb-2">{table.seats} seats</div>
              <span className={`badge ${tableStatusColor(table.status)}`}>{table.status}</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kitchen-orders' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kitchenOrders.map((order) => (
            <div key={order.id} className={`card p-4 border-l-4 ${
              order.status === 'New' ? 'border-l-[var(--color-info)]' :
              order.status === 'Preparing' ? 'border-l-[var(--color-warning)]' :
              'border-l-[var(--color-success)]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold text-[var(--color-primary)]">{order.id}</span>
                <span className={`badge ${orderStatusColor(order.status)}`}>{order.status}</span>
              </div>
              <div className="text-[13px] font-medium text-[var(--color-text)] mb-1">{order.table}</div>
              <ul className="text-[12px] text-[var(--color-text-secondary)] mb-2 space-y-0.5">
                {order.items.map((item, i) => <li key={i}>• {item}</li>)}
              </ul>
              <div className="flex items-center gap-1 text-[11px] text-[var(--color-text-muted)]">
                <Clock size={10} /> {order.time}
              </div>
              {order.status !== 'Ready' && (
                <button className="btn-primary w-full justify-center mt-3 text-[12px] py-1.5">
                  {order.status === 'New' ? 'Start Preparing' : 'Mark as Ready'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
