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
} from 'lucide-react';

export default function StaffHR() {
  const { user, club, isSuperAdmin, hasRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [toast, setToast] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'RECEPTIONIST',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const canManageStaff = isSuperAdmin?.() || hasRole?.('HR_MANAGER');

  useEffect(() => {
    loadData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [eRes, dRes, lRes] = await Promise.all([
        staffService.getEmployees(),
        staffService.getDepartments(),
        staffService.getLeaves(),
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

  const handlePunch = async (employeeId, type) => {
    try {
      const res = await staffService.punchAttendance(employeeId, type);
      if (res && res.success) {
        showToast(res.message || `Successfully punched ${type}!`, 'success');
        // Update local employee state to reflect status immediately
        setEmployees((prev) =>
          prev.map((emp) =>
            emp.id === employeeId || emp.userId === employeeId
              ? { ...emp, status: type === 'IN' ? 'On Duty' : 'Clocked Out' }
              : emp
          )
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to record attendance', 'error');
    }
  };

  const handleLeaveDecision = async (leaveId, status) => {
    try {
      const res = await staffService.updateLeaveStatus(
        leaveId,
        status,
        `Staff decision by ${user?.name || 'Admin'}: ${status}`
      );
      if (res && res.success) {
        showToast(`Leave request has been marked as ${status}.`, 'success');
        setLeaves((prev) =>
          prev.map((l) => (l.id === leaveId ? { ...l, status } : l))
        );
      }
    } catch (err) {
      showToast(err.message || 'Failed to update leave request', 'error');
    }
  };

  const handleCreateEmployee = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await staffService.createEmployee(formData);
      if (res && res.success) {
        showToast('New staff member onboarded successfully!', 'success');
        setShowAddModal(false);
        setFormData({ name: '', email: '', role: 'RECEPTIONIST', password: '' });
        await loadData();
      }
    } catch (err) {
      showToast(err.message || 'Failed to add staff member', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      emp.name?.toLowerCase().includes(q) ||
      emp.firstName?.toLowerCase().includes(q) ||
      emp.lastName?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.employeeCode?.toLowerCase().includes(q);

    const matchesDept =
      deptFilter === 'All' ||
      emp.department?.name === deptFilter ||
      emp.department?.name?.includes(deptFilter);

    const matchesStatus =
      statusFilter === 'All' ||
      emp.status === statusFilter ||
      (statusFilter === 'Active' && (emp.status === 'Active' || emp.status === 'On Duty'));

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 animate-bounce-short transition-all ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-[#1F2937] tracking-tight">
              Staff & Human Resources
            </h1>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-[#F5EFF3] text-[#714B67] rounded-full border border-[#714B67]/15">
              {employees.length} Staff Members
            </span>
            <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              Live Backend Sync
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Department rosters, shifts, punch-clock attendance, and leave approval workflows
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors shadow-xs"
            title="Refresh staff records"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>

          {canManageStaff && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#57344f] text-white hover:bg-[#714b67] transition-colors shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Staff</span>
            </button>
          )}
        </div>
      </div>

      {/* Department Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {departments.slice(0, 4).map((dept) => (
          <div key={dept.id} className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#6B7280] mb-2">
              <span className="font-medium truncate max-w-[150px]">{dept.name}</span>
              <div className="w-7 h-7 rounded-lg bg-[#57344f]/10 text-[#57344f] flex items-center justify-center font-bold text-[11px]">
                {dept.code || 'HR'}
              </div>
            </div>
            <div className="text-2xl font-bold text-[#1F2937]">
              {dept.employeeCount || 1}{' '}
              <span className="text-xs font-normal text-[#6B7280]">assigned</span>
            </div>
            <div className="text-[11px] text-[#6B7280] mt-1 truncate">
              Lead: <strong className="text-[#374151]">{dept.head || 'Manager'}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E5E7EB] shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, code, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67] transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            className="text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            className="text-xs px-2.5 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="On Duty">On Duty</option>
            <option value="Active">Active</option>
            <option value="Clocked Out">Clocked Out</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-[#1F2937]">Active Employee Directory</h2>
            <p className="text-[11px] text-[#6B7280]">
              Showing {filteredEmployees.length} of {employees.length} club personnel
            </p>
          </div>
          <span className="text-xs text-[#6B7280] font-medium">
            {departments.length} Operating Divisions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8F9FA] text-[#6B7280] uppercase tracking-wider font-semibold border-b border-[#E5E7EB]">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Attendance Punch-Clock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F4F6]">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#9CA3AF]">
                    Loading personnel records...
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-[#9CA3AF]">
                    No employees matching the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => {
                  const initials = `${emp.firstName?.[0] || 'S'}${emp.lastName?.[0] || 'M'}`;
                  const isOnDuty = emp.status === 'On Duty';

                  return (
                    <tr key={emp.id} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#714B67] whitespace-nowrap">
                        {emp.employeeCode}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                            style={{ background: 'var(--color-primary, #714b67)' }}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1F2937]">
                              {emp.firstName} {emp.lastName}
                            </div>
                            <div className="text-[10px] text-[#6B7280] font-mono">{emp.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#4B5563]">
                        {emp.department?.name || 'General Operations'}
                      </td>
                      <td className="py-3 px-4 font-medium text-[#1F2937]">
                        {emp.designation || emp.role}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#6B7280] whitespace-nowrap">
                        {emp.shift || '09:00 - 18:00'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            emp.status === 'On Duty'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : emp.status === 'On Leave'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : emp.status === 'Clocked Out'
                              ? 'bg-gray-100 text-gray-700 border border-gray-200'
                              : 'bg-teal-50 text-teal-800 border border-teal-200'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handlePunch(emp.id, 'IN')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors shadow-2xs"
                        >
                          Clock IN
                        </button>
                        <button
                          onClick={() => handlePunch(emp.id, 'OUT')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md border border-rose-200 transition-colors shadow-2xs"
                        >
                          Clock OUT
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leave Requests Management */}
      <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-[#1F2937]">Leave Requests & Approvals</h2>
            <p className="text-[11px] text-[#6B7280]">
              Manage staff time-off requests and administrative approvals
            </p>
          </div>
          <span className="text-[11px] font-semibold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
            {leaves.filter((l) => l.status === 'PENDING').length} Pending Requests
          </span>
        </div>

        {leaves.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9CA3AF]">
            No leave requests recorded.
          </div>
        ) : (
          <div className="space-y-2.5">
            {leaves.map((l) => (
              <div
                key={l.id}
                className="p-3.5 rounded-xl border border-[#E5E7EB] bg-[#F8F9FA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-[#714B67]/30 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#1F2937]">
                      {l.employee?.firstName} {l.employee?.lastName}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800">
                      {l.leaveType}
                    </span>
                    <span className="text-[#6B7280]">
                      ({new Date(l.startDate).toLocaleDateString()} to{' '}
                      {new Date(l.endDate).toLocaleDateString()} • {l.daysCount} days)
                    </span>
                  </div>
                  <div className="text-[11px] text-[#4B5563] mt-1">Reason: {l.reason}</div>
                  {l.decisionNote && (
                    <div className="text-[10px] text-gray-500 italic mt-0.5">
                      Note: {l.decisionNote}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                      l.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : l.status === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {l.status}
                  </span>

                  {l.status === 'PENDING' && canManageStaff && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleLeaveDecision(l.id, 'APPROVED')}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-1 font-semibold text-[11px] shadow-xs transition-colors"
                        title="Approve Leave"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleLeaveDecision(l.id, 'REJECTED')}
                        className="px-2.5 py-1 rounded bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1 font-semibold text-[11px] shadow-xs transition-colors"
                        title="Reject Leave"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#714B67]" />
                <h3 className="font-bold text-sm text-gray-900">Add Club Personnel</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@sportsclub.com"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Operating Role</label>
                <select
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="RECEPTIONIST">Receptionist (Front Desk)</option>
                  <option value="SHOP_INVENTORY_MANAGER">Shop / Inventory Manager</option>
                  <option value="BAR_CAFETERIA_STAFF">Bar / Cafeteria Staff</option>
                  <option value="HR_MANAGER">HR Manager</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="SUPER_ADMIN">Super Admin (Executive)</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">
                  Initial Password (Optional)
                </label>
                <input
                  type="password"
                  placeholder="Default: Staff@123"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-[#714B67]"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
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
                  className="px-4 py-1.5 rounded-lg bg-[#57344f] text-white hover:bg-[#714b67] font-semibold transition-colors flex items-center gap-1.5"
                >
                  {submitting ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Plus className="w-3.5 h-3.5" />
                  )}
                  <span>Save Personnel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
