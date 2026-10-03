/**
 * CourtMatrix.jsx
 * Full-width court × time-slot grid showing today's bookings at a glance.
 * Clicking a booked cell opens BookingModal via the onBookingClick callback.
 *
 * Props:
 *   todayBookings   – array from API
 *   courtUtil       – array from API (used to derive court columns)
 *   onBookingClick  – (booking) => void   — opens BookingModal in parent
 *   onNavigate      – (path: string) => void
 */

import React, { useMemo } from 'react';
import { BarChart2, ArrowUpRight } from 'lucide-react';
import {
  TIME_BANDS,
  FALLBACK_COURTS,
  matrixCellStyle,
  todayLabel,
} from './dashboardUtils';

// ─────────────────────────────────────────────
//  Internal helpers (scoped to this module)
// ─────────────────────────────────────────────

/** Returns the booking for a given court name + start hour, or null */
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

// ─────────────────────────────────────────────
//  Legend strip
// ─────────────────────────────────────────────

const LEGEND = [
  { label: 'Confirmed',   bg: '#eef6ee', border: '#c3dfc3' },
  { label: 'In Progress', bg: '#e8f0fa', border: '#b9cff5' },
  { label: 'Pending',     bg: '#fdf5e6', border: '#f0d9a8' },
  { label: 'Available',   bg: 'var(--color-bg)', border: 'var(--color-border)' },
];

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────

export default function CourtMatrix({ todayBookings = [], courtUtil = [], onBookingClick, onNavigate }) {
  // Build court columns — prefer live API data, fall back to static list
  const courtColumns = useMemo(
    () =>
      courtUtil.length > 0
        ? courtUtil.map((c) => ({ id: c.id, name: c.name, utilization: c.utilization }))
        : FALLBACK_COURTS,
    [courtUtil]
  );

  // Summary stats
  const { bookedCells, peakBand } = useMemo(() => {
    let booked = 0;
    let peak = { label: '–', count: 0 };

    TIME_BANDS.forEach((band) => {
      const count = courtColumns.filter((c) =>
        findBooking(todayBookings, c.name, band.startHour)
      ).length;
      booked += count;
      if (count > peak.count) peak = { label: band.label, count };
    });

    return { bookedCells: booked, peakBand: peak };
  }, [todayBookings, courtColumns]);

  return (
    <div className="card overflow-hidden">

      {/* ── Header ── */}
      <div
        className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
            <h2 className="text-[14px] font-bold" style={{ color: 'var(--color-text)' }}>
              Court Matrix
            </h2>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              — Daily Schedule
            </span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {todayLabel()} · Click any booked slot for details
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: l.bg, border: `1px solid ${l.border}` }}
              />
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Scrollable grid ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse" style={{ minWidth: '640px' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid var(--color-border)' }}>
              {/* Time column header */}
              <th
                className="text-[11px] font-semibold uppercase tracking-wider py-2.5 px-4 whitespace-nowrap text-left"
                style={{
                  color: 'var(--color-text-muted)',
                  width: '128px',
                  minWidth: '128px',
                }}
              >
                Time Slot
              </th>

              {/* Court column headers */}
              {courtColumns.map((c) => (
                <th
                  key={c.id}
                  className="text-[11px] font-semibold py-2.5 px-3 text-center"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className="truncate max-w-[120px] block"
                      title={c.name}
                    >
                      {c.name.split('–')[0].trim()}
                    </span>
                    <span
                      className="badge badge-purple"
                      style={{ fontSize: '10px', lineHeight: '1.6', padding: '0 6px' }}
                      aria-label={`${c.utilization}% utilization today`}
                    >
                      {c.utilization}%
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {TIME_BANDS.map((band, bi) => (
              <tr
                key={band.label}
                style={{
                  borderBottom:
                    bi < TIME_BANDS.length - 1
                      ? '1px solid var(--color-border-light)'
                      : 'none',
                }}
              >
                {/* Time label */}
                <td
                  className="py-2.5 px-4 whitespace-nowrap text-[11px] font-semibold"
                  style={{
                    color: 'var(--color-text-secondary)',
                    background: '#f9fafb',
                    borderRight: '1px solid var(--color-border-light)',
                  }}
                >
                  {band.label}
                </td>

                {/* Court cells */}
                {courtColumns.map((court) => {
                  const booking = findBooking(todayBookings, court.name, band.startHour);
                  const cellStyle = matrixCellStyle(booking?.status);

                  return (
                    <td
                      key={court.id}
                      className="py-2 px-2 text-center"
                      title={
                        booking
                          ? `${booking.guestName} · ${booking.bookingType} · ${booking.status}`
                          : `${court.name} — Available`
                      }
                    >
                      {booking ? (
                        <button
                          className="rounded-md px-2 py-1.5 text-left w-full transition-opacity hover:opacity-80 active:opacity-60"
                          style={{ ...cellStyle, maxWidth: '140px', display: 'block' }}
                          onClick={() => onBookingClick(booking)}
                          aria-label={`Booking: ${booking.guestName}, ${booking.bookingType}, ${booking.status}`}
                        >
                          <div className="text-[10px] font-semibold leading-tight truncate">
                            {booking.guestName}
                          </div>
                          <div
                            className="text-[9px] font-normal mt-0.5 truncate"
                            style={{ opacity: 0.7 }}
                          >
                            {booking.bookingType?.split('·')[0]?.trim() || ''}
                          </div>
                        </button>
                      ) : (
                        <span
                          className="text-[10px]"
                          style={{ color: 'var(--color-border)', fontStyle: 'italic' }}
                        >
                          —
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Summary bar ── */}
      <div
        className="px-5 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]"
        style={{
          background: '#f9fafb',
          borderTop: '1px solid var(--color-border-light)',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>
          <strong style={{ color: 'var(--color-text-secondary)' }}>{courtColumns.length}</strong>{' '}
          courts active
        </span>
        <span style={{ color: 'var(--color-border)' }}>·</span>
        <span>
          <strong style={{ color: 'var(--color-text-secondary)' }}>{bookedCells}</strong>{' '}
          slots booked
        </span>
        <span style={{ color: 'var(--color-border)' }}>·</span>
        <span>
          Peak:{' '}
          <strong style={{ color: 'var(--color-text-secondary)' }}>{peakBand.label}</strong>
        </span>
        <button
          onClick={() => onNavigate('court-bookings')}
          className="ml-auto flex items-center gap-1 font-semibold hover:underline"
          style={{ color: 'var(--color-primary)' }}
          aria-label="Open full court bookings calendar"
        >
          Full calendar <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
