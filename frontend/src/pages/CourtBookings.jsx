/**
 * CourtBookings.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Court Booking Management — includes:
 *   - Page Header & Action Controls (Refresh/Sync, New Booking)
 *   - CourtMatrix: Live court × time-slot matrix grid with slot detail modal
 *   - DailyLedger: Financial transaction ledger for today's bookings & club sales
 *   - AuditTrail: Activity feed and facility court occupancy breakdown
 *   - Reservations Directory: Filterable & searchable table of all bookings
 *   - Interactive Modals: BookingModal, LedgerModal, AuditModal, NewBookingModal
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Calendar, Printer, Pencil, ChevronRight, X,
  RefreshCw, AlertTriangle, Filter, Eye, Trophy, Clock, CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

// ── Transferred Sub-modules ─────────────────────────────────────────────────
import CourtMatrix from '../components/dashboard/CourtMatrix';
import DailyLedger from '../components/dashboard/DailyLedger';
import AuditTrail  from '../components/dashboard/AuditTrail';
import {
  BookingModal,
  LedgerModal,
  AuditModal,
} from '../components/dashboard/DashboardModals';
import {
  todayLabel, fmtTime, fmtDate, deriveFee, statusBadgeClass,
} from '../components/dashboard/dashboardUtils';

// ── Static fallback bookings if API returns empty ───────────────────────────
const FALLBACK_BOOKINGS = [
  {
    id: 'BK-9481',
    startTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(),
    court: { id: 'CRT-1', name: 'Court 1 - Indoor Tennis' },
    guestName: 'Karan Singhania',
    member: { phone: '+91 98100 11001' },
    bookingType: 'Tennis • Singles',
    status: 'Confirmed',
  },
  {
    id: 'BK-9482',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
    court: { id: 'CRT-4', name: 'Court 4 - Squash' },
    guestName: 'Ananya Sen',
    member: { phone: '+91 98200 22002' },
    bookingType: 'Squash • Match',
    status: 'In Progress',
  },
  {
    id: 'BK-9483',
    startTime: new Date(new Date().setHours(6, 30, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(8, 0, 0, 0)).toISOString(),
    court: { id: 'CRT-2', name: 'Court 2 - Padel Beta' },
    guestName: 'Vikram Joshi',
    member: { phone: '+91 98500 55005' },
    bookingType: 'Padel • Singles',
    status: 'Completed',
  },
  {
    id: 'BK-9484',
    startTime: new Date(new Date().setHours(11, 45, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(13, 15, 0, 0)).toISOString(),
    court: { id: 'CRT-3', name: 'Court 3 - Badminton' },
    guestName: 'Devika Pillai',
    member: { phone: '+91 98600 66006' },
    bookingType: 'Badminton • Singles',
    status: 'Pending Payment',
  },
  {
    id: 'BK-9485',
    startTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(15, 30, 0, 0)).toISOString(),
    court: { id: 'CRT-5', name: 'Court 5 - Clay Tennis' },
    guestName: 'Sameer Varma',
    member: { phone: '+91 98700 77007' },
    bookingType: 'Tennis • Coaching',
    status: 'Confirmed',
  },
];

export default function CourtBookings() {
  const navigate = useNavigate();
  const { hasModule } = useAuth();

  // ── Remote Data State ───────────────────────────────────────────────────────
  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError]           = useState(null);

  // ── Interactive Modals ──────────────────────────────────────────────────────
  const [bookingModal, setBookingModal] = useState(null); // booking object | null
  const [ledgerModal,  setLedgerModal]  = useState(null); // ledger row    | null
  const [auditModal,   setAuditModal]   = useState(null); // activity log  | null
  const [showModal,    setShowModal]    = useState(false); // New booking modal

  // ── Filter & Search State ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm]       = useState('');
  const [statusFilter, setStatusFilter]   = useState('ALL');
  const [extraBookings, setExtraBookings] = useState([]);

  // ── Form State for New Booking ──────────────────────────────────────────────
  const [formData, setFormData] = useState({
    member: '',
    court: 'Court 1 - Indoor Tennis',
    date: new Date().toISOString().split('T')[0],
    slot: '08:00–09:30',
    fee: '1200',
    phone: '',
  });

  // ── Navigation Helper ───────────────────────────────────────────────────────
  const handleNavigate = useCallback((path) => {
    if (path === 'court-bookings') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(`/${path}`);
    }
  }, [navigate]);

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

  // ── Fetch Dashboard Data ────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const res = await api.getDashboard();
      if (res?.success) {
        setData(res.data?.dashboard || res.data || res.dashboard);
      } else {
        setError(res?.message || 'Failed to load booking schedule');
      }
    } catch (e) {
      setError(e?.message || 'Network error while retrieving booking data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // ── Extract Data ────────────────────────────────────────────────────────────
  const rawTodayBookings = data?.todayBookings && data.todayBookings.length > 0
    ? data.todayBookings
    : FALLBACK_BOOKINGS;

  const todayBookings = useMemo(() => {
    return [...extraBookings, ...rawTodayBookings];
  }, [extraBookings, rawTodayBookings]);

  const courtUtil      = data?.courtUtilization || [];
  const recentActivity = data?.recentActivity   || [];

  // ── Filtered Bookings for Table ─────────────────────────────────────────────
  const filteredBookings = useMemo(() => {
    return todayBookings.filter((b) => {
      const name = (b.guestName || b.member?.name || '').toLowerCase();
      const courtName = (b.court?.name || '').toLowerCase();
      const id = (b.id || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      const matchesSearch = !term || name.includes(term) || courtName.includes(term) || id.includes(term);
      const matchesStatus = statusFilter === 'ALL' || b.status?.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [todayBookings, searchTerm, statusFilter]);

  // ── Create New Booking Handler ──────────────────────────────────────────────
  const handleCreateBooking = (e) => {
    e.preventDefault();
    if (!formData.member) return;

    const [startHourStr] = formData.slot.split('–')[0].split(':');
    const startHour = parseInt(startHourStr, 10) || 8;
    const startDate = new Date();
    startDate.setHours(startHour, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(startHour + 1, 30, 0, 0);

    const newBooking = {
      id: `BK-${Math.floor(9500 + Math.random() * 500)}`,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      court: { id: `CRT-${Date.now()}`, name: formData.court },
      guestName: formData.member,
      member: { phone: formData.phone || '+91 98000 00000' },
      bookingType: `${formData.court.split('-')[1]?.trim() || 'Court'} • Reservation`,
      status: 'Confirmed',
    };

    setExtraBookings((prev) => [newBooking, ...prev]);
    setShowModal(false);
    setFormData({
      member: '',
      court: 'Court 1 - Indoor Tennis',
      date: new Date().toISOString().split('T')[0],
      slot: '08:00–09:30',
      fee: '1200',
      phone: '',
    });
  };

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
              Court Bookings
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
            Real-time court matrix schedule, daily transaction ledger, and audit trail.
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
            className="btn btn-primary text-[12px] px-3.5 py-1.5 gap-1.5"
            onClick={() => setShowModal(true)}
          >
            <Plus size={15} /> New Booking
          </button>
        </div>
      </div>

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
          1. COURT MATRIX  (Transferred from Dashboard)
      ══════════════════════════════════════════════════════════════════════ */}
      <section aria-label="Court Matrix Schedule">
        <CourtMatrix
          todayBookings={todayBookings}
          courtUtil={courtUtil}
          onBookingClick={(booking) => setBookingModal(booking)}
          onNavigate={handleNavigate}
        />
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          2. DAILY LEDGER + AUDIT TRAIL  (Transferred from Dashboard)
      ══════════════════════════════════════════════════════════════════════ */}
      <section aria-label="Daily Ledger and Audit Trail">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Left 2/3 — DailyLedger module */}
          <div className="lg:col-span-2">
            <DailyLedger
              todayBookings={todayBookings}
              isModuleEnabled={isModuleEnabled}
              onRowClick={(row) => setLedgerModal(row)}
              onNavigate={handleNavigate}
            />
          </div>

          {/* Right 1/3 — AuditTrail module (includes FacilityOccupancy) */}
          <div>
            <AuditTrail
              recentActivity={recentActivity}
              courtUtil={courtUtil}
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
            {/* Status quick filters */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-[11px] font-medium text-gray-600">
              {['ALL', 'Confirmed', 'In Progress', 'Pending'].map((st) => (
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
                placeholder="Filter player, court, ID…"
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
                <th>Member Name</th>
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
                  <td colSpan={7} className="text-center py-8 text-gray-400 text-[13px]">
                    No matching bookings found for "{searchTerm || statusFilter}".
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
                      {fmtTime(b.startTime)} – {fmtTime(b.endTime)}
                    </td>
                    <td className="font-semibold text-gray-900 whitespace-nowrap">
                      ₹{deriveFee(b.court?.name || '').toLocaleString('en-IN')}
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
                          title="Edit booking"
                        >
                          <Pencil size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <p className="text-[12px] text-gray-500">
            Showing {filteredBookings.length} of {todayBookings.length} court bookings • {todayLabel()}
          </p>
          <div className="flex items-center gap-1">
            <button className="btn btn-secondary text-[12px] px-3.5 py-1.5">Previous</button>
            <button className="btn btn-primary  text-[12px] px-3.5 py-1.5">1</button>
            <button className="btn btn-secondary text-[12px] px-3.5 py-1.5">Next</button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          4. MODALS (Transferred & Enhanced)
      ══════════════════════════════════════════════════════════════════════ */}

      {/* Booking Detail Modal (when clicked from CourtMatrix or Directory) */}
      {bookingModal && (
        <BookingModal
          booking={bookingModal}
          onClose={() => setBookingModal(null)}
          onViewAll={() => {
            setBookingModal(null);
            window.scrollTo({ top: 900, behavior: 'smooth' });
          }}
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

      {/* New Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="card w-full max-w-md shadow-xl animate-fade-in bg-white overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-[15px] font-bold text-gray-900">New Court Booking</h2>
                <p className="text-[12px] text-gray-500 mt-0.5">Reserve court slot for member or guest.</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded hover:bg-gray-100 text-gray-400 ml-4 transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form className="px-6 py-5 space-y-4" onSubmit={handleCreateBooking}>
              <div>
                <label className="form-label">Member / Guest Name *</label>
                <input
                  className="form-input"
                  placeholder="e.g. Rohan Sharma"
                  value={formData.member}
                  onChange={(e) => setFormData({ ...formData, member: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Contact Phone</label>
                <input
                  className="form-input"
                  placeholder="+91 98000 00000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label">Court / Facility *</label>
                <select
                  className="form-input"
                  value={formData.court}
                  onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                >
                  <option>Court 1 - Indoor Tennis</option>
                  <option>Court 2 - Padel Beta</option>
                  <option>Court 3 - Badminton</option>
                  <option>Court 4 - Squash</option>
                  <option>Court 5 - Clay Tennis</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Date</label>
                  <input
                    className="form-input"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Time Slot</label>
                  <select
                    className="form-input"
                    value={formData.slot}
                    onChange={(e) => setFormData({ ...formData, slot: e.target.value })}
                  >
                    <option>06:00–07:30</option>
                    <option>08:00–09:30</option>
                    <option>10:00–11:30</option>
                    <option>12:00–13:30</option>
                    <option>14:00–15:30</option>
                    <option>16:00–17:30</option>
                    <option>18:00–19:30</option>
                    <option>19:30–21:00</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Calculated Fee (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  value={deriveFee(formData.court)}
                  readOnly
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  className="btn btn-secondary flex-1 justify-center py-2.5"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 justify-center py-2.5"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
