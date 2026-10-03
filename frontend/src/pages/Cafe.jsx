import React, { useEffect, useState } from 'react';
import {
  Coffee,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Flame,
  Layers,
  Edit2,
  Trash2,
  Image as ImageIcon,
  DollarSign,
  Check,
  X,
  RefreshCw,
  AlertTriangle,
  Utensils,
  ChevronRight,
  Send,
  Zap,
  Tag,
  Eye,
  ShoppingBag,
  TrendingUp,
  Upload,
} from 'lucide-react';
import { cafeService } from '../services/cafeService';
import { useAuth } from '../context/AuthContext';

const DEFAULT_FOOD_IMAGE = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f8f5f8"/><g transform="translate(150,140)"><circle cx="50" cy="50" r="40" fill="#d8c5d4"/><path d="M30 65 Q50 30 70 65" fill="none" stroke="#714B67" stroke-width="4"/><circle cx="50" cy="25" r="6" fill="#714B67"/></g><text x="200" y="270" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="600" fill="#8d6883">Fresh Food &amp; Drink</text></svg>');

const CATEGORIES = ['All', 'Combos & Deals', 'Beverages', 'Healthy Bowls', 'Sandwiches & Snacks', 'Desserts'];

const DIET_TAGS = [
  { value: 'VEG', label: 'Vegetarian', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'NON_VEG', label: 'Non-Vegetarian', color: 'bg-red-50 text-red-700 border-red-200' },
  { value: 'VEGAN', label: 'Vegan', color: 'bg-green-50 text-green-700 border-green-200' },
  { value: 'HIGH_PROTEIN', label: 'High Protein', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

export default function Cafe() {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const isCafeManager = isSuperAdmin?.() || hasRole?.('BAR_CAFETERIA_STAFF') || hasRole?.('HR_MANAGER');

  // Navigation tabs
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'menu'

  // Data state
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    preparingCount: 0,
    servedCount: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [orderFilter, setOrderFilter] = useState('All'); // 'All' | 'PREPARING' | 'SERVED'
  const [orderSearch, setOrderSearch] = useState('');
  const [menuFilter, setMenuFilter] = useState('All'); // 'All' | category
  const [menuSearch, setMenuSearch] = useState('');

  // Add / Edit Modal state
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Combos & Deals',
    type: 'COMBO', // 'SINGLE' | 'COMBO'
    comboItems: '',
    price: '',
    image: '',
    description: '',
    dietTag: 'HIGH_PROTEIN',
    isAvailable: true,
  });
  const [savingItem, setSavingItem] = useState(false);

  // Delete Confirmation Modal state
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating state for orders
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [simulating, setSimulating] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [menuRes, orderRes] = await Promise.all([
        cafeService.getMenuItems(),
        cafeService.getOrders(),
      ]);

      if (menuRes && menuRes.success) {
        setMenuItems(menuRes.items || []);
      }
      if (orderRes && orderRes.success) {
        setOrders(orderRes.orders || []);
        if (orderRes.metrics) setMetrics(orderRes.metrics);
      }
    } catch (err) {
      console.error('Failed to load Cafe data:', err);
      showToast(err.message || 'Failed to load cafe data', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
  };

  // Open Add Item/Combo Modal
  const handleOpenAdd = (defaultType = 'COMBO') => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: defaultType === 'COMBO' ? 'Combos & Deals' : 'Beverages',
      type: defaultType,
      comboItems: defaultType === 'COMBO' ? '1x Cold Brew Coffee + 1x Grilled Sandwich + 1x Protein Bar' : '',
      price: '',
      image: '',
      description: '',
      dietTag: defaultType === 'COMBO' ? 'HIGH_PROTEIN' : 'VEG',
      isAvailable: true,
    });
    setShowItemModal(true);
  };

  // Open Edit Item Modal
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      type: item.type,
      comboItems: item.comboItems || '',
      price: item.price,
      image: item.image || '',
      description: item.description || '',
      dietTag: item.dietTag || 'VEG',
      isAvailable: item.isAvailable,
    });
    setShowItemModal(true);
  };

  // Compress food/drink image before saving to state to ensure high speed & low payload
  const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.85) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handle Picture File Upload (converts file to compressed base64 with instant preview)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WEBP).', 'error');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setFormData((prev) => ({ ...prev, image: compressed }));
      showToast('Picture uploaded successfully!', 'success');
    } catch {
      showToast('Error processing selected image.', 'error');
    }
  };

  // Save Item or Combo
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Please enter an item or combo name.', 'error');
      return;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      showToast('Please provide a valid price.', 'error');
      return;
    }
    if (formData.type === 'COMBO' && !formData.comboItems.trim()) {
      showToast('Please specify the items included in this combo.', 'error');
      return;
    }

    setSavingItem(true);
    try {
      if (editingItem) {
        // Update
        const res = await cafeService.updateMenuItem(editingItem.itemId || editingItem.id, formData);
        showToast(res.message || `Updated "${formData.name}" successfully!`, 'success');
      } else {
        // Create
        const res = await cafeService.createMenuItem(formData);
        showToast(res.message || `Added "${formData.name}" to cafe menu!`, 'success');
      }

      setShowItemModal(false);
      // Reload menu
      const updatedMenu = await cafeService.getMenuItems();
      if (updatedMenu?.success) setMenuItems(updatedMenu.items || []);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to save menu item', 'error');
    } finally {
      setSavingItem(false);
    }
  };

  // Toggle Item Availability
  const handleToggleAvailability = async (item) => {
    try {
      const res = await cafeService.toggleAvailability(item.itemId || item.id);
      setMenuItems((prev) =>
        prev.map((i) =>
          (i.itemId === item.itemId || i.id === item.id) ? { ...i, isAvailable: !i.isAvailable } : i
        )
      );
      showToast(res.message || `Availability updated for "${item.name}"`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update availability', 'error');
    }
  };

  // Confirm Delete Menu Item
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const target = itemToDelete;
    const deleteId = target.itemId || target.id;
    setDeleting(true);

    try {
      const res = await cafeService.deleteMenuItem(deleteId);
      // Optimistic delete
      setMenuItems((prev) => prev.filter((i) => i.itemId !== deleteId && i.id !== deleteId));
      setItemToDelete(null);
      showToast(`Removed "${target.name}" from cafe menu.`, 'success');

      // Refresh in background
      const updated = await cafeService.getMenuItems();
      if (updated?.success) setMenuItems(updated.items || []);
    } catch (err) {
      showToast(err.message || 'Failed to delete menu item', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Advance Order Status (e.g. PREPARING -> SERVED)
  const handleMarkAsServed = async (order) => {
    const targetId = order.orderId || order.id || order.dbId;
    setUpdatingOrderId(order.orderId || order.id);
    try {
      const res = await cafeService.updateOrderStatus(targetId, 'SERVED');

      // Optimistically update order status and recalculate revenue
      setOrders((prev) =>
        prev.map((o) =>
          (o.orderId === order.orderId || o.id === order.id)
            ? { ...o, status: 'SERVED', servedAt: new Date().toISOString() }
            : o
        )
      );

      const orderCost = parseFloat(order.totalAmount) || 0;
      setMetrics((prev) => ({
        ...prev,
        preparingCount: Math.max(0, prev.preparingCount - 1),
        servedCount: prev.servedCount + 1,
        totalRevenue: prev.totalRevenue + orderCost,
        todayRevenue: prev.todayRevenue + orderCost,
      }));

      showToast(res?.message || `Order ${order.orderId || targetId} marked as SERVED to member! 🎉`, 'success');
      
      // Refresh background orders
      const orderRes = await cafeService.getOrders();
      if (orderRes?.success) {
        setOrders(orderRes.orders || []);
        if (orderRes.metrics) setMetrics(orderRes.metrics);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to update order status';
      showToast(errMsg, 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Simulate an incoming order for live testing
  const handleSimulateOrder = async () => {
    setSimulating(true);
    try {
      const sampleCombos = menuItems.filter((i) => i.type === 'COMBO');
      const sampleSingles = menuItems.filter((i) => i.type === 'SINGLE');

      const item1 = sampleCombos[0] || { name: 'Post-Workout Fuel Combo', price: 420, type: 'COMBO' };
      const item2 = sampleSingles[0] || { name: 'Signature Nitro Cold Brew', price: 180, type: 'SINGLE' };

      const memberNames = ['Kavita Rao', 'Devansh Singhal', 'Ananya Patel', 'Tanya Mehra', 'Siddharth Joshi'];
      const locations = ['Court 2 Side Bench', 'Table 6 (Poolside)', 'Table 3 (Cafe)', 'Lounge Booth 1', 'Table 9'];

      const randomMember = memberNames[Math.floor(Math.random() * memberNames.length)];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];

      const res = await cafeService.simulateOrder({
        memberName: randomMember,
        deliveryLocation: randomLoc,
        items: [
          { name: item1.name, price: item1.price, qty: 1, type: item1.type },
          { name: item2.name, price: item2.price, qty: 1, type: item2.type },
        ],
        notes: 'Member placed order via Champions Club app',
      });

      showToast(`⚡ Incoming order received! Status: PREPARING`, 'success');

      // Refresh orders
      const orderRes = await cafeService.getOrders();
      if (orderRes?.success) {
        setOrders(orderRes.orders || []);
        if (orderRes.metrics) setMetrics(orderRes.metrics);
      }
    } catch (err) {
      showToast(err.message || 'Simulation failed', 'error');
    } finally {
      setSimulating(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = orderFilter === 'All' || o.status === orderFilter;
    const matchesSearch =
      !orderSearch.trim() ||
      o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.memberName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.deliveryLocation.toLowerCase().includes(orderSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Filtered menu
  const filteredMenu = menuItems.filter((m) => {
    const matchesCategory =
      menuFilter === 'All'
        ? true
        : menuFilter === 'Combos & Deals'
        ? m.type === 'COMBO'
        : m.category === menuFilter;

    const matchesSearch =
      !menuSearch.trim() ||
      m.name.toLowerCase().includes(menuSearch.toLowerCase()) ||
      m.description.toLowerCase().includes(menuSearch.toLowerCase()) ||
      (m.comboItems && m.comboItems.toLowerCase().includes(menuSearch.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const preparingOrders = orders.filter((o) => o.status === 'PREPARING');

  return (
    <div className="space-y-6 pb-12 animate-fade-in text-gray-900">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold transition-all transform animate-in slide-in-from-bottom-5 ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-[#2b1825] text-white border-[#4d2d44]'
          }`}
        >
          {toast.type === 'error' ? <AlertTriangle size={18} className="text-red-500" /> : <Check size={18} className="text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#2b1825] via-[#4d2d44] to-[#714B67] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-white/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold uppercase tracking-wider text-pink-200">
              <Coffee size={13} className="text-pink-300" />
              <span>Cafe &amp; Bar Operations</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Champions Sports Cafe &amp; Bar
            </h1>
            <p className="text-sm text-pink-100/80 max-w-xl">
              Curate athlete menus &amp; combo meals, track incoming kitchen orders in real-time, and manage served order revenue.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Simulate Incoming Order (Testing Flow) */}
            <button
              onClick={handleSimulateOrder}
              disabled={simulating}
              className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-pink-100 text-xs font-bold border border-white/20 transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              title="Simulate an incoming order from a member"
            >
              {simulating ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} className="text-amber-300" />}
              <span>Simulate Member Order</span>
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-sm"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
            </button>

            {/* Add Menu Item or Combo Button (Primary Action for Manager) */}
            <button
              onClick={() => handleOpenAdd('COMBO')}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-950 text-xs font-black transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Plus size={16} />
              <span>Add Food / Combo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Revenue & Kitchen KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
            <span>Total Realized Revenue</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            ₹{metrics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <span>From {metrics.servedCount} served orders</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
            <span>Today's Cafe Revenue</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-900">
            ₹{metrics.todayRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-500 font-medium mt-1">
            Avg order: ₹{metrics.averageOrderValue || 0}
          </div>
        </div>

        {/* Kitchen Preparing Queue */}
        <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-xs hover:border-amber-200 transition-all bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-700 mb-2">
            <span>Kitchen Queue (Preparing)</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 relative">
              <Clock size={16} />
              {metrics.preparingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />
              )}
            </div>
          </div>
          <div className="text-2xl font-black text-amber-800 flex items-center gap-2">
            <span>{metrics.preparingCount}</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
              In Kitchen
            </span>
          </div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            Waiting to be served to members
          </div>
        </div>

        {/* Total Served */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs hover:border-gray-200 transition-all">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-2">
            <span>Fulfilled Orders</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900">
            {metrics.servedCount}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">
            {menuItems.length} items on active menu
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center justify-between border-b border-gray-200/80 pb-1">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-[#714B67] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Clock size={16} />
            <span>Kitchen &amp; Orders History</span>
            {metrics.preparingCount > 0 && (
              <span className={`px-2 py-0.2 rounded-full text-xs font-black ${
                activeTab === 'orders' ? 'bg-amber-400 text-gray-900' : 'bg-amber-100 text-amber-800'
              }`}>
                {metrics.preparingCount} Prep
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'menu'
                ? 'bg-[#714B67] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Utensils size={16} />
            <span>Menu &amp; Combos Catalog</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold">
              {menuItems.length}
            </span>
          </button>
        </div>

        {activeTab === 'menu' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleOpenAdd('SINGLE')}
              className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 transition-all"
            >
              <Plus size={13} />
              <span>Single Item</span>
            </button>
            <button
              onClick={() => handleOpenAdd('COMBO')}
              className="px-3 py-1.5 rounded-xl bg-[#714B67] text-white text-xs font-bold hover:bg-[#57344f] flex items-center gap-1.5 transition-all shadow-xs"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>New Combo Deal</span>
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: KITCHEN QUEUE & PAST ORDERS HISTORY */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Active Kitchen Preparing Queue (If any orders are in PREPARING status) */}
          {preparingOrders.length > 0 && (
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/50 to-orange-500/10 rounded-3xl p-5 border border-amber-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                    <Flame size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-amber-950 flex items-center gap-2">
                      <span>Kitchen Active Queue</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-extrabold animate-pulse">
                        {preparingOrders.length} In Prep
                      </span>
                    </h2>
                    <p className="text-xs text-amber-800">
                      Orders currently being prepared in the kitchen. Hand over to member and click &quot;Mark as Served&quot;.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid of Preparing Orders */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preparingOrders.map((ord) => (
                  <div
                    key={ord.orderId}
                    className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-sm flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                        <span className="font-mono text-xs font-black text-gray-800">
                          {ord.orderId}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black tracking-wide uppercase flex items-center gap-1">
                          <Clock size={11} className="animate-spin" />
                          <span>Preparing</span>
                        </span>
                      </div>

                      <div className="mt-2.5 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-xs font-bold text-gray-900">{ord.memberName}</span>
                          <span className="text-[11px] font-semibold text-gray-500">{ord.deliveryLocation}</span>
                        </div>
                      </div>

                      {/* Items checklist */}
                      <div className="mt-3 p-2.5 bg-amber-50/50 rounded-xl border border-amber-100/60 space-y-1.5">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-gray-800 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                              <span>{it.qty || 1}x {it.name}</span>
                              {it.type === 'COMBO' && (
                                <span className="px-1.5 py-0.2 bg-purple-100 text-purple-800 text-[9px] font-bold rounded">
                                  Combo
                                </span>
                              )}
                            </span>
                            <span className="text-gray-500 font-mono">₹{(it.price * (it.qty || 1))}</span>
                          </div>
                        ))}
                      </div>

                      {ord.notes && (
                        <p className="mt-2 text-[11px] italic text-amber-900/80 bg-amber-50 p-1.5 rounded-lg">
                          &ldquo;{ord.notes}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Total</span>
                        <span className="text-sm font-black text-gray-900">₹{ord.totalAmount}</span>
                      </div>

                      {/* Mark as Served Action */}
                      <button
                        onClick={() => handleMarkAsServed(ord)}
                        disabled={updatingOrderId === ord.orderId}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
                      >
                        {updatingOrderId === ord.orderId ? (
                          <RefreshCw size={13} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                        <span>Mark as Served</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past Orders History Card */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
            {/* Table Filters & Search */}
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Coffee size={18} className="text-[#714B67]" />
                  <span>Past Orders &amp; Revenue History</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Complete audit log of cafe and beverage orders with member billing details
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Filter Buttons */}
                <div className="flex items-center p-1 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                  {['All', 'PREPARING', 'SERVED'].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                        orderFilter === st
                          ? 'bg-white text-gray-900 shadow-xs'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {st === 'All' ? 'All Orders' : st === 'PREPARING' ? 'Preparing' : 'Served'}
                    </button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by ID or member..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#714B67] w-48 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-5">Order ID</th>
                    <th className="py-3 px-5">Member &amp; Location</th>
                    <th className="py-3 px-5">Ordered Items / Combos</th>
                    <th className="py-3 px-5">Time Placed</th>
                    <th className="py-3 px-5">Amount</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-gray-400">
                        <Coffee size={32} className="mx-auto text-gray-300 mb-2" />
                        <p className="font-semibold">No orders matching this filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => {
                      const isServed = ord.status === 'SERVED';
                      return (
                        <tr key={ord.orderId} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-3.5 px-5 font-mono font-bold text-gray-900">
                            {ord.orderId}
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="font-bold text-gray-900">{ord.memberName}</div>
                            <div className="text-[11px] text-gray-500">{ord.deliveryLocation}</div>
                          </td>
                          <td className="py-3.5 px-5 max-w-xs">
                            <div className="space-y-1">
                              {ord.items.map((it, idx) => (
                                <span
                                  key={idx}
                                  className="inline-block mr-1.5 mb-1 px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium text-gray-700"
                                >
                                  {it.qty || 1}x {it.name}
                                  {it.type === 'COMBO' && ' (Combo)'}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 text-gray-500 font-mono text-[11px]">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <div className="text-[10px] text-gray-400">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="py-3.5 px-5 font-bold text-gray-900">
                            ₹{ord.totalAmount}
                          </td>
                          <td className="py-3.5 px-5">
                            {isServed ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                                <CheckCircle2 size={12} />
                                <span>Served</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                                <Clock size={12} className="animate-spin" />
                                <span>Preparing</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-5 text-right">
                            {!isServed ? (
                              <button
                                onClick={() => handleMarkAsServed(ord)}
                                disabled={updatingOrderId === ord.orderId}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-all disabled:opacity-50"
                              >
                                Mark Served
                              </button>
                            ) : (
                              <span className="text-[11px] text-gray-400 font-medium">Completed</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: MENU & COMBOS CATALOG */}
      {/* ============================================================== */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          {/* Menu Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMenuFilter(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                    menuFilter === cat
                      ? 'bg-[#714B67] text-white shadow-xs'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {cat === 'Combos & Deals' ? '🔥 Combos & Deals' : cat}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={menuSearch}
                onChange={(e) => setMenuSearch(e.target.value)}
                placeholder="Search food, drinks, combos..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#714B67] w-full sm:w-64 transition-all"
              />
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMenu.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-gray-100">
                <Utensils size={36} className="mx-auto text-gray-300 mb-2" />
                <h3 className="text-sm font-bold text-gray-800">No menu items found</h3>
                <p className="text-xs text-gray-500 mt-1">Try another category or add a new food item or combo.</p>
                <button
                  onClick={() => handleOpenAdd('COMBO')}
                  className="mt-4 px-4 py-2 rounded-xl bg-[#714B67] text-white text-xs font-bold"
                >
                  Add Food Item / Combo
                </button>
              </div>
            ) : (
              filteredMenu.map((item) => {
                const isCombo = item.type === 'COMBO';
                return (
                  <div
                    key={item.itemId || item.id}
                    className={`bg-white rounded-3xl border overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between ${
                      isCombo ? 'border-purple-200/80 ring-1 ring-purple-100' : 'border-gray-100'
                    } ${!item.isAvailable ? 'opacity-70' : ''}`}
                  >
                    <div>
                      {/* Image Header with Price & Badges */}
                      <div className="relative h-48 bg-gray-100 overflow-hidden">
                        <img
                          src={item.image || DEFAULT_FOOD_IMAGE}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = DEFAULT_FOOD_IMAGE;
                          }}
                        />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                          {isCombo ? (
                            <span className="px-2.5 py-1 rounded-full bg-purple-600 text-white text-[10px] font-black tracking-wider uppercase shadow-md flex items-center gap-1">
                              <Sparkles size={11} className="text-amber-300" />
                              <span>Combo Deal</span>
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold">
                              {item.category}
                            </span>
                          )}

                          {item.dietTag && (
                            <span className="px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-bold">
                              {item.dietTag.replace('_', ' ')}
                            </span>
                          )}
                        </div>

                        {/* Price Badge */}
                        <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-gray-900 font-black text-sm shadow-md border border-white/50">
                          ₹{item.price}
                        </div>

                        {/* Out of Stock banner */}
                        {!item.isAvailable && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="px-3 py-1 bg-red-600 text-white font-black text-xs uppercase tracking-wider rounded-lg">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-900 text-base leading-tight">
                            {item.name}
                          </h3>
                        </div>

                        {/* If Combo, display inclusions pill */}
                        {isCombo && item.comboItems && (
                          <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100 text-[11px] text-purple-900">
                            <span className="font-bold block text-purple-950 mb-0.5">Includes:</span>
                            <span className="font-medium leading-relaxed">{item.comboItems}</span>
                          </div>
                        )}

                        <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                          {item.description || 'Delicious freshly prepared dish served at Champions Club Cafe.'}
                        </p>
                      </div>
                    </div>

                    {/* Footer Controls: Availability Toggle, Edit, Delete */}
                    <div className="p-4 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
                      {/* Availability Toggle */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={item.isAvailable}
                          onChange={() => handleToggleAvailability(item)}
                          className="sr-only"
                        />
                        <div
                          className={`w-8 h-4 rounded-full transition-colors relative ${
                            item.isAvailable ? 'bg-emerald-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-transform ${
                              item.isAvailable ? 'left-4' : 'left-0.5'
                            }`}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-gray-600">
                          {item.isAvailable ? 'Available' : 'Sold Out'}
                        </span>
                      </label>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-800 hover:bg-gray-200/60 transition-colors"
                          title="Edit Item / Combo"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT MENU ITEM OR COMBO */}
      {/* ============================================================== */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center">
                  {formData.type === 'COMBO' ? <Sparkles size={20} /> : <Utensils size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingItem ? 'Edit Menu Item' : 'Add Food Item or Combo'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Set price, image, diet tags, and combo deal inclusions
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="space-y-4">
              {/* Type Switcher: Single Item vs Combo Deal */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Item Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        type: 'SINGLE',
                        category: prev.category === 'Combos & Deals' ? 'Beverages' : prev.category,
                      }));
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${
                      formData.type === 'SINGLE'
                        ? 'bg-white text-gray-900 shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Single Food / Beverage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        type: 'COMBO',
                        category: 'Combos & Deals',
                      }));
                    }}
                    className={`py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      formData.type === 'COMBO'
                        ? 'bg-[#714B67] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Sparkles size={13} className="text-amber-300" />
                    <span>Combo Deal</span>
                  </button>
                </div>
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {formData.type === 'COMBO' ? 'Combo Meal Name *' : 'Food / Drink Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={formData.type === 'COMBO' ? 'e.g. Post-Workout Protein Combo' : 'e.g. Cold Brew Coffee'}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#714B67]"
                />
              </div>

              {/* If Combo: Combo Inclusions */}
              {formData.type === 'COMBO' && (
                <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-1.5 animate-in fade-in">
                  <label className="block text-xs font-bold text-purple-950">
                    Combo Inclusions (Items included in bundle) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.comboItems}
                    onChange={(e) => setFormData({ ...formData, comboItems: e.target.value })}
                    placeholder="e.g. 1x Cold Brew + 1x Grilled Chicken Wrap + 1x Protein Bar"
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-purple-200 bg-white focus:outline-hidden focus:border-[#714B67]"
                  />
                  <span className="text-[10px] text-purple-700">
                    List what the member receives in this meal deal package.
                  </span>
                </div>
              )}

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 350"
                      className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#714B67]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 bg-white focus:outline-hidden focus:border-[#714B67]"
                  >
                    <option value="Combos & Deals">Combos &amp; Deals</option>
                    <option value="Beverages">Beverages</option>
                    <option value="Healthy Bowls">Healthy Bowls</option>
                    <option value="Sandwiches & Snacks">Sandwiches &amp; Snacks</option>
                    <option value="Desserts">Desserts</option>
                  </select>
                </div>
              </div>

              {/* Picture Upload Option */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Item Picture / Photo</label>
                <div className="flex items-center gap-3">
                  <div className="shrink-0">
                    {formData.image ? (
                      <div className="relative group">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-20 h-20 rounded-xl object-cover border-2 border-[#714B67]/30 bg-gray-50 shadow-sm"
                          onError={(e) => {
                            e.target.src = DEFAULT_FOOD_IMAGE;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: '' }))}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                          title="Remove picture"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon size={22} className="text-gray-400" />
                        <span className="text-[9px] font-semibold mt-1">No Picture</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <label className="w-full px-4 py-3 bg-white border-2 border-dashed border-gray-300 hover:border-[#714B67] hover:bg-purple-50/20 rounded-xl cursor-pointer text-xs font-semibold text-gray-600 hover:text-[#714B67] flex items-center justify-center gap-2 transition-all shadow-xs">
                      <Upload size={15} />
                      <span>{formData.image ? 'Change Food Picture' : 'Upload Food Picture'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-gray-400 mt-1.5 pl-1">
                      PNG, JPG, or WEBP (auto-compressed for fast loading)
                    </p>
                  </div>
                </div>
              </div>

              {/* Diet Tag */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Dietary Preference</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DIET_TAGS.map((tag) => (
                    <button
                      key={tag.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, dietTag: tag.value })}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold border transition-all text-center ${
                        formData.dietTag === tag.value
                          ? `${tag.color} ring-2 ring-[#714B67]/20`
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Fresh ingredients, dietary perks, energy benefits..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-hidden focus:border-[#714B67] resize-none"
                />
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingItem}
                  className="px-5 py-2 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {savingItem ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
                  <span>{editingItem ? 'Save Changes' : 'Publish to Menu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: DELETE CONFIRMATION MODAL */}
      {/* ============================================================== */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Remove from Menu</h3>
                <p className="text-xs text-gray-500">This action will permanently delete this item.</p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center gap-3">
              <img
                src={itemToDelete.image || DEFAULT_FOOD_IMAGE}
                alt={itemToDelete.name}
                className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_FOOD_IMAGE;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{itemToDelete.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="font-semibold text-purple-900">₹{itemToDelete.price}</span>
                  <span>•</span>
                  <span>{itemToDelete.type === 'COMBO' ? 'Combo Meal' : itemToDelete.category}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to remove <strong>&quot;{itemToDelete.name}&quot;</strong> from the cafe menu? Members will no longer be able to order this item.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={13} />
                    <span>Delete Item</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
