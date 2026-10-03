/**
 * DailyLedgerPage.jsx
 * Standalone page — full daily transaction ledger with filters and totals.
 * Route: /daily-ledger
 */

import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign, RefreshCw, ArrowLeft,
  AlertTriangle, Search, Filter,
} from 'lucide-react';
import {
  deriveFee, statusBadgeClass, todayLabel,
} from '../components/dashboard/dashboardUtils';
import { LedgerModal } from '../components/dashboard/DashboardModals';

// ── Row builder ───────────────────────────────
function buildRows(todayBookings = []) {
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

export default function DailyLedgerPage() {
  const navigate = useNavigate();
  const { hasModule } = useAuth();

  const isModuleEnabled = (mod) => {
    const m = mod.toUpperCase();
    if (m === 'MEMBERSHIP') return hasModule ? hasModule('MEMBERSHIP') : true;
    if (m === 'SHOP')        return hasModule ? hasModule('SHOP')        : true;
    if (m === 'CAFE')        return hasModule ? hasModule('BAR')         : true;
    return true;
  };

  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);
  const [selected,   setSelected]   = useState(null);
  const [search,     setSearch]     = useState('');
  const [filterCat,  setFilterCat]  = useState('All');

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

  const allRows = useMemo(
    () => buildRows(data?.todayBookings || []),
    [data]
  );

  const categories = ['All', ...new Set(allRows.map((r) => r.category))];

  const filtered = useMemo(() => {
    return allRows.filter((r) => {
      const matchCat = filterCat === 'All' || r.category === filterCat;
      const q = search.toLowerCase();
      const matchSearch = !q || r.desc.toLowerCase().includes(q)
        || r.player.toLowerCase().includes(q)
        || r.txn.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [allRows, search, filterCat]);

  const total         = filtered.reduce((s, r) => s + r.amount, 0);
  const confirmedAmt  = filtered.filter((r) => r.status === 'Confirmed').reduce((s, r) => s + r.amount, 0);
  const pendingAmt    = filtered.filter((r) => r.status !== 'Confirmed').reduce((s, r) => s + r.amount, 0);

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
              <DollarSign className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
              <h1 className="text-[20px] font-bold" style={{ color: 'var(--color-text)' }}>
                Daily Ledger
              </h1>
            </div>
            <p className="text-[13px] mt-1 ml-[52px]" style={{ color: 'var(--color-text-muted)' }}>
              {todayLabel()} · All transactions for today
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleRefresh} disabled={refreshing} className="btn btn-secondary text-[12px]">
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button onClick={() => navigate('/finance')} className="btn btn-primary text-[12px]">
              <DollarSign className="w-3.5 h-3.5" />
              Full Finance
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
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="card p-4 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>Total Revenue</div>
            <div className="text-[24px] font-bold" style={{ color: 'var(--color-success)' }}>
              {loading ? '…' : `₹${total.toLocaleString('en-IN')}`}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.length} transactions
            </div>
          </div>
          <div className="card p-4 space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>Settled</div>
            <div className="text-[24px] font-bold" style={{ color: 'var(--color-text)' }}>
              {loading ? '…' : `₹${confirmedAmt.toLocaleString('en-IN')}`}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.filter((r) => r.status === 'Confirmed').length} settled
            </div>
          </div>
          <div className="card p-4 space-y-1 col-span-2 sm:col-span-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide"
              style={{ color: 'var(--color-text-muted)' }}>Pending</div>
            <div className="text-[24px] font-bold" style={{ color: 'var(--color-warning)' }}>
              {loading ? '…' : `₹${pendingAmt.toLocaleString('en-IN')}`}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              {filtered.filter((r) => r.status !== 'Confirmed').length} pending
            </div>
          </div>
        </div>

        {/* ── Main ledger card ── */}
        <div className="card overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            style={{ borderColor: 'var(--color-border)' }}>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                style={{ color: 'var(--color-text-muted)' }} />
              <input
                type="text"
                placeholder="Search by ID, description, player…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-8 text-[12px] w-64"
              />
            </div>

            {/* Category filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <Filter className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'var(--color-text-muted)' }} />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCat(cat)}
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors"
                  style={filterCat === cat ? {
                    background: 'var(--color-primary)', color: '#fff',
                    borderColor: 'var(--color-primary)',
                  } : {
                    background: '#fff', color: 'var(--color-text-secondary)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 rounded-full border-[3px] animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Player / Member</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-10"
                        style={{ color: 'var(--color-text-muted)' }}>
                        No transactions match the current filters.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((row) => (
                      <tr key={row.txn} className="cursor-pointer" onClick={() => setSelected(row)}
                        title={`Click to view ${row.txn}`}>
                        <td className="font-mono text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                          {row.txn}
                        </td>
                        <td>
                          <span className="badge badge-purple" style={{ fontSize: '10px' }}>
                            {row.category}
                          </span>
                        </td>
                        <td className="font-medium" style={{ color: 'var(--color-text)' }}>{row.desc}</td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{row.player}</td>
                        <td className="font-semibold" style={{ color: 'var(--color-success)' }}>
                          ₹{row.amount.toLocaleString('en-IN')}
                        </td>
                        <td>
                          <span className={statusBadgeClass(row.status)}>{row.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Total footer */}
          {!loading && (
            <div className="flex items-center justify-between px-5 py-3"
              style={{ background: '#f9fafb', borderTop: '1px solid var(--color-border-light)' }}>
              <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Showing {filtered.length} of {allRows.length} transactions
              </span>
              <span className="text-[13px] font-bold" style={{ color: 'var(--color-text)' }}>
                Total:&nbsp;
                <span style={{ color: 'var(--color-success)' }}>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Ledger detail modal ── */}
      {selected && (
        <LedgerModal
          row={selected}
          onClose={() => setSelected(null)}
          onViewFinance={() => { navigate('/finance'); setSelected(null); }}
        />
      )}
    </>
  );
}
