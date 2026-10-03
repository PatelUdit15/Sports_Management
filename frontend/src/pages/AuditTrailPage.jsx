/**
 * AuditTrailPage.jsx
 * Standalone page — full secured audit trail with search and entry detail modal.
 * Route: /audit-trail
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import {
  Shield, RefreshCw, ArrowLeft,
  AlertTriangle, Search,
} from 'lucide-react';
import {
  getRelativeTime, auditBorderColor, todayLabel,
} from '../components/dashboard/dashboardUtils';
import { AuditModal } from '../components/dashboard/DashboardModals';

export default function AuditTrailPage() {
  const navigate = useNavigate();

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [search,     setSearch]     = useState('');

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

  const recentActivity = data?.recentActivity || [];

  const filtered = useMemo(() => {
    if (!search) return recentActivity;
    const q = search.toLowerCase();
    return recentActivity.filter(
      (log) =>
        log.action?.toLowerCase().includes(q) ||
        log.entity?.toLowerCase().includes(q) ||
        (log.user?.name || log.user?.firstName || '').toLowerCase().includes(q)
    );
  }, [recentActivity, search]);

  // Stats
  const loginCount   = recentActivity.filter((l) => l.action?.toLowerCase().includes('login')).length;
  const bookingCount = recentActivity.filter((l) => l.action?.toLowerCase().includes('booking')).length;
  const syncCount    = recentActivity.filter((l) => l.action?.toLowerCase().includes('sync') || l.action?.toLowerCase().includes('account')).length;

  return (
    <>
      <div className="space-y-5 animate-fade-in">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <button onClick={() => navigate('/dashboard')} className="btn btn-ghost p-1.5" aria-label="Back">
                <ArrowLeft className="w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
              </button>
              <Shield className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
                Audit Trail
              </h1>
              <span className="badge badge-purple" style={{ fontSize: '11px' }}>Secured</span>
            </div>
            <p className="text-[13px] mt-1 ml-[52px]" style={{ color: 'var(--color-text-muted)' }}>
              {todayLabel()} · Immutable system activity log
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="btn btn-secondary text-[12px]">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={() => navigate('/reports')} className="btn btn-primary text-[12px]">
              Full Reports
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

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Entries',    value: recentActivity.length, sub: 'Recorded today',   color: 'var(--color-text)' },
            { label: 'Login Events',     value: loginCount,            sub: 'Auth activity',    color: '#3b82f6' },
            { label: 'Booking Events',   value: bookingCount,          sub: 'Court operations', color: 'var(--color-success)' },
            { label: 'Sync / Account',   value: syncCount,             sub: 'System events',    color: 'var(--color-primary)' },
          ].map((s) => (
            <div key={s.label} className="card p-4 space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wide"
                style={{ color: 'var(--color-text-muted)' }}>{s.label}</div>
              <div className="text-[24px] font-bold" style={{ color: s.color }}>
                {loading ? '…' : s.value}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Main audit card ── */}
        <div className="card overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b flex items-center justify-between gap-3"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
              <h2 className="text-[14px] font-bold" style={{ color: 'var(--color-text)' }}>
                Activity Log
              </h2>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                · {filtered.length} entries
              </span>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search action, entity, staff…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-8 text-[12px] w-56"
              />
            </div>
          </div>

          {/* Entries */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
              No entries match your search.
            </div>
          ) : (
            <div>
              {filtered.map((log, i) => (
                <button
                  key={log.id}
                  className="w-full flex gap-3 px-5 py-3.5 text-left hover:bg-gray-50 transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--color-border-light)' : 'none' }}
                  onClick={() => setSelected(log)}
                  aria-label={`View audit entry: ${log.action}`}
                >
                  {/* Left colour strip */}
                  <div className="w-[3px] rounded-full flex-shrink-0 self-stretch"
                    style={{ background: auditBorderColor(log.action), minHeight: '40px' }} />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[13px] font-semibold leading-snug"
                        style={{ color: 'var(--color-text)' }}>
                        {log.action}
                      </span>
                      <span className="text-[11px] shrink-0 mt-0.5 whitespace-nowrap"
                        style={{ color: 'var(--color-text-muted)' }}>
                        {getRelativeTime(log.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[12px]"
                      style={{ color: 'var(--color-text-muted)' }}>
                      <span>{log.entity}</span>
                      {log.user?.firstName && (
                        <>
                          <span style={{ color: 'var(--color-border)' }}>·</span>
                          <span>
                            by{' '}
                            <span className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                              {log.user.firstName}
                            </span>
                            {log.user.role && (
                              <span> ({log.user.role.replace(/_/g, ' ')})</span>
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Footer */}
          {!loading && (
            <div className="px-5 py-2.5 flex items-center justify-between text-[11px]"
              style={{ background: '#f9fafb', borderTop: '1px solid var(--color-border-light)',
                color: 'var(--color-text-muted)' }}>
              <span>{filtered.length} of {recentActivity.length} entries shown</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full"
                  style={{ background: 'var(--color-primary)' }} />
                <span>All entries are immutable and tamper-proof</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Audit detail modal ── */}
      {selected && (
        <AuditModal
          log={selected}
          onClose={() => setSelected(null)}
          onViewReports={() => { navigate('/reports'); setSelected(null); }}
        />
      )}
    </>
  );
}
