import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { enquiryService } from '../services/enquiryService';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  Plus,
  Search,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  User,
  Trash2,
  Eye,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Clock,
  Filter,
  PhoneCall,
  Check,
  History,
  AlertTriangle,
  ChevronRight,
  Trophy,
  XCircle,
} from 'lucide-react';

const STATUS_CONFIG = {
  New: {
    label: 'New',
    badgeClass: 'badge-info',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    descriptionRequired: false,
    modalTitle: 'Mark Enquiry as New',
    fieldLabel: 'Reopen Note (Optional)',
    placeholder: 'Optional notes on why this enquiry is being reset to New...',
  },
  Contacted: {
    label: 'Contacted',
    badgeClass: 'badge-warning',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    descriptionRequired: true,
    modalTitle: 'Record Conversation & Mark as Contacted',
    fieldLabel: 'Conversation Details with Customer *',
    placeholder:
      'Describe what conversation you had with the customer (e.g. Phone call duration, discussed tennis membership options, interest in weekend coaching, scheduled trial session for Saturday at 10 AM)...',
    helperText:
      'Receptionist requirement: You must record what conversation was held with the customer before marking as Contacted.',
  },
  Converted: {
    label: 'Converted',
    badgeClass: 'badge-success',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    descriptionRequired: true,
    modalTitle: 'Record Conversion Details',
    fieldLabel: 'Conversion Description & Plan Details *',
    placeholder:
      'Describe the conversion outcome (e.g. Customer enrolled in Annual Gold Membership, paid via UPI, membership card issued, assigned coach Sunil for trial)...',
    helperText:
      'Receptionist requirement: Record the membership plan, package, or trial agreed upon by the customer.',
  },
  Closed: {
    label: 'Closed',
    badgeClass: 'badge-gray',
    color: '#64748b',
    bgColor: '#f8fafc',
    borderColor: '#e2e8f0',
    descriptionRequired: true,
    modalTitle: 'Record Reason for Closing Enquiry',
    fieldLabel: 'Reason for Closing Lead *',
    placeholder:
      'State why this lead is being closed (e.g. Customer relocated out of city / Joined competitor / Unreachable after 3 follow-up calls / Not interested at this time)...',
    helperText:
      'Receptionist requirement: Record the reason why this enquiry could not be converted.',
  },
};

export const ALLOWED_STATUS_TRANSITIONS = {
  New: ['Contacted', 'Converted', 'Closed'],
  Contacted: ['Converted', 'Closed'],
  Converted: [],
  Closed: [],
};

export const isTransitionAllowed = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) return false;
  if (currentStatus === targetStatus) return true;
  const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  return allowed.includes(targetStatus);
};

const SPORT_OPTIONS = [
  'General',
  'Tennis',
  'Badminton',
  'Squash',
  'Padel',
  'Swimming',
  'Gym & Fitness',
  'Table Tennis',
  'Basketball',
];

const TYPE_OPTIONS = [
  'Trial Request',
  'Membership Query',
  'VIP Trial',
  'Coaching / Training',
  'Court Rental Query',
  'General Enquiry',
];

const SOURCE_OPTIONS = [
  'Walk-in',
  'Phone Call',
  'Website',
  'Referral',
  'Instagram DM',
  'Social Media',
  'Event / Tournament',
  'Other',
];

