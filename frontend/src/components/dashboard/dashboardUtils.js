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
export const FALLBACK_COURTS = [
  { id: 'CRT-1', name: 'Court 1 – Indoor Tennis',       utilization: 84 },
  { id: 'CRT-2', name: 'Court 2 – Padel Beta',          utilization: 91 },
  { id: 'CRT-3', name: 'Court 3 – Badminton Alpha',     utilization: 68 },
  { id: 'CRT-4', name: 'Court 4 – Squash Championship', utilization: 56 },
  { id: 'CRT-5', name: 'Court 5 – Clay Tennis',         utilization: 75 },
];

// ─────────────────────────────────────────────
//  Ledger fee derivation
// ─────────────────────────────────────────────

const FEE_MAP = {
  tennis: 1200, padel: 1500, squash: 800, badminton: 750, clay: 1000,
};

export function deriveFee(courtName = '') {
  const n = courtName.toLowerCase();
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
