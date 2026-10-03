/**
 * Finance Service
 * Financial ledger, revenue tracking, expense management, and invoicing.
 * Fully dynamic runtime store per club with real-time integration to court bookings.
 * NO dummy or fake data.
 */

import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import { BookingService } from "./bookingService.js";
import { AuditService } from "./auditService.js";

// In-memory per-club storage
const clubTransactionsState = new Map();
const clubTransactionCounters = new Map();
const clubInvoicesState = new Map();
const clubInvoiceCounters = new Map();

function getNextTransactionId(clubId) {
  const current = clubTransactionCounters.get(clubId) || 5500;
  const next = current + 1;
  clubTransactionCounters.set(clubId, next);
  return `TXN-${next}`;
}

function getNextInvoiceId(clubId) {
  const current = clubInvoiceCounters.get(clubId) || 1000;
  const next = current + 1;
  clubInvoiceCounters.set(clubId, next);
  return `INV-${next}`;
}

export class FinanceService {
  /**
   * Initialise clean in-memory finance transactions store for a club
   */
  static _initTransactions(clubId) {
    if (!clubTransactionsState.has(clubId)) {
      clubTransactionCounters.set(clubId, 5500);
      clubTransactionsState.set(clubId, []);
    }
    return clubTransactionsState.get(clubId);
  }

  /**
   * Initialise clean in-memory invoices store for a club
   */
  static _initInvoices(clubId) {
    if (!clubInvoicesState.has(clubId)) {
      clubInvoiceCounters.set(clubId, 1000);
      clubInvoicesState.set(clubId, []);
    }
    return clubInvoicesState.get(clubId);
  }

  /**
   * Build synchronized transaction items from live court bookings
   */
  static _getBookingTransactions(clubId) {
    try {
      const bookings = BookingService._init(clubId) || [];
      return bookings
        .filter((b) => b.status !== "Cancelled")
        .map((b) => {
          const fee = Number(b.fee) || 0;
          const isSettled = b.status === "Confirmed" || b.status === "Completed";
          const bookingDate = b.date || (b.startTime ? b.startTime.split("T")[0] : new Date().toISOString().split("T")[0]);

          return {
            id: `TXN-BK-${(b.id || "").replace("BK-", "").replace("#", "")}`,
            type: "INCOME",
            category: "Court Booking",
            description: `Court Booking – ${b.court?.name || "Court"}`,
            amount: fee,
            taxRate: 18,
            taxAmount: Math.round(fee * 0.18),
            payerPayee: b.guestName || b.member?.name || "Club Member",
            paymentMethod: b.paymentMethod || "UPI",
            status: isSettled ? "Settled" : "Pending",
            date: bookingDate,
            reference: b.id,
            source: "Court Reservation",
            notes: `Slot: ${b.startTime ? new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''} | Court: ${b.court?.name || ''}`,
            createdAt: b.createdAt || new Date().toISOString(),
          };
        });
    } catch {
      return [];
    }
  }

  /**
   * Get all transactions (combining direct finance records + court booking records)
   */
  static async getTransactions(clubId, { type, category, status, paymentMethod, startDate, endDate, period, search } = {}) {
    const manualTxns = this._initTransactions(clubId);
    const bookingTxns = this._getBookingTransactions(clubId);

    // Combine all transactions
    let all = [...manualTxns, ...bookingTxns];

    // Determine date range if period provided
    let start = startDate;
    let end = endDate;

    if (!start && period && period !== "all") {
      const now = new Date();
      const todayStr = now.toISOString().split("T")[0];
      if (period === "today") {
        start = todayStr;
        end = todayStr;
      } else if (period === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        start = weekAgo.toISOString().split("T")[0];
        end = todayStr;
      } else if (period === "month") {
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        start = firstOfMonth.toISOString().split("T")[0];
        end = todayStr;
      } else if (period === "quarter") {
        const quarterAgo = new Date();
        quarterAgo.setMonth(now.getMonth() - 3);
        start = quarterAgo.toISOString().split("T")[0];
        end = todayStr;
      }
    }

    // Filter by Type (INCOME / EXPENSE)
    if (type && type !== "ALL") {
      all = all.filter((t) => (t.type || "").toUpperCase() === type.toUpperCase());
    }

    // Filter by Category
    if (category && category !== "ALL") {
      all = all.filter((t) => (t.category || "").toLowerCase() === category.toLowerCase());
    }

    // Filter by Status (smart matching)
    if (status && status !== "ALL") {
      const s = status.toLowerCase();
      if (s === "settled" || s === "confirmed" || s === "paid") {
        all = all.filter((t) => ["settled", "confirmed", "completed", "paid"].includes((t.status || "").toLowerCase()));
      } else if (s === "pending") {
        all = all.filter((t) => ["pending", "pending payment", "in progress"].includes((t.status || "").toLowerCase()));
      } else {
        all = all.filter((t) => (t.status || "").toLowerCase() === s);
      }
    }

    // Filter by Payment Method (smart matching)
    if (paymentMethod && paymentMethod !== "ALL") {
      const pm = paymentMethod.toLowerCase();
      all = all.filter((t) => {
        const method = (t.paymentMethod || "").toLowerCase();
        if (pm.includes("card") && method.includes("card")) return true;
        if ((pm.includes("bank") || pm.includes("net")) && (method.includes("bank") || method.includes("net"))) return true;
        return method === pm;
      });
    }

    // Filter by Date Range
    if (start) {
      all = all.filter((t) => (t.date || "").split("T")[0] >= start);
    }
    if (end) {
      all = all.filter((t) => (t.date || "").split("T")[0] <= end);
    }

    // Search query
    if (search) {
      const term = search.toLowerCase();
      all = all.filter(
        (t) =>
          (t.id || "").toLowerCase().includes(term) ||
          (t.description || "").toLowerCase().includes(term) ||
          (t.payerPayee || "").toLowerCase().includes(term) ||
          (t.category || "").toLowerCase().includes(term) ||
          (t.reference || "").toLowerCase().includes(term)
      );
    }

    // Sort descending by date & creation
    return all.sort((a, b) => new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime());
  }

