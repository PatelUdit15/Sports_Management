/**
 * Finance.jsx
 * Comprehensive Financial Management Dashboard
 * Features:
 * - Real live KPIs (Total Revenue, Total Expenses, Net Margin, Pending Receivables, Today's Collections)
 * - Dynamic Ledger connected to real backend & court booking system (NO dummy data)
 * - Record Transaction modal (Income & Expense with category, amount, tax, method, customer/vendor, ref)
 * - Invoices & Billing system with itemized breakdown, tax/GST calculation & status
 * - Printable invoice modal & Transaction receipt modal
 * - Financial Breakdown Visuals (Revenue by Stream, Expenses by Department, Payment Methods share)
 * - Full export to CSV
 */

import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Download,
  RefreshCw,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  Printer,
  Receipt,
  X,
  Wallet,
  Percent,
  Layers,
  ArrowRight,
  Building,
  Check,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';

const INCOME_CATEGORIES = [
  'Court Booking',
  'Membership Fee',
  'Coaching Session',
  'Pro Shop',
  'Cafeteria / Bar',
  'Tournament Entry',
  'Facility Rental',
  'Sponsorship',
  'Invoice Payment',
  'Other Income',
];

const EXPENSE_CATEGORIES = [
  'Court Maintenance',
  'Equipment & Gear',
  'Utility Bills (Power/Water)',
  'Staff Payroll & Wages',
  'Inventory Restock',
  'Coaching Remuneration',
  'Marketing & Promotion',
  'Software & Licenses',
  'General Repairs',
  'Other Expense',
];

const PAYMENT_METHODS = [
  'UPI',
  'Credit Card',
  'Debit Card',
  'Cash',
  'Bank Transfer',
  'Net Banking',
  'Cheque',
];

