/**
 * dashboardUtils.js
 * Shared helpers, constants, and style utilities for all dashboard sub-modules.
 * Import from here — never duplicate in individual components.
 */

// ─────────────────────────────────────────────
//  Date / time helpers
// ─────────────────────────────────────────────

export function getRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  if (diff < 60_000)        return 'just now';
  if (diff < 3_600_000)     return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000)    return `${Math.floor(diff / 3_600_000)} hr ago`;
  return 'yesterday';
}

export function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function todayLabel() {
  return new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateLabel(dateStr) {
  if (!dateStr) return todayLabel();
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const today = new Date();
    const isToday =
      today.getFullYear() === y &&
      today.getMonth() === m - 1 &&
      today.getDate() === d;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      tomorrow.getFullYear() === y &&
      tomorrow.getMonth() === m - 1 &&
      tomorrow.getDate() === d;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      yesterday.getFullYear() === y &&
      yesterday.getMonth() === m - 1 &&
      yesterday.getDate() === d;

    const formatted = dateObj.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    if (isToday) return `Today, ${formatted}`;
    if (isTomorrow) return `Tomorrow, ${formatted}`;
    if (isYesterday) return `Yesterday, ${formatted}`;
    return formatted;
  } catch {
    return dateStr;
  }
}

export function shiftDate(dateStr, offsetDays) {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + offsetDays);
  const yyyy = dateObj.getFullYear();
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ─────────────────────────────────────────────
//  Court Matrix constants
// ─────────────────────────────────────────────

/** 90-minute time bands from 06:00 to 21:00 */
export const TIME_BANDS = [
  { label: '06:00 – 07:30', startHour: 6  },
  { label: '07:30 – 09:00', startHour: 7  },
  { label: '09:00 – 10:30', startHour: 9  },
  { label: '10:30 – 12:00', startHour: 10 },
  { label: '12:00 – 13:30', startHour: 12 },
  { label: '13:30 – 15:00', startHour: 13 },
  { label: '15:00 – 16:30', startHour: 15 },
  { label: '16:30 – 18:00', startHour: 16 },
  { label: '18:00 – 19:30', startHour: 18 },
  { label: '19:30 – 21:00', startHour: 19 },
];

/** Fallback court columns when API returns no utilization data */
export const FALLBACK_COURTS = [];

// ─────────────────────────────────────────────
//  Ledger fee derivation
// ─────────────────────────────────────────────

const FEE_MAP = {
  tennis: 1200, padel: 1500, squash: 800, badminton: 750, clay: 1000,
};

export function deriveFee(courtName = '', courtRate = null) {
  if (courtRate !== null && courtRate !== undefined && Number(courtRate) > 0) {
    return Number(courtRate);
  }
  const n = (courtName || '').toLowerCase();
  if (n.includes('padel'))     return FEE_MAP.padel;
  if (n.includes('squash'))    return FEE_MAP.squash;
  if (n.includes('badminton')) return FEE_MAP.badminton;
  if (n.includes('clay'))      return FEE_MAP.clay;
  return FEE_MAP.tennis;
}

// ─────────────────────────────────────────────
//  Status / style utilities
// ─────────────────────────────────────────────

/** Returns the correct CSS class string for a status badge */
export function statusBadgeClass(status) {
  if (!status) return 'badge badge-gray';
  const s = status.toLowerCase();
  if (s === 'confirmed')     return 'badge badge-success';
  if (s === 'in progress')   return 'badge badge-info';
  if (s === 'completed')     return 'badge badge-gray';
  if (s.includes('pending')) return 'badge badge-warning';
  return 'badge badge-gray';
}

/** Returns an inline style object for a court-matrix cell */
export function matrixCellStyle(status) {
  if (!status) return {};
  const s = status.toLowerCase();
  if (s === 'confirmed')
    return { background: '#eef6ee', color: '#2d6a2d', border: '1px solid #c3dfc3' };
  if (s === 'in progress')
    return { background: '#e8f0fa', color: '#1e3a6e', border: '1px solid #b9cff5' };
  if (s.includes('pending'))
    return { background: '#fdf5e6', color: '#7a4f10', border: '1px solid #f0d9a8' };
  return { background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' };
}

/** Returns a left-border accent color for audit trail entries */
export function auditBorderColor(action) {
  if (!action) return '#d1d5db';
  const a = action.toLowerCase();
  if (a.includes('login') || a.includes('session')) return '#3b82f6';
  if (a.includes('booking') || a.includes('court')) return 'var(--color-success, #16a34a)';
  if (a.includes('sync') || a.includes('account'))  return 'var(--color-primary)';
  return '#d1d5db';
}
