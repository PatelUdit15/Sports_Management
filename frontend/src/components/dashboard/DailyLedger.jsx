/**
 * DailyLedger.jsx
 * Today's transaction table derived from todayBookings + module-based static rows.
 * Clicking a row opens LedgerModal via onRowClick callback.
 *
 * Props:
 *   todayBookings     – array from API
 *   isModuleEnabled   – (modKey: string) => boolean
 *   onRowClick        – (ledgerRow) => void   — opens LedgerModal in parent
 *   onNavigate        – (path: string) => void
 */

import React, { useMemo } from 'react';
import { DollarSign, ArrowUpRight } from 'lucide-react';
import { deriveFee, statusBadgeClass, todayLabel, formatDateLabel } from './dashboardUtils';

// ─────────────────────────────────────────────
//  Ledger row builder
// ─────────────────────────────────────────────

function buildLedgerRows(todayBookings = []) {
  return todayBookings
    .filter((b) => b.status !== 'Cancelled')
    .map((b) => ({
      txn: `#TXN-${(b.id || '').replace('BK-', '').replace('#', '')}`,
      bookingId: b.id,
      category: 'Court Booking',
      desc: `Court Booking – ${b.court?.name || 'Court'}`,
      player: b.guestName || b.member?.name || 'Member',
      amount: Number(b.fee) !== undefined && !isNaN(Number(b.fee)) ? Number(b.fee) : deriveFee(b.court?.name || ''),
      status: b.status || 'Confirmed',
    }));
}

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────

export default function DailyLedger({
  todayBookings = [],
  selectedDate,
  isModuleEnabled,
  onRowClick,
  onNavigate,
}) {
  const ledgerRows = useMemo(
    () => buildLedgerRows(todayBookings, isModuleEnabled),
    [todayBookings, isModuleEnabled]
  );

  const ledgerTotal = useMemo(
    () => ledgerRows.reduce((sum, r) => sum + r.amount, 0),
    [ledgerRows]
  );

  return (
    <div className="card overflow-hidden h-full flex flex-col">

      {/* ── Header ── */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <div>
            <h2 className="text-[14px] font-bold" style={{ color: 'var(--color-text)' }}>
              Daily Ledger
            </h2>
            <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {selectedDate ? formatDateLabel(selectedDate) : todayLabel()} · Click any row for details
            </p>
          </div>
        </div>

        {isModuleEnabled('finance') && (
          <button
            onClick={() => onNavigate('finance')}
            className="flex items-center gap-1 text-[12px] font-semibold hover:underline flex-shrink-0"
            style={{ color: 'var(--color-primary)' }}
            aria-label="Open full finance page"
          >
            View Finance <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto flex-1">
        <table className="data-table">
          <thead>
            <tr>
              <th>Txn ID</th>
              <th>Description</th>
              <th>Player / Member</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {ledgerRows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-10"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  No transactions recorded today.
                </td>
              </tr>
            ) : (
              ledgerRows.map((row) => (
                <tr
                  key={row.txn}
                  className="cursor-pointer"
                  onClick={() => onRowClick(row)}
                  title={`Click to view details for ${row.txn}`}
                >
                  <td className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                    {row.txn}
                  </td>
                  <td className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {row.desc}
                  </td>
                  <td style={{ color: 'var(--color-text-secondary)' }}>
                    {row.player}
                  </td>
                  <td className="font-semibold" style={{ color: 'var(--color-success)' }}>
                    ₹{row.amount.toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span
                      className={statusBadgeClass(row.status)}
                      aria-label={`Status: ${row.status}`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer totals bar ── */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: '#f9fafb', borderTop: '1px solid var(--color-border-light)' }}
      >
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
          {ledgerRows.length} transaction{ledgerRows.length !== 1 ? 's' : ''} today
        </span>
        <span className="text-[13px] font-bold" style={{ color: 'var(--color-text)' }}>
          Today's Total:&nbsp;
          <span style={{ color: 'var(--color-success)' }}>
            ₹{ledgerTotal.toLocaleString('en-IN')}
          </span>
        </span>
      </div>
    </div>
  );
}
