/**
 * Dashboard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Executive Overview — KPIs, operational alerts, status, and quick module links.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users, Trophy, DollarSign, TrendingUp,
  AlertTriangle, Clock, Coffee, ShoppingBag,
  Plus, RefreshCw, Activity,
} from 'lucide-react';
import { getGreeting, todayLabel } from '../components/dashboard/dashboardUtils';

// ─────────────────────────────────────────────────────────────────────────────
//  Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ setActiveTab }) {
  const navigate        = useNavigate();
  const { user, club, hasModule } = useAuth();

  // ── API state ───────────────────────────────────────────────────────────────
  const [data,       setData]       = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);


  // ── Navigation helper ───────────────────────────────────────────────────────
  const handleNavigate = useCallback((path) => {
    if (typeof setActiveTab === 'function') setActiveTab(path);
    else navigate(`/${path}`);
  }, [navigate, setActiveTab]);

  // ── Module guard with alias mapping ────────────────────────────────────────
  const isModuleEnabled = useCallback((mod) => {
    if (!mod) return true;
    const m = mod.toUpperCase();
    if (m === 'COURTS' || m === 'COURT' || m === 'COURT_BOOKING')
      return hasModule ? hasModule('COURT_BOOKING') : true;
    if (m === 'MEMBERSHIP' || m === 'MEMBERS')
      return hasModule ? hasModule('MEMBERSHIP') : true;
    if (m === 'SHOP')
      return hasModule ? hasModule('SHOP') : true;
    if (m === 'CAFE' || m === 'BAR')
      return hasModule ? hasModule('BAR') : true;
    if (m === 'FINANCE' || m === 'ACCOUNTING')
      return hasModule ? hasModule('ACCOUNTING') : true;
    if (m === 'STAFF' || m === 'HR')
      return hasModule ? hasModule('HR') : true;
    return hasModule ? hasModule(m) : true;
  }, [hasModule]);

  // ── Data fetching ───────────────────────────────────────────────────────────
  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      if (res?.success) {
        setData(res.data?.dashboard || res.data || res.dashboard);
      } else {
        setError(res?.message || 'Failed to fetch dashboard data');
      }
    } catch (e) {
      setError(e?.message || 'Network error while connecting to backend');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div
            className="w-9 h-9 rounded-full border-[3px] animate-spin mx-auto"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          />
          <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  // ── Safe data extraction ────────────────────────────────────────────────────
  const kpis   = data?.kpis   || {};
  const alerts = data?.alerts || [];

  // ─────────────────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="p-4 sm:p-6 max-w-[1400px] mx-auto space-y-5 animate-fade-in">

        {/* ══════════════════════════════════════════════════════════════════════
            HEADER BAR
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="card px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left — club name + greeting */}
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1
                className="text-[18px] font-bold leading-tight"
                style={{ color: 'var(--color-text)' }}
              >
                {club?.name || data?.club?.name || 'Sports Club'}
              </h1>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                style={{ background: '#eef6ee', color: '#2d6a2d', border: '1px solid #c3dfc3' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[13px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
              {getGreeting()},{' '}
              <span className="font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                {user?.name || 'Staff'}
              </span>
              {' '}· {todayLabel()}
            </p>
          </div>

          {/* Right — action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn btn-secondary text-[12px] px-3 py-1.5"
              title="Refresh dashboard data"
              aria-label="Refresh dashboard data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Sync
            </button>

            {isModuleEnabled('courts') && (
              <button
                onClick={() => handleNavigate('court-bookings')}
                className="btn btn-primary text-[12px] px-3 py-1.5"
                title="Open court bookings"
                aria-label="Create a new court booking"
              >
                <Plus className="w-3.5 h-3.5" />
                Book Court
              </button>
            )}

            {isModuleEnabled('membership') && (
              <button
                onClick={() => handleNavigate('members')}
                className="btn btn-secondary text-[12px] px-3 py-1.5"
                title="Go to members"
                aria-label="Add a new member"
              >
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                New Member
              </button>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            ERROR BANNER
        ══════════════════════════════════════════════════════════════════════ */}
        {error && (
          <div
            className="card px-4 py-3 flex items-center justify-between text-[13px]"
            style={{ background: '#fff5f5', borderColor: '#fca5a5' }}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" style={{ color: 'var(--color-danger)' }} />
              <span style={{ color: '#7f1d1d' }}>{error}</span>
            </div>
            <button
              onClick={loadDashboard}
              className="text-[12px] font-semibold underline hover:no-underline ml-4"
              style={{ color: 'var(--color-danger)' }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            OPERATIONAL ALERTS
        ══════════════════════════════════════════════════════════════════════ */}
        {alerts.length > 0 && (
          <div
            className="card px-4 py-3 flex items-start gap-3"
            style={{ background: '#fffbeb', borderColor: '#fde68a' }}
          >
            <AlertTriangle
              className="w-4 h-4 shrink-0 mt-0.5"
              style={{ color: 'var(--color-warning)' }}
            />
            <div className="flex-1 text-[12px]" style={{ color: '#78350f' }}>
              <span className="font-bold mr-1.5">Alerts:</span>
              {alerts.map((a) => a.message).join(' · ')}
            </div>
            {isModuleEnabled('shop') && (
              <button
                onClick={() => handleNavigate('shop')}
                className="text-[11px] font-semibold underline hover:no-underline shrink-0"
                style={{ color: '#92400e' }}
                aria-label="Go to shop to review stock levels"
              >
                Review
              </button>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            KPI STRIP  (4 metric cards)
        ══════════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          {/* Active Members */}
          {isModuleEnabled('membership') && (
            <button
              className="card p-5 space-y-3 text-left hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('members')}
              aria-label={`${kpis.activeMembers ?? 0} active members — go to members`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Active Members
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'var(--color-primary-light)' }}
                >
                  <Users className="w-4 h-4" style={{ color: 'var(--color-primary)' }} />
                </div>
              </div>
              <div className="text-[28px] font-bold leading-none" style={{ color: 'var(--color-text)' }}>
                {kpis.activeMembers ?? 0}
              </div>
              <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                <TrendingUp className="w-3 h-3" />
                <span>{kpis.expiringSoon ?? 0} expiring in 30d</span>
              </div>
            </button>
          )}

          {/* Today's Bookings */}
          {isModuleEnabled('courts') && (
            <button
              className="card p-5 space-y-3 text-left hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('court-bookings')}
              aria-label={`${kpis.todayBookingsCount ?? 0} bookings today — go to court bookings`}
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Today's Bookings
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#e8f6f5' }}
                >
                  <Trophy className="w-4 h-4" style={{ color: '#0f766e' }} />
                </div>
              </div>
              <div className="text-[28px] font-bold leading-none" style={{ color: 'var(--color-text)' }}>
                {kpis.todayBookingsCount ?? 0}
              </div>
              <div className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                <Clock className="w-3 h-3" />
                <span>
                  Occupancy:{' '}
                  <strong style={{ color: 'var(--color-text-secondary)' }}>
                    {kpis.courtUtilization ?? 0}%
                  </strong>
                </span>
              </div>
            </button>
          )}

          {/* Monthly Revenue */}
          {isModuleEnabled('finance') && (
            <button
              className="card p-5 space-y-3 text-left hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('finance')}
              aria-label="View monthly revenue in finance"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Monthly Revenue
                </span>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: '#ecfdf5' }}
                >
                  <DollarSign className="w-4 h-4" style={{ color: 'var(--color-success)' }} />
                </div>
              </div>
              <div className="text-[28px] font-bold leading-none" style={{ color: 'var(--color-text)' }}>
                ₹{Number(kpis.monthlyRevenue || 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Current billing cycle
              </div>
            </button>
          )}

          {/* Dynamic 4th card — Café / Shop / CRM */}
          {isModuleEnabled('cafe') ? (
            <button
              className="card p-5 space-y-3 text-left hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('cafe')}
              aria-label="Go to café"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Café Open Tabs
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fefce8' }}>
                  <Coffee className="w-4 h-4" style={{ color: '#a16207' }} />
                </div>
              </div>
              <div className="text-[28px] font-bold leading-none" style={{ color: 'var(--color-text)' }}>
                {kpis.activeTabs ?? 0}
              </div>
              <div className="text-[11px]" style={{ color: '#a16207' }}>
                {kpis.pendingKitchenOrders ?? 0} orders in prep
              </div>
            </button>
          ) : isModuleEnabled('shop') ? (
            <button
              className="card p-5 space-y-3 text-left hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('shop')}
              aria-label="Go to shop — low stock alerts"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Low Stock Alerts
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#fff1f2' }}>
                  <ShoppingBag className="w-4 h-4" style={{ color: 'var(--color-danger)' }} />
                </div>
              </div>
              <div className="text-[28px] font-bold leading-none" style={{ color: 'var(--color-danger)' }}>
                {kpis.lowStockCount ?? 0}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Below reorder level
              </div>
            </button>
          ) : (
            <button
              className="card p-5 space-y-3 text-left hover:shadow-md transition-shadow"
              onClick={() => handleNavigate('enquiries')}
              aria-label="Go to CRM enquiries"
            >
              <div className="flex items-center justify-between">
                <span
                  className="text-[11px] font-semibold uppercase tracking-wide"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  CRM Enquiries
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#eff6ff' }}>
                  <Activity className="w-4 h-4" style={{ color: '#2563eb' }} />
                </div>
              </div>
              <div className="text-[28px] font-bold leading-none" style={{ color: 'var(--color-text)' }}>
                {kpis.newLeadsCount ?? 0}
              </div>
              <div className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                Pending follow-up
              </div>
            </button>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            SYSTEM STATUS FOOTER
        ══════════════════════════════════════════════════════════════════════ */}
        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 pb-2 text-[11px]"
          style={{ color: 'var(--color-text-muted)' }}
        >
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            ERP Server: Online
          </span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span>Club: {club?.name || 'Active'}</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span>User: {user?.name} · {user?.role?.replace(/_/g, ' ')}</span>
          <span style={{ color: 'var(--color-border)' }}>|</span>
          <span>Last sync: just now</span>
        </div>

      </div>
    </>
  );
}