export default function Enquiries() {
  const { user, isSuperAdmin, hasRole } = useAuth();
  const navigate = useNavigate();

  // Role permissions
  const canManage = isSuperAdmin?.() || hasRole?.('RECEPTIONIST');

  // Component state
  const [enquiries, setEnquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sportFilter, setSportFilter] = useState('ALL');

  // Modals & toast
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [toast, setToast] = useState(null);

  // Dedicated Status Change Modal (for mandatory conversation description)
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    enquiry: null,
    targetStatus: '',
    description: '',
    error: '',
    submitting: false,
  });

  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    sport: 'General',
    type: 'Trial Request',
    source: 'Walk-in',
    notes: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Detail Modal status update state
  const [detailStatus, setDetailStatus] = useState('');
  const [detailNotes, setDetailNotes] = useState('');
  const [detailError, setDetailError] = useState('');
  const [updatingDetail, setUpdatingDetail] = useState(false);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Lock body scroll and handle Escape key when any modal is open
  const isAnyModalOpen = showDetailModal || statusModal.isOpen || showCreateModal;
  useEffect(() => {
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          if (statusModal.isOpen) {
            setStatusModal({
              isOpen: false,
              enquiry: null,
              targetStatus: '',
              description: '',
              error: '',
              submitting: false,
            });
          } else if (showDetailModal) {
            setShowDetailModal(false);
          } else if (showCreateModal) {
            setShowCreateModal(false);
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isAnyModalOpen, showDetailModal, statusModal.isOpen, showCreateModal]);

  // Fetch enquiries from backend API
  const loadEnquiries = async (isManualRefresh = false) => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    try {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const response = await enquiryService.getEnquiries(params);

      if (response?.success) {
        const list = response.data?.enquiries || response.enquiries || [];
        setEnquiries(list);

        if (response.data?.stats || response.stats) {
          setStats(response.data?.stats || response.stats);
        } else {
          setStats({
            total: list.length,
            new: list.filter((e) => e.status === 'New').length,
            contacted: list.filter((e) => e.status === 'Contacted').length,
            converted: list.filter((e) => e.status === 'Converted').length,
            closed: list.filter((e) => e.status === 'Closed').length,
          });
        }

        // If detail modal is open, keep selected enquiry refreshed with newest conversationLog
        if (selectedEnquiry) {
          const updatedSelected = list.find((e) => e.id === selectedEnquiry.id);
          if (updatedSelected) {
            setSelectedEnquiry(updatedSelected);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load enquiries:', error);
      showToast(error.message || 'Unable to fetch enquiries from server', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, [statusFilter]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadEnquiries();
    }, 350);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filter list by sport client-side if sport filter is set
  const filteredEnquiries = useMemo(() => {
    if (sportFilter === 'ALL') return enquiries;
    return enquiries.filter((e) => (e.sport || '').toLowerCase() === sportFilter.toLowerCase());
  }, [enquiries, sportFilter]);

  // Validation for Create Form
  const validateCreateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Contact name is required';
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (formData.phone.trim().length < 7) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Create Enquiry Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!validateCreateForm()) return;

    try {
      setSubmitting(true);
      const res = await enquiryService.createEnquiry(formData);
      if (res?.success) {
        showToast('Enquiry logged successfully!', 'success');
        setShowCreateModal(false);
        setFormData({
          name: '',
          phone: '',
          email: '',
          sport: 'General',
          type: 'Trial Request',
          source: 'Walk-in',
          notes: '',
        });
        setFormErrors({});
        loadEnquiries(true);
      }
    } catch (error) {
      console.error('Error creating enquiry:', error);
      showToast(error.message || 'Failed to create enquiry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Initiate status change — ALWAYS prompts for conversation description when moving forward (Contacted, Converted, or Closed)
  // Forward-only flow: Status flow cannot be reversed.
  const handleInitiateStatusChange = (enquiry, targetStatus) => {
    if (targetStatus === enquiry.status) return;

    if (!isTransitionAllowed(enquiry.status, targetStatus)) {
      showToast(
        `Status flow moves forward only. "${enquiry.status}" cannot be changed back to "${targetStatus}".`,
        'error'
      );
      return;
    }

    if (['Contacted', 'Converted', 'Closed'].includes(targetStatus)) {
      // Open the mandatory conversation description modal
      setStatusModal({
        isOpen: true,
        enquiry,
        targetStatus,
        description: '',
        error: '',
        submitting: false,
      });
    }
  };

  // Execute status update with notes
  const executeStatusUpdate = async (enquiryId, targetStatus, description) => {
    try {
      const res = await enquiryService.updateStatus(enquiryId, targetStatus, description);
      if (res?.success) {
        showToast(`Status updated to "${targetStatus}" & conversation logged`, 'success');
        loadEnquiries(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update status:', error);
      showToast(error.message || 'Failed to update enquiry status', 'error');
      return false;
    }
  };

  // Submit Status Modal (with mandatory description check)
  const handleStatusModalSubmit = async (e) => {
    e.preventDefault();
    const { enquiry, targetStatus, description } = statusModal;

    if (!description.trim()) {
      let errorMsg = 'Please enter a description before updating status.';
      if (targetStatus === 'Contacted') {
        errorMsg = 'Please describe what conversation you had with the customer.';
      } else if (targetStatus === 'Converted') {
        errorMsg = 'Please describe the conversion details (package, membership or trial agreed).';
      } else if (targetStatus === 'Closed') {
        errorMsg = 'Please provide the reason for closing this enquiry.';
      }
      setStatusModal((prev) => ({ ...prev, error: errorMsg }));
      return;
    }

    setStatusModal((prev) => ({ ...prev, submitting: true, error: '' }));

    const ok = await executeStatusUpdate(enquiry.id, targetStatus, description.trim());
    if (ok) {
      setStatusModal({
        isOpen: false,
        enquiry: null,
        targetStatus: '',
        description: '',
        error: '',
        submitting: false,
      });
      // If Detail Modal is also open for this enquiry, update its state
      if (selectedEnquiry && selectedEnquiry.id === enquiry.id) {
        setSelectedEnquiry((prev) => ({ ...prev, status: targetStatus }));
        setDetailStatus(targetStatus);
      }
    } else {
      setStatusModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // Handle Detail Modal Save Changes
  const handleDetailUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    const isStatusChanging = detailStatus !== selectedEnquiry.status;
    const isDescriptiveStatus = ['Contacted', 'Converted', 'Closed'].includes(detailStatus);

    // Prevent reversing status
    if (isStatusChanging && !isTransitionAllowed(selectedEnquiry.status, detailStatus)) {
      setDetailError(
        `Status flow cannot be reversed. Cannot change status from "${selectedEnquiry.status}" to "${detailStatus}".`
      );
      return;
    }

    // If changing to Contacted, Converted, or Closed, description is strictly required!
    if (isStatusChanging && isDescriptiveStatus) {
      if (!detailNotes.trim()) {
        let msg = `A description is required when changing status to ${detailStatus}.`;
        if (detailStatus === 'Contacted') {
          msg = 'Please record what conversation you had with the customer.';
        } else if (detailStatus === 'Converted') {
          msg = 'Please record the conversion details (plan/package agreed).';
        } else if (detailStatus === 'Closed') {
          msg = 'Please record the reason for closing this enquiry.';
        }
        setDetailError(msg);
        return;
      }
    }

    try {
      setUpdatingDetail(true);
      setDetailError('');
      const noteToSend = detailNotes.trim() || `Status updated to ${detailStatus}`;
      const res = await enquiryService.updateStatus(selectedEnquiry.id, detailStatus, noteToSend);
      if (res?.success) {
        showToast('Enquiry conversation and status saved successfully', 'success');
        setShowDetailModal(false);
        loadEnquiries(true);
      }
    } catch (error) {
      console.error('Failed to update enquiry:', error);
      setDetailError(error.message || 'Could not save changes');
    } finally {
      setUpdatingDetail(false);
    }
  };

  // Handle Delete Enquiry
  const handleDeleteEnquiry = async (enquiryId) => {
    if (!window.confirm('Are you sure you want to delete this enquiry? This action cannot be undone.')) {
      return;
    }

    try {
      const res = await enquiryService.deleteEnquiry(enquiryId);
      if (res?.success) {
        showToast('Enquiry removed', 'success');
        setEnquiries((prev) => prev.filter((e) => e.id !== enquiryId));
        if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
          setShowDetailModal(false);
        }
        loadEnquiries(true);
      }
    } catch (error) {
      console.error('Failed to delete enquiry:', error);
      showToast(error.message || 'Failed to delete enquiry', 'error');
    }
  };

  // Open Detail Modal
  const openDetail = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setDetailStatus(enquiry.status);
    setDetailNotes('');
    setDetailError('');
    setShowDetailModal(true);
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Format date-time for conversation logs
  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch (e) {
      return dateString;
    }
  };

  // Access check guard
  if (!canManage) {
    return (
      <div className="card p-10 max-w-xl mx-auto my-12 text-center animate-fade-in shadow-md">
        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-amber-200 text-amber-600">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-[20px] font-bold text-gray-900 mb-2">Restricted Access</h2>
        <p className="text-[14px] text-gray-600 mb-6 leading-relaxed">
          The <strong>Enquiries & Lead Management</strong> CRM is exclusively available to{' '}
          <strong>Super Admins</strong> and <strong>Receptionists</strong>. Your active role does not have authorization to view or log customer enquiries.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="btn btn-primary inline-flex items-center gap-2 mx-auto"
        >
          Return to Dashboard <ArrowRight size={15} />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Toast Notification ── */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-[13px] font-medium transition-all ${
            toast.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight tracking-tight">
              Enquiries & Leads CRM
            </h1>
            <span className="badge badge-purple text-[11px] font-semibold">
              {isSuperAdmin?.() ? 'Super Admin' : 'Receptionist'} Mode
            </span>
          </div>
          <p className="text-[13px] text-gray-500 mt-1">
            Capture, record customer conversations, and convert walk-ins and phone enquiries in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            onClick={() => loadEnquiries(true)}
            disabled={refreshing}
            className="btn btn-secondary text-gray-700 hover:text-gray-900 border border-gray-200 shadow-sm"
            title="Refresh Enquiries"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin text-purple-600' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                name: '',
                phone: '',
                email: '',
                sport: 'General',
                type: 'Trial Request',
                source: 'Walk-in',
                notes: '',
              });
              setFormErrors({});
              setShowCreateModal(true);
            }}
            className="btn btn-primary gap-2 shadow-sm font-semibold"
          >
            <Plus size={16} /> Log Enquiry
          </button>
        </div>
      </div>

      {/* ── Dynamic KPI Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          {
            label: 'Total Enquiries',
            value: stats.total || enquiries.length,
            color: '#6b3fa0',
            bg: '#f3eeff',
            filter: 'ALL',
            icon: HelpCircle,
          },
          {
            label: 'New Leads',
            value: stats.new || enquiries.filter((e) => e.status === 'New').length,
            color: '#2563eb',
            bg: '#eff6ff',
            filter: 'New',
            icon: Sparkles,
          },
          {
            label: 'Contacted',
            value: stats.contacted || enquiries.filter((e) => e.status === 'Contacted').length,
            color: '#d97706',
            bg: '#fffbeb',
            filter: 'Contacted',
            icon: Clock,
          },
          {
            label: 'Converted',
            value: stats.converted || enquiries.filter((e) => e.status === 'Converted').length,
            color: '#16a34a',
            bg: '#f0fdf4',
            filter: 'Converted',
            icon: CheckCircle2,
          },
          {
            label: 'Closed',
            value: stats.closed || enquiries.filter((e) => e.status === 'Closed').length,
            color: '#64748b',
            bg: '#f8fafc',
            filter: 'Closed',
            icon: X,
          },
        ].map((s) => {
          const Icon = s.icon;
          const isActive = statusFilter === s.filter;
          return (
            <div
              key={s.label}
              onClick={() => setStatusFilter(s.filter)}
              className={`card p-4 transition-all cursor-pointer border ${
                isActive ? 'ring-2 ring-purple-600 shadow-md' : 'hover:shadow-md hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  {s.label}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: s.bg, color: s.color }}
                >
                  <Icon size={14} />
                </div>
              </div>
              <div className="text-[24px] font-bold leading-none" style={{ color: s.color }}>
                {s.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, phone, sport, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-9 pr-8 text-[13px] h-9 w-full"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Sport Filter */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={14} className="text-gray-400 hidden sm:inline" />
            <select
              value={sportFilter}
              onChange={(e) => setSportFilter(e.target.value)}
              className="form-input text-[13px] h-9 py-1 px-3 w-full sm:w-44"
            >
              <option value="ALL">All Sports</option>
              {SPORT_OPTIONS.map((sport) => (
                <option key={sport} value={sport}>
                  {sport}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {['ALL', 'New', 'Contacted', 'Converted', 'Closed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'All Leads' : st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <HelpCircle size={16} className="text-purple-600" />
            <h2 className="text-[15px] font-bold text-gray-900">
              {statusFilter === 'ALL' ? 'All Live Enquiries' : `${statusFilter} Enquiries`}
            </h2>
            <span className="text-[12px] text-gray-500 font-mono">
              ({filteredEnquiries.length} {filteredEnquiries.length === 1 ? 'record' : 'records'})
            </span>
          </div>

          {searchTerm && (
            <span className="text-[12px] text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md font-medium">
              Filtered by: "{searchTerm}"
            </span>
          )}
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500 space-y-3">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-[13px] font-medium text-gray-600">Loading enquiries from backend...</p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-16 px-6 text-center space-y-4">
            <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto text-purple-600 border border-purple-100 shadow-sm">
              <HelpCircle size={26} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-[16px] font-bold text-gray-900">No enquiries found</h3>
              <p className="text-[13px] text-gray-500 mt-1">
                {searchTerm || statusFilter !== 'ALL' || sportFilter !== 'ALL'
                  ? 'No enquiries match your active filter criteria. Try clearing filters or search term.'
                  : 'No customer enquiries or trial requests have been logged yet for this club.'}
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center gap-3">
              {searchTerm || statusFilter !== 'ALL' || sportFilter !== 'ALL' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setSportFilter('ALL');
                  }}
                  className="btn btn-secondary text-[13px]"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary gap-2 text-[13px]"
                >
                  <Plus size={15} /> Log First Enquiry
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th className="w-24">ID</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Sport</th>
                  <th>Enquiry Type</th>
                  <th>Source</th>
                  <th>Date</th>
                  <th>Status & Conversation</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnquiries.map((e) => {
                  const conf = STATUS_CONFIG[e.status] || STATUS_CONFIG.New;
                  const logCount = Array.isArray(e.conversationLog) ? e.conversationLog.length : 0;
                  return (
                    <tr key={e.id} className="hover:bg-purple-50/20 transition-colors">
                      {/* ID */}
                      <td className="font-mono text-[12px] font-bold text-gray-600">
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-700">
                          {e.id}
                        </span>
                      </td>

                      {/* Customer Name & Email */}
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-bold text-[12px] flex items-center justify-center flex-shrink-0">
                            {e.name ? e.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 text-[13px] truncate">
                              {e.name}
                            </div>
                            {e.email ? (
                              <div className="text-[11px] text-gray-400 truncate flex items-center gap-1">
                                <Mail size={10} /> {e.email}
                              </div>
                            ) : (
                              <div className="text-[11px] text-gray-400 italic">No email provided</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td>
                        <a
                          href={`tel:${e.phone}`}
                          className="font-mono text-[12px] text-purple-700 hover:text-purple-900 font-medium inline-flex items-center gap-1.5 whitespace-nowrap"
                        >
                          <Phone size={11} className="text-purple-600" />
                          {e.phone}
                        </a>
                      </td>

                      {/* Sport */}
                      <td>
                        <span className="text-[12px] font-medium text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                          {e.sport || 'General'}
                        </span>
                      </td>

                      {/* Enquiry Type */}
                      <td className="text-gray-700 text-[13px]">
                        <span className="font-medium">{e.type || 'General'}</span>
                      </td>

                      {/* Source */}
                      <td className="text-gray-500 text-[12px]">
                        {e.source || 'Walk-in'}
                      </td>

                      {/* Date */}
                      <td className="text-[12px] text-gray-500 whitespace-nowrap">
                        {formatDate(e.createdAt)}
                      </td>

                      {/* Status Dropdown / Badge (Forward-Only Flow) */}
                      <td>
                        <div className="flex items-center gap-2">
                          {(ALLOWED_STATUS_TRANSITIONS[e.status] || []).length === 0 ? (
                            <span
                              className="badge text-[11px] font-bold py-1 px-2.5 border shadow-xs inline-flex items-center gap-1.5"
                              style={{
                                background: conf.bgColor,
                                color: conf.color,
                                borderColor: conf.borderColor,
                              }}
                              title={`Finalized (${e.status}). Status cannot be reversed.`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: conf.color }} />
                              {e.status}
                            </span>
                          ) : (
                            <select
                              value={e.status}
                              onChange={(ev) => handleInitiateStatusChange(e, ev.target.value)}
                              className="badge text-[11px] font-bold cursor-pointer pr-5 py-1 border transition-all appearance-none outline-none shadow-xs"
                              style={{
                                background: conf.bgColor,
                                color: conf.color,
                                borderColor: conf.borderColor,
                              }}
                              title="Advance status forward and record customer conversation"
                            >
                              <option value={e.status} disabled>
                                {e.status} (Current)
                              </option>
                              {(ALLOWED_STATUS_TRANSITIONS[e.status] || []).map((nextSt) => (
                                <option key={nextSt} value={nextSt}>
                                  &rarr; Move to {nextSt}
                                </option>
                              ))}
                            </select>
                          )}

                          {logCount > 0 && (
                            <button
                              onClick={() => openDetail(e)}
                              className="text-[11px] text-gray-400 hover:text-purple-700 flex items-center gap-0.5"
                              title={`${logCount} conversation/history log(s)`}
                            >
                              <History size={12} />
                              <span className="font-mono">{logCount}</span>
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => openDetail(e)}
                            className="p-1.5 rounded-md hover:bg-purple-50 text-gray-500 hover:text-purple-700 transition-colors"
                            title="View History & Record Conversation"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteEnquiry(e.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete Enquiry"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MANDATORY STATUS CONVERSATION MODAL ── */}
      {statusModal.isOpen && statusModal.enquiry && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setStatusModal({
                isOpen: false,
                enquiry: null,
                targetStatus: '',
                description: '',
                error: '',
                submitting: false,
              });
            }
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] my-auto relative animate-fade-in"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Modal Header */}
            <div
              className="flex items-center justify-between px-6 py-4 border-b border-gray-100"
              style={{
                background:
                  STATUS_CONFIG[statusModal.targetStatus]?.bgColor || '#f8fafc',
              }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: '#fff',
                    color: STATUS_CONFIG[statusModal.targetStatus]?.color || '#1e293b',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  }}
                >
                  {statusModal.targetStatus === 'Contacted' ? (
                    <PhoneCall size={18} />
                  ) : statusModal.targetStatus === 'Converted' ? (
                    <Trophy size={18} />
                  ) : (
                    <XCircle size={18} />
                  )}
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900 leading-tight">
                    {STATUS_CONFIG[statusModal.targetStatus]?.modalTitle}
                  </h3>
                  <p className="text-[12px] text-gray-600">
                    Mandatory conversation description for Receptionist
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  setStatusModal({
                    isOpen: false,
                    enquiry: null,
                    targetStatus: '',
                    description: '',
                    error: '',
                    submitting: false,
                  })
                }
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleStatusModalSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Customer summary pill */}
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-between text-[13px]">
                <div>
                  <div className="font-bold text-gray-900">{statusModal.enquiry.name}</div>
                  <div className="text-[12px] text-gray-500 font-mono mt-0.5">
                    {statusModal.enquiry.phone} • {statusModal.enquiry.sport}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-bold">
                  <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                    {statusModal.enquiry.status}
                  </span>
                  <ChevronRight size={14} className="text-gray-400" />
                  <span
                    className="px-2 py-0.5 rounded border"
                    style={{
                      background: STATUS_CONFIG[statusModal.targetStatus]?.bgColor,
                      color: STATUS_CONFIG[statusModal.targetStatus]?.color,
                      borderColor: STATUS_CONFIG[statusModal.targetStatus]?.borderColor,
                    }}
                  >
                    {statusModal.targetStatus}
                  </span>
                </div>
              </div>

              {/* Requirement Alert Banner */}
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-[12px] text-amber-900">
                <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Required Note: </span>
                  {STATUS_CONFIG[statusModal.targetStatus]?.helperText}
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="form-label font-bold text-gray-900">
                  {STATUS_CONFIG[statusModal.targetStatus]?.fieldLabel}
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder={STATUS_CONFIG[statusModal.targetStatus]?.placeholder}
                  value={statusModal.description}
                  onChange={(e) =>
                    setStatusModal({
                      ...statusModal,
                      description: e.target.value,
                      error: '',
                    })
                  }
                  className={`form-input resize-none text-[13px] ${
                    statusModal.error ? 'border-red-400 focus:ring-red-200' : ''
                  }`}
                  autoFocus
                />
                {statusModal.error && (
                  <p className="text-[12px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} /> {statusModal.error}
                  </p>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setStatusModal({
                      isOpen: false,
                      enquiry: null,
                      targetStatus: '',
                      description: '',
                      error: '',
                      submitting: false,
                    })
                  }
                  className="btn btn-secondary text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={statusModal.submitting}
                  className="btn btn-primary min-w-[140px] font-semibold"
                >
                  {statusModal.submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    `Save & Mark as ${statusModal.targetStatus}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── CREATE / LOG ENQUIRY MODAL ── */}
      {showCreateModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)' }} onClick={(e) => { if (e.target === e.currentTarget) { setShowCreateModal(false); setFormData({ name: '', phone: '', email: '', sportInterest: '', source: 'Walk-in', notes: '' }); } }}>
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Plus size={16} />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-gray-900 leading-tight">Log New Enquiry</h3>
                  <p className="text-[12px] text-gray-500">Record a walk-in, trial query or phone lead</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Customer Name */}
              <div>
                <label className="form-label">
                  Customer Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arjun Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`form-input ${formErrors.name ? 'border-red-400 focus:ring-red-300' : ''}`}
                  autoFocus
                />
                {formErrors.name && (
                  <p className="text-[11px] text-red-500 mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Phone & Email Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={`form-input ${formErrors.phone ? 'border-red-400' : ''}`}
                  />
                  {formErrors.phone && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="form-label">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="e.g. arjun@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`form-input ${formErrors.email ? 'border-red-400' : ''}`}
                  />
                  {formErrors.email && (
                    <p className="text-[11px] text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>
              </div>

              {/* Sport & Enquiry Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Sport of Interest</label>
                  <select
                    value={formData.sport}
                    onChange={(e) => setFormData({ ...formData, sport: e.target.value })}
                    className="form-input"
                  >
                    {SPORT_OPTIONS.map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Enquiry Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="form-input"
                  >
                    {TYPE_OPTIONS.map((tp) => (
                      <option key={tp} value={tp}>
                        {tp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Lead Source */}
              <div>
                <label className="form-label">Lead Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="form-input"
                >
                  {SOURCE_OPTIONS.map((src) => (
                    <option key={src} value={src}>
                      {src}
                    </option>
                  ))}
                </select>
              </div>

              {/* Initial Notes */}
              <div>
                <label className="form-label">Initial Request & Inquiries</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Inquiring about weekend court slot availability, coach recommendations, family membership discounts..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="form-input resize-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-secondary text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary min-w-[110px]"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    'Log Lead'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* ── ENQUIRY DETAIL & CONVERSATION HISTORY MODAL ── */}
      {showDetailModal && selectedEnquiry && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          style={{ background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(5px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDetailModal(false);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 overflow-hidden flex flex-col max-h-[90vh] my-auto relative animate-fade-in"
            style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[15px]">
                  {selectedEnquiry.name ? selectedEnquiry.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-bold text-gray-900 leading-tight">
                      {selectedEnquiry.name}
                    </h3>
                    <span className="text-[11px] font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">
                      {selectedEnquiry.id}
                    </span>
                  </div>
                  <p className="text-[12px] text-gray-500">
                    Logged on {formatDateTime(selectedEnquiry.createdAt)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <form onSubmit={handleDetailUpdateSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg bg-gray-50 border border-gray-100 text-[13px]">
                <div>
                  <span className="text-gray-400 text-[11px] uppercase font-semibold block">Phone</span>
                  <a
                    href={`tel:${selectedEnquiry.phone}`}
                    className="font-mono font-medium text-purple-700 flex items-center gap-1.5 mt-0.5"
                  >
                    <Phone size={12} /> {selectedEnquiry.phone}
                  </a>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] uppercase font-semibold block">Email</span>
                  {selectedEnquiry.email ? (
                    <a
                      href={`mailto:${selectedEnquiry.email}`}
                      className="font-medium text-gray-800 flex items-center gap-1.5 mt-0.5 truncate"
                    >
                      <Mail size={12} /> {selectedEnquiry.email}
                    </a>
                  ) : (
                    <span className="text-gray-400 italic">None</span>
                  )}
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] uppercase font-semibold block">Sport</span>
                  <span className="font-semibold text-gray-800">{selectedEnquiry.sport}</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[11px] uppercase font-semibold block">Type / Source</span>
                  <span className="font-medium text-gray-700 truncate block">
                    {selectedEnquiry.type} ({selectedEnquiry.source})
                  </span>
                </div>
              </div>

              {/* Status Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label font-bold text-gray-900 mb-0">
                    Lead Status Progression
                  </label>
                  {detailStatus !== selectedEnquiry.status ? (
                    <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded flex items-center gap-1">
                      Advancing: {selectedEnquiry.status} &rarr; {detailStatus}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400 font-medium">
                      Forward-only flow
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['New', 'Contacted', 'Converted', 'Closed'].map((st) => {
                    const conf = STATUS_CONFIG[st];
                    const isSelected = detailStatus === st;
                    const isCurrent = selectedEnquiry.status === st;
                    const isAllowed = isCurrent || (ALLOWED_STATUS_TRANSITIONS[selectedEnquiry.status] || []).includes(st);

                    return (
                      <button
                        type="button"
                        key={st}
                        disabled={!isAllowed}
                        onClick={() => {
                          if (!isAllowed) return;
                          setDetailStatus(st);
                          setDetailError('');
                        }}
                        className={`py-2 px-3 rounded-lg text-[12px] font-bold border transition-all text-center flex items-center justify-center gap-1.5 ${
                          !isAllowed
                            ? 'opacity-40 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-200'
                            : isSelected
                            ? 'ring-2 ring-purple-600 shadow-xs'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                        style={
                          isSelected && isAllowed
                            ? { background: conf.bgColor, color: conf.color, borderColor: conf.borderColor }
                            : {}
                        }
                        title={
                          !isAllowed
                            ? 'Status flow moves forward only. Reversing is not allowed.'
                            : isCurrent
                            ? 'Current status'
                            : `Advance status to ${st}`
                        }
                      >
                        {isSelected && <Check size={13} />}
                        {!isAllowed && <span className="text-[10px]">🔒</span>}
                        {st}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-gray-400 mt-1.5">
                  * Status moves forward only (New &rarr; Contacted &rarr; Converted / Closed). Once advanced, status cannot be reversed.
                </p>
              </div>

              {/* Conversation description input */}
              <div>
                <label className="form-label font-bold text-gray-900 flex items-center justify-between">
                  <span>
                    {detailStatus === selectedEnquiry.status
                      ? 'Add New Conversation Note / Follow-up'
                      : STATUS_CONFIG[detailStatus]?.fieldLabel || 'Conversation Description *'}
                  </span>
                  {detailStatus !== selectedEnquiry.status &&
                    ['Contacted', 'Converted', 'Closed'].includes(detailStatus) && (
                      <span className="text-[11px] text-red-600 font-bold">Mandatory</span>
                    )}
                </label>
                <textarea
                  rows={3}
                  value={detailNotes}
                  onChange={(e) => {
                    setDetailNotes(e.target.value);
                    setDetailError('');
                  }}
                  placeholder={
                    detailStatus !== selectedEnquiry.status
                      ? STATUS_CONFIG[detailStatus]?.placeholder
                      : 'Record follow-up conversation notes, call summary, or customer requests...'
                  }
                  className={`form-input resize-none text-[13px] ${
                    detailError ? 'border-red-400 focus:ring-red-200' : ''
                  }`}
                />
                {detailError && (
                  <p className="text-[12px] text-red-600 font-medium mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} /> {detailError}
                  </p>
                )}
              </div>

              {/* Conversation History Timeline */}
              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <History size={15} className="text-purple-600" />
                  <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-wide">
                    Conversation & Activity Log
                  </h4>
                </div>

                {Array.isArray(selectedEnquiry.conversationLog) &&
                selectedEnquiry.conversationLog.length > 0 ? (
                  <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                    {selectedEnquiry.conversationLog.map((log, index) => {
                      const logConf = STATUS_CONFIG[log.toStatus] || STATUS_CONFIG.New;
                      return (
                        <div
                          key={log.id || index}
                          className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-[12px] space-y-1.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2 py-0.5 rounded text-[11px] font-bold border"
                                style={{
                                  background: logConf.bgColor,
                                  color: logConf.color,
                                  borderColor: logConf.borderColor,
                                }}
                              >
                                {log.toStatus}
                              </span>
                              <span className="text-gray-500 font-medium">
                                by <strong className="text-gray-700">{log.updatedBy || 'Staff'}</strong>
                              </span>
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">
                              {formatDateTime(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-700 text-[13px] whitespace-pre-wrap leading-relaxed pl-0.5">
                            {log.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-center text-gray-400 text-[12px]">
                    No previous conversation logs recorded.
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteEnquiry(selectedEnquiry.id)}
                  className="btn btn-ghost text-red-600 hover:bg-red-50 text-[12px] gap-1.5"
                >
                  <Trash2 size={14} /> Delete Enquiry
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDetailModal(false)}
                    className="btn btn-secondary text-gray-700"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updatingDetail}
                    className="btn btn-primary min-w-[130px] font-semibold"
                  >
                    {updatingDetail ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
