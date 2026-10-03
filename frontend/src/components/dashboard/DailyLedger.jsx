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
import { deriveFee, statusBadgeClass, todayLabel } from './dashboardUtils';

// ─────────────────────────────────────────────
//  Ledger row builder
// ─────────────────────────────────────────────

function buildLedgerRows(todayBookings, isModuleEnabled) {
  const rows = todayBookings.map((b, i) => ({
    txn:    `#TXN-${9501 + i}`,
    desc:   `Court Booking – ${b.court?.name || 'Court'}`,
    player: b.guestName || 'Member',
    amount: deriveFee(b.court?.name || ''),
    status: b.status,
  }));

  if (isModuleEnabled('membership')) {
    rows.push({
      txn: '#TXN-9599', desc: 'Membership Renewal – Gold',
      player: 'Walk-in Member', amount: 25000, status: 'Confirmed',
    });
  }
  if (isModuleEnabled('shop')) {
    rows.push({
      txn: '#TXN-9600', desc: 'Pro Shop – Equipment Purchase',
      player: 'Counter Sale', amount: 3500, status: 'Confirmed',
    });
  }
  if (isModuleEnabled('cafe')) {
    rows.push({
      txn: '#TXN-9601', desc: 'Café & Bar – Tab Settlement',
      player: 'Table 4', amount: 860, status: 'Pending',
    });
  }

  return rows;
}

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────

export default function DailyLedger({
  todayBookings = [],
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
              {todayLabel()} · Click any row for details
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
