/**
 * DashboardModals.jsx
 * Reusable modal shell + three detail modals:
 *   BookingModal  — court matrix cell click
 *   LedgerModal   — daily ledger row click
 *   AuditModal    — audit trail entry click
 */

import React, { useEffect } from 'react';
import {
  X, Trophy, CreditCard, Shield,
  User, MapPin, Calendar, Clock, Hash,
  CheckCircle2, Circle, FileText,
  DollarSign, BarChart2, Users,
} from 'lucide-react';
import {
  fmtTime, fmtDate, todayLabel,
  statusBadgeClass, auditBorderColor,
  deriveFee, getRelativeTime,
} from './dashboardUtils';

// ─────────────────────────────────────────────
//  Modal shell
// ─────────────────────────────────────────────

export function Modal({ title, subtitle, onClose, children, icon: Icon }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(17,24,39,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="card w-full max-w-md animate-fade-in overflow-hidden"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Header */}
        <div
          className="flex items-start justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--color-primary-light)' }}
              >
                <Icon className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              </div>
            )}
            <div>
              <h2 className="text-[14px] font-bold" style={{ color: 'var(--color-text)' }}>
                {title}
              </h2>
              {subtitle && (
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors ml-2 flex-shrink-0"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Shared detail row
// ─────────────────────────────────────────────

export function DetailRow({ icon: Icon, label, value }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex items-start gap-3">
      <div
        className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: 'var(--color-bg)' }}
      >
        <Icon className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {label}
        </div>
        <div
          className="text-[13px] font-medium mt-0.5 break-words"
          style={{ color: 'var(--color-text)' }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Booking detail modal
//  Opened when a user clicks a booked cell in CourtMatrix
// ─────────────────────────────────────────────

export function BookingModal({ booking, onClose, onViewAll, onStatusChange, onDelete }) {
  const [updating, setUpdating] = React.useState(false);

  const handleStatus = async (newStatus) => {
    if (!onStatusChange) return;
    try {
      setUpdating(true);
      await onStatusChange(booking.id, newStatus);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (window.confirm(`Are you sure you want to cancel and remove booking #${booking.id}?`)) {
      try {
        setUpdating(true);
        await onDelete(booking.id);
        onClose();
      } finally {
        setUpdating(false);
      }
    }
  };

  return (
    <Modal
      title="Booking Details"
      subtitle={`Booking ID: ${booking.id}`}
      onClose={onClose}
      icon={Trophy}
    >
      <DetailRow icon={User}     label="Player / Guest" value={booking.guestName} />
      <DetailRow icon={MapPin}   label="Court"          value={booking.court?.name} />
      <DetailRow icon={Calendar} label="Session Type"   value={booking.bookingType} />
      <DetailRow
        icon={Clock}
        label="Time Slot"
        value={
          booking.slot ||
          (booking.startTime && booking.endTime
            ? `${fmtTime(booking.startTime)} – ${fmtTime(booking.endTime)}`
            : 'Scheduled Slot')
        }
      />
      <DetailRow
        icon={Hash}
        label="Date"
        value={booking.date || (booking.startTime ? fmtDate(booking.startTime) : todayLabel())}
      />
      {booking.member?.phone && (
        <DetailRow icon={User}   label="Contact"        value={booking.member.phone} />
      )}
      {booking.notes && (
        <DetailRow icon={FileText} label="Notes"        value={booking.notes} />
      )}

      {/* Status */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--color-bg)' }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
          </div>
          <div>
            <div
              className="text-[10px] font-semibold uppercase tracking-wide mb-1"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Status
            </div>
            <span
              className={statusBadgeClass(booking.status)}
              aria-label={`Booking status: ${booking.status}`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        {/* Status quick switcher */}
        {onStatusChange && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {booking.status !== 'In Progress' && booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
              <button
                disabled={updating}
                onClick={() => handleStatus('In Progress')}
                className="btn btn-secondary text-[11px] py-1 px-2.5"
                title="Player arrived and checked in"
              >
                Check In
              </button>
            )}
            {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
              <button
                disabled={updating}
                onClick={() => handleStatus('Completed')}
                className="btn btn-secondary text-[11px] py-1 px-2.5 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                title="Mark session completed"
              >
                Complete
              </button>
            )}
            {booking.status !== 'Cancelled' && (
              <button
                disabled={updating}
                onClick={() => handleStatus('Cancelled')}
                className="btn btn-secondary text-[11px] py-1 px-2 text-red-600 hover:bg-red-50"
                title="Cancel reservation"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>

      {/* Fee highlight */}
      <div
        className="rounded-lg px-4 py-3 flex items-center justify-between mt-1"
        style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}
      >
        <span className="text-[12px] font-semibold" style={{ color: 'var(--color-primary)' }}>
          Session Fee
        </span>
        <span className="text-[16px] font-bold" style={{ color: 'var(--color-primary)' }}>
          ₹{Number(booking.fee || deriveFee(booking.court?.name || '')).toLocaleString('en-IN')}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        {onDelete && (
          <button
            disabled={updating}
            className="btn btn-secondary text-red-600 hover:bg-red-50 text-[12px] px-3"
            onClick={handleDelete}
            title="Delete this booking permanently"
          >
            Delete
          </button>
        )}
        <button className="btn btn-secondary flex-1 justify-center text-[12px]" onClick={onClose}>
          Close
        </button>
        {onViewAll && (
          <button
            className="btn btn-primary flex-1 justify-center text-[12px]"
            onClick={() => { onViewAll(); onClose(); }}
          >
            <Calendar className="w-3.5 h-3.5" />
            All Bookings
          </button>
        )}
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
//  Ledger transaction detail modal
//  Opened when a user clicks a row in DailyLedger
// ─────────────────────────────────────────────

export function LedgerModal({ row, onClose, onViewFinance }) {
  return (
    <Modal
      title="Transaction Detail"
      subtitle={row.txn}
      onClose={onClose}
      icon={CreditCard}
    >
      <DetailRow icon={FileText} label="Description"     value={row.desc} />
      <DetailRow icon={User}     label="Member / Player" value={row.player} />
      <DetailRow icon={Calendar} label="Date"            value={todayLabel()} />

      {/* Amount highlight */}
      <div
        className="rounded-lg px-4 py-3 flex items-center justify-between"
        style={{ background: '#ecfdf5', border: '1px solid #a7f3d0' }}
      >
        <span className="text-[12px] font-semibold" style={{ color: '#065f46' }}>
          Amount
        </span>
        <span className="text-[18px] font-bold" style={{ color: 'var(--color-success)' }}>
          ₹{row.amount.toLocaleString('en-IN')}
        </span>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 pt-1">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-bg)' }}
        >
          <Circle className="w-3.5 h-3.5" style={{ color: 'var(--color-text-muted)' }} />
        </div>
        <div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wide mb-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Settlement Status
          </div>
          <span
            className={statusBadgeClass(row.status)}
            aria-label={`Settlement status: ${row.status}`}
          >
            {row.status}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button className="btn btn-secondary flex-1 justify-center text-[12px]" onClick={onClose}>
          Close
        </button>
        <button
          className="btn btn-primary flex-1 justify-center text-[12px]"
          onClick={() => { onViewFinance(); onClose(); }}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Open Finance
        </button>
      </div>
    </Modal>
  );
}

// ─────────────────────────────────────────────
//  Audit log detail modal
//  Opened when a user clicks an entry in AuditTrail
// ─────────────────────────────────────────────

export function AuditModal({ log, onClose, onViewReports }) {
  return (
    <Modal
      title="Audit Entry"
      subtitle={`Log ID: ${log.id}`}
      onClose={onClose}
      icon={Shield}
    >
      <DetailRow icon={FileText} label="Action"       value={log.action} />
      <DetailRow icon={Hash}     label="Entity"       value={log.entity} />
      <DetailRow
        icon={User}
        label="Performed by"
        value={log.user?.name || log.user?.firstName || 'Staff'}
      />
      {log.user?.role && (
        <DetailRow
          icon={Users}
          label="Role"
          value={log.user.role.replace(/_/g, ' ')}
        />
      )}
      <DetailRow
        icon={Clock}
        label="Timestamp"
        value={new Date(log.createdAt).toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })}
      />

      {/* Immutable record accent */}
      <div
        className="rounded-lg px-4 py-2.5 flex items-center gap-3"
        style={{ background: 'var(--color-primary-light)', border: '1px solid var(--color-border)' }}
      >
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: auditBorderColor(log.action) }}
        />
        <span className="text-[11px] font-medium" style={{ color: 'var(--color-primary)' }}>
          {getRelativeTime(log.createdAt)} · Immutable record
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button className="btn btn-secondary flex-1 justify-center text-[12px]" onClick={onClose}>
          Close
        </button>
        <button
          className="btn btn-primary flex-1 justify-center text-[12px]"
          onClick={() => { onViewReports(); onClose(); }}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          Full Audit Log
        </button>
      </div>
    </Modal>
  );
}
