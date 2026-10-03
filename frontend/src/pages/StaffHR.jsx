import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { staffService } from '../services/staffService';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Building,
  Clock,
  Calendar,
  Check,
  X,
  AlertCircle,
  Briefcase,
  Plus,
  Search,
  Filter,
  RefreshCw,
  UserPlus,
  Shield,
  CheckCircle2,
  DollarSign,
  FileText,
  Printer,
  ChevronRight,
  Download,
  Users,
  Eye,
  Send,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function StaffHR() {
  const { user, club, isSuperAdmin, hasRole } = useAuth();
  const canManageStaff = isSuperAdmin?.() || hasRole?.('HR_MANAGER');
  const [activeTab, setActiveTab] = useState(canManageStaff ? 'employees' : 'payslips'); // 'employees' | 'departments' | 'leaves' | 'payslips' | 'self-service'
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState(null);

  // Add Employee Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'RECEPTIONIST',
    department: 'Front Desk & Reception',
    designation: 'Front Desk Receptionist',
    employeeId: '',
    salary: 28000,
    shift: '07:00 - 15:30',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Apply Leave Form (Employee self-service)
  const [leaveForm, setLeaveForm] = useState({
    leaveType: 'Casual Leave',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    reason: '',
  });
  const [applyingLeave, setApplyingLeave] = useState(false);

  // Selected Payslip for Digital View/Print
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  // Generate Payslip Modal (HR)
  const [showGeneratePayslipModal, setShowGeneratePayslipModal] = useState(false);
  const [genPayslipData, setGenPayslipData] = useState({
    employeeId: '',
    month: 'November 2026',
    bonus: 0,
    deductions: 0,
  });

  useEffect(() => {
    if (!canManageStaff && (activeTab === 'employees' || activeTab === 'departments' || activeTab === 'leaves')) {
      setActiveTab('payslips');
    }
  }, [canManageStaff, activeTab]);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-generate employee ID and default department when role changes in modal
  useEffect(() => {
    const rolePrefixes = {
      RECEPTIONIST: { prefix: 'REC', dept: 'Front Desk & Reception', desig: 'Front Desk Receptionist', shift: '07:00 - 15:30', sal: 28000 },
      SHOP_INVENTORY_MANAGER: { prefix: 'INV', dept: 'Pro Shop & Inventory', desig: 'Inventory Manager', shift: '10:00 - 19:00', sal: 32000 },
      BAR_CAFETERIA_STAFF: { prefix: 'BAR', dept: 'Cafe & Bar Operations', desig: 'Bar & Cafe Manager', shift: '08:00 - 16:30', sal: 30000 },
      ACCOUNTANT: { prefix: 'ACC', dept: 'Finance & Accounts', desig: 'Club Accountant', shift: '09:30 - 18:30', sal: 38000 },
      HR_MANAGER: { prefix: 'HRM', dept: 'Human Resources & Payroll', desig: 'HR Manager', shift: '09:00 - 18:00', sal: 40000 },
      SUPER_ADMIN: { prefix: 'ADM', dept: 'Executive Management', desig: 'Operations Director', shift: '09:00 - 18:00', sal: 60000 },
    };

    const config = rolePrefixes[formData.role] || rolePrefixes.RECEPTIONIST;
    const nextNum = 100 + (employees.length + 1);
    setFormData((prev) => ({
      ...prev,
      employeeId: prev.employeeId || `EMP-${config.prefix}-${nextNum}`,
      department: prev.department || config.dept,
      designation: prev.designation || config.desig,
      shift: prev.shift || config.shift,
      salary: prev.salary || config.sal,
    }));
  }, [formData.role, employees.length]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [eRes, dRes, lRes, pRes] = await Promise.all([
        staffService.getEmployees(),
        staffService.getDepartments(),
        staffService.getLeaves(),
        staffService.getPayslips(),
      ]);

      if (eRes && (eRes.success || eRes.employees)) {
        setEmployees(eRes.employees || eRes.data?.employees || []);
      }
      if (dRes && (dRes.success || dRes.departments)) {
        setDepartments(dRes.departments || dRes.data?.departments || []);
      }
      if (lRes && (lRes.success || lRes.leaves)) {
        setLeaves(lRes.leaves || lRes.data?.leaves || []);
      }
      if (pRes && (pRes.success || pRes.payslips)) {
        setPayslips(pRes.payslips || pRes.data?.payslips || []);
      }
    } catch (e) {
      console.error('Failed to load staff/HR data:', e);
      showToast(e.message || 'Error loading staff records', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  // Clock In / Out
  const handlePunch = async (employeeId, type) => {
    try {
      const res = await staffService.punchAttendance(employeeId, type);
      if (res && res.success) {
        showToast(res.message || `Successfully punched ${type}!`, 'success');
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employeeId || emp.employeeId === employeeId || emp.userId === employeeId
              ? { ...emp, status: type === 'IN' ? 'On Duty' : 'Clocked Out' }
              : emp
          )
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to record attendance', 'error');
    }
  };

  // HR Leave Decision (Approve / Reject)
  const handleLeaveDecision = async (leaveId, status) => {
    try {
      const note = prompt(`Enter optional decision note for ${status}:`, `Decision by ${user?.name || 'HR'}: ${status}`);
      const res = await staffService.updateLeaveStatus(leaveId, status, note || `Marked as ${status}`);
      if (res && res.success) {
        showToast(`Leave request has been marked as ${status}.`, 'success');
        setLeaves((prev) =>
          prev.map((l) => (l.id === leaveId || l.leaveId === leaveId ? { ...l, status, decisionNote: note } : l))
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to update leave request', 'error');
    }
  };

  // HR Create Employee with Credentials and Unique ID
  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showToast('Name, Email, and Password credentials are required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await staffService.createEmployee(formData);
      if (res && res.success) {
        showToast(`Staff member ${formData.name} onboarded! Login credentials set.`, 'success');
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'RECEPTIONIST',
          department: 'Front Desk & Reception',
          designation: 'Front Desk Receptionist',
          employeeId: '',
          salary: 28000,
          shift: '07:00 - 15:30',
          phone: '',
        });
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add staff member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Employee Apply for Leave
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.reason.trim()) {
      showToast('Please provide a reason for leave.', 'error');
      return;
    }

    try {
      setApplyingLeave(true);
      const res = await staffService.applyLeave(leaveForm);
      if (res && res.success) {
        showToast('Leave request submitted! Pending HR approval.', 'success');
        setLeaveForm({
          leaveType: 'Casual Leave',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          reason: '',
        });
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to submit leave application', 'error');
    } finally {
      setApplyingLeave(false);
    }
  };

  // HR Generate Payslip
  const handleGeneratePayslip = async (e) => {
    e.preventDefault();
    if (!genPayslipData.employeeId) {
      showToast('Please select an employee.', 'error');
      return;
    }

    try {
      const res = await staffService.generatePayslip(genPayslipData);
      if (res && res.success) {
        showToast('Payslip generated successfully!', 'success');
        setShowGeneratePayslipModal(false);
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate payslip', 'error');
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      emp.name?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.employeeId?.toLowerCase().includes(q) ||
      emp.employeeCode?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q);

    const matchesDept =
      deptFilter === 'All' ||
      emp.department?.name?.toLowerCase().includes(deptFilter.toLowerCase());

    const matchesStatus =
      statusFilter === 'All' ||
      emp.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesDept && matchesStatus;
  });

  // Calculate quick stats
  const totalPayroll = employees.reduce((acc, curr) => acc + (parseFloat(curr.salary) || 0), 0);
  const pendingLeavesCount = leaves.filter((l) => l.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      {/* Top Banner / Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {canManageStaff ? 'Staff & HR Management' : 'Employee Workspace: My Wages & Self-Service'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#714B67]/10 text-[#714B67] text-[11px] font-bold">
              {canManageStaff ? `${employees.length} Personnel` : user?.role?.replace(/_/g, ' ') || 'Staff Member'}
            </span>
            {canManageStaff && pendingLeavesCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold animate-pulse">
                {pendingLeavesCount} Pending Leave{pendingLeavesCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {canManageStaff
              ? 'Manage roles (Receptionist, Inventory, Cafe), credentials, leaves, and wage payslips.'
              : 'View your individual month-wise wages payslips and manage your employee leave requests.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {canManageStaff && (
            <button
              onClick={() => setShowAddModal(true)}
              id="add-staff-btn"
              className="px-4 py-2 rounded-xl bg-[#714B67] text-white hover:bg-[#57344f] text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-[1.02]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Employee / Manager</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 overflow-x-auto text-xs font-bold">
        {(canManageStaff
          ? [
              { id: 'employees', label: 'Staff Roster & Roles', icon: Users, count: employees.length },
              { id: 'departments', label: 'Departments', icon: Building, count: departments.length },
              { id: 'leaves', label: 'Leave Management (HR Review)', icon: Calendar, badge: pendingLeavesCount },
              { id: 'payslips', label: 'Wages & Payslips', icon: DollarSign, count: payslips.length },
              { id: 'self-service', label: 'Employee Self-Service (Apply Leave & My Wages)', icon: Send },
            ]
          : [
              { id: 'payslips', label: 'Wages Playslip & Individual Month-Wise Payslips', icon: DollarSign, count: payslips.length },
              { id: 'self-service', label: 'Employee Self-Service (Apply Leave & My Wages)', icon: Send },
            ]
        ).map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
                active
                  ? 'bg-[#714B67] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${active ? 'bg-white text-[#714B67]' : 'bg-amber-500 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── TAB 1: Employees Directory (HR View) ── */}
      {canManageStaff && activeTab === 'employees' && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-100">
            <div className="relative w-full sm:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by ID, name, email..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-[#714B67]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none"
              >
                <option value="All">All Departments</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="On Duty">On Duty</option>
                <option value="Clocked Out">Clocked Out</option>
              </select>
            </div>
          </div>

          {/* Employees Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Unique ID</th>
                    <th className="py-3 px-4">Staff Member &amp; Email</th>
                    <th className="py-3 px-4">Operating Role</th>
                    <th className="py-3 px-4">Department &amp; Title</th>
                    <th className="py-3 px-4">Shift &amp; Wage</th>
                    <th className="py-3 px-4">Duty Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* Unique Employee ID */}
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 border border-gray-200 text-[11px]">
                          {emp.employeeId || emp.employeeCode}
                        </span>
                      </td>

                      {/* Name & Credentials Email */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900 text-[13px]">{emp.name}</div>
                        <div className="text-[11px] text-gray-500 font-normal">{emp.email}</div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.role === 'RECEPTIONIST'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : emp.role === 'SHOP_INVENTORY_MANAGER'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : emp.role === 'BAR_CAFETERIA_STAFF'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : emp.role === 'ACCOUNTANT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          <Shield size={10} />
                          {emp.role.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Department & Designation */}
                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-semibold">{emp.designation}</div>
                        <div className="text-[11px] text-gray-500">{emp.department?.name}</div>
                      </td>

                      {/* Shift & Monthly Wage */}
                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-bold">₹{emp.salary?.toLocaleString()}/mo</div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock size={10} /> {emp.shift}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            emp.status === 'On Duty'
                              ? 'bg-emerald-100 text-emerald-800'
                              : emp.status === 'Active'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              emp.status === 'On Duty' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'
                            }`}
                          />
                          {emp.status}
                        </span>
                      </td>

                      {/* Punch Clock / Action */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {emp.status === 'On Duty' ? (
                            <button
                              onClick={() => handlePunch(emp.id || emp.userId, 'OUT')}
                              className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 text-[11px] font-bold border border-amber-200"
                            >
                              Clock OUT
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePunch(emp.id || emp.userId, 'IN')}
                              className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold border border-emerald-200"
                            >
                              Clock IN
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: Departments ── */}
      {canManageStaff && activeTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#714B67] flex items-center justify-center font-bold">
                    <Building size={18} />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-[#714B67] text-xs font-bold">
                    {dept.employeeCount} Personnel
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm">{dept.name}</h3>
                <p className="text-xs text-gray-500 mt-1">Lead: <strong>{dept.head}</strong></p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 text-[11px] text-gray-400">
                Department Code: <strong className="font-mono text-gray-700">{dept.code}</strong>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── TAB 3: Leave Management (HR Review) ── */}
      {canManageStaff && activeTab === 'leaves' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Leave Applications for Review</h2>
              <p className="text-xs text-gray-500">Approve or reject leave requests submitted by staff members.</p>
            </div>
            <span className="text-xs font-bold text-gray-700">Total Requests: {leaves.length}</span>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Leave ID &amp; Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Leave Type</th>
                    <th className="py-3 px-4">Dates &amp; Duration</th>
                    <th className="py-3 px-4">Reason / Notes</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">HR Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {leaves.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-gray-900 text-[11px]">{l.leaveId || l.id}</div>
                        <div className="font-bold text-gray-800">{l.employee?.name}</div>
                        <div className="text-[10px] text-gray-400">{l.employeeId}</div>
                      </td>

                      <td className="py-3 px-4">{l.employee?.department}</td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 text-[11px] font-semibold">
                          {l.leaveType}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-gray-900 font-bold">{l.daysCount} Day{l.daysCount > 1 ? 's' : ''}</div>
                        <div className="text-[11px] text-gray-500">{l.startDate} → {l.endDate}</div>
                      </td>

                      <td className="py-3 px-4 max-w-xs truncate" title={l.reason}>
                        <div className="text-gray-800 italic">"{l.reason}"</div>
                        {l.decisionNote && (
                          <div className="text-[10px] text-gray-500 mt-0.5">Note: {l.decisionNote}</div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            l.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : l.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        {l.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleLeaveDecision(l.id, 'APPROVED')}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                              title="Approve Leave"
                            >
                              <Check size={14} />
                            </button>
                            <button
                              onClick={() => handleLeaveDecision(l.id, 'REJECTED')}
                              className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                              title="Reject Leave"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-normal">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: Wages & Payslips ── */}
      {activeTab === 'payslips' && (
        <div className="space-y-4">
          {/* Quick Metrics */}
          {!canManageStaff ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Current Month Net Wage</span>
                <div className="text-2xl font-black text-gray-900 mt-1">
                  ₹{(payslips[0]?.netSalary || 25200).toLocaleString()}
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-0.5">Payment Status: PAID / Disbursed</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Basic Salary</span>
                <div className="text-2xl font-black text-[#714B67] mt-1">
                  ₹{(payslips[0]?.basicSalary || 19600).toLocaleString()}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Base Monthly Compensation</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Allowances &amp; Deductions</span>
                <div className="text-xl font-black text-gray-900 mt-1">
                  <span className="text-emerald-700">+₹{(payslips[0]?.allowances || 7000).toLocaleString()}</span>
                  <span className="text-gray-400 text-sm mx-1">/</span>
                  <span className="text-red-600">-₹{(payslips[0]?.deductions || 1400).toLocaleString()}</span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">HRA &amp; Allowances minus Tax/PF</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Total Monthly Payroll</span>
                <div className="text-2xl font-black text-gray-900 mt-1">₹{totalPayroll.toLocaleString()}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Across {employees.length} employees</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
                <span className="text-[11px] font-bold text-gray-400 uppercase">Average Staff Wage</span>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  ₹{Math.round(totalPayroll / (employees.length || 1)).toLocaleString()}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Monthly standard rate</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-gray-400 uppercase">Generate Wage Payslip</span>
                  <p className="text-xs text-gray-600 mt-1">Disburse month salary slip</p>
                </div>
                <button
                  onClick={() => setShowGeneratePayslipModal(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#714B67] text-white hover:bg-[#57344f] text-xs font-bold flex items-center gap-1 shadow-xs"
                >
                  <Plus size={14} />
                  <span>Generate</span>
                </button>
              </div>
            </div>
          )}

          {/* Payslips Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Payslip ID</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department &amp; Role</th>
                    <th className="py-3 px-4">Month &amp; Period</th>
                    <th className="py-3 px-4">Basic Pay</th>
                    <th className="py-3 px-4">Allowances / Deductions</th>
                    <th className="py-3 px-4">Net Wage</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">View / Print</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700 font-medium">
                  {payslips.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 text-[11px]">
                        {p.payslipId || p.id}
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{p.employeeName}</div>
                        <div className="text-[10px] text-gray-400">{p.employeeId}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-gray-900">{p.department}</div>
                        <div className="text-[10px] text-gray-500">{p.role}</div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-gray-900">{p.month}</div>
                        <div className="text-[10px] text-gray-400">{p.payPeriod}</div>
                      </td>

                      <td className="py-3 px-4 font-semibold text-gray-800">
                        ₹{p.basicSalary?.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-emerald-700 font-semibold">+₹{p.allowances?.toLocaleString()}</span> /{' '}
                        <span className="text-red-600 font-semibold">-₹{p.deductions?.toLocaleString()}</span>
                      </td>

                      <td className="py-3 px-4 font-black text-gray-900 text-sm">
                        ₹{p.netSalary?.toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {p.paymentStatus || 'PAID'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayslip(p)}
                          className="px-2.5 py-1 rounded bg-purple-50 text-[#714B67] hover:bg-purple-100 text-[11px] font-bold border border-purple-200 inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          <span>View Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 5: Employee Self-Service (Apply Leaves & My Wages) ── */}
      {activeTab === 'self-service' && (
        <div className="space-y-6">
          {/* Banner */}
          <div className="bg-gradient-to-r from-purple-900/10 via-[#714B67]/10 to-transparent p-5 rounded-2xl border border-purple-200/60">
            <h2 className="text-sm font-bold text-gray-900">Employee Workspace Portal</h2>
            <p className="text-xs text-gray-600 mt-1">
              Logged in personnel can submit leave applications and inspect their monthly wage payslips.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Apply for Leave Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <Calendar className="w-4 h-4 text-[#714B67]" />
                <h3 className="font-bold text-sm text-gray-900">Apply for Leave</h3>
              </div>

              {/* Leave Balances preview */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                  <div className="text-[10px] text-gray-500 font-bold">Casual</div>
                  <div className="text-lg font-black text-[#714B67]">12</div>
                  <div className="text-[9px] text-gray-400">Days Left</div>
                </div>
                <div className="p-2 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="text-[10px] text-gray-500 font-bold">Sick</div>
                  <div className="text-lg font-black text-blue-700">8</div>
                  <div className="text-[9px] text-gray-400">Days Left</div>
                </div>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-[10px] text-gray-500 font-bold">Annual</div>
                  <div className="text-lg font-black text-emerald-700">15</div>
                  <div className="text-[9px] text-gray-400">Days Left</div>
                </div>
              </div>

              <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Leave Type *</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    value={leaveForm.leaveType}
                    onChange={(e) => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}
                  >
                    <option value="Casual Leave">Casual Leave</option>
                    <option value="Medical / Sick Leave">Medical / Sick Leave</option>
                    <option value="Annual / Paid Leave">Annual / Paid Leave</option>
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
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveForm.endDate}
                      onChange={(e) => setLeaveForm({ ...leaveForm, endDate: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Reason for Leave *</label>
                  <textarea
                    required
                    rows="3"
                    value={leaveForm.reason}
                    onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                    placeholder="Provide details about your leave application..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={applyingLeave}
                  className="w-full py-2.5 rounded-xl bg-[#714B67] text-white hover:bg-[#57344f] font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  {applyingLeave ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Submit Leave Application</span>
                </button>
              </form>
            </div>

            {/* Right: My Wage Payslips History */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[#714B67]" />
                  <h3 className="font-bold text-sm text-gray-900">My Wage Payslips</h3>
                </div>
                <span className="text-xs text-gray-400">Disbursed monthly</span>
              </div>

              <div className="space-y-3">
                {payslips.map((p) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-gray-100 hover:border-purple-200 bg-gray-50/50 flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-xs">{p.month}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {p.paymentStatus || 'PAID'}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Pay Period: {p.payPeriod} • Basic: ₹{p.basicSalary?.toLocaleString()}
                      </div>
                    </div>

                    <div className="text-right flex items-center gap-3">
                      <div>
                        <div className="text-sm font-black text-gray-900">₹{p.netSalary?.toLocaleString()}</div>
                        <div className="text-[10px] text-gray-400">Net Wage</div>
                      </div>
                      <button
                        onClick={() => setSelectedPayslip(p)}
                        className="p-2 rounded-lg bg-white border border-gray-200 text-gray-700 hover:text-[#714B67] hover:border-purple-300"
                        title="View Detailed Payslip"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 1: Add Employee / Manager with Credentials ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#714B67]" />
                <h3 className="font-bold text-sm text-gray-900">Add Staff Personnel (HR Portal)</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs mt-3">
              {/* Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              {/* Role & Department */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Operating Role *</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="RECEPTIONIST">Receptionist (Front Desk)</option>
                    <option value="SHOP_INVENTORY_MANAGER">Shop / Inventory Manager</option>
                    <option value="BAR_CAFETERIA_STAFF">Bar / Cafe Manager &amp; Staff</option>
                    <option value="ACCOUNTANT">Accountant (Finance)</option>
                    <option value="HR_MANAGER">HR Manager</option>
                    <option value="SUPER_ADMIN">Super Admin (Executive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Department *</label>
                  <select
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  >
                    <option value="Front Desk & Reception">Front Desk &amp; Reception</option>
                    <option value="Pro Shop & Inventory">Pro Shop &amp; Inventory</option>
                    <option value="Cafe & Bar Operations">Cafe &amp; Bar Operations</option>
                    <option value="Court Operations & Maintenance">Court Operations &amp; Maintenance</option>
                    <option value="Finance & Accounts">Finance &amp; Accounts</option>
                    <option value="Human Resources & Payroll">Human Resources &amp; Payroll</option>
                    <option value="High Performance Coaching">High Performance Coaching</option>
                  </select>
                </div>
              </div>

              {/* Unique Employee ID & Designation */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Unique Employee ID *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. EMP-REC-104"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-mono font-bold text-gray-800 outline-none focus:border-[#714B67]"
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Job Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Receptionist"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  />
                </div>
              </div>

              {/* Monthly Wage & Shift */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Monthly Wage / Salary (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="28000"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg font-bold text-gray-900 outline-none focus:border-[#714B67]"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Shift Timing</label>
                  <input
                    type="text"
                    placeholder="07:00 - 15:30"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  />
                </div>
              </div>

              {/* Login Email & Password Credentials (Set by HR as requested) */}
              <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-100 space-y-3">
                <div className="flex items-center gap-1.5 text-[#714B67] font-bold">
                  <Lock size={13} />
                  <span>Employee Login Credentials (Set by HR)</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Login Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="employee@skylinesports.com"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-semibold mb-1">Set Password *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Staff@123"
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">
                  The employee will sign in using these exact credentials to access their portal, apply for leaves, and view payslips.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-1.5 rounded-lg bg-[#714B67] text-white hover:bg-[#57344f] font-semibold transition-colors flex items-center gap-1.5"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UserPlus className="w-3.5 h-3.5" />
                  )}
                  <span>Save Personnel &amp; Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Digital / Printable Wage Payslip ── */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-left">
            {/* Payslip Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#714B67] text-white flex items-center justify-center font-bold text-xs">
                    S
                  </div>
                  <span className="font-bold text-sm text-gray-900">Skyline Sports Club</span>
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

            {/* Employee Meta */}
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

            {/* Wage Earnings & Deductions Breakdown */}
            <div className="py-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-bold text-gray-900">₹{selectedPayslip.basicSalary?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">House Rent &amp; Travel Allowances</span>
                <span className="font-bold text-emerald-700">+₹{selectedPayslip.allowances?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Statutory Deductions (Taxes &amp; PF)</span>
                <span className="font-bold text-red-600">-₹{selectedPayslip.deductions?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 text-sm font-black border-t border-gray-200">
                <span className="text-gray-900">Net Wage Payable</span>
                <span className="text-emerald-700">₹{selectedPayslip.netSalary?.toLocaleString()}</span>
              </div>
            </div>

            {/* Actions */}
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

      {/* ── MODAL 3: HR Generate Payslip ── */}
      {showGeneratePayslipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900">Generate Month Wage Payslip</h3>
              <button
                onClick={() => setShowGeneratePayslipModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleGeneratePayslip} className="space-y-3.5 text-xs mt-3">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Select Employee *</label>
                <select
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                  value={genPayslipData.employeeId}
                  onChange={(e) => setGenPayslipData({ ...genPayslipData, employeeId: e.target.value })}
                >
                  <option value="">Select Employee...</option>
                  {employees.map((e) => (
                    <option key={e.id} value={e.employeeId || e.id}>
                      {e.name} ({e.employeeId || e.employeeCode} - {e.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Wage Month *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                  value={genPayslipData.month}
                  onChange={(e) => setGenPayslipData({ ...genPayslipData, month: e.target.value })}
                  placeholder="e.g. November 2026"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Bonus / Extra (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    value={genPayslipData.bonus}
                    onChange={(e) => setGenPayslipData({ ...genPayslipData, bonus: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-semibold mb-1">Deductions (₹)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none"
                    value={genPayslipData.deductions}
                    onChange={(e) => setGenPayslipData({ ...genPayslipData, deductions: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowGeneratePayslipModal(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#714B67] text-white hover:bg-[#57344f] font-semibold"
                >
                  Generate Statement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