  /**
   * Get single transaction by ID
   */
  static async getTransactionById(clubId, id) {
    const transactions = await this.getTransactions(clubId);
    const found = transactions.find((t) => t.id === id);
    if (!found) {
      throw new AppError("Transaction not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }
    return found;
  }

  /**
   * Record a new manual transaction (Income or Expense)
   */
  static async createTransaction(clubId, data, user) {
    const {
      type = "INCOME",
      category,
      description,
      amount,
      taxRate = 0,
      payerPayee,
      paymentMethod = "Cash",
      status = "Settled",
      date,
      reference,
      notes,
    } = data;

    if (!category) {
      throw new AppError("Transaction category is required", HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      throw new AppError("A valid positive transaction amount is required", HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    }

    const txDate = date || new Date().toISOString().split("T")[0];
    const parsedTaxRate = Number(taxRate) || 0;
    const taxAmount = parsedTaxRate > 0 ? Math.round((parsedAmount * parsedTaxRate) / 100) : 0;

    const newTxn = {
      id: getNextTransactionId(clubId),
      type: type.toUpperCase() === "EXPENSE" ? "EXPENSE" : "INCOME",
      category: category.trim(),
      description: description?.trim() || `${category} - ${payerPayee || "Direct Entry"}`,
      amount: parsedAmount,
      taxRate: parsedTaxRate,
      taxAmount,
      payerPayee: payerPayee?.trim() || (type === "EXPENSE" ? "Vendor / Supplier" : "Club Member / Guest"),
      paymentMethod: paymentMethod || "UPI",
      status: status || "Settled",
      date: txDate,
      reference: reference?.trim() || "",
      notes: notes?.trim() || "",
      source: "Manual Entry",
      createdBy: {
        name: user?.name || user?.firstName || "Staff",
        role: user?.role || "ACCOUNTANT",
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const store = this._initTransactions(clubId);
    store.unshift(newTxn);

    // Audit log
    AuditService.logActivity(clubId, {
      action: `Recorded ${newTxn.type}: ${newTxn.id}`,
      entity: "Finance & Accounts",
      details: `${newTxn.type} of ₹${newTxn.amount.toLocaleString()} for ${newTxn.category} (${newTxn.payerPayee})`,
      user,
    });

    return newTxn;
  }

  /**
   * Update transaction status
   */
  static async updateTransactionStatus(clubId, id, status, user) {
    // If it's a booking transaction, update the underlying booking
    if (id.startsWith("TXN-BK-")) {
      const bookingId = `BK-${id.replace("TXN-BK-", "")}`;
      const bookingStatus = status === "Settled" ? "Confirmed" : (status === "Pending" ? "Pending Payment" : status);
      await BookingService.updateBookingStatus(clubId, bookingId, bookingStatus, user);
      return await this.getTransactionById(clubId, id);
    }

    const store = this._initTransactions(clubId);
    const txn = store.find((t) => t.id === id);
    if (!txn) {
      throw new AppError("Transaction not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }

    const oldStatus = txn.status;
    txn.status = status;
    txn.updatedAt = new Date().toISOString();

    AuditService.logActivity(clubId, {
      action: `Transaction ${id} Status Changed`,
      entity: "Finance & Accounts",
      details: `Status transitioned from ${oldStatus} to ${status}`,
      user,
    });

    return txn;
  }

  /**
   * Delete / Void a manual transaction
   */
  static async deleteTransaction(clubId, id, user) {
    if (id.startsWith("TXN-BK-")) {
      throw new AppError("Court booking transactions must be managed directly via Court Bookings", HTTP_STATUS.BAD_REQUEST, "FORBIDDEN");
    }

    const store = this._initTransactions(clubId);
    const index = store.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new AppError("Transaction not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }

    const [deleted] = store.splice(index, 1);

    AuditService.logActivity(clubId, {
      action: `Transaction ${id} Deleted`,
      entity: "Finance & Accounts",
      details: `Removed transaction of ₹${deleted.amount.toLocaleString()} for ${deleted.category}`,
      user,
    });

    return deleted;
  }

  /**
   * Invoices CRUD
   */
  static async getInvoices(clubId, { status, search } = {}) {
    let invoices = this._initInvoices(clubId);

    if (status && status !== "ALL") {
      invoices = invoices.filter((inv) => inv.status.toLowerCase() === status.toLowerCase());
    }

    if (search) {
      const term = search.toLowerCase();
      invoices = invoices.filter(
        (inv) =>
          inv.id.toLowerCase().includes(term) ||
          inv.customerName.toLowerCase().includes(term) ||
          (inv.customerEmail || "").toLowerCase().includes(term) ||
          (inv.customerPhone || "").toLowerCase().includes(term)
      );
    }

    return [...invoices].sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());
  }

  static async createInvoice(clubId, data, user) {
    const {
      customerName,
      customerEmail = "",
      customerPhone = "",
      issueDate,
      dueDate,
      items = [],
      taxRate = 18,
      notes = "",
      paymentMethod = "UPI",
    } = data;

    if (!customerName || !customerName.trim()) {
      throw new AppError("Customer name is required for invoice generation", HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    }

    if (!items || items.length === 0) {
      throw new AppError("Invoice must have at least one billable item", HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    }

    const parsedItems = items.map((item, index) => {
      const qty = Number(item.qty) || 1;
      const unitPrice = Number(item.unitPrice) || 0;
      return {
        id: `item-${index + 1}`,
        description: item.description || "General Service",
        qty,
        unitPrice,
        total: qty * unitPrice,
      };
    });

    const subtotal = parsedItems.reduce((sum, item) => sum + item.total, 0);
    const parsedTaxRate = Number(taxRate) || 0;
    const taxAmount = Math.round((subtotal * parsedTaxRate) / 100);
    const total = subtotal + taxAmount;

    const todayStr = new Date().toISOString().split("T")[0];
    const newInvoice = {
      id: getNextInvoiceId(clubId),
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      issueDate: issueDate || todayStr,
      dueDate: dueDate || todayStr,
      items: parsedItems,
      subtotal,
      taxRate: parsedTaxRate,
      taxAmount,
      total,
      status: "Pending",
      paymentMethod,
      notes: notes.trim(),
      createdBy: {
        name: user?.name || user?.firstName || "Staff",
        role: user?.role || "ACCOUNTANT",
      },
      createdAt: new Date().toISOString(),
    };

    const store = this._initInvoices(clubId);
    store.unshift(newInvoice);

    AuditService.logActivity(clubId, {
      action: `Generated Invoice #${newInvoice.id}`,
      entity: "Finance & Accounts",
      details: `Invoice for ₹${newInvoice.total.toLocaleString()} billed to ${newInvoice.customerName}`,
      user,
    });

    return newInvoice;
  }

  static async updateInvoiceStatus(clubId, id, status, paymentMethod = "UPI", user) {
    const store = this._initInvoices(clubId);
    const invoice = store.find((inv) => inv.id === id);
    if (!invoice) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }

    const prevStatus = invoice.status;
    invoice.status = status;
    invoice.updatedAt = new Date().toISOString();

    // If marked Paid, auto-record an Income transaction in the ledger
    if (status === "Paid" && prevStatus !== "Paid") {
      invoice.paidAt = new Date().toISOString();
      invoice.paymentMethod = paymentMethod || invoice.paymentMethod;

      // Create matching transaction
      await this.createTransaction(
        clubId,
        {
          type: "INCOME",
          category: "Invoice Payment",
          description: `Settlement for Invoice #${invoice.id}`,
          amount: invoice.total,
          taxRate: invoice.taxRate,
          payerPayee: invoice.customerName,
          paymentMethod: invoice.paymentMethod,
          status: "Settled",
          date: new Date().toISOString().split("T")[0],
          reference: invoice.id,
          notes: `Billed to ${invoice.customerName} (${invoice.items.length} items)`,
        },
        user
      );
    }

    AuditService.logActivity(clubId, {
      action: `Invoice #${id} Marked as ${status}`,
      entity: "Finance & Accounts",
      details: `Invoice payment status updated for ${invoice.customerName}`,
      user,
    });

    return invoice;
  }

  static async deleteInvoice(clubId, id, user) {
    const store = this._initInvoices(clubId);
    const index = store.findIndex((inv) => inv.id === id);
    if (index === -1) {
      throw new AppError("Invoice not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }

    const [deleted] = store.splice(index, 1);

    AuditService.logActivity(clubId, {
      action: `Invoice #${id} Voided & Removed`,
      entity: "Finance & Accounts",
      details: `Deleted invoice of ₹${deleted.total.toLocaleString()} for ${deleted.customerName}`,
      user,
    });

    return deleted;
  }

  /**
   * Get dynamic financial executive summary & KPIs
   */
  static async getFinanceSummary(clubId, { startDate, endDate, period = "month" } = {}) {
    // Determine date range if period given
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    let start = startDate;
    let end = endDate;

    if (!start && period) {
      if (period === "today") {
        start = todayStr;
        end = todayStr;
      } else if (period === "week") {
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        start = weekAgo.toISOString().split("T")[0];
        end = todayStr;
      } else if (period === "month") {
        const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        start = firstOfMonth.toISOString().split("T")[0];
        end = todayStr;
      } else if (period === "quarter") {
        const quarterAgo = new Date();
        quarterAgo.setMonth(now.getMonth() - 3);
        start = quarterAgo.toISOString().split("T")[0];
        end = todayStr;
      }
      // 'all' leaves start & end undefined
    }

    const allTxns = await this.getTransactions(clubId, { startDate: start, endDate: end });
    const allInvoices = await this.getInvoices(clubId);

    // Revenue = Settled Income
    const incomeTxns = allTxns.filter((t) => t.type === "INCOME");
    const expenseTxns = allTxns.filter((t) => t.type === "EXPENSE");

    const settledIncome = incomeTxns.filter((t) => t.status === "Settled");
    const settledExpenses = expenseTxns.filter((t) => t.status === "Settled");

    const totalRevenue = settledIncome.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = settledExpenses.reduce((sum, t) => sum + t.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const netMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

    // Today's collections
    const todayIncome = incomeTxns
      .filter((t) => t.date === todayStr && t.status === "Settled")
      .reduce((sum, t) => sum + t.amount, 0);

    const todayExpenses = expenseTxns
      .filter((t) => t.date === todayStr && t.status === "Settled")
      .reduce((sum, t) => sum + t.amount, 0);

    // Pending Receivables = Pending income transactions + Unpaid invoices
    const pendingIncomeAmt = incomeTxns
      .filter((t) => t.status === "Pending")
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingInvoicesAmt = allInvoices
      .filter((inv) => inv.status === "Pending")
      .reduce((sum, inv) => sum + inv.total, 0);

    const pendingReceivables = pendingIncomeAmt + pendingInvoicesAmt;

    // Revenue by Category
    const revenueByCategory = {};
    settledIncome.forEach((t) => {
      revenueByCategory[t.category] = (revenueByCategory[t.category] || 0) + t.amount;
    });

    // Expenses by Category
    const expenseByCategory = {};
    settledExpenses.forEach((t) => {
      expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + t.amount;
    });

    // Payment Methods Breakdown
    const paymentMethodBreakdown = {};
    settledIncome.forEach((t) => {
      const method = t.paymentMethod || "Other";
      paymentMethodBreakdown[method] = (paymentMethodBreakdown[method] || 0) + t.amount;
    });

    return {
      period: period || "custom",
      dateRange: { startDate: start || null, endDate: end || null },
      kpis: {
        totalRevenue,
        totalExpenses,
        netProfit,
        netMargin,
        pendingReceivables,
        todayRevenue: todayIncome,
        todayExpenses,
        transactionCount: allTxns.length,
        settledCount: settledIncome.length + settledExpenses.length,
        pendingCount: incomeTxns.filter((t) => t.status === "Pending").length + allInvoices.filter((i) => i.status === "Pending").length,
      },
      revenueByCategory,
      expenseByCategory,
      paymentMethodBreakdown,
      recentTransactions: allTxns.slice(0, 10),
      invoiceSummary: {
        totalInvoices: allInvoices.length,
        pendingInvoices: allInvoices.filter((i) => i.status === "Pending").length,
        paidInvoices: allInvoices.filter((i) => i.status === "Paid").length,
      },
    };
  }
}
