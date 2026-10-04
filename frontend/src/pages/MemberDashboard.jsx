import React, { useState, useEffect } from 'react';
import {
  CreditCard, Calendar, Coffee, ShoppingBag, Clock, AlertTriangle, ArrowRight,
  ShieldCheck, Dumbbell, CalendarDays, CheckCircle2, RotateCw, Copy, Check,
  QrCode, Sparkles, ChevronRight, User, Award, Flame, ExternalLink, Zap,
  LogOut, Bell, Mail, Phone, Lock, Save, Trash2, Plus, Minus, Search,
  ShoppingCart, Utensils, MapPin, Receipt, X, Tag, HeartHandshake, Eye
} from 'lucide-react';
import memberService from '../services/memberService';
import { api } from '../services/api';

export default function MemberDashboard() {
  // Core Profile & Status
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('courts'); // 'courts' | 'shop' | 'cafe' | 'pass' | 'profile' | 'details'
  const [copiedId, setCopiedId] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phone: '+91 98765 43210',
    birthday: '1998-05-14',
    gender: 'Male',
    emergencyContact: '+91 91234 56789',
    courtNotifications: true,
    cafeAlerts: true,
    renewalAlerts: true,
  });

  // ==========================================
  // 1. COURT BOOKING STATES
  // ==========================================
  const [courtMatrix, setCourtMatrix] = useState({ courts: [], bookings: [] });
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(null);
  const [myBookings, setMyBookings] = useState([]);
  const [courtViewMode, setCourtViewMode] = useState('matrix'); // 'matrix' | 'my-bookings'
  const [selectedBookingSlot, setSelectedBookingSlot] = useState(null); // for modal
  const [bookingNotes, setBookingNotes] = useState('');

  // ==========================================
  // 2. PRO SHOP / BUY INVENTORY STATES
  // ==========================================
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productCategory, setProductCategory] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [purchaseLoading, setPurchaseLoading] = useState(false);
  const [purchaseReceipt, setPurchaseReceipt] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState('Pro Shop Counter Pickup');

  // ==========================================
  // 3. CAFE FOOD ORDERING STATES
  // ==========================================
  const [cafeMenu, setCafeMenu] = useState([]);
  const [cafeLoading, setCafeLoading] = useState(false);
  const [cafeCategory, setCafeCategory] = useState('All');
  const [cafeDietFilter, setCafeDietFilter] = useState('All');
  const [cafeSearch, setCafeSearch] = useState('');
  const [cafeOrderTray, setCafeOrderTray] = useState([]);
  const [isCafeTrayOpen, setIsCafeTrayOpen] = useState(false);
  const [cafeOrderLoading, setCafeOrderLoading] = useState(false);
  const [myCafeOrders, setMyCafeOrders] = useState([]);
  const [cafeDeliveryLocation, setCafeDeliveryLocation] = useState('Court 1 Side Bench');
  const [cafeNotes, setCafeNotes] = useState('');
  const [cafeOrderSuccess, setCafeOrderSuccess] = useState(null);

  // Logout handler
  const handleMemberLogout = () => {
    localStorage.removeItem('currentMember');
    localStorage.removeItem('member_token');
    localStorage.removeItem('token');
    localStorage.removeItem('activeMemberPass');
    window.location.href = '/user/login';
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3500);
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (activeTab === 'courts') {
      fetchCourtMatrix(selectedDate);
      fetchMyBookings();
    } else if (activeTab === 'shop') {
      fetchProducts();
    } else if (activeTab === 'cafe') {
      fetchCafeMenu();
      fetchMyCafeOrders();
    }
  }, [activeTab, selectedDate]);

  // ==========================================
  // API FETCHERS
  // ==========================================

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      let res;
      if (memberService && typeof memberService.getMemberProfile === 'function') {
        res = await memberService.getMemberProfile();
      } else {
        const rawRes = await api.get('/member-dashboard/me');
        res = rawRes.data;
      }

      if (res?.data) {
        setProfileData(res.data);
      } else if (res?.member) {
        setProfileData(res);
      }
    } catch (err) {
      console.warn('API fetch failed, checking local member cache:', err);
      const cachedPass = localStorage.getItem('activeMemberPass') || localStorage.getItem('currentMember') || localStorage.getItem('member_data');
      if (cachedPass) {
        try {
          const pass = JSON.parse(cachedPass);
          setProfileData({
            member: {
              id: pass.memberId || pass.id || 'MEM-001',
              memberId: pass.memberId || pass.id || 'MEM-001',
              fullName: pass.fullName || pass.name || 'Valued Member',
              email: pass.email || 'member@skylinesports.com',
              membershipTier: pass.tier || pass.membershipTier || 'GOLD',
              startDate: pass.startDate || new Date().toISOString(),
              endDate: pass.endDate || new Date(Date.now() + 30 * 86400000).toISOString(),
              status: pass.status || 'ACTIVE',
            },
            club: pass.club || { name: 'Champions Sports Club', sport: 'Multi-Sport' },
            moduleConfig: {
              courtBooking: true,
              bar: true,
              shop: true,
              membership: true,
            },
            renewalInfo: { requiresRenewalAlert: false, daysUntilExpiry: 30 },
          });
          return;
        } catch (e) {
          console.error('Error parsing cached member pass:', e);
        }
      }
      setError(err?.response?.data?.message || err?.message || 'Failed to load member profile');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourtMatrix = async (date) => {
    try {
      const res = await memberService.getCourtMatrix(date);
      setCourtMatrix(res?.data || { courts: [], bookings: [] });
    } catch (err) {
      console.error('Failed to load court matrix', err);
    }
  };

  const fetchMyBookings = async () => {
    try {
      const res = await memberService.getMyBookings();
      setMyBookings(res?.data?.bookings || res?.bookings || []);
    } catch (err) {
      console.error('Failed to load member bookings', err);
    }
  };

  const fetchProducts = async () => {
    try {
      setProductsLoading(true);
      const res = await memberService.getClubProducts({
        category: productCategory !== 'All' ? productCategory : undefined,
        search: productSearch || undefined,
      });
      setProducts(res?.products || res?.data?.products || []);
    } catch (err) {
      console.error('Failed to fetch club products', err);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchCafeMenu = async () => {
    try {
      setCafeLoading(true);
      const res = await memberService.getCafeMenu({
        category: cafeCategory !== 'All' ? cafeCategory : undefined,
        search: cafeSearch || undefined,
      });
      setCafeMenu(res?.items || res?.data?.items || []);
    } catch (err) {
      console.error('Failed to fetch cafe menu', err);
    } finally {
      setCafeLoading(false);
    }
  };

  const fetchMyCafeOrders = async () => {
    try {
      const res = await memberService.getMyCafeOrders();
      setMyCafeOrders(res?.orders || res?.data?.orders || []);
    } catch (err) {
      console.error('Failed to fetch my cafe orders', err);
    }
  };

  // ==========================================
  // ACTION HANDLERS: COURTS
  // ==========================================

  const openBookingModal = (court, timeSlotStr) => {
    setSelectedBookingSlot({
      courtId: court.courtId || court.id,
      courtName: court.name,
      sportType: court.sportType || 'Multi-Sport',
      hourlyRate: court.hourlyRate || 1000,
      timeSlotStr,
      date: selectedDate,
    });
    setBookingNotes('');
  };

  const handleConfirmCourtBooking = async () => {
    if (!selectedBookingSlot) return;
    try {
      setBookingLoading(true);
      const { courtId, courtName, timeSlotStr, date } = selectedBookingSlot;
      const startTime = new Date(`${date}T${timeSlotStr}:00`);
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);

      await memberService.memberBookCourt({
        courtId,
        courtName,
        date,
        slot: `${timeSlotStr}-${endTime.getHours().toString().padStart(2, '0')}:00`,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        notes: bookingNotes
      });

      setSelectedBookingSlot(null);
      fetchCourtMatrix(selectedDate);
      fetchMyBookings();
      setBookingSuccess(`Court ${courtName} successfully reserved for ${timeSlotStr}!`);
      setTimeout(() => setBookingSuccess(null), 4500);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to book court');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this court reservation?')) return;
    try {
      await memberService.cancelBooking(bookingId);
      fetchCourtMatrix(selectedDate);
      fetchMyBookings();
      setBookingSuccess('Court reservation successfully cancelled.');
      setTimeout(() => setBookingSuccess(null), 4000);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to cancel booking');
    }
  };

  // ==========================================
  // ACTION HANDLERS: PRO SHOP / CART
  // ==========================================

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.productId);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          alert(`Cannot add more than available stock (${product.quantity})`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product.productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateCartQty = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const handleCheckoutPurchase = async () => {
    if (cart.length === 0) return;
    try {
      setPurchaseLoading(true);
      const res = await memberService.purchaseProducts({
        items: cart.map((c) => ({
          productId: c.productId,
          quantity: c.quantity,
          price: c.price,
          name: c.name,
        })),
        deliveryLocation: deliveryOption,
        paymentMethod: 'Member Privilege Pass Balance',
      });

      setPurchaseReceipt(res?.data || res);
      setCart([]);
      setIsCartOpen(false);
      fetchProducts(); // refresh live stock
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Checkout failed');
    } finally {
      setPurchaseLoading(false);
    }
  };

  // ==========================================
  // ACTION HANDLERS: CAFE FOOD ORDERING
  // ==========================================

  const addToCafeTray = (item) => {
    setCafeOrderTray((prev) => {
      const existing = prev.find((o) => (o.itemId || o.id) === (item.itemId || item.id));
      if (existing) {
        return prev.map((o) =>
          (o.itemId || o.id) === (item.itemId || item.id)
            ? { ...o, qty: o.qty + 1 }
            : o
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
    setIsCafeTrayOpen(true);
  };

  const updateCafeTrayQty = (id, delta) => {
    setCafeOrderTray((prev) =>
      prev
        .map((item) => {
          if ((item.itemId || item.id) === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCafeTray = (id) => {
    setCafeOrderTray((prev) => prev.filter((item) => (item.itemId || item.id) !== id));
  };

  const handlePlaceCafeOrder = async () => {
    if (cafeOrderTray.length === 0) return;
    try {
      setCafeOrderLoading(true);
      const res = await memberService.orderCafeFood({
        items: cafeOrderTray.map((item) => ({
          name: item.name,
          price: item.price,
          qty: item.qty,
          type: item.type || 'SINGLE',
        })),
        deliveryLocation: cafeDeliveryLocation,
        notes: cafeNotes,
      });

      setCafeOrderSuccess(res?.data || res);
      setCafeOrderTray([]);
      setIsCafeTrayOpen(false);
      setCafeNotes('');
      fetchMyCafeOrders();
      setTimeout(() => setCafeOrderSuccess(null), 6000);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message || 'Failed to place cafe order');
    } finally {
      setCafeOrderLoading(false);
    }
  };

  const copyMemberId = () => {
    const id = profileData?.member?.memberId || 'MEM-001';
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2500);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F6FA]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-gray-500">Loading your sports club member portal...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#F5F6FA] text-gray-800 p-4">
        <div className="p-8 bg-white rounded-2xl border border-red-200 shadow-xs flex flex-col items-center max-w-md text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-gray-900">Unable to Load Member Profile</h2>
          <p className="text-xs text-gray-500 mt-2">{error}</p>
          <button
            onClick={fetchProfile}
            className="mt-5 px-5 py-2.5 rounded-xl bg-[#714B67] text-white text-xs font-bold hover:bg-[#57344f] transition-all shadow-xs cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const { member, club, moduleConfig, renewalInfo } = profileData;
  const hours = Array.from({ length: 16 }, (_, i) => i + 6); // 6 AM to 9 PM

  // Calculation helpers
  const cartSubtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const cartDiscount = Math.round(cartSubtotal * 0.15 * 100) / 100;
  const cartTotal = Math.max(0, cartSubtotal - cartDiscount);

  const cafeSubtotal = cafeOrderTray.reduce((acc, it) => acc + it.price * it.qty, 0);
  const cafeDiscount = Math.round(cafeSubtotal * 0.20 * 100) / 100;
  const cafeDiscountedSubtotal = cafeSubtotal - cafeDiscount;
  const cafeTax = Math.round(cafeDiscountedSubtotal * 0.05 * 100) / 100;
  const cafeTotal = cafeDiscountedSubtotal + cafeTax;

  const TABS = [
    { id: 'courts', label: 'Book a Court', icon: CalendarDays, badge: `${courtMatrix.courts.length} Courts` },
    { id: 'shop', label: 'Buy Inventory (Pro Shop)', icon: ShoppingBag, badge: cart.length ? `${cart.length}` : null },
    { id: 'cafe', label: 'Order Cafe Food', icon: Coffee, badge: cafeOrderTray.length ? `${cafeOrderTray.length}` : null },
    { id: 'pass', label: 'Membership Pass', icon: CreditCard },
    { id: 'profile', label: 'Profile & Settings', icon: User },
    { id: 'details', label: 'Plan & Billing', icon: Award },
  ];

  // Filtering products
  const filteredProducts = products.filter((p) => {
    if (productCategory !== 'All' && p.category?.toLowerCase() !== productCategory.toLowerCase()) return false;
    if (productSearch && !p.name?.toLowerCase().includes(productSearch.toLowerCase())) return false;
    return true;
  });

  // Filtering cafe items
  const filteredCafeItems = cafeMenu.filter((item) => {
    if (cafeCategory !== 'All' && item.category?.toLowerCase() !== cafeCategory.toLowerCase()) return false;
    if (cafeDietFilter !== 'All' && item.diet_tag !== cafeDietFilter && item.dietTag !== cafeDietFilter) return false;
    if (cafeSearch && !item.name?.toLowerCase().includes(cafeSearch.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F5F6FA] text-gray-900 font-sans p-4 sm:p-6 lg:p-8 selection:bg-[#714B67] selection:text-white">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. TOP HEADER BANNER */}
        <div className="bg-gradient-to-r from-[#3B1E34] via-[#4D2845] to-[#5C3252] text-white p-6 sm:p-8 rounded-2xl shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              {/* Club & Portal Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-purple-200 border border-white/15 text-[11px] font-bold uppercase tracking-wider mb-3">
                <Sparkles size={12} className="text-amber-400" />
                <span>{club.name} • Member Portal</span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
                <span>Welcome, {member.fullName.split(' ')[0]}!</span>
                <span className="text-2xl">🎾</span>
              </h1>
              <p className="text-purple-100/80 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
                Directly book courts, purchase club sports inventory with 15% discount, and order high-protein cafe meals to your court.
              </p>
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveTab('courts')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'courts'
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Zap size={14} />
                <span>Book Court</span>
              </button>

              <button
                onClick={() => setActiveTab('shop')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'shop'
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <ShoppingBag size={14} />
                <span>Pro Shop</span>
                {cart.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-700 text-white text-[10px] font-bold">
                    {cart.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('cafe')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'cafe'
                    ? 'bg-amber-400 text-slate-900 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                }`}
              >
                <Coffee size={14} />
                <span>Order Food</span>
                {cafeOrderTray.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full bg-purple-700 text-white text-[10px] font-bold">
                    {cafeOrderTray.length}
                  </span>
                )}
              </button>

              <button
                onClick={copyMemberId}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                title="Click to copy Member ID"
              >
                <span>ID: {member.memberId}</span>
                {copiedId ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>

              <button
                onClick={handleMemberLogout}
                className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 text-white text-xs font-semibold transition-all cursor-pointer"
                title="Log out"
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* 2. SUCCESS NOTIFICATIONS & BANNERS */}
        {bookingSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between text-xs font-bold shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>{bookingSuccess}</span>
            </div>
            <button onClick={() => setBookingSuccess(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
              <X size={15} />
            </button>
          </div>
        )}

        {cafeOrderSuccess && (
          <div className="bg-purple-50 border border-purple-200 text-[#714B67] p-4 rounded-xl flex items-center justify-between text-xs font-bold shadow-xs animate-fade-in">
            <div className="flex items-center gap-2.5">
              <Utensils size={18} className="text-[#714B67] flex-shrink-0" />
              <span>
                {cafeOrderSuccess.message || `Order ${cafeOrderSuccess.orderId} dispatched to kitchen in PREPARING status!`}
              </span>
            </div>
            <button onClick={() => setCafeOrderSuccess(null)} className="text-[#714B67] cursor-pointer">
              <X size={15} />
            </button>
          </div>
        )}

        {/* 3. KPI QUICK STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {/* Card 1: Membership Status */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] border-t-4 border-t-emerald-500 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Member Status</span>
              <ShieldCheck size={16} className="text-emerald-600" />
            </div>
            <div className="mt-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-lg font-extrabold text-gray-900 uppercase tracking-tight">{member.status}</span>
              </div>
              <span className="text-[10px] text-gray-400 mt-0.5 block">{club.name}</span>
            </div>
          </div>

          {/* Card 2: Tier Level */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] border-t-4 border-t-[#714B67] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Pass Tier</span>
              <Award size={16} className="text-[#714B67]" />
            </div>
            <div className="mt-2.5">
              <div className="text-lg font-extrabold text-[#714B67] tracking-tight">{member.membershipTier} PASS</div>
              <span className="text-[10px] text-gray-400 mt-0.5 block">Priority Booking Privilege</span>
            </div>
          </div>

          {/* Card 3: Live Courts */}
          <div
            onClick={() => setActiveTab('courts')}
            className="bg-white rounded-2xl p-4 border border-[#E5E7EB] border-t-4 border-t-amber-500 shadow-xs flex flex-col justify-between cursor-pointer hover:border-amber-400 transition-all"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Court Matrix</span>
              <CalendarDays size={16} className="text-amber-600" />
            </div>
            <div className="mt-2.5">
              <div className="text-lg font-extrabold text-amber-700 tracking-tight">
                {courtMatrix.courts.length} Active Courts
              </div>
              <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">Click to Reserve Slot →</span>
            </div>
          </div>

          {/* Card 4: Pro Shop Privilege */}
          <div
            onClick={() => setActiveTab('shop')}
            className="bg-white rounded-2xl p-4 border border-[#E5E7EB] border-t-4 border-t-blue-500 shadow-xs flex flex-col justify-between cursor-pointer hover:border-blue-400 transition-all"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Club Pro Shop</span>
              <ShoppingBag size={16} className="text-blue-600" />
            </div>
            <div className="mt-2.5">
              <div className="text-lg font-extrabold text-blue-700 tracking-tight">15% Discount</div>
              <span className="text-[10px] text-blue-600 font-semibold mt-0.5 block">Browse Equipment &amp; Gear →</span>
            </div>
          </div>

          {/* Card 5: Cafe & Bar Discount */}
          <div
            onClick={() => setActiveTab('cafe')}
            className="bg-white rounded-2xl p-4 border border-[#E5E7EB] border-t-4 border-t-purple-500 shadow-xs flex flex-col justify-between cursor-pointer hover:border-purple-400 transition-all col-span-2 sm:col-span-1"
          >
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-[10px] font-bold uppercase tracking-wider">Sports Cafe</span>
              <Coffee size={16} className="text-purple-600" />
            </div>
            <div className="mt-2.5">
              <div className="text-lg font-extrabold text-[#714B67] tracking-tight">20% Off Meals</div>
              <span className="text-[10px] text-[#714B67] font-semibold mt-0.5 block">Court Side Delivery Active →</span>
            </div>
          </div>
        </div>

        {/* 4. MAIN NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-[#714B67] text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                }`}
              >
                <Icon size={14} className={active ? 'text-white' : 'text-gray-400'} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      active ? 'bg-white/20 text-white' : 'bg-purple-50 text-[#714B67] border border-purple-200'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* 5. TAB 1: BOOK A COURT */}
        {activeTab === 'courts' && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-gray-100">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Live Court Booking Matrix</h2>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Reserve courts instantly for your matches. All reservations include complimentary equipment readiness.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sub-toggle: Matrix vs My Bookings & Date Pickers */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
                  <button
                    onClick={() => setCourtViewMode('matrix')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      courtViewMode === 'matrix' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    Slot Matrix
                  </button>
                  <button
                    onClick={() => setCourtViewMode('my-bookings')}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                      courtViewMode === 'my-bookings' ? 'bg-white text-[#714B67] shadow-2xs' : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <span>My Bookings</span>
                    {myBookings.length > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#714B67] text-white text-[9px] flex items-center justify-center">
                        {myBookings.length}
                      </span>
                    )}
                  </button>
                </div>

                {courtViewMode === 'matrix' && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedDate === new Date().toISOString().split('T')[0]
                          ? 'bg-purple-50 border-purple-200 text-[#714B67]'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Today
                    </button>
                    <button
                      onClick={() => {
                        const tmrw = new Date();
                        tmrw.setDate(tmrw.getDate() + 1);
                        setSelectedDate(tmrw.toISOString().split('T')[0]);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        selectedDate === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                          ? 'bg-purple-50 border-purple-200 text-[#714B67]'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      Tomorrow
                    </button>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#714B67] cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Matrix View */}
            {courtViewMode === 'matrix' ? (
              courtMatrix.courts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                  <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-gray-700">No Courts Configured Yet</h4>
                  <p className="text-xs text-gray-400 mt-1">
                    Please check back soon or consult reception.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto pb-4">
                    <div className="min-w-[820px] space-y-3">
                      {/* Hours Header */}
                      <div className="grid grid-cols-[160px_1fr] gap-3 items-center px-3 py-2 bg-gray-50/80 rounded-xl border border-gray-100">
                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Court Details</span>
                        <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                          {hours.map((h) => (
                            <span key={h} className="flex-1 text-center font-bold">
                              {h.toString().padStart(2, '0')}:00
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Court Rows */}
                      {courtMatrix.courts.map((court) => (
                        <div
                          key={court.id || court.courtId}
                          className="grid grid-cols-[160px_1fr] gap-3 items-center p-3 rounded-xl bg-white border border-gray-200 hover:border-purple-200 transition-all shadow-2xs"
                        >
                          <div className="pr-2">
                            <span className="text-xs font-bold text-gray-900 block truncate">{court.name}</span>
                            <span className="text-[10px] text-gray-400 block">
                              {court.sportType} • ₹{court.hourlyRate}/hr
                            </span>
                            <span className="text-[9px] text-emerald-600 font-semibold block mt-0.5">
                              Free for {member.membershipTier} Tier
                            </span>
                          </div>

                          <div className="flex gap-1.5 h-11 bg-gray-50 rounded-lg p-1 border border-gray-200">
                            {hours.map((h) => {
                              const timeStr = `${h.toString().padStart(2, '0')}:00`;
                              const isBooked = courtMatrix.bookings.some((b) => {
                                const bCourtId = b.courtId || b.id;
                                if (bCourtId !== (court.courtId || court.id)) return false;
                                if (b.slot && b.slot.includes(timeStr)) return true;
                                if (b.startTime) {
                                  const bStart = new Date(b.startTime);
                                  return bStart.getHours() === h;
                                }
                                return false;
                              });

                              return (
                                <button
                                  key={h}
                                  disabled={isBooked || bookingLoading}
                                  onClick={() => openBookingModal(court, timeStr)}
                                  title={isBooked ? `Booked (${timeStr})` : `Click to reserve ${court.name} at ${timeStr}`}
                                  className={`flex-1 rounded transition-all flex flex-col items-center justify-center text-[9px] font-bold ${
                                    isBooked
                                      ? 'bg-rose-100 text-rose-700 border border-rose-200 cursor-not-allowed'
                                      : 'bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-300 text-emerald-800 cursor-pointer shadow-2xs hover:scale-105'
                                  }`}
                                >
                                  <span>{isBooked ? '✕' : '✓'}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Matrix Legend */}
                  <div className="flex flex-wrap items-center justify-between pt-4 border-t border-gray-100 text-xs gap-3">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-emerald-50 border border-emerald-300 flex items-center justify-center text-[10px] font-bold text-emerald-800">
                          ✓
                        </span>
                        <span className="text-gray-600 font-medium">Available (Click to book)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-rose-100 border border-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-700">
                          ✕
                        </span>
                        <span className="text-gray-600 font-medium">Reserved / Booked</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-gray-500">
                      ⚡ 1-hour slots • Court floodlights included for evening sessions
                    </span>
                  </div>
                </div>
              )
            ) : (
              /* My Bookings View */
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800">Your Reserved Court Sessions</h3>
                  <span className="text-xs text-gray-500">{myBookings.length} total bookings</span>
                </div>

                {myBookings.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <CalendarDays className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-gray-700">No Active Reservations</h4>
                    <p className="text-xs text-gray-400 mt-1">
                      You haven't reserved any courts yet. Switch to Slot Matrix to pick an open court!
                    </p>
                    <button
                      onClick={() => setCourtViewMode('matrix')}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#714B67] text-white text-xs font-bold hover:bg-[#57344f] cursor-pointer"
                    >
                      Browse Available Slots
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myBookings.map((b) => (
                      <div
                        key={b.id || b.bookingId}
                        className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-purple-200 shadow-2xs space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                            {b.status || 'CONFIRMED'}
                          </span>
                          <span className="text-[11px] font-mono text-gray-400">Ref: {b.id || b.bookingId}</span>
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-gray-900">{b.court?.name || b.courtName || 'Club Court'}</h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-gray-400" />
                              {b.date || (b.startTime ? b.startTime.split('T')[0] : selectedDate)}
                            </span>
                            <span className="flex items-center gap-1 font-mono font-bold text-purple-700">
                              <Clock size={13} />
                              {b.slot || (b.startTime ? `${new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Reserved Slot')}
                            </span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                          <span className="text-gray-500">Member Pass Covered</span>
                          <button
                            onClick={() => handleCancelBooking(b.id || b.bookingId)}
                            className="px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            Cancel Reservation
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 6. TAB 2: BUY INVENTORY (PRO SHOP) */}
        {activeTab === 'shop' && (
          <div className="space-y-6 animate-fade-in">
            {/* Pro Shop Header & Privilege Banner */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Official Club Pro Shop &amp; Inventory</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Purchase top-tier equipment, apparel, footwear, and recovery nutrition for {club.name}.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-full bg-purple-50 text-[#714B67] border border-purple-200 text-xs font-bold flex items-center gap-1.5">
                  <Tag size={13} />
                  <span>15% Member Discount Applied</span>
                </div>

                <button
                  onClick={() => setIsCartOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <ShoppingCart size={15} />
                  <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
                  {cart.length > 0 && <span className="font-mono">₹{cartTotal.toLocaleString()}</span>}
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {['All', 'Equipment', 'Apparel', 'Footwear', 'Accessories', 'Nutrition'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setProductCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      productCategory === cat
                        ? 'bg-[#714B67] text-white shadow-2xs'
                        : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search club inventory..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#714B67]"
                />
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">Loading club gear &amp; inventory...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <ShoppingBag className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-700">No Products Found</h4>
                <p className="text-xs text-gray-400 mt-1">No inventory items matched your filter or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProducts.map((p) => {
                  const discountedPrice = Math.round(p.price * 0.85);
                  const isOutOfStock = p.quantity <= 0;
                  const isLowStock = p.quantity > 0 && p.quantity <= (p.minQuantity || 5);

                  return (
                    <div
                      key={p.productId || p.id}
                      className="bg-white rounded-2xl border border-gray-200 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="relative h-48 bg-gray-100 overflow-hidden">
                          <img
                            src={p.photo}
                            alt={p.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                              {p.category}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            {isOutOfStock ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                                Sold Out
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                                Only {p.quantity} left
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold">
                                In Stock ({p.quantity})
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="p-4 space-y-2">
                          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{p.name}</h3>
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                            {p.description || 'Official club-certified sports item.'}
                          </p>
                        </div>
                      </div>

                      {/* Pricing & Add to Cart */}
                      <div className="p-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-extrabold text-[#714B67]">
                              ₹{discountedPrice.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ₹{p.price.toLocaleString()}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold block">15% Member Discount</span>
                        </div>

                        <button
                          disabled={isOutOfStock}
                          onClick={() => addToCart(p)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            isOutOfStock
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#714B67] hover:bg-[#57344f] text-white shadow-2xs hover:scale-105'
                          }`}
                        >
                          <Plus size={14} />
                          <span>Buy Now</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 7. TAB 3: ORDER CAFE FOOD */}
        {activeTab === 'cafe' && (
          <div className="space-y-6 animate-fade-in">
            {/* Cafe Banner */}
            <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Coffee size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">Sports Cafe &amp; Recovery Bar</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Order freshly prepared smoothies, protein wraps, espresso, and snacks directly to your court.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
                  <Utensils size={13} />
                  <span>20% Member Food Discount Active</span>
                </div>

                <button
                  onClick={() => setIsCafeTrayOpen(true)}
                  className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <Coffee size={15} />
                  <span>Order Tray ({cafeOrderTray.reduce((a, b) => a + b.qty, 0)})</span>
                  {cafeOrderTray.length > 0 && <span className="font-mono">₹{cafeTotal.toLocaleString()}</span>}
                </button>
              </div>
            </div>

            {/* Cafe Filters & Search */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 items-center">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
                {['All', 'Beverages', 'Combos & Deals', 'High-Protein', 'Bowls', 'Snacks'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCafeCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      cafeCategory === cat
                        ? 'bg-[#714B67] text-white shadow-2xs'
                        : 'bg-white hover:bg-gray-50 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={cafeDietFilter}
                  onChange={(e) => setCafeDietFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Diets</option>
                  <option value="VEG">Veg Only 🟢</option>
                  <option value="NON_VEG">Non-Veg 🔴</option>
                  <option value="HIGH_PROTEIN">High Protein ⚡</option>
                </select>

                <div className="relative flex-1 sm:w-56">
                  <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search cafe menu..."
                    value={cafeSearch}
                    onChange={(e) => setCafeSearch(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-white border border-gray-200 text-xs text-gray-800 focus:outline-none focus:border-[#714B67]"
                  />
                </div>
              </div>
            </div>

            {/* Menu Grid */}
            {cafeLoading ? (
              <div className="text-center py-16">
                <div className="w-8 h-8 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-gray-500">Loading cafe menu &amp; chef specials...</p>
              </div>
            ) : filteredCafeItems.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                <Coffee className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-gray-700">No Menu Items Found</h4>
                <p className="text-xs text-gray-400 mt-1">Try another category or clear your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCafeItems.map((item) => {
                  const itemId = item.itemId || item.id;
                  const discountedPrice = Math.round(item.price * 0.8);
                  const isAvailable = item.is_available !== false && item.isAvailable !== false;
                  const isCombo = item.type === 'COMBO';

                  return (
                    <div
                      key={itemId}
                      className="bg-white rounded-2xl border border-gray-200 hover:border-purple-300 shadow-2xs hover:shadow-xs transition-all overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="relative h-44 bg-gray-100 overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&auto=format&fit=crop&q=80';
                            }}
                          />
                          <div className="absolute top-3 left-3 flex items-center gap-1.5">
                            {isCombo && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider">
                                Combo Deal
                              </span>
                            )}
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold">
                              {item.category}
                            </span>
                          </div>

                          <div className="absolute top-3 right-3">
                            {item.diet_tag === 'VEG' || item.dietTag === 'VEG' ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 bg-white">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                Veg
                              </span>
                            ) : item.diet_tag === 'HIGH_PROTEIN' || item.dietTag === 'HIGH_PROTEIN' ? (
                              <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-300 text-[10px] font-bold flex items-center gap-1 bg-white">
                                ⚡ Protein
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300 text-[10px] font-bold flex items-center gap-1 bg-white">
                                Non-Veg
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-1.5">
                          <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-1">{item.name}</h3>
                          <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                            {item.description || item.combo_items || item.comboItems || 'Freshly made to order by the club cafe chef.'}
                          </p>
                          {(item.combo_items || item.comboItems) && (
                            <div className="p-2 bg-purple-50/70 rounded-xl border border-purple-100 text-[10px] text-purple-900 font-medium">
                              Includes: {item.combo_items || item.comboItems}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pricing & Add */}
                      <div className="p-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-base font-extrabold text-[#714B67]">
                              ₹{discountedPrice}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ₹{item.price}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-600 font-bold block">20% Member Discount</span>
                        </div>

                        <button
                          disabled={!isAvailable}
                          onClick={() => addToCafeTray(item)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                            !isAvailable
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-[#714B67] hover:bg-[#57344f] text-white shadow-2xs hover:scale-105'
                          }`}
                        >
                          <Plus size={14} />
                          <span>Add to Tray</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Member's Recent Orders Tracking Section */}
            {myCafeOrders.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-[#714B67]" />
                    <h3 className="text-sm font-bold text-gray-900">Your Live &amp; Recent Cafe Orders</h3>
                  </div>
                  <span className="text-xs text-gray-500">{myCafeOrders.length} orders tracked</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {myCafeOrders.slice(0, 6).map((order) => {
                    const isPrep = order.status === 'PREPARING';
                    return (
                      <div
                        key={order.orderId}
                        className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-gray-900">{order.orderId}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                              isPrep
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                          >
                            {isPrep && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />}
                            {order.status}
                          </span>
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          <div className="flex items-center gap-1 text-gray-500">
                            <MapPin size={12} />
                            <span className="truncate">{order.deliveryLocation}</span>
                          </div>
                          <div className="font-medium text-gray-800">
                            {order.items?.map((it) => `${it.qty || 1}x ${it.name}`).join(', ') || 'Cafe items'}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-xs">
                          <span className="font-bold text-[#714B67]">₹{order.totalAmount}</span>
                          <span className="text-[10px] text-gray-400">
                            {order.createdAt ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 8. TAB 4: DIGITAL MEMBERSHIP PASS */}
        {activeTab === 'pass' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
            {/* Left: The Pass Card */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Official Membership Pass</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Show this digital pass at the club reception or turnstile</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                  Active Pass
                </span>
              </div>

              {/* Digital Pass Card (Front) */}
              <div className="rounded-2xl p-6 sm:p-7 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 text-white shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between pb-5 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center font-black text-slate-900 text-sm shadow-xs">
                      S
                    </div>
                    <div>
                      <div className="text-base font-bold text-white tracking-tight">{club.name}</div>
                      <div className="text-[11px] text-gray-300 font-medium">{club.sport || 'Multi-Sport Complex'}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    {member.membershipTier} PASS
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-5 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider">MEMBER NAME</span>
                    <span className="font-bold text-white text-base mt-0.5 block">{member.fullName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider">OFFICIAL MEMBER ID</span>
                    <span className="font-mono font-bold text-amber-300 text-base mt-0.5 block tracking-wider">
                      {member.memberId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider">VALID FROM</span>
                    <span className="font-semibold text-gray-200 mt-0.5 block">
                      {member.startDate ? new Date(member.startDate).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase tracking-wider">VALID UNTIL</span>
                    <span className="font-semibold text-gray-200 mt-0.5 block">
                      {member.endDate ? new Date(member.endDate).toLocaleDateString() : 'Auto-Renew'}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[10px]">
                  <div className="flex items-center gap-2 text-gray-300 font-mono">
                    <QrCode size={14} className="text-amber-400" />
                    <span>SKYLINE-SECURE-MEMBER-AUTH</span>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    VERIFIED
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={copyMemberId}
                  className="flex-1 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedId ? <Check size={16} className="text-white" /> : <Copy size={16} />}
                  <span>{copiedId ? 'Member ID Copied!' : 'Copy Member ID'}</span>
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Print Pass
                </button>
              </div>
            </div>

            {/* Right: Pass Details & Member Information */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100 flex items-center gap-2">
                <User size={16} className="text-[#714B67]" />
                <span>Account &amp; Security Profile</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Registered Email:</span>
                  <span className="font-semibold text-gray-900">{member.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Club Association:</span>
                  <span className="font-semibold text-gray-900">{club.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Assigned Member ID:</span>
                  <span className="font-mono font-bold text-[#714B67]">{member.memberId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Membership Tier:</span>
                  <span className="font-bold text-emerald-700 uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {member.membershipTier}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">Status:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {member.status}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200/70 text-xs text-gray-600 leading-relaxed">
                <div className="flex items-center gap-2 font-bold text-[#714B67] mb-1">
                  <ShieldCheck size={16} />
                  <span>Turnstile &amp; Reception Access</span>
                </div>
                Present your <strong>{member.memberId}</strong> Member ID at the front desk or court kiosk for contactless entry, locker access, and discount verification.
              </div>
            </div>
          </div>
        )}

        {/* 9. TAB 5: PROFILE & SETTINGS */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-fade-in">
            {profileSaved && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 text-xs font-bold shadow-xs">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <span>Profile details and club notification settings saved successfully!</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Member Card Summary */}
              <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
                  <div className="w-14 h-14 rounded-2xl bg-[#714B67] text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    {member.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">{member.fullName}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-[#714B67] text-[11px] font-bold border border-purple-200 uppercase">
                      {member.membershipTier} Member
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Member ID:</span>
                    <span className="font-mono font-bold text-[#714B67]">{member.memberId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Registered Email:</span>
                    <span className="font-medium text-gray-900 truncate max-w-[180px]">{member.email}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Club:</span>
                    <span className="font-semibold text-gray-900">{club.name}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-50">
                    <span className="text-gray-500">Account Status:</span>
                    <span className="font-bold text-emerald-600">{member.status}</span>
                  </div>
                </div>

                <button
                  onClick={handleMemberLogout}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
                >
                  <LogOut size={14} />
                  <span>Log Out of Member Portal</span>
                </button>
              </div>

              {/* Editable Profile & Settings Form */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-7 shadow-xs">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Personal Information &amp; Preferences</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Keep your contact and emergency information updated for court bookings and club notifications.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileForm.fullName || member.fullName}
                        onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-hidden focus:border-[#714B67]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-hidden focus:border-[#714B67]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Gender
                      </label>
                      <select
                        value={profileForm.gender}
                        onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-hidden focus:border-[#714B67]"
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Emergency Contact Phone
                      </label>
                      <input
                        type="text"
                        value={profileForm.emergencyContact}
                        onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-hidden focus:border-[#714B67]"
                      />
                    </div>
                  </div>

                  {/* Club Notifications & Settings */}
                  <div className="pt-5 border-t border-gray-100 space-y-3">
                    <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Club Notification Preferences</h4>

                    <div className="space-y-2.5">
                      <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <Bell size={16} className="text-[#714B67]" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">Court Booking Confirmations &amp; Reminders</span>
                            <span className="text-[11px] text-gray-500">Receive instant SMS and email when a court is booked or modified</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileForm.courtNotifications}
                          onChange={(e) => setProfileForm({ ...profileForm, courtNotifications: e.target.checked })}
                          className="w-4 h-4 accent-[#714B67]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <Coffee size={16} className="text-amber-600" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">Cafe Order Delivery Updates</span>
                            <span className="text-[11px] text-gray-500">Receive alert when food or smoothies are dispatched to your court</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileForm.cafeAlerts}
                          onChange={(e) => setProfileForm({ ...profileForm, cafeAlerts: e.target.checked })}
                          className="w-4 h-4 accent-[#714B67]"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 cursor-pointer">
                        <div className="flex items-center gap-2.5">
                          <Clock size={16} className="text-emerald-600" />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">Plan Expiry &amp; Renewal Notices</span>
                            <span className="text-[11px] text-gray-500">Notify 7 days prior to monthly membership renewal</span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={profileForm.renewalAlerts}
                          onChange={(e) => setProfileForm({ ...profileForm, renewalAlerts: e.target.checked })}
                          className="w-4 h-4 accent-[#714B67]"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Save Profile &amp; Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* 10. TAB 6: PLAN & BILLING */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 sm:p-8 shadow-xs space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Subscription &amp; Invoicing History</h2>
                <p className="text-xs text-gray-500 mt-0.5">Manage your active membership validity and renewal cycle</p>
              </div>

              <span className="px-3.5 py-1.5 rounded-full bg-purple-50 text-[#714B67] border border-purple-200 text-xs font-bold">
                {member.membershipTier} Tier • 30-Day Cycle
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Start Date</span>
                <span className="text-sm font-bold text-gray-900 mt-1 block">
                  {member.startDate ? new Date(member.startDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'N/A'}
                </span>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Expiry Date</span>
                <span className="text-sm font-bold text-gray-900 mt-1 block">
                  {member.endDate ? new Date(member.endDate).toLocaleDateString('en-US', { dateStyle: 'long' }) : 'N/A'}
                </span>
              </div>
              <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Renewal Status</span>
                <span className="text-sm font-bold text-emerald-700 mt-1 block flex items-center gap-1.5">
                  <CheckCircle2 size={15} className="text-emerald-600" />
                  <span>Continuous Access</span>
                </span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50/30 border border-purple-200/70 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Want to renew or upgrade your tier?</h4>
                <p className="text-xs text-gray-500 mt-1">
                  Enjoy unlimited access to advanced court matrix scheduling, coaching clinics, and cafe perks.
                </p>
              </div>
              <button
                onClick={() => (window.location.href = '/user/clubs')}
                className="px-5 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                Renew or Change Plan
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ========================================== */}
      {/* MODAL 1: COURT BOOKING CONFIRMATION MODAL */}
      {/* ========================================== */}
      {selectedBookingSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Reserve Court Slot</h3>
                  <span className="text-[11px] text-gray-500">{club.name}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookingSlot(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Court:</span>
                <span className="font-bold text-gray-900">{selectedBookingSlot.courtName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Date:</span>
                <span className="font-semibold text-gray-900">{selectedBookingSlot.date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Time Slot:</span>
                <span className="font-mono font-bold text-purple-700">
                  {selectedBookingSlot.timeSlotStr} – {parseInt(selectedBookingSlot.timeSlotStr.split(':')[0]) + 1}:00
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200/60">
                <span className="text-gray-500">Member Pass Benefit:</span>
                <span className="font-bold text-emerald-600">Free / Covered by {member.membershipTier} Tier</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Booking Rate:</span>
                <span className="font-bold text-gray-900 line-through">₹{selectedBookingSlot.hourlyRate}/hr</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                Special Request / Equipment Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Need 2 racquets, high-compression tennis balls"
                value={bookingNotes}
                onChange={(e) => setBookingNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-none focus:border-[#714B67]"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBookingSlot(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-xs font-bold hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={bookingLoading}
                onClick={handleConfirmCourtBooking}
                className="flex-1 py-2.5 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {bookingLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Check size={15} />
                    <span>Confirm Booking</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 2: PRO SHOP CART & CHECKOUT DRAWER   */}
      {/* ========================================== */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white h-full w-full max-w-md p-6 flex flex-col justify-between shadow-2xl animate-slide-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Your Pro Shop Cart</h3>
                    <span className="text-[11px] text-gray-500">{cart.length} unique items selected</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-16">
                  <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">Your cart is currently empty</p>
                  <p className="text-[11px] text-gray-400 mt-1">Browse equipment and gear to add items.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 max-h-[48vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <img
                        src={item.photo}
                        alt={item.name}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                        <span className="text-[11px] text-[#714B67] font-semibold">
                          ₹{item.price} each
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartQty(item.productId, -1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQty(item.productId, 1)}
                          className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                        >
                          <Plus size={12} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="p-1 text-gray-400 hover:text-red-500 cursor-pointer ml-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Pickup / Delivery Location
                  </label>
                  <select
                    value={deliveryOption}
                    onChange={(e) => setDeliveryOption(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none"
                  >
                    <option value="Pro Shop Counter Pickup">Pickup at Club Pro Shop Counter</option>
                    <option value="Deliver to Court 1 Side Bench">Deliver to Court 1 Side Bench</option>
                    <option value="Deliver to Court 2 Side Bench">Deliver to Court 2 Side Bench</option>
                    <option value="Deliver to Locker Room">Deliver to Member Locker Room</option>
                  </select>
                </div>

                <div className="bg-purple-50/60 p-3.5 rounded-xl border border-purple-200/70 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Catalog Subtotal:</span>
                    <span className="font-mono">₹{cartSubtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>15% Member Pro-Shop Privilege:</span>
                    <span className="font-mono">-₹{cartDiscount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-extrabold text-sm pt-1 border-t border-purple-200/60">
                    <span>Total Payable:</span>
                    <span className="font-mono text-[#714B67]">₹{cartTotal.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  disabled={purchaseLoading}
                  onClick={handleCheckoutPurchase}
                  className="w-full py-3 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {purchaseLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Receipt size={15} />
                      <span>Complete Purchase &amp; Buy (₹{cartTotal.toLocaleString()})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 3: PURCHASE RECEIPT CONFIRMATION     */}
      {/* ========================================== */}
      {purchaseReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6 space-y-5 animate-scale-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 size={26} />
              </div>
              <h3 className="text-base font-bold text-gray-900">Inventory Purchase Confirmed!</h3>
              <p className="text-xs text-gray-500">
                Your items have been reserved and deducted from live club stock.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Order Reference:</span>
                <span className="font-mono font-bold text-[#714B67]">{purchaseReceipt.purchaseRef}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Member:</span>
                <span className="font-bold text-gray-900">{purchaseReceipt.memberName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Delivery / Pickup:</span>
                <span className="font-semibold text-gray-800">{purchaseReceipt.deliveryLocation}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-200">
                <span className="text-gray-500">Items Purchased:</span>
                <span className="font-semibold text-gray-800">
                  {purchaseReceipt.items?.map((it) => `${it.quantity}x ${it.name}`).join(', ')}
                </span>
              </div>
              <div className="flex justify-between py-1 pt-1 font-bold text-sm text-[#714B67]">
                <span>Total Amount Paid:</span>
                <span className="font-mono">₹{purchaseReceipt.totalAmount?.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => setPurchaseReceipt(null)}
              className="w-full py-2.5 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              Done &amp; Return to Shop
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* MODAL 4: CAFE ORDER TRAY & CHECKOUT DRAWER */}
      {/* ========================================== */}
      {isCafeTrayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white h-full w-full max-w-md p-6 flex flex-col justify-between shadow-2xl animate-slide-left">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                    <Coffee size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">Cafe Order Tray</h3>
                    <span className="text-[11px] text-gray-500">{cafeOrderTray.length} meal items selected</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCafeTrayOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {cafeOrderTray.length === 0 ? (
                <div className="text-center py-16">
                  <Coffee className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-700">Your food tray is empty</p>
                  <p className="text-[11px] text-gray-400 mt-1">Add items from the menu to place an order.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-3 max-h-[44vh] overflow-y-auto pr-1">
                  {cafeOrderTray.map((item) => {
                    const id = item.itemId || item.id;
                    return (
                      <div
                        key={id}
                        className="p-3 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate">{item.name}</h4>
                          <span className="text-[11px] text-[#714B67] font-semibold">
                            ₹{item.price} each
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCafeTrayQty(id, -1)}
                            className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-6 text-center font-bold text-xs">{item.qty}</span>
                          <button
                            onClick={() => updateCafeTrayQty(id, 1)}
                            className="w-6 h-6 rounded-md bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-100 cursor-pointer"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            onClick={() => removeFromCafeTray(id)}
                            className="p-1 text-gray-400 hover:text-red-500 cursor-pointer ml-1"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cafeOrderTray.length > 0 && (
              <div className="space-y-3.5 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Deliver Food To:
                  </label>
                  <select
                    value={cafeDeliveryLocation}
                    onChange={(e) => setCafeDeliveryLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs font-medium text-gray-800 focus:outline-none"
                  >
                    <option value="Court 1 Side Bench">Court 1 Side Bench</option>
                    <option value="Court 2 Side Bench">Court 2 Side Bench</option>
                    <option value="Court 3 Side Bench">Court 3 Side Bench</option>
                    <option value="Cafe Terrace Table 4">Cafe Terrace (Table 4)</option>
                    <option value="Lounge Booth 2">Lounge (Booth 2)</option>
                    <option value="Swimming Pool Deck">Swimming Pool Deck Lounger</option>
                    <option value="Main Reception Desk">Main Reception Counter</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Kitchen Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Less ice, dressing on the side, warm beverage"
                    value={cafeNotes}
                    onChange={(e) => setCafeNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 focus:outline-none"
                  />
                </div>

                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-200/70 space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Menu Subtotal:</span>
                    <span className="font-mono">₹{cafeSubtotal}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>20% Member Food Privilege:</span>
                    <span className="font-mono">-₹{cafeDiscount}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>GST (5%):</span>
                    <span className="font-mono">₹{cafeTax}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-extrabold text-sm pt-1 border-t border-purple-200/60">
                    <span>Total Amount:</span>
                    <span className="font-mono text-[#714B67]">₹{cafeTotal}</span>
                  </div>
                </div>

                <button
                  disabled={cafeOrderLoading}
                  onClick={handlePlaceCafeOrder}
                  className="w-full py-3 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  {cafeOrderLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Utensils size={15} />
                      <span>Send Order to Kitchen (₹{cafeTotal})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
