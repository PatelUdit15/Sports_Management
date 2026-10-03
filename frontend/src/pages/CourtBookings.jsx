/**
 * CourtBookings.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Comprehensive Court Facility & Booking Management:
 *   - Page Header with Live Operations status, Sync, Add Court & New Booking buttons
 *   - Add Court Modal: Set up sports facilities, surfaces, hourly rates, & statuses
 *   - Court Matrix: Interactive live grid of courts × time slots with click-to-book
 *   - Daily Ledger: Real transaction accounting derived from confirmed reservations
 *   - Facility Occupancy: Dynamic utilization % and booked hours per court
 *   - Audit Trail: Immutable activity logs of facility operations & bookings
 *   - Booking Directory & Reservations: Full filterable table with status switcher & actions
 *   - Modals: BookingModal (with status controls), AddCourtModal, NewBookingModal
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Calendar, Printer, Pencil, ChevronRight, X,
  RefreshCw, AlertTriangle, Filter, Eye, Trophy, Clock, CheckCircle2,
  Trash2, Layers, MapPin, DollarSign,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Dashboard Sub-modules ───────────────────────────────────────────────────
import CourtMatrix from '../components/dashboard/CourtMatrix';
import DailyLedger from '../components/dashboard/DailyLedger';
import AuditTrail from '../components/dashboard/AuditTrail';
import {
  BookingModal,
  LedgerModal,
  AuditModal,
} from '../components/dashboard/DashboardModals';
import {
  todayLabel, formatDateLabel, shiftDate, fmtTime, fmtDate, deriveFee, statusBadgeClass, TIME_BANDS,
} from '../components/dashboard/dashboardUtils';

export default function CourtBookings() {
  const navigate = useNavigate();
  const { hasModule, user } = useAuth();

  // ── Remote Data State ───────────────────────────────────────────────────────
  const [courts, setCourts]         = useState([]);
  const [bookings, setBookings]     = useState([]);
  const [courtUtil, setCourtUtil]   = useState([]);
  const [auditLogs, setAuditLogs]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);

  // ── Date Navigation State ───────────────────────────────────────────────────
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bookingDateScope, setBookingDateScope] = useState('ALL'); // 'ALL' | 'SELECTED'

  // ── Interactive Modals ──────────────────────────────────────────────────────
  const [bookingModal, setBookingModal]       = useState(null); // Selected booking for detail
  const [ledgerModal, setLedgerModal]         = useState(null); // Selected ledger row
  const [auditModal, setAuditModal]           = useState(null); // Selected activity log
  const [showBookingModal, setShowBookingModal] = useState(false); // New booking modal
  const [showAddCourtModal, setShowAddCourtModal] = useState(false); // Add court modal
  const [courtModalTab, setCourtModalTab]     = useState('create'); // 'create' | 'manage'
  const [successBanner, setSuccessBanner]     = useState(null);
  const [deletingCourtId, setDeletingCourtId] = useState(null);

  // ── Search & Filter State ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm]     = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // ── Form State for New Booking ──────────────────────────────────────────────
  const [bookingForm, setBookingForm] = useState({
    guestName: '',
    phone: '',
    courtId: '',
    date: new Date().toISOString().split('T')[0],
    slot: '08:00–09:30',
    bookingType: 'Singles Match',
    fee: '',
    notes: '',
  });
  const [bookingError, setBookingError] = useState(null);
  const [submittingBooking, setSubmittingBooking] = useState(false);

  // ── Form State for Add Court ────────────────────────────────────────────────
  const [courtForm, setCourtForm] = useState({
    name: '',
    sportType: 'Tennis',
    surface: 'Standard Hard Court',
    hourlyRate: 1200,
    indoor: false,
    status: 'Active',
    notes: '',
  });
  const [courtError, setCourtError] = useState(null);
  const [submittingCourt, setSubmittingCourt] = useState(false);

  // ── Module Guard ────────────────────────────────────────────────────────────
  const isModuleEnabled = useCallback((mod) => {
    if (!mod) return true;
    const m = mod.toUpperCase();
    if (m === 'COURTS' || m === 'COURT' || m === 'COURT_BOOKING')
      return hasModule ? hasModule('COURT_BOOKING') : true;
    if (m === 'MEMBERSHIP' || m === 'MEMBERS')
      return hasModule ? hasModule('MEMBERSHIP') : true;
    if (m === 'SHOP')
      return hasModule ? hasModule('SHOP') : true;
    if (m === 'CAFE' || m === 'BAR')
      return hasModule ? hasModule('BAR') : true;
    if (m === 'FINANCE' || m === 'ACCOUNTING')
      return hasModule ? hasModule('ACCOUNTING') : true;
    if (m === 'STAFF' || m === 'HR')
      return hasModule ? hasModule('HR') : true;
    return hasModule ? hasModule(m) : true;
  }, [hasModule]);

  // ── Navigation Helper ───────────────────────────────────────────────────────
  const handleNavigate = useCallback((path) => {
    if (path === 'court-bookings') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(`/${path}`);
    }
  }, [navigate]);

  // ── Fetch Live Data ─────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError(null);

      // Fetch courts, bookings, dashboard data & audit logs concurrently
      const [courtsRes, bookingsRes, dashboardRes, auditRes] = await Promise.allSettled([
        api.getCourts(),
        api.getBookings(),
        api.getDashboard(),
        api.getAuditLogs(),
      ]);

      let courtsList = [];
      if (courtsRes.status === 'fulfilled' && courtsRes.value?.success) {
        courtsList = courtsRes.value.data?.courts || courtsRes.value.courts || [];
      } else if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.success) {
        courtsList = dashboardRes.value.data?.dashboard?.courts || dashboardRes.value.data?.courts || [];
      }
      setCourts(courtsList);

      let bookingsList = [];
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value?.success) {
        bookingsList = bookingsRes.value.data?.bookings || bookingsRes.value.bookings || [];
      } else if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.success) {
        bookingsList = dashboardRes.value.data?.dashboard?.todayBookings || dashboardRes.value.data?.todayBookings || [];
      }
      setBookings(bookingsList);

      // Calculate or fetch utilization
      let utilList = [];
      if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.success) {
        utilList = dashboardRes.value.data?.dashboard?.courtUtilization || dashboardRes.value.data?.courtUtilization || [];
      }

      // If utilization not pre-computed by dashboard, compute from courts & bookings
      if (!utilList || utilList.length === 0) {
        const todayStr = new Date().toISOString().split('T')[0];
        const activeBookings = bookingsList.filter((b) => {
          const bDate = b.date || (b.startTime ? b.startTime.split('T')[0] : '');
          return bDate === todayStr && b.status !== 'Cancelled';
        });

        utilList = courtsList.map((c) => {
          const courtBookings = activeBookings.filter(
            (b) => b.courtId === c.id || b.court?.id === c.id || b.court?.name === c.name
          );
          const bookedHours = +(courtBookings.length * 1.5).toFixed(1);
          const utilization = Math.min(100, Math.round((courtBookings.length / 10) * 100));
          return {
            id: c.id,
            name: c.name,
            sportType: c.sportType,
            surface: c.surface,
            hourlyRate: c.hourlyRate,
            bookedHours,
            utilization,
            status: c.status,
          };
        });
      }
      setCourtUtil(utilList);

      // Audit logs
      let logsList = [];
      if (auditRes.status === 'fulfilled' && auditRes.value?.success) {
        logsList = auditRes.value.data?.logs || auditRes.value.logs || [];
      } else if (dashboardRes.status === 'fulfilled' && dashboardRes.value?.success) {
        logsList = dashboardRes.value.data?.dashboard?.recentActivity || dashboardRes.value.data?.recentActivity || [];
      }
      setAuditLogs(logsList);

      // Sync form default court if unset
      if (courtsList.length > 0 && !bookingForm.courtId) {
        setBookingForm((prev) => ({
          ...prev,
          courtId: courtsList[0].id,
          fee: courtsList[0].hourlyRate ? String(courtsList[0].hourlyRate) : '1200',
        }));
      }
    } catch (e) {
      setError(e?.message || 'Error connecting to booking service');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [bookingForm.courtId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // ── Date Navigation Handlers ────────────────────────────────────────────────
  const handlePrevDay = useCallback(() => {
    setSelectedDate((prev) => shiftDate(prev, -1));
  }, []);

  const handleNextDay = useCallback(() => {
    setSelectedDate((prev) => shiftDate(prev, 1));
  }, []);

  const handleToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleDateChange = useCallback((newDate) => {
    if (newDate) setSelectedDate(newDate);
  }, []);

  // ── Open Booking Modal for a specific Slot (from Matrix click) ──────────────
  const openBookingForSlot = ({ court, band, date }) => {
    const targetCourt = court || courts[0];
    const targetDate = date || selectedDate || new Date().toISOString().split('T')[0];
    setBookingForm({
      guestName: '',
      phone: '',
      courtId: targetCourt?.id,
      date: targetDate,
      slot: band?.label || '08:00–09:30',
      bookingType: 'Singles Match',
      fee: targetCourt?.hourlyRate ? String(targetCourt.hourlyRate) : String(deriveFee(targetCourt?.name || '')),
      notes: '',
    });
    setBookingError(null);
    setShowBookingModal(true);
  };

  // ── Handle New Court Creation ───────────────────────────────────────────────
  const handleCreateCourt = async (e) => {
    e.preventDefault();
    if (!courtForm.name.trim()) return;

    try {
      setSubmittingCourt(true);
      setCourtError(null);

      const res = await api.createCourt({
        ...courtForm,
        hourlyRate: Number(courtForm.hourlyRate) || 1000,
      });

      if (res?.success) {
        setShowAddCourtModal(false);
        const addedName = courtForm.name.trim();
        setCourtForm({
          name: '',
          sportType: 'Tennis',
          surface: 'Standard Hard Court',
          hourlyRate: 1200,
          indoor: false,
          status: 'Active',
          notes: '',
        });
        setSuccessBanner(`Court "${addedName}" created successfully!`);
        setTimeout(() => setSuccessBanner(null), 4000);
        await loadData();
      } else {
        setCourtError(res?.message || 'Failed to create court');
      }
    } catch (err) {
      setCourtError(err?.message || 'Failed to save court');
    } finally {
      setSubmittingCourt(false);
    }
  };

  // ── Handle Delete Court ─────────────────────────────────────────────────────
  const handleDeleteCourt = async (courtId, courtName) => {
    if (!window.confirm(`Are you sure you want to remove court "${courtName}"? This will also remove associated bookings.`)) {
      return;
    }
    try {
      setDeletingCourtId(courtId);
      const res = await api.deleteCourt(courtId);
      if (res?.success) {
        setSuccessBanner(`Court "${courtName}" removed successfully.`);
        setTimeout(() => setSuccessBanner(null), 4000);
        await loadData();
      } else {
        alert(res?.message || 'Failed to delete court');
      }
    } catch (err) {
      alert(err?.message || 'Failed to delete court');
    } finally {
      setDeletingCourtId(null);
    }
  };

  // ── Handle New Booking Creation ─────────────────────────────────────────────
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.guestName.trim()) return;

    try {
      setSubmittingBooking(true);
      setBookingError(null);

      const selectedCourt = courts.find((c) => c.id === bookingForm.courtId) || courts[0];

      const res = await api.createBooking({
        guestName: bookingForm.guestName.trim(),
        phone: bookingForm.phone.trim(),
        courtId: selectedCourt?.id,
        courtName: selectedCourt?.name,
        date: bookingForm.date,
        slot: bookingForm.slot,
        bookingType: bookingForm.bookingType,
        fee: bookingForm.fee !== '' ? Number(bookingForm.fee) : selectedCourt?.hourlyRate || 1000,
        notes: bookingForm.notes,
        status: 'Confirmed',
      });

      if (res?.success) {
        setShowBookingModal(false);
        setBookingForm({
          guestName: '',
          phone: '',
          courtId: courts[0]?.id || '',
          date: new Date().toISOString().split('T')[0],
          slot: '08:00–09:30',
          bookingType: 'Singles Match',
          fee: courts[0]?.hourlyRate ? String(courts[0].hourlyRate) : '1200',
          notes: '',
        });
        await loadData();
      } else {
        setBookingError(res?.message || 'Failed to create booking');
      }
    } catch (err) {
      setBookingError(err?.message || 'Conflict: Court slot may already be booked.');
    } finally {
      setSubmittingBooking(false);
    }
  };

  // ── Update Booking Status ───────────────────────────────────────────────────
  const handleUpdateStatus = async (bookingId, newStatus) => {
    try {
      await api.updateBookingStatus(bookingId, newStatus);
      // Refresh local list and update active modal
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      );
      if (bookingModal && bookingModal.id === bookingId) {
        setBookingModal((prev) => ({ ...prev, status: newStatus }));
      }
      await loadData();
    } catch (err) {
      alert(err?.message || 'Failed to update status');
    }
  };

  // ── Delete / Cancel Booking ─────────────────────────────────────────────────
  const handleDeleteBooking = async (bookingId) => {
    try {
      await api.deleteBooking(bookingId);
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      if (bookingModal?.id === bookingId) {
        setBookingModal(null);
      }
      await loadData();
    } catch (err) {
      alert(err?.message || 'Failed to delete booking');
    }
  };

  // ── Court Selector Change in New Booking Form ───────────────────────────────
  const handleCourtSelectionChange = (courtId) => {
    const selected = courts.find((c) => c.id === courtId);
    setBookingForm((prev) => ({
      ...prev,
      courtId,
      fee: selected?.hourlyRate ? String(selected.hourlyRate) : String(deriveFee(selected?.name || '')),
    }));
  };

  // ── Date-wise bookings for Court Matrix and Daily Ledger ────────────────────
  const dateBookings = useMemo(() => {
    return bookings.filter((b) => {
      const bDate = b.date || (b.startTime ? b.startTime.split('T')[0] : '');
      return bDate === selectedDate;
    });
  }, [bookings, selectedDate]);

  // ── Date-wise court utilization derived from real bookings on selectedDate ──
  const dateCourtUtil = useMemo(() => {
    return courts.map((c) => {
      const courtBookings = dateBookings.filter(
        (b) =>
          (b.courtId === c.id || b.court?.id === c.id || b.court?.name === c.name) &&
          b.status !== 'Cancelled'
      );
      const bookedHours = +(courtBookings.length * 1.5).toFixed(1);
      const utilization = Math.min(100, Math.round((courtBookings.length / 10) * 100));
      return {
        id: c.id,
        name: c.name,
        sportType: c.sportType,
        surface: c.surface,
        hourlyRate: c.hourlyRate,
        indoor: c.indoor,
        bookedHours,
        utilization,
        status: c.status,
      };
    });
  }, [courts, dateBookings]);

  // ── Filtered Bookings for Table ─────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const name = (b.guestName || b.member?.name || '').toLowerCase();
      const courtName = (b.court?.name || '').toLowerCase();
      const id = (b.id || '').toLowerCase();
      const term = searchTerm.toLowerCase();
      const bDate = b.date || (b.startTime ? b.startTime.split('T')[0] : '');

      const matchesSearch =
        !term || name.includes(term) || courtName.includes(term) || id.includes(term);
      const matchesStatus =
        statusFilter === 'ALL' || b.status?.toLowerCase() === statusFilter.toLowerCase();
      const matchesDate =
        bookingDateScope === 'ALL' || bDate === selectedDate;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bookings, searchTerm, statusFilter, bookingDateScope, selectedDate]);

  // ── Helper to resolve court dot color ───────────────────────────────────────
  const getCourtDotColor = (courtName = '') => {
    const n = courtName.toLowerCase();
    if (n.includes('padel')) return '#6b7280';
    if (n.includes('squash')) return '#3b82f6';
    if (n.includes('badminton')) return '#f59e0b';
    return '#16a34a';
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-[1400px] mx-auto pb-10">

      {/* ══════════════════════════════════════════════════════════════════════
          PAGE HEADER BAR
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="card px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-[20px] font-bold text-gray-900 leading-tight">
              Court Bookings & Facilities
            </h1>
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
              style={{ background: '#eef6ee', color: '#2d6a2d', border: '1px solid #c3dfc3' }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">
            Real-time court scheduling matrix, daily financial ledger, facility occupancy, and reservations directory.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn btn-secondary text-[12px] px-3 py-1.5"
            title="Refresh bookings and matrix"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Sync
          </button>

          <button
            className="btn btn-secondary text-[12px] px-3.5 py-1.5 gap-1.5"
            onClick={() => {
              setCourtError(null);
              setShowAddCourtModal(true);
            }}
            title="Add a new court to this club"
          >
            <Layers size={14} className="text-emerald-700" />
            + Add Court
          </button>

          <button
            className="btn btn-primary text-[12px] px-3.5 py-1.5 gap-1.5"
            onClick={() => {
              setBookingError(null);
              setBookingForm((prev) => ({
                ...prev,
                date: selectedDate,
                courtId: prev.courtId || courts[0]?.id || '',
                fee: prev.fee || (courts[0]?.hourlyRate ? String(courts[0].hourlyRate) : '1200'),
              }));
              setShowBookingModal(true);
            }}
          >
            <Plus size={15} /> New Booking
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SUCCESS NOTIFICATION (IF ANY)
      ══════════════════════════════════════════════════════════════════════ */}
      {successBanner && (
        <div
          className="card px-4 py-3 flex items-center justify-between text-[13px] border border-emerald-300 bg-emerald-50 text-emerald-800 animate-fade-in"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span className="font-semibold">{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-[12px] text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          ERROR BANNER (IF ANY)
      ══════════════════════════════════════════════════════════════════════ */}
      {error && (
        <div
          className="card px-4 py-3 flex items-center justify-between text-[13px]"
          style={{ background: '#fff5f5', borderColor: '#fca5a5' }}
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-danger)' }} />
            <span style={{ color: '#7f1d1d' }}>{error}</span>
          </div>
          <button
            onClick={loadData}
            className="text-[12px] font-semibold underline hover:no-underline ml-4"
            style={{ color: 'var(--color-danger)' }}
          >
            Retry
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          1. COURT MATRIX (DATE-WISE INTERACTIVE SCHEDULE)
      ══════════════════════════════════════════════════════════════════════ */}
      <section aria-label="Court Matrix Schedule">
        <CourtMatrix
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onPrevDay={handlePrevDay}
          onNextDay={handleNextDay}
          onToday={handleToday}
          todayBookings={dateBookings}
          courtUtil={dateCourtUtil}
          onBookingClick={(booking) => setBookingModal(booking)}
          onNavigate={handleNavigate}
          onAddCourt={() => {
            setCourtError(null);
            setShowAddCourtModal(true);
          }}
          onSelectSlot={openBookingForSlot}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DAILY LEDGER + AUDIT TRAIL & OCCUPANCY (DATE-AWARE)
      ══════════════════════════════════════════════════════════════════════ */}
      <section aria-label="Daily Ledger and Audit Trail">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left 2/3 — DailyLedger module */}
          <div className="lg:col-span-2">
            <DailyLedger
              todayBookings={dateBookings}
              selectedDate={selectedDate}
              isModuleEnabled={isModuleEnabled}
              onRowClick={(row) => setLedgerModal(row)}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Right 1/3 — AuditTrail module (includes live FacilityOccupancy) */}
          <div>
            <AuditTrail
              recentActivity={auditLogs}
              courtUtil={dateCourtUtil}
              selectedDate={selectedDate}
              onEntryClick={(log) => setAuditModal(log)}
              onNavigate={handleNavigate}
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          3. RESERVATIONS DIRECTORY / ALL BOOKINGS TABLE
      ══════════════════════════════════════════════════════════════════════ */}
      <section className="card overflow-hidden" aria-label="Reservations Directory">
        {/* Table header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-600" />
            <h2 className="text-[15px] font-bold text-gray-900">
              Booking Directory & Reservations
            </h2>
            <span className="text-[12px] text-gray-500 font-normal">
              ({filteredBookings.length} {filteredBookings.length === 1 ? 'record' : 'records'})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Date scope filter */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-[11px] font-medium text-gray-600">
              <button
                type="button"
                onClick={() => setBookingDateScope('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  bookingDateScope === 'ALL'
                    ? 'bg-white text-gray-900 font-bold shadow-xs'
                    : 'hover:text-gray-900'
                }`}
              >
                All Dates ({bookings.length})
              </button>
              <button
                type="button"
                onClick={() => setBookingDateScope('SELECTED')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  bookingDateScope === 'SELECTED'
                    ? 'bg-white text-gray-900 font-bold shadow-xs'
                    : 'hover:text-gray-900'
                }`}
                title={`Filter bookings on ${selectedDate}`}
              >
                {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate} ({dateBookings.length})
              </button>
            </div>

            {/* Status quick filters */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-[11px] font-medium text-gray-600">
              {['ALL', 'Confirmed', 'In Progress', 'Pending Payment', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    statusFilter === st
                      ? 'bg-white text-gray-900 font-bold shadow-xs'
                      : 'hover:text-gray-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search player, court, ID…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input pl-7 w-52 text-[12px]"
              />
            </div>
          </div>
        </div>

        {/* Table content */}
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Member / Guest</th>
                <th>Sport / Facility</th>
                <th>Time Slot</th>
                <th>Fee</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-400 text-[13px]">
                    {searchTerm || statusFilter !== 'ALL'
                      ? `No bookings matching "${searchTerm || statusFilter}".`
                      : 'No court reservations logged yet. Click "+ New Booking" to reserve a slot.'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-gray-50/70 transition-colors cursor-pointer"
                    onClick={() => setBookingModal(b)}
                  >
                    <td className="font-mono text-[12px] text-gray-500 whitespace-nowrap font-medium">
                      #{b.id.replace('#', '')}
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-900">
                          {b.guestName || b.member?.name || 'Member'}
                        </span>
                        <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </span>
                      </div>
                      {b.member?.phone && (
                        <div className="text-[10px] text-gray-400">{b.member.phone}</div>
                      )}
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: getCourtDotColor(b.court?.name) }}
                        />
                        <span className="text-gray-700 font-medium">
                          {b.court?.name || 'Main Court'}
                        </span>
                      </div>
                    </td>
                    <td className="font-mono text-[12px] text-gray-600 whitespace-nowrap">
                      <div className="font-semibold text-gray-800">
                        {b.slot || (b.startTime ? `${fmtTime(b.startTime)} – ${fmtTime(b.endTime)}` : '08:00 – 09:30')}
                      </div>
                      <div className="text-[10px] text-gray-400 font-sans">
                        {b.date || (b.startTime ? b.startTime.split('T')[0] : selectedDate)}
                      </div>
                    </td>
                    <td className="font-semibold text-gray-900 whitespace-nowrap">
                      ₹{Number(b.fee || deriveFee(b.court?.name || '')).toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={statusBadgeClass(b.status)}>
                        {b.status}
                      </span>
                    </td>
                    <td className="text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setBookingModal(b)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-emerald-700 transition-colors"
                          title="View details"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Print slip"
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          onClick={() => setBookingModal(b)}
                          className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors"
                          title="Update status"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete booking #${b.id}?`)) {
                              handleDeleteBooking(b.id);
                            }
                          }}
                          className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete booking"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <p className="text-[12px] text-gray-500">
            Showing {filteredBookings.length} of {bookings.length} court bookings • {todayLabel()}
          </p>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-gray-400 font-medium mr-2">
              Courts Active: {courts.length}
            </span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. MODALS
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Booking Detail Modal with Status Switcher & Delete */}
      {bookingModal && (
        <BookingModal
          booking={bookingModal}
          onClose={() => setBookingModal(null)}
          onViewAll={() => {
            setBookingModal(null);
            window.scrollTo({ top: 900, behavior: 'smooth' });
          }}
          onStatusChange={handleUpdateStatus}
          onDelete={handleDeleteBooking}
        />
      )}

      {/* Daily Ledger Detail Modal */}
      {ledgerModal && (
        <LedgerModal
          row={ledgerModal}
          onClose={() => setLedgerModal(null)}
          onViewFinance={() => handleNavigate('finance')}
        />
      )}

      {/* Audit Trail Detail Modal */}
      {auditModal && (
        <AuditModal
          log={auditModal}
          onClose={() => setAuditModal(null)}
          onViewReports={() => handleNavigate('reports')}
        />
      )}

      {/* ── ADD COURT MODAL (TABBED: CREATE / MANAGE) ─────────────────────────── */}
      {showAddCourtModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddCourtModal(false);
          }}
        >
          <div className="card w-full max-w-lg shadow-2xl animate-fade-in bg-white overflow-hidden flex flex-col max-h-[90vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Layers size={17} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                    Facility & Court Configuration
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Add new sports courts or manage active facility surfaces and rates.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddCourtModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors ml-4"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-gray-100 bg-gray-50/70 px-6 pt-2 gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setCourtModalTab('create')}
                className={`pb-2.5 px-3 text-[12px] font-bold border-b-2 transition-colors ${
                  courtModalTab === 'create'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                + Add New Court
              </button>
              <button
                type="button"
                onClick={() => setCourtModalTab('manage')}
                className={`pb-2.5 px-3 text-[12px] font-bold border-b-2 transition-colors ${
                  courtModalTab === 'manage'
                    ? 'border-emerald-600 text-emerald-800'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                Manage Existing ({courts.length})
              </button>
            </div>

            {/* TAB 1: CREATE COURT FORM */}
            {courtModalTab === 'create' ? (
              <form onSubmit={handleCreateCourt} className="flex-1 flex flex-col min-h-0">
                <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
                  {courtError && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-center gap-2">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>{courtError}</span>
                    </div>
                  )}

                  <div>
                    <label className="form-label text-[12px]">Court Name *</label>
                    <input
                      className="form-input"
                      placeholder="e.g. Court 2 - Panoramic Padel"
                      value={courtForm.name}
                      onChange={(e) => setCourtForm({ ...courtForm, name: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-[12px]">Sport Type *</label>
                      <select
                        className="form-input"
                        value={courtForm.sportType}
                        onChange={(e) => setCourtForm({ ...courtForm, sportType: e.target.value })}
                      >
                        <option value="Tennis">Tennis</option>
                        <option value="Padel">Padel</option>
                        <option value="Badminton">Badminton</option>
                        <option value="Squash">Squash</option>
                        <option value="Pickleball">Pickleball</option>
                        <option value="Table Tennis">Table Tennis</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Futsal">Futsal</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label text-[12px]">Hourly Rate (₹) *</label>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        placeholder="1200"
                        value={courtForm.hourlyRate}
                        onChange={(e) => setCourtForm({ ...courtForm, hourlyRate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-[12px]">Surface Material</label>
                    <select
                      className="form-input"
                      value={courtForm.surface}
                      onChange={(e) => setCourtForm({ ...courtForm, surface: e.target.value })}
                    >
                      <option value="Standard Hard Court">Standard Hard Court</option>
                      <option value="Plexicushion Hard">Plexicushion Hard</option>
                      <option value="Red Roland Garros Clay">Red Roland Garros Clay</option>
                      <option value="Panoramic Glass & Turf">Panoramic Glass & Turf</option>
                      <option value="BWF Grade Synthetic">BWF Grade Synthetic</option>
                      <option value="Select Hard Maple">Select Hard Maple</option>
                      <option value="Acrylic Cushion">Acrylic Cushion</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="form-label text-[12px]">Environment</label>
                      <select
                        className="form-input"
                        value={courtForm.indoor ? 'Indoor' : 'Outdoor'}
                        onChange={(e) => setCourtForm({ ...courtForm, indoor: e.target.value === 'Indoor' })}
                      >
                        <option value="Outdoor">Outdoor</option>
                        <option value="Indoor">Indoor (Air Conditioned)</option>
                      </select>
                    </div>

                    <div>
                      <label className="form-label text-[12px]">Operational Status</label>
                      <select
                        className="form-input"
                        value={courtForm.status}
                        onChange={(e) => setCourtForm({ ...courtForm, status: e.target.value })}
                      >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Under Maintenance</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="form-label text-[12px]">Notes / Amenities (Optional)</label>
                    <input
                      className="form-input"
                      placeholder="e.g. LED Floodlights, Ball machine available"
                      value={courtForm.notes}
                      onChange={(e) => setCourtForm({ ...courtForm, notes: e.target.value })}
                    />
                  </div>
                </div>

                {/* Pinned Action Footer */}
                <div className="border-t border-gray-100 px-6 py-3.5 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
                  <button
                    type="button"
                    className="btn btn-secondary px-4 py-2 text-[13px]"
                    onClick={() => setShowAddCourtModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingCourt || !courtForm.name.trim()}
                    className="btn btn-primary px-5 py-2 text-[13px] font-semibold"
                  >
                    {submittingCourt ? 'Saving…' : 'Save Court'}
                  </button>
                </div>
              </form>
            ) : (
              /* TAB 2: MANAGE EXISTING COURTS */
              <div className="flex-1 flex flex-col min-h-0">
                <div className="overflow-y-auto px-6 py-4 space-y-3 flex-1">
                  {courts.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                      <p className="text-[13px]">No courts configured in this club yet.</p>
                      <button
                        type="button"
                        onClick={() => setCourtModalTab('create')}
                        className="btn btn-primary text-[12px] mt-3 mx-auto"
                      >
                        + Add First Court
                      </button>
                    </div>
                  ) : (
                    courts.map((court) => (
                      <div
                        key={court.id}
                        className="p-3.5 rounded-lg border border-gray-200 bg-white hover:border-gray-300 transition-all flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                              style={{ background: getCourtDotColor(court.name) }}
                            />
                            <h4 className="font-bold text-[13px] text-gray-900 truncate">
                              {court.name}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                court.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {court.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-gray-700">{court.sportType}</span>
                            <span>•</span>
                            <span>{court.surface || 'Standard'}</span>
                            <span>•</span>
                            <span className="font-semibold text-gray-900">₹{court.hourlyRate}/session</span>
                            <span>•</span>
                            <span>{court.indoor ? 'Indoor AC' : 'Outdoor'}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteCourt(court.id, court.name)}
                          disabled={deletingCourtId === court.id}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors flex-shrink-0"
                          title={`Delete ${court.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="border-t border-gray-100 px-6 py-3.5 bg-gray-50 flex items-center justify-between gap-3 flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setCourtModalTab('create')}
                    className="btn btn-secondary text-[12px] px-3.5 py-2 text-emerald-800 font-bold"
                  >
                    + Add Another Court
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary px-4 py-2 text-[13px]"
                    onClick={() => setShowAddCourtModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── NEW BOOKING MODAL (RESPONSIVE WITH PINNED FOOTER) ────────────────── */}
      {showBookingModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowBookingModal(false);
          }}
        >
          <div className="card w-full max-w-md shadow-2xl animate-fade-in bg-white overflow-hidden flex flex-col max-h-[90vh] my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">New Court Reservation</h2>
                <p className="text-[12px] text-gray-500 mt-0.5">Reserve court slot for member or walk-in guest.</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 ml-4 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="flex-1 flex flex-col min-h-0">
              <div className="overflow-y-auto px-6 py-4 space-y-4 flex-1">
                {bookingError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[12px] flex items-center gap-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                <div>
                  <label className="form-label text-[12px]">Member / Guest Name *</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Rohan Sharma"
                    value={bookingForm.guestName}
                    onChange={(e) => setBookingForm({ ...bookingForm, guestName: e.target.value })}
                    required
                    autoFocus
                  />
                </div>

                <div>
                  <label className="form-label text-[12px]">Contact Phone</label>
                  <input
                    className="form-input"
                    placeholder="+91 98000 00000"
                    value={bookingForm.phone}
                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label text-[12px]">Court / Facility *</label>
                  {courts.length === 0 ? (
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-800 text-[12px] flex items-center justify-between">
                      <span>No courts created yet.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowBookingModal(false);
                          setCourtModalTab('create');
                          setShowAddCourtModal(true);
                        }}
                        className="font-bold underline text-amber-900"
                      >
                        Add Court first
                      </button>
                    </div>
                  ) : (
                    <select
                      className="form-input"
                      value={bookingForm.courtId}
                      onChange={(e) => handleCourtSelectionChange(e.target.value)}
                      required
                    >
                      {courts.map((court) => (
                        <option key={court.id} value={court.id}>
                          {court.name} ({court.sportType} · ₹{court.hourlyRate}/session)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-[12px]">Date</label>
                    <input
                      className="form-input"
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label text-[12px]">Time Slot</label>
                    <select
                      className="form-input"
                      value={bookingForm.slot}
                      onChange={(e) => setBookingForm({ ...bookingForm, slot: e.target.value })}
                    >
                      {TIME_BANDS.map((band) => (
                        <option key={band.label} value={band.label}>
                          {band.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="form-label text-[12px]">Booking Type</label>
                    <select
                      className="form-input"
                      value={bookingForm.bookingType}
                      onChange={(e) => setBookingForm({ ...bookingForm, bookingType: e.target.value })}
                    >
                      <option value="Singles Match">Singles Match</option>
                      <option value="Doubles Match">Doubles Match</option>
                      <option value="Coaching Session">Coaching Session</option>
                      <option value="Casual Practice">Casual Practice</option>
                      <option value="Tournament">Tournament</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label text-[12px]">Calculated Fee (₹)</label>
                    <input
                      className="form-input"
                      type="number"
                      value={bookingForm.fee}
                      onChange={(e) => setBookingForm({ ...bookingForm, fee: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label text-[12px]">Notes (Optional)</label>
                  <input
                    className="form-input"
                    placeholder="e.g. Requests coach assistance, bringing guest"
                    value={bookingForm.notes}
                    onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Pinned Action Footer */}
              <div className="border-t border-gray-100 px-6 py-3.5 bg-gray-50 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-secondary px-4 py-2 text-[13px]"
                  onClick={() => setShowBookingModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking || courts.length === 0}
                  className="btn btn-primary px-5 py-2 text-[13px] font-semibold"
                >
                  {submittingBooking ? 'Confirming…' : 'Confirm Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
