/**
 * CourtMatrix.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Interactive court × time-slot scheduling matrix with date-wise navigation.
 * Allows viewing any day's court bookings, navigating previous/next days,
 * picking arbitrary dates, and clicking available slots to instantly reserve.
 *
 * Props:
 *   selectedDate    – current date string (YYYY-MM-DD)
 *   onDateChange    – (newDate: string) => void
 *   onPrevDay       – () => void
 *   onNextDay       – () => void
 *   onToday         – () => void
 *   todayBookings   – array of bookings for the selected date
 *   courtUtil       – array of court utilization metrics
 *   onBookingClick  – (booking) => void
 *   onNavigate      – (path: string) => void
 *   onAddCourt      – () => void
 *   onSelectSlot    – ({ court, band, date }) => void
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useMemo } from 'react';
import {
  BarChart2, ChevronLeft, ChevronRight, Calendar, Plus, Clock,
} from 'lucide-react';
import {
  TIME_BANDS,
  FALLBACK_COURTS,
  matrixCellStyle,
  formatDateLabel,
  todayLabel,
} from './dashboardUtils';

// ─────────────────────────────────────────────
//  Internal helpers
// ─────────────────────────────────────────────

/** Match a booking for a specific court, time-slot band, and selected date */
function findBooking(bookings = [], court = {}, band = {}, selectedDate = '') {
  const shortCourtName = (court.name || '').toLowerCase().split('–')[0].split('-')[0].trim();

  return (
    bookings.find((b) => {
      if (b.status === 'Cancelled') return false;

      // 1. Verify court match (ID or Name)
      const bCourtId = b.courtId || b.court?.id;
      const bCourtName = (b.court?.name || '').toLowerCase();
      const courtMatches =
        (bCourtId && court.id && bCourtId === court.id) ||
        (court.name && bCourtName.includes(shortCourtName));
      if (!courtMatches) return false;

      // 2. Verify date match (if selectedDate is given)
      const bDate = b.date || (b.startTime ? b.startTime.split('T')[0] : '');
      if (selectedDate && bDate && bDate !== selectedDate) return false;

      // 3. Verify slot match
      if (b.slot) {
        const cleanBSlot = b.slot.replace('—', '-').replace('–', '-').trim();
        const cleanBand = band.label.replace('—', '-').replace('–', '-').trim();
        if (cleanBSlot === cleanBand) return true;
      }
      if (b.startTime) {
        const bHour = new Date(b.startTime).getHours();
        return bHour >= band.startHour && bHour < band.startHour + 2;
      }

      return false;
    }) || null
  );
}

// ─────────────────────────────────────────────
//  Legend items
// ─────────────────────────────────────────────

const LEGEND = [
  { label: 'Confirmed',   bg: '#eef6ee', border: '#c3dfc3' },
  { label: 'In Progress', bg: '#e8f0fa', border: '#b9cff5' },
  { label: 'Pending',     bg: '#fdf5e6', border: '#f0d9a8' },
  { label: 'Available',   bg: 'var(--color-bg)', border: 'var(--color-border)' },
];

