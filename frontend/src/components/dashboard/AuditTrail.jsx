/**
 * AuditTrail.jsx
 * Secured activity log with colour-coded left-border strips and relative timestamps.
 * Clicking an entry opens AuditModal via the onEntryClick callback.
 *
 * Props:
 *   recentActivity  – array from API
 *   courtUtil       – array from API (for the facility occupancy card above)
 *   onEntryClick    – (logEntry) => void   — opens AuditModal in parent
 *   onNavigate      – (path: string) => void
 */

import React from 'react';
import { Shield, ChevronRight, BarChart2 } from 'lucide-react';
import { getRelativeTime, auditBorderColor, formatDateLabel } from './dashboardUtils';

// ─────────────────────────────────────────────
//  Facility Occupancy — lives here because it
//  always sits directly above the Audit Trail
//  in the right-side column.
// ─────────────────────────────────────────────

function FacilityOccupancy({ courtUtil, selectedDate }) {
  return (
    <div className="card overflow-hidden">
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-[14px] font-bold" style={{ color: 'var(--color-text)' }}>
            Facility Occupancy
          </h2>
        </div>
        <span className="badge badge-gray" style={{ fontSize: '10px' }}>
          {selectedDate ? formatDateLabel(selectedDate).split(',')[0] : 'Today'}
        </span>
      </div>

      <div className="px-5 py-4 space-y-4">
        {courtUtil.length === 0 ? (
          <p className="text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            No utilization data available.
          </p>
        ) : (
          courtUtil.map((c) => (
            <div key={c.id} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-[12px] font-semibold truncate max-w-[160px]"
                  style={{ color: 'var(--color-text)' }}
                  title={c.name}
                >
                  {c.name.split('–')[0]?.trim() || c.name}
                </span>
                <span
                  className="badge badge-purple"
                  style={{ fontSize: '10px' }}
                  aria-label={`${c.utilization}% utilization`}
                >
                  {c.utilization}%
                </span>
              </div>

              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: 'var(--color-border)' }}
                role="progressbar"
                aria-valuenow={c.utilization}
                aria-valuemax={100}
                aria-label={`${c.name} ${c.utilization}% utilization`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.max(4, c.utilization))}%`,
                    background: 'linear-gradient(to right, var(--color-primary), #0f766e)',
                  }}
                />
              </div>

              <div
                className="flex justify-between text-[10px]"
                style={{ color: 'var(--color-text-muted)' }}
              >
                <span>{c.sportType} · {c.surface}</span>
                <span>{c.bookedHours}h booked</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Audit Trail
// ─────────────────────────────────────────────

function AuditTrailCard({ recentActivity, onEntryClick, onNavigate }) {
  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        className="px-5 py-4 border-b flex items-center justify-between"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
          <h2 className="text-[14px] font-bold" style={{ color: 'var(--color-text)' }}>
            Audit Trail
          </h2>
        </div>
        <span className="badge badge-purple" style={{ fontSize: '10px' }}>Secured</span>
      </div>

      {/* Entries */}
      <div>
        {recentActivity.length === 0 ? (
          <div
            className="px-5 py-8 text-[12px] text-center"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No activity recorded.
          </div>
        ) : (
          recentActivity.map((log, i) => (
            <button
              key={log.id}
              className="w-full flex gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors"
              style={{
                borderBottom:
                  i < recentActivity.length - 1
                    ? '1px solid var(--color-border-light)'
                    : 'none',
              }}
              onClick={() => onEntryClick(log)}
              aria-label={`View audit entry: ${log.action}`}
            >
              {/* Left colour strip */}
              <div
                className="w-[3px] rounded-full flex-shrink-0 self-stretch"
                style={{
                  background: auditBorderColor(log.action),
                  minHeight: '36px',
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="text-[12px] font-semibold leading-snug"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {log.action}
                  </span>
                  <span
                    className="text-[10px] shrink-0 mt-0.5"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {getRelativeTime(log.createdAt)}
                  </span>
                </div>

                <div
                  className="text-[11px] mt-0.5"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {log.entity}
                  {(log.user?.name || log.user?.firstName) && (
                    <span>
                      {' '}· by{' '}
                      <span
                        className="font-medium"
                        style={{ color: 'var(--color-text-secondary)' }}
                      >
                        {log.user?.name || log.user?.firstName}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div
        className="px-5 py-2.5"
        style={{ background: '#f9fafb', borderTop: '1px solid var(--color-border-light)' }}
      >
        <button
          onClick={() => onNavigate('reports')}
          className="flex items-center gap-1 text-[11px] font-semibold hover:underline"
          style={{ color: 'var(--color-primary)' }}
          aria-label="Open full audit log in reports"
        >
          Full audit log <ChevronRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  Default export — the complete right-side column
//  (Facility Occupancy stacked above Audit Trail)
// ─────────────────────────────────────────────

export default function AuditTrail({
  recentActivity = [],
  courtUtil = [],
  selectedDate,
  onEntryClick,
  onNavigate,
}) {
  return (
    <div className="space-y-5">
      <FacilityOccupancy courtUtil={courtUtil} selectedDate={selectedDate} />
      <AuditTrailCard
        recentActivity={recentActivity}
        onEntryClick={onEntryClick}
        onNavigate={onNavigate}
      />
    </div>
  );
}
