/**
 * Finance Controller
 * HTTP handlers for finance ledger, summary KPIs, manual transactions, and invoices
 */

import { FinanceService } from "../services/financeService.js";
import { HTTP_STATUS } from "../config/constants.js";

export class FinanceController {
  /**
   * GET /api/finance/summary
   */
  static async getSummary(req, res, next) {
    try {
      const { startDate, endDate, period } = req.query;
      const summary = await FinanceService.getFinanceSummary(req.clubId, {
        startDate,
        endDate,
        period,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Financial summary calculated successfully",
        data: summary,
        ...summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/finance/transactions
   */
  static async getTransactions(req, res, next) {
    try {
      const { type, category, status, paymentMethod, startDate, endDate, period, search } = req.query;
      const transactions = await FinanceService.getTransactions(req.clubId, {
        type,
        category,
        status,
        paymentMethod,
        startDate,
        endDate,
        period,
        search,
      });

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Transactions retrieved successfully",
        data: { transactions },
        transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/finance/transactions/:id
   */
  static async getTransactionById(req, res, next) {
    try {
      const transaction = await FinanceService.getTransactionById(req.clubId, req.params.id);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        data: { transaction },
        transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/finance/transactions
   */
  static async createTransaction(req, res, next) {
    try {
      const transaction = await FinanceService.createTransaction(req.clubId, req.body, req.user);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Transaction recorded successfully",
        data: { transaction },
        transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/finance/transactions/:id/status
   */
  static async updateTransactionStatus(req, res, next) {
    try {
      const { status } = req.body;
      const transaction = await FinanceService.updateTransactionStatus(
        req.clubId,
        req.params.id,
        status,
        req.user
      );

      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Transaction status updated to ${status}`,
        data: { transaction },
        transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/finance/transactions/:id
   */
  static async deleteTransaction(req, res, next) {
    try {
      const deleted = await FinanceService.deleteTransaction(req.clubId, req.params.id, req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Transaction deleted successfully",
        data: { transaction: deleted },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/finance/invoices
   */
  static async getInvoices(req, res, next) {
    try {
      const { status, search } = req.query;
      const invoices = await FinanceService.getInvoices(req.clubId, { status, search });
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Invoices retrieved successfully",
        data: { invoices },
        invoices,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/finance/invoices
   */
  static async createInvoice(req, res, next) {
    try {
      const invoice = await FinanceService.createInvoice(req.clubId, req.body, req.user);
      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: "Invoice created successfully",
        data: { invoice },
        invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/finance/invoices/:id/status
   */
  static async updateInvoiceStatus(req, res, next) {
    try {
      const { status, paymentMethod } = req.body;
      const invoice = await FinanceService.updateInvoiceStatus(
        req.clubId,
        req.params.id,
        status,
        paymentMethod,
        req.user
      );
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: `Invoice marked as ${status}`,
        data: { invoice },
        invoice,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/finance/invoices/:id
   */
  static async deleteInvoice(req, res, next) {
    try {
      const deleted = await FinanceService.deleteInvoice(req.clubId, req.params.id, req.user);
      return res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Invoice cancelled and removed",
        data: { invoice: deleted },
      });
    } catch (error) {
      next(error);
    }
  }
}