export default function CourtMatrix({
  selectedDate = new Date().toISOString().split('T')[0],
  onDateChange,
  onPrevDay,
  onNextDay,
  onToday,
  todayBookings = [],
  courtUtil = [],
  onBookingClick,
  onNavigate,
  onAddCourt,
  onSelectSlot,
}) {
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const isToday = selectedDate === todayStr;

  // Build court columns from live data
  const courtColumns = useMemo(
    () =>
      courtUtil.length > 0
        ? courtUtil.map((c) => ({
            id: c.id,
            name: c.name,
            utilization: c.utilization !== undefined ? c.utilization : 0,
            hourlyRate: c.hourlyRate,
            sportType: c.sportType,
          }))
        : FALLBACK_COURTS,
    [courtUtil]
  );

  // Summary stats for selected date
  const { bookedCells, peakBand } = useMemo(() => {
    let booked = 0;
    let peak = { label: '–', count: 0 };

    TIME_BANDS.forEach((band) => {
      const count = courtColumns.filter((c) =>
        findBooking(todayBookings, c, band, selectedDate)
      ).length;
      booked += count;
      if (count > peak.count) peak = { label: band.label, count };
    });

    return { bookedCells: booked, peakBand: peak };
  }, [todayBookings, courtColumns, selectedDate]);

  return (
    <div className="card overflow-hidden">

      {/* ── 1. Top Header: Title & Legend ── */}
      <div
        className="px-5 py-3.5 border-b flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <BarChart2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[15px] font-bold text-gray-900 leading-tight">
                Court Matrix
              </h2>
              <span className="text-[11px] font-medium text-gray-500">
                — Facility Schedule
              </span>
            </div>
            <p className="text-[12px] text-gray-500 mt-0.5">
              Live court availability grid. Click any booked reservation or vacant slot.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 flex-wrap">
          {LEGEND.map((l) => (
            <div key={l.label} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: l.bg, border: `1px solid ${l.border}` }}
              />
              <span className="text-[11px] text-gray-600 font-medium">
                {l.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Date Navigation Toolbar ── */}
      <div className="px-5 py-2.5 bg-gray-50/80 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Date Selector & Prev / Next Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center bg-white border border-gray-200 rounded-lg shadow-2xs overflow-hidden">
            <button
              type="button"
              onClick={onPrevDay}
              className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors border-r border-gray-100"
              title="Previous Day"
              aria-label="Previous Day"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="relative flex items-center px-2.5 py-1 gap-2">
              <Calendar size={14} className="text-emerald-600 shrink-0 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => onDateChange && onDateChange(e.target.value)}
                className="bg-transparent text-[12px] font-bold text-gray-800 focus:outline-none cursor-pointer"
                title="Select arbitrary date"
              />
            </div>

            <button
              type="button"
              onClick={onNextDay}
              className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors border-l border-gray-100"
              title="Next Day"
              aria-label="Next Day"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Quick Date Pills */}
          <button
            type="button"
            onClick={onToday}
            className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-colors border ${
              isToday
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-2xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
            }`}
          >
            Today
          </button>

          {/* Formatted Date Label */}
          <span className="text-[12px] font-semibold text-gray-700 ml-1">
            {formatDateLabel(selectedDate)}
          </span>
        </div>

        {/* Selected Date Summary Metrics */}
        <div className="flex items-center gap-2.5 text-[11px] font-semibold text-gray-600">
          <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 shadow-2xs">
            Bookings: <strong className="text-gray-900 font-bold">{bookedCells}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-white border border-gray-200 shadow-2xs">
            Peak Slot: <strong className="text-emerald-700 font-bold">{peakBand.label}</strong>
          </span>
        </div>
      </div>

      {/* ── 3. Scrollable Grid or Empty State ── */}
      {courtColumns.length === 0 ? (
        <div className="p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BarChart2 className="w-6 h-6" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900">No Courts Configured</h3>
          <p className="text-[13px] text-gray-500 max-w-sm mx-auto">
            Add your club's sports facilities and courts to generate the live scheduling matrix and open reservations.
          </p>
          {onAddCourt && (
            <button
              onClick={onAddCourt}
              className="btn btn-primary text-[12px] inline-flex items-center gap-1.5 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Add First Court
            </button>
          )}
        </div>
      ) : (
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
                        className="truncate max-w-[130px] block font-bold text-gray-900 text-[12px]"
                        title={c.name}
                      >
                        {c.name.split('–')[0].split('-')[0].trim()}
                      </span>
                      <div className="flex items-center gap-1">
                        <span
                          className="badge badge-purple"
                          style={{ fontSize: '10px', lineHeight: '1.6', padding: '0 6px' }}
                          title={`Utilization for ${formatDateLabel(selectedDate)}`}
                        >
                          {c.utilization}%
                        </span>
                        {c.hourlyRate && (
                          <span className="text-[10px] text-gray-500 font-normal">
                            ₹{c.hourlyRate}
                          </span>
                        )}
                      </div>
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
                    const booking = findBooking(todayBookings, court, band, selectedDate);
                    const cellStyle = matrixCellStyle(booking?.status);

                    return (
                      <td
                        key={court.id}
                        className="py-2 px-2 text-center"
                        title={
                          booking
                            ? `${booking.guestName} · ${booking.bookingType} · ${booking.status}`
                            : `${court.name} — Available on ${selectedDate} (click to book)`
                        }
                      >
                        {booking ? (
                          <button
                            className="rounded-md px-2 py-1.5 text-left w-full transition-opacity hover:opacity-85 active:opacity-60 shadow-2xs"
                            style={{ ...cellStyle, maxWidth: '140px', display: 'block' }}
                            onClick={() => onBookingClick(booking)}
                            aria-label={`Booking: ${booking.guestName}, ${booking.bookingType}, ${booking.status}`}
                          >
                            <div className="text-[11px] font-bold leading-tight truncate">
                              {booking.guestName}
                            </div>
                            <div
                              className="text-[9px] font-normal mt-0.5 truncate"
                              style={{ opacity: 0.75 }}
                            >
                              {booking.bookingType?.split('·')[0]?.trim() || ''}
                            </div>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              onSelectSlot &&
                              onSelectSlot({ court, band, date: selectedDate })
                            }
                            className="w-full py-1.5 px-2 rounded hover:bg-emerald-50 hover:text-emerald-800 transition-colors text-[11px] text-gray-400 group"
                            title={`Book ${court.name} for ${band.label} on ${selectedDate}`}
                          >
                            <span className="hidden group-hover:inline font-semibold text-[10px] text-emerald-700">
                              + Book
                            </span>
                            <span className="group-hover:hidden text-gray-300 font-mono">—</span>
                          </button>
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

      {/* ── 4. Matrix Footer ── */}
      <div
        className="px-5 py-2.5 border-t flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-500 bg-gray-50/50"
        style={{ borderColor: 'var(--color-border-light)' }}
      >
        <span>
          Showing court matrix for <strong>{formatDateLabel(selectedDate)}</strong> • {courtColumns.length} Active Facilities
        </span>
        <span className="text-gray-400">
          Click any empty slot to create a reservation for that time
        </span>
      </div>

    </div>
  );
}
