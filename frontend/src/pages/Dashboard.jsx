import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Trophy,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Calendar,
  Coffee,
  ShoppingBag,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  RefreshCw,
  Activity,
  Layers,
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const navigate = useNavigate();
  const { user, club, enabledModules, hasModule } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Navigate handler supporting both tab callback and router path
  const handleNavigate = (path) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(path);
    } else {
      navigate(`/${path}`);
    }
  };

  // Helper to check module status with multiple alias forms
  const isModuleEnabled = (mod) => {
    if (!mod) return true;
    const m = mod.toUpperCase();
    if (m === 'COURTS' || m === 'COURT' || m === 'COURT_BOOKING') {
      return hasModule ? hasModule('COURT_BOOKING') : true;
    }
    if (m === 'MEMBERSHIP' || m === 'MEMBERS') {
      return hasModule ? hasModule('MEMBERSHIP') : true;
    }
    if (m === 'SHOP') {
      return hasModule ? hasModule('SHOP') : true;
    }
    if (m === 'CAFE' || m === 'BAR') {
      return hasModule ? hasModule('BAR') : true;
    }
    if (m === 'FINANCE' || m === 'ACCOUNTING') {
      return hasModule ? hasModule('ACCOUNTING') : true;
    }
    if (m === 'STAFF' || m === 'HR') {
      return hasModule ? hasModule('HR') : true;
    }
    return hasModule ? hasModule(m) : true;
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboard();
      if (res && res.success) {
        setData(res.data?.dashboard || res.data || res.dashboard);
      } else {
        setError(res?.message || 'Failed to fetch dashboard data');
      }
    } catch (e) {
      console.error('Failed to load dashboard:', e);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#714B67] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-medium text-[#6B7280]">
            Connecting to Champions Club ERP Engine...
          </p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const todayBookings = data?.todayBookings || [];
  const courtUtilization = data?.courtUtilization || [];
  const alerts = data?.alerts || [];
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#1F2937] tracking-tight">
              Enterprise Operations Dashboard
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync Active
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Real-time status for <strong className="text-[#1F2937] font-semibold">{club?.name || data?.club?.name || 'Sports Club'}</strong> • Modular SaaS Engine Online
          </p>
        </div>

        {/* Quick Action Shortcuts & Refresh */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors shadow-xs"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {isModuleEnabled('courts') && (
            <button
              onClick={() => handleNavigate('court-bookings')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#57344f] text-white hover:bg-[#714b67] transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Book Court</span>
            </button>
          )}

          {isModuleEnabled('membership') && (
            <button
              onClick={() => handleNavigate('members')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F8F9FA] transition-colors"
            >
              <Users className="w-3.5 h-3.5 text-[#00696e]" />
              <span>New Member</span>
            </button>
          )}

          {isModuleEnabled('shop') && (
            <button
              onClick={() => handleNavigate('shop')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-[#F8F9FA] transition-colors"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#714B67]" />
              <span>POS Sale</span>
            </button>
          )}
        </div>
      </div>

      {/* Error notification if any */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-rose-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadDashboard}
            className="font-semibold underline hover:no-underline ml-4"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Operational Alerts banner */}
      {alerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-900 mr-2">Operational Alerts:</span>
            <span className="text-amber-800">
              {alerts.map((a) => a.message).join(' • ')}
            </span>
          </div>
          {isModuleEnabled('shop') && (
            <button
              onClick={() => handleNavigate('shop')}
              className="text-xs font-semibold text-amber-900 underline hover:no-underline shrink-0"
            >
              Review Stock
            </button>
          )}
        </div>
      )}

      {/* Dynamic KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Members */}
        {isModuleEnabled('membership') && (
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span className="font-medium">Active Members</span>
              <div className="w-7 h-7 rounded-lg bg-[#57344f]/10 text-[#57344f] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1F2937]">{kpis.activeMembers ?? 0}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#00A09D]">
              <TrendingUp className="w-3 h-3" />
              <span>{kpis.expiringSoon ?? 0} expiring in next 30 days</span>
            </div>
          </div>
        )}

        {/* Court Bookings Today */}
        {isModuleEnabled('courts') && (
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span className="font-medium">Today's Bookings</span>
              <div className="w-7 h-7 rounded-lg bg-teal-50 text-[#00696e] flex items-center justify-center">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1F2937]">{kpis.todayBookingsCount ?? 0}</div>
            <div className="flex items-center gap-1 mt-1 text-[11px] text-[#6B7280]">
              <Clock className="w-3 h-3 text-[#00696e]" />
              <span>Court Occupancy: <strong className="text-[#1F2937]">{kpis.courtUtilization ?? 0}%</strong></span>
            </div>
          </div>
        )}

        {/* Monthly Revenue */}
        {isModuleEnabled('finance') && (
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span className="font-medium">Monthly Revenue</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1F2937]">
              ₹{Number(kpis.monthlyRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1">Current billing cycle</div>
          </div>
        )}

        {/* Cafe / Shop / CRM Status */}
        {isModuleEnabled('cafe') ? (
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span className="font-medium">Cafe Open Tabs</span>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <Coffee className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1F2937]">{kpis.activeTabs ?? 0}</div>
            <div className="text-[11px] text-amber-700 mt-1 font-medium">
              {kpis.pendingKitchenOrders ?? 0} orders in prep
            </div>
          </div>
        ) : isModuleEnabled('shop') ? (
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span className="font-medium">Low Stock Alerts</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-700 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#DC2626]">{kpis.lowStockCount ?? 0}</div>
            <div className="text-[11px] text-[#6B7280] mt-1">Items below safety reorder level</div>
          </div>
        ) : (
          <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span className="font-medium">New CRM Enquiries</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1F2937]">{kpis.newLeadsCount ?? 0}</div>
            <div className="text-[11px] text-[#6B7280] mt-1">Pending follow-up</div>
          </div>
        )}
      </div>

      {/* Main Grid: Court Bookings & Utilization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Today's Bookings Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">Today's Court Sessions</h2>
              <p className="text-[11px] text-[#6B7280]">
                Live reservations and booked time slots
              </p>
            </div>
            <button
              onClick={() => handleNavigate('court-bookings')}
              className="text-xs text-[#714B67] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Full Calendar</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8F9FA] text-[#6B7280] uppercase tracking-wider font-semibold border-y border-[#E5E7EB]">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Court</th>
                  <th className="py-2.5 px-3">Player / Member</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3F4F6]">
                {todayBookings.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-[#9CA3AF]">
                      No court bookings scheduled for today.
                    </td>
                  </tr>
                ) : (
                  todayBookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 px-3 font-semibold text-[#1F2937] whitespace-nowrap">
                        {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-3 font-medium text-[#4B5563] whitespace-nowrap">
                        {b.court?.name || 'Main Court'}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-[#1F2937]">{b.guestName || 'Member'}</div>
                        {b.member?.phone && (
                          <div className="text-[10px] text-[#9CA3AF] font-mono">{b.member.phone}</div>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-700 rounded">
                          {b.bookingType}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : b.status === 'In Progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{b.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Court Utilization Breakdown & Audit Trail */}
        <div className="space-y-6">
          {/* Utilization Breakdown */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1F2937]">Facility Occupancy</h2>
              <span className="text-[10px] font-semibold bg-teal-50 text-teal-800 px-2 py-0.5 rounded">
                Today
              </span>
            </div>
            <div className="space-y-3">
              {courtUtilization.map((c) => (
                <div key={c.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-[#374151] truncate max-w-[170px]">{c.name}</span>
                    <span className="font-bold text-[#714B67]">{c.utilization}%</span>
                  </div>
                  <div className="w-full bg-[#E5E7EB] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#57344f] to-[#00696e] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(8, c.utilization))}%` }}
                    ></div>
                  </div>
                  <div className="text-[10px] text-[#9CA3AF] flex justify-between">
                    <span>{c.sportType} • {c.surface}</span>
                    <span>{c.bookedHours} hrs booked</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Log / Live Activity Feed */}
          <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1F2937]">Recent Audit Trail</h2>
              <span className="text-[10px] font-semibold bg-[#F5EFF3] text-[#714B67] px-2 py-0.5 rounded">
                Secured
              </span>
            </div>
            <div className="space-y-2.5">
              {recentActivity.map((log) => (
                <div key={log.id} className="text-xs border-b border-[#F3F4F6] pb-2 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#1F2937]">{log.action}</span>
                    <span className="text-[10px] text-[#9CA3AF]">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#6B7280]">
                    {log.entity} • by {log.user?.firstName || log.user?.name || 'Staff'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System status bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-gray-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Core ERP Server: Online (Port 5001)</span>
        </div>
        <span className="text-gray-200">|</span>
        <span>Connected Club: {club?.name || 'Active'}</span>
        <span className="text-gray-200">|</span>
        <span>Active User: {user?.name} ({user?.role})</span>
      </div>
    </div>
  );
}
