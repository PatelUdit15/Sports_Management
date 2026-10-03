import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Bell,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Eye,
  Edit2,
  Trash2,
  TrendingDown,
  Layers,
  Image as ImageIcon,
  DollarSign,
  Package,
  ArrowUpRight,
  X,
  Upload,
  Check,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';

// Default placeholder when no product photo is provided
const DEFAULT_PRODUCT_PHOTO = 'data:image/svg+xml;base64,' + btoa('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect width="400" height="400" fill="#f3f0f5"/><g transform="translate(150,140)"><rect x="10" y="60" width="80" height="50" rx="6" fill="#c4a8bd"/><circle cx="50" cy="40" r="28" fill="#c4a8bd"/><path d="M30 60 L50 20 L70 60" fill="none" stroke="#f3f0f5" stroke-width="3"/></g><text x="200" y="260" text-anchor="middle" font-family="Inter,sans-serif" font-size="14" font-weight="600" fill="#a08090">No Photo</text></svg>');

const CATEGORIES = ['All', 'Equipment', 'Accessories', 'Footwear', 'Apparel', 'Nutrition'];

export default function Shop() {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const isProductManager = isSuperAdmin?.() || hasRole?.('SHOP_INVENTORY_MANAGER') || hasRole?.('HR_MANAGER');

  const [products, setProducts] = useState([]);
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalStock: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    totalAlerts: 0,
    totalValuation: 0,
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockFilter, setStockFilter] = useState('All'); // 'All' | 'LOW_STOCK' | 'IN_STOCK' | 'OUT_OF_STOCK'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  // Add / Edit Product Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    photo: '',
    price: '',
    quantity: '',
    minQuantity: '5',
    category: 'Equipment',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Quick Restock / Adjust Stock Modal state
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'RESTOCK', // 'RESTOCK' | 'SELL' | 'SET'
    delta: 5,
    quantity: 0,
  });
  const [adjustingStock, setAdjustingStock] = useState(false);

  // Delete Product Confirmation Modal state
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    loadCatalog();
  }, [selectedCategory, stockFilter]);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const [prodRes, notifRes] = await Promise.all([
        productService.getProducts({
          category: selectedCategory,
          stockStatus: stockFilter,
          search: search.trim(),
        }),
        productService.getNotifications(false),
      ]);

      if (prodRes && prodRes.success) {
        setProducts(prodRes.products || []);
        if (prodRes.metrics) setMetrics(prodRes.metrics);
      }

      if (notifRes && notifRes.success) {
        setNotifications(notifRes.notifications || []);
      }
    } catch (err) {
      console.error('Failed to load shop catalog:', err);
      showToast(err.message || 'Error connecting to product catalog', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCatalog();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadCatalog();
  };

  // Open Add Product Modal
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      photo: '',
      price: '',
      quantity: '',
      minQuantity: '5',
      category: 'Equipment',
      description: '',
    });
    setShowAddModal(true);
  };

  // Open Edit Product Modal
  const handleOpenEdit = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      photo: p.photo,
      price: p.price,
      quantity: p.quantity,
      minQuantity: p.minQuantity,
      category: p.category,
      description: p.description || '',
    });
    setShowAddModal(true);
  };

  // Compress image before saving to state to ensure high speed & low payload
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
        img.onerror = () => resolve(e.target.result); // Fallback to raw data
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  // Handle Photo File Upload (convert to compressed base64 for instant preview)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setFormData((prev) => ({ ...prev, photo: compressed }));
    } catch {
      showToast('Error processing selected image.', 'error');
    }
  };

  // Submit Add or Edit Product
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Product name is required.', 'error');
      return;
    }
    if (formData.price === '' || isNaN(formData.price) || Number(formData.price) < 0) {
      showToast('Please enter a valid price.', 'error');
      return;
    }
    if (formData.quantity === '' || isNaN(formData.quantity) || Number(formData.quantity) < 0) {
      showToast('Please enter a valid initial stock quantity.', 'error');
      return;
    }
    if (formData.minQuantity === '' || isNaN(formData.minQuantity) || Number(formData.minQuantity) < 0) {
      showToast('Please enter a valid minimum quantity threshold.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        photo: formData.photo.trim() || PHOTO_PRESETS[0].url,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity, 10),
        minQuantity: parseInt(formData.minQuantity, 10),
        description: formData.description.trim(),
      };

      let res;
      if (editingProduct) {
        res = await productService.updateProduct(editingProduct.productId || editingProduct.id, payload);
      } else {
        res = await productService.createProduct(payload);
      }

      if (res && res.success) {
        setShowAddModal(false);
        if (res.notification) {
          showToast(
            `⚠️ Alert: "${payload.name}" stock is at/below min threshold (${payload.quantity} ≤ ${payload.minQuantity})!`,
            'error'
          );
        } else {
          showToast(
            editingProduct ? 'Product details updated successfully!' : 'Product added successfully to inventory!',
            'success'
          );
        }
        await loadCatalog();
        window.dispatchEvent(new CustomEvent('inventory-updated'));
      } else {
        showToast(res?.message || 'Failed to save product.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error saving product.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Quick Restock / Adjust Stock Modal
  const handleOpenStockModal = (product) => {
    setStockModalProduct(product);
    setStockAdjustment({
      type: 'RESTOCK',
      delta: 5,
      quantity: product.quantity,
    });
  };

  // Submit Stock Adjustment
  const handleApplyStockAdjustment = async (e) => {
    e.preventDefault();
    if (!stockModalProduct) return;

    try {
      setAdjustingStock(true);
      const res = await productService.adjustStock(
        stockModalProduct.productId || stockModalProduct.id,
        stockAdjustment
      );

      if (res && res.success) {
        setStockModalProduct(null);
        if (res.data?.notification) {
          showToast(
            `⚠️ Low Stock Triggered: "${res.data.name}" dropped to ${res.data.quantity} units (Threshold: ${res.data.minQuantity})!`,
            'error'
          );
        } else {
          showToast(res.message || 'Stock updated successfully!', 'success');
        }
        await loadCatalog();
        window.dispatchEvent(new CustomEvent('inventory-updated'));
      }
    } catch (err) {
      showToast(err.message || 'Failed to update stock.', 'error');
    } finally {
      setAdjustingStock(false);
    }
  };

  // Trigger Delete confirmation modal
  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
  };

  // Perform confirmed deletion
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    const prod = productToDelete;
    const deleteId = prod.productId || prod.id;
    setDeleting(true);

    try {
      const res = await productService.deleteProduct(deleteId);
      
      // Optimistic removal so UI updates instantly
      setProducts((prev) =>
        prev.filter(
          (p) => p.productId !== deleteId && p.id !== deleteId && p.productId !== prod.productId
        )
      );
      setProductToDelete(null);
      showToast(`Removed "${prod.name}" from catalog.`, 'success');

      // Refresh in background for synchronized metrics and notifications
      loadCatalog();
      window.dispatchEvent(new CustomEvent('inventory-updated'));
    } catch (err) {
      console.error('Delete error:', err);
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  // Dismiss a low stock notification
  const handleDismissNotification = async (notificationId) => {
    try {
      await productService.markNotificationRead(notificationId);
      setNotifications((prev) => prev.filter((n) => n.notificationId !== notificationId && n.id !== notificationId));
      showToast('Notification dismissed', 'success');
      window.dispatchEvent(new CustomEvent('inventory-updated'));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered products on client side for fast instant search
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      !search.trim() ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.productId.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();

    let matchesStock = true;
    if (stockFilter === 'LOW_STOCK') matchesStock = p.status === 'LOW_STOCK' || p.status === 'OUT_OF_STOCK';
    else if (stockFilter === 'IN_STOCK') matchesStock = p.status === 'IN_STOCK';
    else if (stockFilter === 'OUT_OF_STOCK') matchesStock = p.status === 'OUT_OF_STOCK';

    return matchesSearch && matchesCategory && matchesStock;
  });

  const activeAlerts = notifications.filter((n) => !n.isRead);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── TOP LOW-STOCK NOTIFICATION BANNER ── */}
      {metrics.totalAlerts > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-red-500/10 to-amber-500/5 border border-amber-300/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm animate-pulse">
              <AlertTriangle size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-gray-900">
                  Low Stock Alert Triggered ({metrics.totalAlerts} items affected)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black uppercase">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {metrics.lowStockCount} product(s) have dropped to or below their minimum quantity threshold, and{' '}
                {metrics.outOfStockCount} product(s) are completely out of stock.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setStockFilter(stockFilter === 'LOW_STOCK' ? 'All' : 'LOW_STOCK')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                stockFilter === 'LOW_STOCK'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {stockFilter === 'LOW_STOCK' ? 'Show All Products' : 'Filter Low Stock Items'}
            </button>
            <button
              onClick={() => setShowNotifDrawer(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Bell size={13} />
              <span>View Alerts ({activeAlerts.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* ── HEADER BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-8 h-8 rounded-xl bg-[#714B67]/10 text-[#714B67] flex items-center justify-center font-bold">
              <ShoppingBag size={18} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Pro Shop &amp; Inventory Management</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#714B67] text-[11px] font-bold border border-purple-200">
              {isProductManager ? 'Product Manager' : 'Inventory Catalog'}
            </span>
            {metrics.totalAlerts > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                {metrics.totalAlerts} Low Stock Alert{metrics.totalAlerts !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Add products with price, initial quantity &amp; min threshold. System triggers real-time alerts when stock drops.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDrawer(!showNotifDrawer)}
              className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold relative transition-colors"
              title="Stock Alerts"
            >
              <Bell size={16} />
              {activeAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs animate-bounce">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Sync inventory"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          {isProductManager && (
            <button
              onClick={handleOpenAdd}
              id="add-product-btn"
              className="px-4 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.02]"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TOP METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Catalog Products</span>
            <div className="text-2xl font-black text-gray-900 mt-1">{metrics.totalProducts}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Active sports items</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold">
            <Package size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Units in Stock</span>
            <div className="text-2xl font-black text-blue-700 mt-1">{metrics.totalStock}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Physical items available</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers size={20} />
          </div>
        </div>

        <div
          onClick={() => setStockFilter(stockFilter === 'LOW_STOCK' ? 'All' : 'LOW_STOCK')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all shadow-xs flex items-center justify-between ${
            metrics.totalAlerts > 0
              ? 'bg-amber-50/60 border-amber-200 hover:border-amber-400'
              : 'bg-white border-gray-100'
          }`}
        >
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Low Stock Alerts</span>
              {metrics.totalAlerts > 0 && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">{metrics.totalAlerts}</div>
            <div className="text-[11px] text-amber-800 font-semibold mt-0.5">
              {metrics.lowStockCount} Low / {metrics.outOfStockCount} Out of stock
            </div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
            <AlertTriangle size={20} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Inventory Valuation</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹{metrics.totalValuation.toLocaleString()}</div>
            <div className="text-[11px] text-gray-500 mt-0.5">Total retail asset value</div>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
            <DollarSign size={20} />
          </div>
        </div>
      </div>

      {/* ── CONTROLS: SEARCH, CATEGORIES & STOCK FILTERS ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product name or SKU..."
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#714B67] transition-all"
            />
          </form>

          {/* Filters & View Switcher */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none"
            >
              <option value="All">All Stock Levels</option>
              <option value="LOW_STOCK">⚠️ Low Stock Alerts (Drop ≤ Min)</option>
              <option value="IN_STOCK">✓ Healthy Stock</option>
              <option value="OUT_OF_STOCK">❌ Out of Stock (0 units)</option>
            </select>

            <div className="flex items-center bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Grid view"
              >
                <Layers size={14} />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'table' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-900'
                }`}
                title="Table view"
              >
                <SlidersHorizontal size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold pt-1 border-t border-gray-100">
          <span className="text-[11px] text-gray-400 font-bold uppercase mr-1">Category:</span>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#714B67] text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── NOTIFICATIONS SLIDE PANEL (LOW STOCK ALERTS) ── */}
      {showNotifDrawer && (
        <div className="bg-white rounded-2xl border border-amber-200 shadow-lg p-5 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Bell size={14} />
              </div>
              <h2 className="text-sm font-bold text-gray-900">
                Low Stock Notification Center ({activeAlerts.length} Unresolved)
              </h2>
            </div>
            <button
              onClick={() => setShowNotifDrawer(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          {activeAlerts.length === 0 ? (
            <div className="p-6 text-center text-gray-400 text-xs">
              <CheckCircle2 size={24} className="mx-auto mb-2 text-emerald-500" />
              All inventory levels are healthy! No active low-stock alerts.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {activeAlerts.map((notif) => (
                <div
                  key={notif.notificationId || notif.id}
                  className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{notif.productName}</span>
                      <span className="px-2 py-0.2 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                        Stock: {notif.currentQuantity} (Min: {notif.minQuantity})
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900 mt-1">{notif.message}</p>
                    <span className="text-[10px] text-gray-400 mt-0.5 block">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        const target = products.find((p) => p.productId === notif.productId);
                        if (target) handleOpenStockModal(target);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px]"
                    >
                      Quick Restock
                    </button>
                    <button
                      onClick={() => handleDismissNotification(notif.notificationId || notif.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 font-bold text-[11px]"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PRODUCTS VIEW (GRID OR TABLE) ── */}
      {loading ? (
        <div className="p-16 text-center">
          <div className="w-10 h-10 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-gray-500 font-semibold">Loading Pro Shop Inventory &amp; Stock Levels...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center space-y-3">
          <ShoppingBag size={36} className="text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">No Products Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            {search
              ? `No products match your search query "${search}". Try resetting the filter.`
              : 'Your store catalog is currently empty. Click "Add Product" to add sports gear with low-stock alerts.'}
          </p>
          {isProductManager && (
            <button
              onClick={handleOpenAdd}
              className="mt-2 px-4 py-2 rounded-xl bg-[#714B67] text-white font-bold text-xs inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Your First Product</span>
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW OF PRODUCTS */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((p) => {
            const isLow = p.quantity <= p.minQuantity && p.quantity > 0;
            const isOut = p.quantity === 0;

            return (
              <div
                key={p.productId || p.id}
                className={`bg-white rounded-2xl border overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group ${
                  isOut
                    ? 'border-red-200 ring-1 ring-red-100'
                    : isLow
                    ? 'border-amber-200 ring-1 ring-amber-100'
                    : 'border-gray-100 hover:border-purple-200'
                }`}
              >
                <div>
                  {/* Photo with status badge */}
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={p.photo}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = DEFAULT_PRODUCT_PHOTO;
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-xs">
                        {p.category}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isOut ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-xs flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={11} />
                          Out of Stock
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white shadow-xs flex items-center gap-1 animate-pulse">
                          <AlertTriangle size={11} />
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-xs flex items-center gap-1">
                          <Check size={11} />
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div>
                      <div className="text-[10px] font-mono text-gray-400">{p.productId}</div>
                      <h3 className="font-bold text-gray-900 text-sm mt-0.5 group-hover:text-[#714B67] transition-colors line-clamp-1">
                        {p.name}
                      </h3>
                      {p.description && (
                        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>
                      )}
                    </div>

                    {/* Pricing & Stock Bar */}
                    <div className="pt-2 border-t border-gray-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-semibold">Retail Price</span>
                        <span className="text-base font-black text-gray-900">₹{p.price?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-semibold flex items-center gap-1">
                          Available Stock:
                          <strong
                            className={`font-black ${
                              isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                            }`}
                          >
                            {p.quantity} Units
                          </strong>
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          Min Alert: <strong className="text-gray-700">{p.minQuantity}</strong>
                        </span>
                      </div>

                      {/* Stock Level Progress Bar */}
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            isOut ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(5, (p.quantity / (p.minQuantity * 2 || 10)) * 100))}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 pt-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleOpenStockModal(p)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-white border border-gray-200 hover:border-[#714B67] hover:text-[#714B67] text-gray-700 text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
                  >
                    <Zap size={13} className="text-amber-500" />
                    <span>Adjust / Restock</span>
                  </button>

                  {isProductManager && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        title="Edit product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW OF PRODUCTS */
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Photo &amp; Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Current Stock</th>
                  <th className="py-3 px-4">Min Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                {filteredProducts.map((p) => {
                  const isLow = p.quantity <= p.minQuantity && p.quantity > 0;
                  const isOut = p.quantity === 0;

                  return (
                    <tr key={p.productId || p.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.photo}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-gray-100 border border-gray-200"
                            onError={(e) => {
                              e.target.src = PHOTO_PRESETS[0].url;
                            }}
                          />
                          <div>
                            <div className="font-bold text-gray-900">{p.name}</div>
                            <div className="text-[10px] font-mono text-gray-400">{p.productId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-bold">
                          {p.category}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-black text-gray-900">₹{p.price?.toLocaleString()}</td>

                      <td className="py-3 px-4 font-black">
                        <span
                          className={`text-sm ${
                            isOut ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-emerald-700'
                          }`}
                        >
                          {p.quantity} Units
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-gray-500">
                        {p.minQuantity} <span className="text-[10px] font-normal text-gray-400">units</span>
                      </td>

                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={10} />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1 animate-pulse">
                            <AlertTriangle size={10} />
                            Low Stock (≤{p.minQuantity})
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                            <Check size={10} />
                            In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStockModal(p)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 text-[11px] font-bold border border-amber-200"
                            title="Adjust / Restock"
                          >
                            Restock
                          </button>
                          {isProductManager && (
                            <>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                                title="Edit"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p)}
                                className="p-1 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          ADD / EDIT PRODUCT MODAL (PRODUCT MANAGER FLOW)
          Details: Product Name, Product Photo, Product Price,
                   Product Quantity, Product Min Quantity
          ══════════════════════════════════════════════════════════════ */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-7 shadow-2xl border border-gray-100 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#714B67] text-white flex items-center justify-center font-bold text-xs">
                  <Package size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    {editingProduct ? 'Edit Product Details' : 'Add New Product to Store'}
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Fill in name, photo, price, quantity, and minimum stock threshold.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="space-y-4 pt-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Yonex Astrox 88D Pro Badminton Racket"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#714B67] text-xs font-medium"
                />
              </div>

              {/* Category & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#714B67] text-xs font-medium"
                  >
                    <option value="Equipment">Equipment</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Nutrition">Nutrition</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Product Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="e.g. 4800"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#714B67] text-xs font-medium"
                  />
                </div>
              </div>

              {/* Product Quantity & Product Min Quantity (Alert Threshold) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Product Quantity (Stock) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="e.g. 25"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#714B67] text-xs font-medium"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">Current physical inventory</span>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    Product Min Quantity (Alert Threshold) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="e.g. 5"
                    value={formData.minQuantity}
                    onChange={(e) => setFormData({ ...formData, minQuantity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#714B67] text-xs font-medium"
                  />
                  <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
                    ⚠️ Triggers low stock alert when stock ≤ threshold
                  </span>
                </div>
              </div>

              {/* Live Low Stock Trigger Warning */}
              {Number(formData.quantity) <= Number(formData.minQuantity) &&
                formData.quantity !== '' &&
                formData.minQuantity !== '' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800 text-[11px] font-semibold animate-fade-in">
                    <AlertTriangle size={15} className="flex-shrink-0 text-amber-600" />
                    <span>
                      Notice: Quantity ({formData.quantity}) is ≤ Min Quantity ({formData.minQuantity}). Adding this
                      will immediately dispatch a <strong>Low Stock Notification</strong> to the Product Manager!
                    </span>
                  </div>
                )}

              {/* Product Photo */}
              <div className="space-y-2">
                <label className="block text-gray-700 font-semibold">Product Photo</label>

                {/* Photo Preview & Upload/URL Options */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                  {/* Photo Preview */}
                  <div className="flex-shrink-0">
                    {formData.photo ? (
                      <img
                        src={formData.photo}
                        alt="Preview"
                        className="w-20 h-20 rounded-xl object-cover border-2 border-[#714B67]/30 bg-white shadow-sm"
                        onError={(e) => {
                          e.target.src = DEFAULT_PRODUCT_PHOTO;
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon size={20} />
                        <span className="text-[8px] font-semibold mt-1">No Photo</span>
                      </div>
                    )}
                  </div>

                  {/* Upload & URL Input */}
                  <div className="flex-1 space-y-2.5">
                    {/* File Upload Button */}
                    <label className="w-full px-4 py-2.5 bg-white border-2 border-dashed border-gray-300 hover:border-[#714B67] hover:bg-purple-50/30 rounded-xl cursor-pointer text-xs font-semibold text-gray-600 hover:text-[#714B67] flex items-center justify-center gap-2 transition-all">
                      <Upload size={14} />
                      <span>Click to Upload Product Photo</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>

                    {/* Divider */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-px bg-gray-200" />
                      <span className="text-[10px] text-gray-400 font-medium">OR paste URL</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    {/* URL Input */}
                    <input
                      type="url"
                      placeholder="https://example.com/product-image.jpg"
                      value={formData.photo}
                      onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#714B67] text-xs font-medium placeholder:text-gray-300"
                    />

                    {formData.photo && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, photo: '' })}
                        className="text-[10px] text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
                      >
                        <X size={10} />
                        Remove Photo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Description (Optional)</label>
                <textarea
                  rows="2"
                  placeholder="Key features, frame material, size, or product specifications..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#714B67] text-xs"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white font-bold flex items-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
                >
                  {submitting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check size={14} />}
                  <span>{editingProduct ? 'Save Product Changes' : 'Add Product to Inventory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          QUICK RESTOCK / ADJUST STOCK MODAL
          Allows product manager to restock or record a sale to test
          the low stock threshold trigger!
          ══════════════════════════════════════════════════════════════ */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-amber-500" />
                <h3 className="font-bold text-sm text-gray-900">Adjust Inventory Stock</h3>
              </div>
              <button
                onClick={() => setStockModalProduct(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleApplyStockAdjustment} className="space-y-4 pt-3 text-xs">
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
                <img
                  src={stockModalProduct.photo}
                  alt={stockModalProduct.name}
                  className="w-12 h-12 rounded-lg object-cover border border-gray-300 bg-white flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">{stockModalProduct.name}</h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-500">
                    <span>
                      Current Stock: <strong className="text-gray-900">{stockModalProduct.quantity}</strong>
                    </span>
                    <span>
                      Min Threshold: <strong className="text-amber-700">{stockModalProduct.minQuantity}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Adjustment Mode */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <button
                  type="button"
                  onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'RESTOCK' })}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                    stockAdjustment.type === 'RESTOCK'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  + Restock
                </button>
                <button
                  type="button"
                  onClick={() => setStockAdjustment({ ...stockAdjustment, type: 'SELL' })}
                  className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                    stockAdjustment.type === 'SELL'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  - Record Sale
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setStockAdjustment({
                      ...stockAdjustment,
                      type: 'SET',
                      quantity: stockModalProduct.quantity,
                    })
                  }
                  className={`py-2 px-3 rounded-xl font-bold border transition-all ${
                    stockAdjustment.type === 'SET'
                      ? 'bg-purple-50 text-[#714B67] border-purple-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  = Direct Count
                </button>
              </div>

              {/* Amount input */}
              {stockAdjustment.type === 'SET' ? (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Set New Quantity Count</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={stockAdjustment.quantity}
                    onChange={(e) =>
                      setStockAdjustment({ ...stockAdjustment, quantity: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">
                    {stockAdjustment.type === 'RESTOCK' ? 'Units to Restock (+)' : 'Units Sold / Reduced (-)'}
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={stockAdjustment.delta}
                    onChange={(e) =>
                      setStockAdjustment({ ...stockAdjustment, delta: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none text-xs font-bold"
                  />
                </div>
              )}

              {/* Calculation Preview */}
              {(() => {
                let resulting = stockModalProduct.quantity;
                if (stockAdjustment.type === 'RESTOCK') resulting += stockAdjustment.delta;
                else if (stockAdjustment.type === 'SELL') resulting = Math.max(0, resulting - stockAdjustment.delta);
                else if (stockAdjustment.type === 'SET') resulting = stockAdjustment.quantity;

                const willAlert = resulting <= stockModalProduct.minQuantity;

                return (
                  <div
                    className={`p-3 rounded-xl border text-[11px] font-semibold flex items-center justify-between ${
                      willAlert ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-gray-50 border-gray-200 text-gray-700'
                    }`}
                  >
                    <span>
                      Resulting Stock: <strong>{resulting} Units</strong>
                    </span>
                    {willAlert ? (
                      <span className="text-amber-700 font-black">⚠️ Will trigger Low Stock Alert!</span>
                    ) : (
                      <span className="text-emerald-700 font-bold">✓ Healthy Stock Level</span>
                    )}
                  </div>
                );
              })()}

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-3.5 py-2 rounded-xl border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adjustingStock}
                  className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {adjustingStock ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check size={14} />}
                  <span>Update Stock Level</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Product</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
              <img
                src={productToDelete.photo || DEFAULT_PRODUCT_PHOTO}
                alt={productToDelete.name}
                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = DEFAULT_PRODUCT_PHOTO;
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{productToDelete.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                  <span className="font-mono">{productToDelete.productId}</span>
                  <span>•</span>
                  <span className="font-semibold text-gray-700">₹{productToDelete.price}</span>
                  <span>•</span>
                  <span>{productToDelete.quantity} units</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              Are you sure you want to permanently delete this product? All corresponding stock notifications and catalog listings will be removed.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
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
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Delete Product</span>
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