const STATUS_THEMES = {
  Settled: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Settled' },
  Confirmed: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Settled' },
  Paid: { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0', label: 'Paid' },
  Pending: { bg: '#fef3c7', color: '#b45309', border: '#fde68a', label: 'Pending' },
  Overdue: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Overdue' },
  Failed: { bg: '#fee2e2', color: '#dc2626', border: '#fecaca', label: 'Failed' },
  Refunded: { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff', label: 'Refunded' },
  Cancelled: { bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb', label: 'Cancelled' },
};

export default function Finance() {
  const { user } = useAuth();

  // Active view tab
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'invoices' | 'expenses' | 'analytics'

  // Summary and data states
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters
  const [period, setPeriod] = useState('month'); // 'today' | 'week' | 'month' | 'quarter' | 'all'
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // 'ALL' | 'INCOME' | 'EXPENSE'
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterMethod, setFilterMethod] = useState('ALL');
  const [filterDateRange, setFilterDateRange] = useState('ALL'); // 'ALL' | 'TODAY' | 'YESTERDAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'CUSTOM'
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [sortBy, setSortBy] = useState('DATE_DESC'); // 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC'

  // Modals state
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form states
  const [txnFormType, setTxnFormType] = useState('INCOME');
  const [txnFormData, setTxnFormData] = useState({
    category: 'Court Booking',
    description: '',
    amount: '',
    taxRate: '18',
    payerPayee: '',
    paymentMethod: 'UPI',
    status: 'Settled',
    date: new Date().toISOString().split('T')[0],
    reference: '',
    notes: '',
  });

  const [invoiceFormData, setInvoiceFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'UPI',
    taxRate: '18',
    notes: 'Thank you for your business! Payment is due within 7 days.',
    items: [{ description: 'Court Booking Package', qty: 1, unitPrice: '' }],
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Fetch all finance data
  const fetchData = async () => {
    try {
      setError(null);
      const [sumRes, txnRes, invRes] = await Promise.all([
        api.getFinanceSummary({ period }),
        api.getFinanceTransactions({ period }),
        api.getFinanceInvoices(),
      ]);

      if (sumRes?.success) setSummary(sumRes.data || sumRes);
      if (txnRes?.success) setTransactions(txnRes.data?.transactions || txnRes.transactions || []);
      if (invRes?.success) setInvoices(invRes.data?.invoices || invRes.invoices || []);
    } catch (err) {
      console.error('Failed to load finance data:', err);
      setError(err?.message || 'Could not connect to finance server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
  }, [period]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Tab switcher helper
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    setSearch('');
    setFilterCategory('ALL');
    setFilterStatus('ALL');
    setFilterMethod('ALL');
    setFilterDateRange('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    if (newTab === 'expenses') {
      setFilterType('EXPENSE');
    } else {
      setFilterType('ALL');
    }
  };

  // Dynamic Categories based on current tab & type
  const availableCategories = useMemo(() => {
    let baseList = [];
    if (activeTab === 'expenses' || filterType === 'EXPENSE') {
      baseList = EXPENSE_CATEGORIES;
    } else if (filterType === 'INCOME') {
      baseList = INCOME_CATEGORIES;
    } else {
      baseList = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
    }
    const existing = transactions.map((t) => t.category).filter(Boolean);
    const combined = Array.from(new Set([...baseList, ...existing]));
    return ['ALL', ...combined];
  }, [activeTab, filterType, transactions]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim()) count++;
    if (filterType !== 'ALL' && activeTab !== 'expenses') count++;
    if (filterCategory !== 'ALL') count++;
    if (filterStatus !== 'ALL') count++;
    if (filterMethod !== 'ALL') count++;
    if (filterDateRange !== 'ALL') count++;
    if (sortBy !== 'DATE_DESC') count++;
    return count;
  }, [search, filterType, activeTab, filterCategory, filterStatus, filterMethod, filterDateRange, sortBy]);

  const handleResetFilters = () => {
    setSearch('');
    if (activeTab === 'expenses') setFilterType('EXPENSE');
    else setFilterType('ALL');
    setFilterCategory('ALL');
    setFilterStatus('ALL');
    setFilterMethod('ALL');
    setFilterDateRange('ALL');
    setCustomStartDate('');
    setCustomEndDate('');
    setSortBy('DATE_DESC');
  };

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];

    const monthAgo = new Date();
    monthAgo.setDate(1);
    const monthStartStr = monthAgo.toISOString().split('T')[0];

    let result = transactions.filter((t) => {
      // 1. Tab / Type filter
      if (activeTab === 'expenses' && t.type !== 'EXPENSE') return false;
      if (filterType !== 'ALL' && t.type !== filterType) return false;

      // 2. Category filter
      if (filterCategory !== 'ALL' && (t.category || '').toLowerCase() !== filterCategory.toLowerCase()) {
        return false;
      }

      // 3. Status filter (smart matching)
      if (filterStatus !== 'ALL') {
        const s = filterStatus.toLowerCase();
        const tStatus = (t.status || '').toLowerCase();
        if (s === 'settled' || s === 'confirmed' || s === 'paid') {
          if (!['settled', 'confirmed', 'completed', 'paid'].includes(tStatus)) return false;
        } else if (s === 'pending') {
          if (!['pending', 'pending payment', 'in progress'].includes(tStatus)) return false;
        } else {
          if (tStatus !== s) return false;
        }
      }

      // 4. Payment Method filter (smart matching)
      if (filterMethod !== 'ALL') {
        const m = filterMethod.toLowerCase();
        const tMethod = (t.paymentMethod || '').toLowerCase();
        if (m.includes('card')) {
          if (!tMethod.includes('card')) return false;
        } else if (m.includes('bank') || m.includes('net')) {
          if (!tMethod.includes('bank') && !tMethod.includes('net')) return false;
        } else {
          if (tMethod !== m) return false;
        }
      }

      // 5. Date Range Filter
      const tDate = (t.date || t.createdAt || '').split('T')[0];
      if (filterDateRange === 'TODAY') {
        if (tDate !== todayStr) return false;
      } else if (filterDateRange === 'YESTERDAY') {
        if (tDate !== yesterdayStr) return false;
      } else if (filterDateRange === 'THIS_WEEK') {
        if (tDate < weekAgoStr || tDate > todayStr) return false;
      } else if (filterDateRange === 'THIS_MONTH') {
        if (tDate < monthStartStr || tDate > todayStr) return false;
      } else if (filterDateRange === 'CUSTOM') {
        if (customStartDate && tDate < customStartDate) return false;
        if (customEndDate && tDate > customEndDate) return false;
      }

      // 6. Search query
      if (search) {
        const q = search.toLowerCase();
        const matchesId = (t.id || '').toLowerCase().includes(q);
        const matchesDesc = (t.description || '').toLowerCase().includes(q);
        const matchesPayer = (t.payerPayee || '').toLowerCase().includes(q);
        const matchesRef = (t.reference || '').toLowerCase().includes(q);
        const matchesCategory = (t.category || '').toLowerCase().includes(q);
        const matchesNotes = (t.notes || '').toLowerCase().includes(q);
        if (!matchesId && !matchesDesc && !matchesPayer && !matchesRef && !matchesCategory && !matchesNotes) {
          return false;
        }
      }

      return true;
    });

    // 7. Sorting
    result.sort((a, b) => {
      const dateA = new Date(a.date || a.createdAt).getTime();
      const dateB = new Date(b.date || b.createdAt).getTime();
      const amtA = Number(a.amount) || 0;
      const amtB = Number(b.amount) || 0;

      if (sortBy === 'DATE_ASC') return dateA - dateB;
      if (sortBy === 'AMOUNT_DESC') return amtB - amtA;
      if (sortBy === 'AMOUNT_ASC') return amtA - amtB;
      return dateB - dateA; // DATE_DESC
    });

    return result;
  }, [
    transactions,
    activeTab,
    filterType,
    filterCategory,
    filterStatus,
    filterMethod,
    filterDateRange,
    customStartDate,
    customEndDate,
    search,
    sortBy,
  ]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (filterStatus !== 'ALL' && inv.status.toLowerCase() !== filterStatus.toLowerCase()) return false;
      if (search) {
        const q = search.toLowerCase();
        const matchesId = inv.id.toLowerCase().includes(q);
        const matchesName = inv.customerName.toLowerCase().includes(q);
        const matchesEmail = (inv.customerEmail || '').toLowerCase().includes(q);
        if (!matchesId && !matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [invoices, filterStatus, search]);

  // Export transactions to CSV
  const handleExportCSV = () => {
    const rowsToExport = activeTab === 'invoices' ? filteredInvoices : filteredTransactions;
    if (!rowsToExport.length) {
      alert('No data to export.');
      return;
    }

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'invoices') {
      csvContent += 'Invoice ID,Customer Name,Email,Issue Date,Due Date,Subtotal,Tax,Total,Status\n';
      rowsToExport.forEach((inv) => {
        csvContent += `"${inv.id}","${inv.customerName}","${inv.customerEmail || ''}","${inv.issueDate}","${inv.dueDate}",${inv.subtotal},${inv.taxAmount},${inv.total},"${inv.status}"\n`;
      });
    } else {
      csvContent += 'Transaction ID,Date,Type,Category,Description,Payer/Payee,Payment Method,Amount,Tax Amount,Status,Reference\n';
      rowsToExport.forEach((t) => {
        csvContent += `"${t.id}","${t.date}","${t.type}","${t.category}","${t.description.replace(/"/g, '""')}","${t.payerPayee}","${t.paymentMethod || 'UPI'}",${t.amount},${t.taxAmount || 0},"${t.status}","${t.reference || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finance_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Record Transaction Form
  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!txnFormData.amount || Number(txnFormData.amount) <= 0) {
      setFormError('Please enter a valid positive amount.');
      return;
    }
    if (!txnFormData.category) {
      setFormError('Please select a category.');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await api.createFinanceTransaction({
        ...txnFormData,
        type: txnFormType,
      });

      if (res?.success) {
        setShowTxnModal(false);
        // Reset form
        setTxnFormData({
          category: txnFormType === 'INCOME' ? 'Court Booking' : 'Court Maintenance',
          description: '',
          amount: '',
          taxRate: '18',
          payerPayee: '',
          paymentMethod: 'UPI',
          status: 'Settled',
          date: new Date().toISOString().split('T')[0],
          reference: '',
          notes: '',
        });
        fetchData();
      } else {
        setFormError(res?.message || 'Failed to record transaction');
      }
    } catch (err) {
      setFormError(err?.message || 'Error recording transaction');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Submit Create Invoice Form
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!invoiceFormData.customerName.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    const hasValidItem = invoiceFormData.items.some(
      (item) => item.description.trim() && Number(item.unitPrice) > 0
    );
    if (!hasValidItem) {
      setFormError('Please provide at least one valid item with description and price.');
      return;
    }

    try {
      setFormSubmitting(true);
      const res = await api.createFinanceInvoice(invoiceFormData);
      if (res?.success) {
        setShowInvoiceModal(false);
        // Reset form
        setInvoiceFormData({
          customerName: '',
          customerEmail: '',
          customerPhone: '',
          issueDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          paymentMethod: 'UPI',
          taxRate: '18',
          notes: 'Thank you for your business! Payment is due within 7 days.',
          items: [{ description: 'Court Booking Package', qty: 1, unitPrice: '' }],
        });
        fetchData();
      } else {
        setFormError(res?.message || 'Failed to create invoice');
      }
    } catch (err) {
      setFormError(err?.message || 'Error generating invoice');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Mark invoice as paid
  const handleMarkInvoicePaid = async (inv) => {
    try {
      const res = await api.updateFinanceInvoiceStatus(inv.id, 'Paid', inv.paymentMethod || 'UPI');
      if (res?.success) {
        fetchData();
        if (selectedInvoice && selectedInvoice.id === inv.id) {
          setSelectedInvoice({ ...selectedInvoice, status: 'Paid' });
        }
      }
    } catch (err) {
      alert(err?.message || 'Failed to update invoice status');
    }
  };

  // Delete transaction
  const handleDeleteTxn = async (id) => {
    if (!confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      const res = await api.deleteFinanceTransaction(id);
      if (res?.success) {
        fetchData();
        if (selectedTxn?.id === id) setSelectedTxn(null);
      }
    } catch (err) {
      alert(err?.message || 'Could not delete transaction');
    }
  };

  // Update transaction status
  const handleUpdateTxnStatus = async (id, status) => {
    try {
      const res = await api.updateFinanceTransactionStatus(id, status);
      if (res?.success) {
        fetchData();
        if (selectedTxn?.id === id) {
          setSelectedTxn({ ...selectedTxn, status });
        }
      }
    } catch (err) {
      alert(err?.message || 'Could not update status');
    }
  };

  // KPI figures derived from real data
  const kpis = summary?.kpis || {
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
    netMargin: 0,
    pendingReceivables: 0,
    todayRevenue: 0,
    todayExpenses: 0,
    transactionCount: 0,
  };

  // Revenue & Expense percentage breakdown
  const revenueCategories = summary?.revenueByCategory || {};
  const expenseCategories = summary?.expenseByCategory || {};
  const paymentMethodsBreakdown = summary?.paymentMethodBreakdown || {};

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Page Header ── */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[24px] font-bold text-gray-900 leading-tight tracking-tight">
                Finance & Accounts
              </h1>
              <span className="badge badge-success text-[11px] font-medium py-0.5 px-2">Live Ledger</span>
            </div>
            <p className="text-[13px] text-gray-500 mt-1">
              Real-time financial tracking, integrated court booking revenue, expense control, and invoices.
            </p>
          </div>

          {/* Period selector & Refresh */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shadow-xs">
              {[
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'quarter', label: 'Quarter' },
                { id: 'all', label: 'All Time' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-all ${
                    period === p.id
                      ? 'bg-purple-700 text-white shadow-xs font-semibold'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRefresh}
              className="btn btn-secondary p-2 flex items-center justify-center rounded-lg shadow-xs"
              title="Refresh Ledger"
            >
              <RefreshCw size={15} className={refreshing ? 'animate-spin text-purple-600' : 'text-gray-600'} />
            </button>
          </div>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="text-[12px] text-gray-500 flex items-center gap-1.5">
            <Calendar size={13} className="text-gray-400" />
            <span>Showing entries for: <strong className="text-gray-700 capitalize">{period === 'all' ? 'All Time' : period}</strong></span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary gap-1.5 text-[12px] py-1.5 px-3 rounded-lg shadow-xs"
            >
              <Download size={14} /> Export CSV
            </button>

            <button
              onClick={() => setShowInvoiceModal(true)}
              className="btn btn-secondary gap-1.5 text-[12px] py-1.5 px-3 rounded-lg border-purple-200 text-purple-700 hover:bg-purple-50 shadow-xs"
            >
              <FileText size={14} /> New Invoice
            </button>

            <button
              onClick={() => {
                setTxnFormType('EXPENSE');
                setTxnFormData((prev) => ({
                  ...prev,
                  category: 'Court Maintenance',
                  payerPayee: 'Vendor / Contractor',
                }));
                setShowTxnModal(true);
              }}
              className="btn btn-secondary gap-1.5 text-[12px] py-1.5 px-3 rounded-lg text-rose-700 border-rose-200 hover:bg-rose-50 shadow-xs"
            >
              <TrendingDown size={14} /> Record Expense
            </button>

            <button
              onClick={() => {
                setTxnFormType('INCOME');
                setTxnFormData((prev) => ({
                  ...prev,
                  category: 'Court Booking',
                  payerPayee: 'Club Member',
                }));
                setShowTxnModal(true);
              }}
              className="btn btn-primary gap-1.5 text-[12px] py-1.5 px-3.5 rounded-lg shadow-xs"
            >
              <Plus size={15} /> Record Income
            </button>
          </div>
        </div>
      </div>

      {/* ── Executive KPI Cards (Real Values, NO Dummy Data) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Inflow */}
        <div className="card p-5 border-l-4 border-l-emerald-500 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Inflow (Rev)</span>
            <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp size={15} />
            </div>
          </div>
          <div className="text-[23px] font-bold text-emerald-700">
            ₹{kpis.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
            <span>Settled revenue across streams</span>
          </div>
        </div>

        {/* Total Outflow */}
        <div className="card p-5 border-l-4 border-l-rose-500 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Expenses</span>
            <div className="w-7 h-7 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <TrendingDown size={15} />
            </div>
          </div>
          <div className="text-[23px] font-bold text-rose-700">
            ₹{kpis.totalExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Operational, gear & maintenance
          </div>
        </div>

        {/* Net Profit */}
        <div className="card p-5 border-l-4 border-l-purple-600 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Net Balance</span>
            <div className="w-7 h-7 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
              <DollarSign size={15} />
            </div>
          </div>
          <div className={`text-[23px] font-bold ${kpis.netProfit >= 0 ? 'text-purple-700' : 'text-rose-700'}`}>
            ₹{kpis.netProfit.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1 font-medium">
            <span className={kpis.netMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
              {kpis.netMargin}% operating margin
            </span>
          </div>
        </div>

        {/* Pending Receivables */}
        <div className="card p-5 border-l-4 border-l-amber-500 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Pending Receivables</span>
            <div className="w-7 h-7 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock size={15} />
            </div>
          </div>
          <div className="text-[23px] font-bold text-amber-700">
            ₹{kpis.pendingReceivables.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Unsettled slots & pending invoices
          </div>
        </div>

        {/* Today's Collections */}
        <div className="card p-5 border-l-4 border-l-blue-600 bg-white">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Today's Collections</span>
            <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <Wallet size={15} />
            </div>
          </div>
          <div className="text-[23px] font-bold text-blue-700">
            ₹{kpis.todayRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-gray-400 mt-1">
            Cashflow collected today
          </div>
        </div>
      </div>

      {/* ── Financial Analytics & Distribution (Visual breakdown) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Streams Breakdown */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-600" />
              <h3 className="text-[14px] font-bold text-gray-900">Revenue by Source</h3>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              ₹{kpis.totalRevenue.toLocaleString()}
            </span>
          </div>

          {Object.keys(revenueCategories).length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[12px]">
              No settled revenue recorded in this period.
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              {Object.entries(revenueCategories).map(([cat, amount]) => {
                const pct = kpis.totalRevenue > 0 ? Math.round((amount / kpis.totalRevenue) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="font-semibold text-gray-900">
                        ₹{amount.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <TrendingDown size={16} className="text-rose-600" />
              <h3 className="text-[14px] font-bold text-gray-900">Expenses Breakdown</h3>
            </div>
            <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
              ₹{kpis.totalExpenses.toLocaleString()}
            </span>
          </div>

          {Object.keys(expenseCategories).length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[12px]">
              No expense entries recorded in this period.
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              {Object.entries(expenseCategories).map(([cat, amount]) => {
                const pct = kpis.totalExpenses > 0 ? Math.round((amount / kpis.totalExpenses) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-gray-700">{cat}</span>
                      <span className="font-semibold text-gray-900">
                        ₹{amount.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Channels Share */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2.5">
            <div className="flex items-center gap-2">
              <CreditCard size={16} className="text-purple-600" />
              <h3 className="text-[14px] font-bold text-gray-900">Payment Channels</h3>
            </div>
            <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Distribution
            </span>
          </div>

          {Object.keys(paymentMethodsBreakdown).length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-[12px]">
              No settled payments registered yet.
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              {Object.entries(paymentMethodsBreakdown).map(([method, amount]) => {
                const pct = kpis.totalRevenue > 0 ? Math.round((amount / kpis.totalRevenue) * 100) : 0;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-medium text-gray-700">{method}</span>
                      <span className="font-semibold text-gray-900">
                        ₹{amount.toLocaleString()} <span className="text-gray-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Interactive Workspace Tabs ── */}
      <div className="card">
        {/* Tab Headers */}
        <div className="flex flex-wrap items-center justify-between px-6 pt-4 border-b border-gray-200 gap-4">
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleTabChange('transactions')}
              className={`pb-3 text-[14px] font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'transactions'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <CreditCard size={15} /> All Transactions ({transactions.length})
            </button>

            <button
              onClick={() => handleTabChange('invoices')}
              className={`pb-3 text-[14px] font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'invoices'
                  ? 'border-purple-600 text-purple-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <FileText size={15} /> Invoices & Billing ({invoices.length})
            </button>

            <button
              onClick={() => handleTabChange('expenses')}
              className={`pb-3 text-[14px] font-semibold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'expenses'
                  ? 'border-rose-600 text-rose-700'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <TrendingDown size={15} /> Expense Ledger ({transactions.filter((t) => t.type === 'EXPENSE').length})
            </button>
          </div>

          {/* Results Summary & Active Filter count */}
          <div className="flex items-center gap-2 pb-2 text-[12px] text-gray-500">
            <span>
              Showing{' '}
              <strong className="text-gray-900 font-bold">
                {activeTab === 'invoices' ? filteredInvoices.length : filteredTransactions.length}
              </strong>{' '}
              of {activeTab === 'invoices' ? invoices.length : transactions.length}
            </span>
            {activeFiltersCount > 0 && (
              <span className="badge badge-warning text-[10px] py-0 px-1.5 font-bold">
                {activeFiltersCount} active filter{activeFiltersCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-gray-50/60 border-b border-gray-100 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Search Input with quick clear */}
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="text"
                placeholder={activeTab === 'invoices' ? 'Search invoice #, customer name...' : 'Search txn ID, reference, customer, notes...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input pl-8 pr-7 py-1.5 text-[12px] w-full bg-white"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Type Filter */}
              {activeTab !== 'invoices' && activeTab !== 'expenses' && (
                <select
                  value={filterType}
                  onChange={(e) => {
                    setFilterType(e.target.value);
                    setFilterCategory('ALL');
                  }}
                  className="form-input py-1.5 text-[12px] bg-white w-32 font-medium"
                >
                  <option value="ALL">All Types</option>
                  <option value="INCOME">Income (+)</option>
                  <option value="EXPENSE">Expense (-)</option>
                </select>
              )}

              {/* Category Filter */}
              {activeTab !== 'invoices' && (
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="form-input py-1.5 text-[12px] bg-white w-40 font-medium"
                >
                  <option value="ALL">All Categories</option>
                  {availableCategories.filter((c) => c !== 'ALL').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}

              {/* Payment Method Filter */}
              {activeTab !== 'invoices' && (
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="form-input py-1.5 text-[12px] bg-white w-36 font-medium"
                >
                  <option value="ALL">All Methods</option>
                  <option value="UPI">UPI / QR</option>
                  <option value="Card">Cards (Credit/Debit)</option>
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank / Net Banking</option>
                  <option value="Cheque">Cheque</option>
                </select>
              )}

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="form-input py-1.5 text-[12px] bg-white w-36 font-medium"
              >
                <option value="ALL">All Statuses</option>
                <option value="Settled">Settled / Confirmed</option>
                <option value="Pending">Pending</option>
                {activeTab === 'invoices' && <option value="Paid">Paid</option>}
                {activeTab === 'invoices' && <option value="Overdue">Overdue</option>}
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>

              {/* Date Filter (for transactions) */}
              {activeTab !== 'invoices' && (
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="form-input py-1.5 text-[12px] bg-white w-32 font-medium"
                >
                  <option value="ALL">All Dates</option>
                  <option value="TODAY">Today</option>
                  <option value="YESTERDAY">Yesterday</option>
                  <option value="THIS_WEEK">Past 7 Days</option>
                  <option value="THIS_MONTH">This Month</option>
                  <option value="CUSTOM">Custom Range...</option>
                </select>
              )}

              {/* Sort By Filter */}
              {activeTab !== 'invoices' && (
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-input py-1.5 text-[12px] bg-white w-36 font-medium"
                >
                  <option value="DATE_DESC">Newest First</option>
                  <option value="DATE_ASC">Oldest First</option>
                  <option value="AMOUNT_DESC">Amount: High to Low</option>
                  <option value="AMOUNT_ASC">Amount: Low to High</option>
                </select>
              )}

              {/* Clear / Reset Filters Button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={handleResetFilters}
                  className="btn btn-secondary text-[12px] py-1.5 px-2.5 text-rose-700 border-rose-200 hover:bg-rose-50 flex items-center gap-1 shadow-2xs"
                  title="Reset all active filters"
                >
                  <RotateCcw size={13} /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Custom Date Range Row (visible only when CUSTOM is picked) */}
          {filterDateRange === 'CUSTOM' && activeTab !== 'invoices' && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60 animate-fade-in text-[12px]">
              <span className="font-semibold text-gray-700 flex items-center gap-1">
                <Calendar size={13} className="text-purple-600" /> Custom Range:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="form-input py-1 px-2 text-[12px] bg-white"
                  placeholder="From date"
                />
                <span className="text-gray-400">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="form-input py-1 px-2 text-[12px] bg-white"
                  placeholder="To date"
                />
                {(customStartDate || customEndDate) && (
                  <button
                    onClick={() => { setCustomStartDate(''); setCustomEndDate(''); }}
                    className="text-gray-400 hover:text-rose-600 p-1 text-[11px]"
                    title="Clear date inputs"
                  >
                    Clear dates
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Tab Content: Transactions & Expense Ledger ── */}
        {(activeTab === 'transactions' || activeTab === 'expenses') && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw size={22} className="animate-spin text-purple-600" />
                <span className="text-[13px]">Synchronizing live financial ledger...</span>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <Receipt size={36} className="mx-auto text-gray-300 mb-3" />
                <h4 className="text-[15px] font-semibold text-gray-700">No Transactions Found</h4>
                <p className="text-[12px] text-gray-400 mt-1 max-w-sm mx-auto">
                  {transactions.length === 0
                    ? "Your club's financial ledger is clean. Record a new income, track an expense, or confirm court bookings to start viewing real transactions."
                    : 'No transactions match the selected filters.'}
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setTxnFormType('INCOME');
                      setShowTxnModal(true);
                    }}
                    className="btn btn-primary text-[12px] py-1.5 px-3"
                  >
                    <Plus size={14} /> Record Income
                  </button>
                  <button
                    onClick={() => {
                      setTxnFormType('EXPENSE');
                      setShowTxnModal(true);
                    }}
                    className="btn btn-secondary text-[12px] py-1.5 px-3 text-rose-700 border-rose-200"
                  >
                    <TrendingDown size={14} /> Record Expense
                  </button>
                </div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Txn ID</th>
                    <th>Date</th>
                    <th>Category & Details</th>
                    <th>Party / Member</th>
                    <th>Payment Method</th>
                    <th>Type</th>
                    <th className="text-right">Amount (₹)</th>
                    <th>Status</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((t) => {
                    const statusConfig = STATUS_THEMES[t.status] || STATUS_THEMES.Settled;
                    const isExpense = t.type === 'EXPENSE';

                    return (
                      <tr key={t.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="font-mono text-[12px] text-gray-600 font-semibold whitespace-nowrap">
                          {t.id}
                          {t.source === 'Court Reservation' && (
                            <span className="ml-1.5 inline-block text-[10px] text-purple-700 bg-purple-50 border border-purple-100 rounded px-1">
                              Booking
                            </span>
                          )}
                        </td>
                        <td className="text-[12px] text-gray-500 whitespace-nowrap">
                          {t.date}
                        </td>
                        <td>
                          <div className="font-semibold text-gray-900 text-[13px]">{t.category}</div>
                          <div className="text-[11px] text-gray-500 truncate max-w-xs">{t.description}</div>
                        </td>
                        <td className="text-[12px] text-gray-700 font-medium">
                          {t.payerPayee}
                        </td>
                        <td className="text-[12px] text-gray-600 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <CreditCard size={12} className="text-gray-400" />
                            {t.paymentMethod || 'UPI'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`badge text-[10px] font-bold ${
                              isExpense ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isExpense ? 'EXPENSE' : 'INCOME'}
                          </span>
                        </td>
                        <td className={`text-right font-bold text-[13px] ${isExpense ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {isExpense ? '-' : '+'}₹{Number(t.amount || 0).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className="badge text-[10px] font-bold border"
                            style={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                              borderColor: statusConfig.border,
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => setSelectedTxn(t)}
                              className="btn btn-ghost p-1 text-gray-500 hover:text-purple-700"
                              title="View Receipt & Breakdown"
                            >
                              <Eye size={14} />
                            </button>
                            {t.source !== 'Court Reservation' && (
                              <button
                                onClick={() => handleDeleteTxn(t.id)}
                                className="btn btn-ghost p-1 text-gray-400 hover:text-rose-600"
                                title="Delete Transaction"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Tab Content: Invoices & Billing ── */}
        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw size={22} className="animate-spin text-purple-600" />
                <span className="text-[13px]">Loading client invoices...</span>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                <FileText size={36} className="mx-auto text-gray-300 mb-3" />
                <h4 className="text-[15px] font-semibold text-gray-700">No Invoices Issued</h4>
                <p className="text-[12px] text-gray-400 mt-1 max-w-sm mx-auto">
                  Create and send itemized invoices to club members, sponsors, and corporate clients.
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => setShowInvoiceModal(true)}
                    className="btn btn-primary text-[12px] py-1.5 px-3"
                  >
                    <Plus size={14} /> Generate First Invoice
                  </button>
                </div>
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Customer / Member</th>
                    <th>Issue Date</th>
                    <th>Due Date</th>
                    <th>Items</th>
                    <th className="text-right">Subtotal</th>
                    <th className="text-right">Total (Inc. GST)</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInvoices.map((inv) => {
                    const statusConfig = STATUS_THEMES[inv.status] || STATUS_THEMES.Pending;

                    return (
                      <tr key={inv.id} className="hover:bg-purple-50/20 transition-colors">
                        <td className="font-mono text-[12px] text-purple-700 font-bold whitespace-nowrap">
                          {inv.id}
                        </td>
                        <td>
                          <div className="font-semibold text-gray-900 text-[13px]">{inv.customerName}</div>
                          {inv.customerEmail && (
                            <div className="text-[11px] text-gray-400">{inv.customerEmail}</div>
                          )}
                        </td>
                        <td className="text-[12px] text-gray-500 whitespace-nowrap">{inv.issueDate}</td>
                        <td className="text-[12px] text-gray-500 whitespace-nowrap">{inv.dueDate}</td>
                        <td className="text-[12px] text-gray-600">
                          <span className="badge badge-info text-[11px] font-medium">
                            {inv.items?.length || 1} line item(s)
                          </span>
                        </td>
                        <td className="text-right text-[12px] text-gray-600">
                          ₹{Number(inv.subtotal || 0).toLocaleString()}
                        </td>
                        <td className="text-right font-bold text-[13px] text-gray-900">
                          ₹{Number(inv.total || 0).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className="badge text-[10px] font-bold border"
                            style={{
                              backgroundColor: statusConfig.bg,
                              color: statusConfig.color,
                              borderColor: statusConfig.border,
                            }}
                          >
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="text-center whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {inv.status !== 'Paid' && (
                              <button
                                onClick={() => handleMarkInvoicePaid(inv)}
                                className="btn btn-secondary text-[11px] py-1 px-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                title="Mark as Paid & Reconcile to Ledger"
                              >
                                <Check size={12} className="mr-0.5" /> Paid
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="btn btn-ghost p-1 text-gray-500 hover:text-purple-700"
                              title="View & Print Invoice"
                            >
                              <Printer size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* ── MODAL: Record Transaction (Income or Expense) ── */}
      {showTxnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    txnFormType === 'INCOME' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {txnFormType === 'INCOME' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <h3 className="text-[16px] font-bold text-gray-900">
                  {txnFormType === 'INCOME' ? 'Record Income / Inflow' : 'Record Outflow / Expense'}
                </h3>
              </div>
              <button
                onClick={() => setShowTxnModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTransaction} className="p-6 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => {
                    setTxnFormType('INCOME');
                    setTxnFormData((p) => ({ ...p, category: 'Court Booking' }));
                  }}
                  className={`py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                    txnFormType === 'INCOME'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  + Income (Inflow)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxnFormType('EXPENSE');
                    setTxnFormData((p) => ({ ...p, category: 'Court Maintenance' }));
                  }}
                  className={`py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                    txnFormType === 'EXPENSE'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  - Expense (Outflow)
                </button>
              </div>

              {formError && (
                <div className="p-3 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Amount & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 2500"
                    value={txnFormData.amount}
                    onChange={(e) => setTxnFormData({ ...txnFormData, amount: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    Transaction Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={txnFormData.date}
                    onChange={(e) => setTxnFormData({ ...txnFormData, date: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
              </div>

              {/* Category & Payment Method */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={txnFormData.category}
                    onChange={(e) => setTxnFormData({ ...txnFormData, category: e.target.value })}
                    className="form-input w-full"
                  >
                    {(txnFormType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={txnFormData.paymentMethod}
                    onChange={(e) => setTxnFormData({ ...txnFormData, paymentMethod: e.target.value })}
                    className="form-input w-full"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Party Name & GST Tax */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    {txnFormType === 'INCOME' ? 'Paid By (Member / Guest)' : 'Paid To (Vendor / Contractor)'}
                  </label>
                  <input
                    type="text"
                    placeholder={txnFormType === 'INCOME' ? 'e.g. Rahul Verma' : 'e.g. Skyline Surface Maintenance'}
                    value={txnFormData.payerPayee}
                    onChange={(e) => setTxnFormData({ ...txnFormData, payerPayee: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    Tax / GST Rate
                  </label>
                  <select
                    value={txnFormData.taxRate}
                    onChange={(e) => setTxnFormData({ ...txnFormData, taxRate: e.target.value })}
                    className="form-input w-full"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST (Standard)</option>
                    <option value="28">28% GST</option>
                  </select>
                </div>
              </div>

              {/* Description & Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    Receipt / Reference No.
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. REC-9921 or Invoice #"
                    value={txnFormData.reference}
                    onChange={(e) => setTxnFormData({ ...txnFormData, reference: e.target.value })}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    Settlement Status
                  </label>
                  <select
                    value={txnFormData.status}
                    onChange={(e) => setTxnFormData({ ...txnFormData, status: e.target.value })}
                    className="form-input w-full"
                  >
                    <option value="Settled">Settled / Completed</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional details or internal accounting memo..."
                  value={txnFormData.notes}
                  onChange={(e) => setTxnFormData({ ...txnFormData, notes: e.target.value })}
                  className="form-input w-full text-[12px]"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowTxnModal(false)}
                  className="btn btn-secondary text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={`btn text-[12px] ${
                    txnFormType === 'INCOME' ? 'btn-primary' : 'bg-rose-600 hover:bg-rose-700 text-white'
                  }`}
                >
                  {formSubmitting ? 'Recording...' : `Record ${txnFormType === 'INCOME' ? 'Income' : 'Expense'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Create New Invoice ── */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-purple-600" />
                <h3 className="text-[16px] font-bold text-gray-900">Create New Invoice</h3>
              </div>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 text-[12px] text-rose-700 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2">
                  <AlertCircle size={15} />
                  <span>{formError}</span>
                </div>
              )}

              {/* Customer details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">
                    Billed To (Client / Member) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Arjun Kapoor"
                    value={invoiceFormData.customerName}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerName: e.target.value })}
                    className="form-input w-full text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@email.com"
                    value={invoiceFormData.customerEmail}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerEmail: e.target.value })}
                    className="form-input w-full text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={invoiceFormData.customerPhone}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, customerPhone: e.target.value })}
                    className="form-input w-full text-[12px]"
                  />
                </div>
              </div>

              {/* Dates & tax */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={invoiceFormData.issueDate}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, issueDate: e.target.value })}
                    className="form-input w-full text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={invoiceFormData.dueDate}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, dueDate: e.target.value })}
                    className="form-input w-full text-[12px]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-700 mb-1">GST Tax Rate</label>
                  <select
                    value={invoiceFormData.taxRate}
                    onChange={(e) => setInvoiceFormData({ ...invoiceFormData, taxRate: e.target.value })}
                    className="form-input w-full text-[12px]"
                  >
                    <option value="0">0% (Nil)</option>
                    <option value="5">5% GST</option>
                    <option value="12">12% GST</option>
                    <option value="18">18% GST</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50 space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-gray-200">
                  <span className="text-[12px] font-bold text-gray-800">Billable Items</span>
                  <button
                    type="button"
                    onClick={() => {
                      setInvoiceFormData({
                        ...invoiceFormData,
                        items: [...invoiceFormData.items, { description: '', qty: 1, unitPrice: '' }],
                      });
                    }}
                    className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {invoiceFormData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Item description (e.g. Padel Court Booking)"
                        value={item.description}
                        onChange={(e) => {
                          const updated = [...invoiceFormData.items];
                          updated[idx].description = e.target.value;
                          setInvoiceFormData({ ...invoiceFormData, items: updated });
                        }}
                        className="form-input flex-1 text-[12px]"
                        required
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...invoiceFormData.items];
                          updated[idx].qty = e.target.value;
                          setInvoiceFormData({ ...invoiceFormData, items: updated });
                        }}
                        className="form-input w-16 text-[12px] text-center"
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Price (₹)"
                        value={item.unitPrice}
                        onChange={(e) => {
                          const updated = [...invoiceFormData.items];
                          updated[idx].unitPrice = e.target.value;
                          setInvoiceFormData({ ...invoiceFormData, items: updated });
                        }}
                        className="form-input w-28 text-[12px] text-right"
                        required
                      />
                      {invoiceFormData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const updated = invoiceFormData.items.filter((_, i) => i !== idx);
                            setInvoiceFormData({ ...invoiceFormData, items: updated });
                          }}
                          className="text-gray-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Live total calculation */}
                {(() => {
                  const sub = invoiceFormData.items.reduce(
                    (s, it) => s + (Number(it.qty) || 0) * (Number(it.unitPrice) || 0),
                    0
                  );
                  const tax = Math.round((sub * Number(invoiceFormData.taxRate || 0)) / 100);
                  const grandTotal = sub + tax;
                  return (
                    <div className="pt-2 border-t border-gray-200 text-right space-y-0.5 text-[12px]">
                      <div className="text-gray-500">Subtotal: ₹{sub.toLocaleString()}</div>
                      <div className="text-gray-500">Tax ({invoiceFormData.taxRate}%): ₹{tax.toLocaleString()}</div>
                      <div className="text-[14px] font-bold text-gray-900">
                        Invoice Total: ₹{grandTotal.toLocaleString()}
                      </div>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-gray-700 mb-1">Notes / Terms</label>
                <textarea
                  rows="2"
                  value={invoiceFormData.notes}
                  onChange={(e) => setInvoiceFormData({ ...invoiceFormData, notes: e.target.value })}
                  className="form-input w-full text-[12px]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="btn btn-secondary text-[12px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn btn-primary text-[12px]"
                >
                  {formSubmitting ? 'Generating...' : 'Issue Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: Transaction Details & Printable Receipt ── */}
      {selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md border border-gray-200 overflow-hidden">
            {/* Printable Receipt Area */}
            <div id="receipt-print-area" className="p-6 bg-white space-y-5">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900 tracking-tight">SKYLINE SPORTS CLUB</h3>
                  <div className="text-[11px] text-gray-500">Official Payment Receipt</div>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[12px] text-purple-700 font-bold block">{selectedTxn.id}</span>
                  <span className="text-[11px] text-gray-400">{selectedTxn.date}</span>
                </div>
              </div>

              <div className="space-y-2.5 text-[12px]">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Party / Member</span>
                  <span className="font-semibold text-gray-900">{selectedTxn.payerPayee}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Category</span>
                  <span className="font-semibold text-gray-900">{selectedTxn.category}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Description</span>
                  <span className="text-gray-800 text-right max-w-xs">{selectedTxn.description}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Payment Method</span>
                  <span className="font-semibold text-gray-900">{selectedTxn.paymentMethod || 'UPI'}</span>
                </div>
                {selectedTxn.reference && (
                  <div className="flex justify-between py-1 border-b border-gray-100">
                    <span className="text-gray-500">Reference #</span>
                    <span className="font-mono text-gray-800">{selectedTxn.reference}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500">Settlement Status</span>
                  <span
                    className="badge text-[10px] font-bold"
                    style={{
                      backgroundColor: STATUS_THEMES[selectedTxn.status]?.bg || '#f3f4f6',
                      color: STATUS_THEMES[selectedTxn.status]?.color || '#374151',
                    }}
                  >
                    {selectedTxn.status}
                  </span>
                </div>
              </div>

              {/* Amount Box */}
              <div className="p-3 bg-purple-50/60 rounded-lg border border-purple-100 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase text-purple-700">Total Settled</div>
                  <div className="text-[10px] text-gray-400">Includes applicable GST</div>
                </div>
                <div className="text-[20px] font-bold text-purple-900">
                  ₹{Number(selectedTxn.amount || 0).toLocaleString()}
                </div>
              </div>

              {/* Status Switcher Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                <span className="text-[11px] text-gray-500">Change Status:</span>
                <div className="flex items-center gap-1.5">
                  {selectedTxn.status !== 'Settled' && (
                    <button
                      onClick={() => handleUpdateTxnStatus(selectedTxn.id, 'Settled')}
                      className="btn btn-secondary text-[11px] py-1 px-2 text-emerald-700 border-emerald-200"
                    >
                      Mark Settled
                    </button>
                  )}
                  {selectedTxn.status !== 'Refunded' && (
                    <button
                      onClick={() => handleUpdateTxnStatus(selectedTxn.id, 'Refunded')}
                      className="btn btn-secondary text-[11px] py-1 px-2 text-purple-700 border-purple-200"
                    >
                      Refund
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="btn btn-secondary gap-1.5 text-[12px] py-1.5 px-3"
              >
                <Printer size={14} /> Print Receipt
              </button>
              <button
                onClick={() => setSelectedTxn(null)}
                className="btn btn-primary text-[12px] py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Printable Invoice Document ── */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl border border-gray-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="p-8 space-y-6 overflow-y-auto flex-1 bg-white">
              {/* Header with Club Info */}
              <div className="flex items-start justify-between border-b border-gray-200 pb-5">
                <div>
                  <h2 className="text-[20px] font-extrabold text-purple-900 tracking-tight">SKYLINE SPORTS CLUB</h2>
                  <p className="text-[12px] text-gray-500 mt-0.5">Court Reservations, Pro Shop & Facilities</p>
                  <p className="text-[11px] text-gray-400">GSTIN: 27AABCS1429B1Z8</p>
                </div>
                <div className="text-right">
                  <div className="text-[16px] font-bold text-gray-900 font-mono">{selectedInvoice.id}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Issue Date: {selectedInvoice.issueDate}</div>
                  <div className="text-[11px] text-gray-500">Due Date: {selectedInvoice.dueDate}</div>
                </div>
              </div>

              {/* Billed To */}
              <div className="flex justify-between items-start text-[12px]">
                <div>
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                    Billed To
                  </span>
                  <div className="font-bold text-[14px] text-gray-900">{selectedInvoice.customerName}</div>
                  {selectedInvoice.customerEmail && <div className="text-gray-500">{selectedInvoice.customerEmail}</div>}
                  {selectedInvoice.customerPhone && <div className="text-gray-500">{selectedInvoice.customerPhone}</div>}
                </div>
                <div className="text-right">
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px] block mb-1">
                    Status
                  </span>
                  <span
                    className="badge text-[11px] font-bold border px-2.5 py-0.5"
                    style={{
                      backgroundColor: STATUS_THEMES[selectedInvoice.status]?.bg || '#f3f4f6',
                      color: STATUS_THEMES[selectedInvoice.status]?.color || '#374151',
                    }}
                  >
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-[12px]">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Unit Price</th>
                      <th className="p-2.5 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedInvoice.items?.map((it, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-medium text-gray-900">{it.description}</td>
                        <td className="p-2.5 text-center text-gray-600">{it.qty}</td>
                        <td className="p-2.5 text-right text-gray-600">₹{Number(it.unitPrice).toLocaleString()}</td>
                        <td className="p-2.5 text-right font-semibold text-gray-900">
                          ₹{(Number(it.qty) * Number(it.unitPrice)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-[12px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>₹{Number(selectedInvoice.subtotal || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>GST ({selectedInvoice.taxRate || 18}%):</span>
                    <span>₹{Number(selectedInvoice.taxAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[15px] font-bold text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total Amount:</span>
                    <span className="text-purple-900">₹{Number(selectedInvoice.total || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="p-3 bg-gray-50 rounded-lg text-[11px] text-gray-500 border border-gray-100">
                  <span className="font-semibold text-gray-700 block mb-0.5">Notes:</span>
                  {selectedInvoice.notes}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="btn btn-secondary gap-1.5 text-[12px] py-1.5 px-3"
                >
                  <Printer size={14} /> Print
                </button>
                {selectedInvoice.status !== 'Paid' && (
                  <button
                    onClick={() => handleMarkInvoicePaid(selectedInvoice)}
                    className="btn btn-secondary text-[12px] py-1.5 px-3 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                  >
                    <Check size={13} className="mr-1" /> Mark Paid
                  </button>
                )}
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="btn btn-primary text-[12px] py-1.5 px-4"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
