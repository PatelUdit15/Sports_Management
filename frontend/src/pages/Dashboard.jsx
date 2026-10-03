/**
 * Dashboard.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Executive Overview — KPIs, operational alerts, status, and quick module links.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { staffService } from '../services/staffService';
import { useAuth } from '../context/AuthContext';
import {
  Users, Trophy, DollarSign, TrendingUp,
  AlertTriangle, Clock, Calendar, Coffee, ShoppingBag,
  ArrowUpRight, Plus, CheckCircle2, RefreshCw, Activity,
  Layers, Send, FileText, Printer, Shield, Eye, AlertCircle, X, Lock
} from 'lucide-react';
import { getGreeting, todayLabel } from '../components/dashboard/dashboardUtils';

// ─────────────────────────────────────────────────────────────────────────────
//  Dashboard
// ─────────────────────────────────────────────────────────────────────────────

export default function Dashboard({ setActiveTab }) {
  const navigate = useNavigate();
  const { user, club, hasModule, isSuperAdmin, hasRole } = useAuth();

  // ── API state ───────────────────────────────────────────────────────────────
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);

  // Employee Dashboard specific states (for non-admin / non-HR staff)
  const isExecutiveOrHr = isSuperAdmin?.() || hasRole?.('HR_MANAGER') || user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER';
  const [employeeLeaves, setEmployeeLeaves] = useState([]);
  const [employeePayslips, setEmployeePayslips] = useState([]);
  const [employeeTab, setEmployeeTab] = useState('ALL'); // 'ALL' | 'PAYSLIPS' | 'SELF_SERVICE'
  const [dutyStatus, setDutyStatus] = useState('Active');
  const [toast, setToast] = useState(null);

  // Employee Leave application form
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
  });
  const [submittingLeave, setSubmittingLeave] = useState(false);

  // Selected Payslip for Digital View/Print
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
  const loadDashboard = useCallback(async () => {
    if (isExecutiveOrHr) {
      await loadExecutiveDashboard();
    } else {
      await loadEmployeeDashboard();
    }
  }, [isExecutiveOrHr]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, user?.role]);

  const loadExecutiveDashboard = async () => {
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

  const loadEmployeeDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [lRes, pRes] = await Promise.all([
        staffService.getMyLeaves(),
        staffService.getMyPayslips(),
      ]);

      if (lRes && (lRes.success || lRes.leaves)) {
        setEmployeeLeaves(lRes.leaves || lRes.data?.leaves || []);
      }
      if (pRes && (pRes.success || pRes.payslips)) {
        setEmployeePayslips(pRes.payslips || pRes.data?.payslips || []);
      }
    } catch (e) {
      console.error('Failed to load employee data:', e);
      setError(e?.message || 'Unable to load employee workspace');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
  };

  // Clock In / Out for Employee
  const handlePunch = async (type) => {
    try {
      const res = await staffService.punchAttendance(user?.userId, type);
      if (res && res.success) {
        setDutyStatus(type === 'IN' ? 'On Duty' : 'Clocked Out');
        showToast(`Clocked ${type}! Status is now ${type === 'IN' ? 'On Duty' : 'Clocked Out'}`);
      }
    } catch (err) {
      showToast(err.message || 'Failed to record attendance punch', 'error');
    }
  };

  // Apply Leave (Employee Self-Service)
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      showToast('Please provide a reason for leave.', 'error');
      return;
    }

    try {
      setSubmittingLeave(true);
      const res = await staffService.applyLeave(leaveForm);
      if (res && res.success) {
        showToast('Leave request submitted! Pending HR approval.', 'success');
        setLeaveForm({
          leaveType: 'Casual Leave',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          reason: '',
        });
        await loadEmployeeDashboard();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit leave application', 'error');
    } finally {
      setSubmittingLeave(false);
    }
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

  /* ══════════════════════════════════════════════════════════════════
     A. EMPLOYEE DASHBOARD (FOR RECEPTIONIST, INVENTORY MGR, BAR/CAFE, ETC.)
     Prompt: "only in thier employee dashbaord they can view only two sections
     which you already builded that is Wages Playslip and their individual payslips
     only month wise and as well as Employee Self Servvie (apply leave and my wages ) section"
     ══════════════════════════════════════════════════════════════════ */
  if (!isExecutiveOrHr) {
    const latestPayslip = employeePayslips[0] || null;

    return (
      <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">
        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold animate-fade-in ${
              toast.type === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* Top Header / Employee Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                Welcome, {user?.name || 'Staff Member'}! 👋
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#714B67] text-[11px] font-bold border border-purple-200">
                {user?.role?.replace(/_/g, ' ') || 'Staff'}
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  dutyStatus === 'On Duty' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    dutyStatus === 'On Duty' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                  }`}
                />
                {dutyStatus}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {club?.name || 'Skyline Sports Club'} • Employee Self-Service Workspace &amp; Wages Portal
            </p>
          </div>

          {/* Quick Actions (Punch Clock & Sync) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Sync records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Sync</span>
            </button>

            {dutyStatus === 'On Duty' ? (
              <button
                onClick={() => handlePunch('OUT')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all"
              >
                Clock OUT
              </button>
            ) : (
              <button
                onClick={() => handlePunch('IN')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
              >
                Clock IN
              </button>
            )}
          </div>
        </div>

        {/* Section View Switcher */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs font-bold">
          <button
            onClick={() => setEmployeeTab('ALL')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              employeeTab === 'ALL'
                ? 'bg-[#714B67] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Layers size={14} />
            <span>All Sections</span>
          </button>

          <button
            onClick={() => setEmployeeTab('PAYSLIPS')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              employeeTab === 'PAYSLIPS'
                ? 'bg-[#714B67] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <DollarSign size={14} />
            <span>Wages Playslip &amp; Individual Month-Wise Payslips</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                employeeTab === 'PAYSLIPS' ? 'bg-white text-[#714B67]' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {employeePayslips.length}
            </span>
          </button>

          <button
            onClick={() => setEmployeeTab('SELF_SERVICE')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              employeeTab === 'SELF_SERVICE'
                ? 'bg-[#714B67] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Send size={14} />
            <span>Employee Self-Service (Apply Leave &amp; My Wages)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                employeeTab === 'SELF_SERVICE' ? 'bg-white text-[#714B67]' : 'bg-purple-100 text-[#714B67]'
              }`}
            >
              {employeeLeaves.length}
            </span>
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 1: WAGES PLAYSLIP & INDIVIDUAL MONTH-WISE PAYSLIPS
            ══════════════════════════════════════════════════════════════ */}
        {(employeeTab === 'ALL' || employeeTab === 'PAYSLIPS') && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <DollarSign size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Wages Playslip &amp; Individual Month-Wise Payslips
                  </h2>
                  <p className="text-xs text-gray-500">
                    Review and inspect your month-by-month wage payslips, breakdown, and digital statements.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700">
                {employeePayslips.length} Statement{employeePayslips.length !== 1 ? 's' : ''} Available
              </span>
            </div>

            {employeePayslips.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                No wage payslips available yet. Once HR disburses your salary statement, it will appear here.
              </div>
            ) : (
              <div className="space-y-3">
                {employeePayslips.map((p) => (
                  <div
                    key={p.id}
                    className="p-5 rounded-2xl border border-gray-200/70 hover:border-purple-300 bg-gradient-to-r from-gray-50/60 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-sm font-black text-gray-900">{p.month}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {p.paymentStatus || 'PAID'}
                        </span>
                        <span className="text-[11px] font-mono text-gray-400">Slip ID: {p.payslipId || p.id}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3 text-xs text-gray-600">
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase">Basic Salary</span>
                          <span className="font-bold text-gray-900">₹{p.basicSalary?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase">Allowances</span>
                          <span className="font-bold text-emerald-700">+₹{p.allowances?.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-gray-400 block uppercase">Deductions (Tax/PF)</span>
                          <span className="font-bold text-red-600">-₹{p.deductions?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                      <div className="text-left sm:text-right">
                        <span className="text-[10px] text-gray-400 block uppercase">Net Wage Disbursed</span>
                        <span className="text-xl font-black text-gray-900">₹{p.netSalary?.toLocaleString()}</span>
                      </div>

                      <button
                        onClick={() => setSelectedPayslip(p)}
                        className="px-4 py-2 rounded-xl bg-[#714B67] hover:bg-[#57344f] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <FileText size={14} />
                        <span>View Playslip</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2: EMPLOYEE SELF-SERVICE (APPLY LEAVE & MY WAGES)
            ══════════════════════════════════════════════════════════════ */}
        {(employeeTab === 'ALL' || employeeTab === 'SELF_SERVICE') && (
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold">
                  <Send size={16} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Employee Self-Service (Apply Leave &amp; My Wages)
                  </h2>
                  <p className="text-xs text-gray-500">
                    Submit a leave request for HR approval, track leave balances, and review wages overview.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-[#714B67]">
                {employeeLeaves.length} Leave Application{employeeLeaves.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Quick Leave Balances & My Wages Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-100">
                <span className="text-[11px] font-bold text-[#714B67] uppercase">Casual Leaves</span>
                <div className="text-2xl font-black text-[#714B67] mt-1">12</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Days Available</div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                <span className="text-[11px] font-bold text-blue-700 uppercase">Medical / Sick Leaves</span>
                <div className="text-2xl font-black text-blue-700 mt-1">8</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Days Available</div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-bold text-emerald-700 uppercase">Annual / Paid Leaves</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">15</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Days Available</div>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                <span className="text-[11px] font-bold text-gray-500 uppercase">Current Month Wage</span>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  {latestPayslip ? `₹${latestPayslip.netSalary?.toLocaleString()}` : '₹25,200'}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-0.5">Status: Disbursed / Paid</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pt-2">
              {/* Apply for Leave Form */}
              <div className="lg:col-span-5 p-5 rounded-2xl bg-gray-50/70 border border-gray-200/70 space-y-4">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#714B67]" />
                  <span>Apply for Leave</span>
                </h3>

                <form onSubmit={handleApplyLeave} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Leave Type *</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                      value={leaveForm.leaveType}
                      onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                    >
                      <option value="Casual Leave">Casual Leave (12 left)</option>
                      <option value="Medical / Sick Leave">Medical / Sick Leave (8 left)</option>
                      <option value="Annual / Paid Leave">Annual / Paid Leave (15 left)</option>
                      <option value="Unpaid Leave">Unpaid Leave</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">Start Date *</label>
                      <input
                        type="date"
                        required
                        value={leaveForm.startDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, startDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-1">End Date *</label>
                      <input
                        type="date"
                        required
                        value={leaveForm.endDate}
                        onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Reason for Leave *</label>
                    <textarea
                      required
                      rows="2"
                      value={leaveForm.reason}
                      onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                      placeholder="Specify the reason for your leave request..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingLeave}
                    className="w-full py-2.5 rounded-xl bg-[#714B67] text-white hover:bg-[#57344f] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all hover:scale-[1.01]"
                  >
                    {submittingLeave ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Submit Leave Application</span>
                  </button>
                </form>
              </div>

              {/* My Leave Applications History */}
              <div className="lg:col-span-7 space-y-3">
                <h3 className="font-bold text-xs uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                  <Clock size={14} className="text-[#714B67]" />
                  <span>My Leave Application Status History</span>
                </h3>

                {employeeLeaves.length === 0 ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
                    No leave requests submitted yet. Use the form on the left to apply for leave.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                    {employeeLeaves.map((l) => (
                      <div
                        key={l.id}
                        className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 flex items-center justify-between transition-colors text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{l.leaveType}</span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                l.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : l.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800 animate-pulse'
                              }`}
                            >
                              {l.status}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1">
                            {l.startDate} → {l.endDate} ({l.daysCount} Day{l.daysCount > 1 ? 's' : ''})
                          </div>
                          <div className="text-[11px] text-gray-600 mt-0.5 italic">"{l.reason}"</div>
                          {l.decisionNote && (
                            <div className="text-[10px] text-purple-700 font-medium mt-1">
                              HR Note: {l.decisionNote}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-gray-400">{l.leaveId || l.id}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Digital / Printable Wage Statement Modal */}
        {selectedPayslip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-left">
              <div className="flex items-start justify-between pb-4 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#714B67] text-white flex items-center justify-center font-bold text-xs">
                      S
                    </div>
                    <span className="font-bold text-sm text-gray-900">
                      {club?.name || 'Skyline Sports Club'}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-1">Official Monthly Wage Statement</div>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {selectedPayslip.paymentStatus || 'PAID'}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">{selectedPayslip.payPeriod}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-4 border-b border-gray-100 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">EMPLOYEE NAME</span>
                  <span className="font-bold text-gray-900">{selectedPayslip.employeeName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">UNIQUE EMPLOYEE ID</span>
                  <span className="font-mono font-bold text-gray-900">{selectedPayslip.employeeId}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">DEPARTMENT</span>
                  <span className="text-gray-800">{selectedPayslip.department}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">DESIGNATION / ROLE</span>
                  <span className="text-gray-800">{selectedPayslip.role}</span>
                </div>
              </div>

              <div className="py-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Basic Wage Salary</span>
                  <span className="font-bold text-gray-900">₹{selectedPayslip.basicSalary?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">House Rent &amp; Travel Allowances</span>
                  <span className="font-bold text-emerald-700">+₹{selectedPayslip.allowances?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-50">
                  <span className="text-gray-600">Statutory Deductions (Tax &amp; PF)</span>
                  <span className="font-bold text-red-600">-₹{selectedPayslip.deductions?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-2 text-sm font-black border-t border-gray-200">
                  <span className="text-gray-900">Net Wage Payable</span>
                  <span className="text-emerald-700">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-[10px] text-gray-400">Slip ID: {selectedPayslip.payslipId || selectedPayslip.id}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Printer size={13} />
                    <span>Print Slip</span>
                  </button>
                  <button
                    onClick={() => setSelectedPayslip(null)}
                    className="px-4 py-1.5 rounded-lg bg-[#714B67] text-white hover:bg-[#57344f] text-xs font-bold"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════
     B. EXECUTIVE / HR DASHBOARD (FOR SUPER_ADMIN & HR_MANAGER)
     ══════════════════════════════════════════════════════════════════ */
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

            {isModuleEnabled('staff') && (
              <button
                onClick={() => handleNavigate('staff')}
                className="btn btn-secondary text-[12px] px-3 py-1.5"
                title="Go to Staff & HR"
                aria-label="Open staff & HR roster"
              >
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--color-primary)' }} />
                Staff & HR
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
