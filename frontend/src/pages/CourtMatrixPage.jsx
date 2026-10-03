/**
 * CourtMatrixPage.jsx
 * Standalone page — full court × time-slot schedule with booking details modal.
 * Route: /court-matrix
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  BarChart2, RefreshCw, Plus, ArrowLeft,
  AlertTriangle,
} from 'lucide-react';
import {
  TIME_BANDS, FALLBACK_COURTS,
  matrixCellStyle, statusBadgeClass,
  todayLabel, fmtTime, fmtDate, deriveFee,
} from '../components/dashboard/dashboardUtils';
import { BookingModal } from '../components/dashboard/DashboardModals';

// ── Legend config ─────────────────────────────
const LEGEND = [
  { label: 'Confirmed',   bg: '#eef6ee', border: '#c3dfc3' },
  { label: 'In Progress', bg: '#e8f0fa', border: '#b9cff5' },
  { label: 'Pending',     bg: '#fdf5e6', border: '#f0d9a8' },
  { label: 'Available',   bg: 'var(--color-bg)', border: 'var(--color-border)' },
];

// ── Booking lookup ────────────────────────────
function findBooking(todayBookings, courtName, startHour) {
  const shortName = courtName.toLowerCase().split('–')[0].trim();
  return (
    todayBookings.find((b) => {
      const bHour = new Date(b.startTime).getHours();
      return (
        (b.court?.name || '').toLowerCase().includes(shortName) &&
        bHour >= startHour &&
        bHour < startHour + 2
      );
    }) || null
  );
}

export default function CourtMatrixPage() {
  const navigate = useNavigate();
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null); // booking for modal

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await api.getDashboard();
      if (res?.success) setData(res.data?.dashboard || res.data || res.dashboard);
      else setError(res?.message || 'Failed to load data');
    } catch (e) { setError(e?.message || 'Network error'); }
    finally { setLoading(false); setRefreshing(false); }
  };

  useEffect(() => { load(); }, []);

  const handleRefresh = () => { setRefreshing(true); load(); };

  const todayBookings = data?.todayBookings    || [];
  const courtUtil     = data?.courtUtilization || [];

  const courtColumns =
    courtUtil.length > 0
      ? courtUtil.map((c) => ({ id: c.id, name: c.name, utilization: c.utilization }))
      : FALLBACK_COURTS;

  // Summary stats
  let bookedCells = 0;
  let peakBand = { label: '–', count: 0 };
  TIME_BANDS.forEach((band) => {
    const count = courtColumns.filter((c) => findBooking(todayBookings, c.name, band.startHour)).length;
    bookedCells += count;
    if (count > peakBand.count) peakBand = { label: band.label, count };
  });

  return (
    <>
      <div className="space-y-5 animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-ghost p-1.5"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              </button>
              <BarChart2 className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
                Court Matrix
              </h1>
            </div>
            <p className="text-[13px] mt-1 ml-[52px]" style={{ color: 'var(--color-text-muted)' }}>
              {todayLabel()} · Full daily schedule view across all courts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary text-[12px]"
              aria-label="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={() => navigate('/court-bookings')}
              className="btn btn-primary text-[12px]"
              aria-label="New booking"
            >
              <Plus className="w-3.5 h-3.5" />
              New Booking
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="card px-4 py-3 flex items-center justify-between"
            style={{ background: '#fff5f5', borderColor: '#fca5a5' }}>
            <div className="flex items-center gap-2 text-[13px]">
              <AlertTriangle className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
              <span style={{ color: '#7f1d1d' }}>{error}</span>
            </div>
            <button onClick={load} className="text-[12px] font-semibold underline"
              style={{ color: 'var(--color-danger)' }}>Retry</button>
          </div>
        )}

        {/* ── Summary KPI strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Courts',    value: courtColumns.length,    sub: 'Active today' },
            { label: 'Slots Booked',    value: bookedCells,             sub: 'Across all courts' },
            { label: 'Peak Window',     value: peakBand.label,          sub: `${peakBand.count} courts busy`, wide: true },
            { label: 'Avg Utilization', value: courtUtil.length
                ? Math.round(courtUtil.reduce((s,c) => s + c.utilization, 0) / courtUtil.length) + '%'
                : '–',
              sub: 'Courts average' },
          ].map((s) => (
            <div key={s.label} className={`card p-4 space-y-1 ${s.wide ? 'sm:col-span-1' : ''}`}>
              <div className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
              <div className="text-[22px] font-bold leading-none" style={{ color: 'var(--color-text)' }}>
                {loading ? '…' : s.value}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main matrix card ── */}
        <div className="card overflow-hidden">

          {/* Card header */}
          <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ borderColor: 'var(--color-border)' }}>
            <div>
              <h2 className="text-[14px] font-bold" style={{ color: 'var(--color-text)' }}>
                Time-slot × Court Grid
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Click any booked cell to view booking details
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {LEGEND.map((l) => (
                <div key={l.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ background: l.bg, border: `1px solid ${l.border}` }} />
                  <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{l.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Loading skeleton */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: '700px' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-[11px] font-semibold uppercase tracking-wider py-3 px-4 whitespace-nowrap text-left"
                      style={{ color: 'var(--color-text-muted)', width: '130px', minWidth: '130px' }}>
                      Time Slot
                    </th>
                    {courtColumns.map((c) => (
                      <th key={c.id} className="text-[11px] font-semibold py-3 px-3 text-center"
                        style={{ color: 'var(--color-text-secondary)' }}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="truncate max-w-[130px] block" title={c.name}>
                            {c.name.split('–')[0].trim()}
                          </span>
                          <span className="badge badge-purple"
                            style={{ fontSize: '10px', lineHeight: '1.6', padding: '0 6px' }}
                            aria-label={`${c.utilization}% utilization`}>
                            {c.utilization}%
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_BANDS.map((band, bi) => (
                    <tr key={band.label}
                      style={{ borderBottom: bi < TIME_BANDS.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}>
                      <td className="py-2.5 px-4 whitespace-nowrap text-[11px] font-semibold"
                        style={{ color: 'var(--color-text-secondary)', background: '#f9fafb',
                          borderRight: '1px solid var(--color-border-light)' }}>
                        {band.label}
                      </td>
                      {courtColumns.map((court) => {
                        const booking = findBooking(todayBookings, court.name, band.startHour);
                        const cs = matrixCellStyle(booking?.status);
                        return (
                          <td key={court.id} className="py-2 px-2 text-center"
                            title={booking
                              ? `${booking.guestName} · ${booking.bookingType} · ${booking.status}`
                              : `${court.name} — Available`}>
                            {booking ? (
                              <button
                                className="rounded-md px-2 py-1.5 text-left w-full transition-opacity hover:opacity-80 active:opacity-60"
                                style={{ ...cs, maxWidth: '150px', display: 'block' }}
                                onClick={() => setSelected(booking)}
                                aria-label={`${booking.guestName} — ${booking.status}`}>
                                <div className="text-[10px] font-semibold leading-tight truncate">
                                  {booking.guestName}
                                </div>
                                <div className="text-[9px] font-normal mt-0.5 truncate" style={{ opacity: 0.7 }}>
                                  {booking.bookingType?.split('·')[0]?.trim()}
                                </div>
                              </button>
                            ) : (
                              <span className="text-[10px]"
                                style={{ color: 'var(--color-border)', fontStyle: 'italic' }}>—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!loading && (
            <div className="px-5 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]"
              style={{ background: '#f9fafb', borderTop: '1px solid var(--color-border-light)',
                color: 'var(--color-text-muted)' }}>
              <span><strong style={{ color: 'var(--color-text-secondary)' }}>{courtColumns.length}</strong> courts</span>
              <span style={{ color: 'var(--color-border)' }}>·</span>
              <span><strong style={{ color: 'var(--color-text-secondary)' }}>{bookedCells}</strong> slots booked</span>
              <span style={{ color: 'var(--color-border)' }}>·</span>
              <span>Peak: <strong style={{ color: 'var(--color-text-secondary)' }}>{peakBand.label}</strong></span>
            </div>
          )}
        </div>

        {/* ── Utilization breakdown table ── */}
        {!loading && courtUtil.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <h2 className="text-[14px] font-bold" style={{ color: 'var(--color-text)' }}>
                Court Utilization Breakdown
              </h2>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                Occupancy and booking hours per court — today
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Court</th>
                    <th>Sport</th>
                    <th>Surface</th>
                    <th>Booked Hrs</th>
                    <th>Utilization</th>
                  </tr>
                </thead>
                <tbody>
                  {courtUtil.map((c) => (
                    <tr key={c.id}>
                      <td className="font-semibold" style={{ color: 'var(--color-text)' }}>{c.name}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{c.sportType}</td>
                      <td style={{ color: 'var(--color-text-secondary)' }}>{c.surface}</td>
                      <td className="font-semibold" style={{ color: 'var(--color-text)' }}>
                        {c.bookedHours}h
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                            style={{ background: 'var(--color-border)', minWidth: '80px' }}
                            role="progressbar" aria-valuenow={c.utilization} aria-valuemax={100}>
                            <div className="h-full rounded-full"
                              style={{
                                width: `${Math.min(100, Math.max(4, c.utilization))}%`,
                                background: 'linear-gradient(to right, var(--color-primary), #0f766e)',
                              }} />
                          </div>
                          <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                            {c.utilization}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Booking detail modal ── */}
      {selected && (
        <BookingModal
          booking={selected}
          onClose={() => setSelected(null)}
          onViewAll={() => { navigate('/court-bookings'); setSelected(null); }}
        />
      )}
    </>
  );
}
