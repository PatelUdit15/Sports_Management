/**
 * Finance Routes
 * Endpoints for financial ledger, metrics summary, manual transactions, and invoices
 */

import express from "express";
import { FinanceController } from "../controllers/financeController.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorizeRole } from "../middleware/authorizeRole.js";
import { ROLES } from "../config/constants.js";

const router = express.Router();

// All finance endpoints require valid session authentication and SUPER_ADMIN or ACCOUNTANT role
router.use(authenticate);
router.use(authorizeRole(ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT));

// Financial summary KPIs & metrics
router.get("/summary", FinanceController.getSummary);

// Transactions Ledger endpoints
router.get("/transactions", FinanceController.getTransactions);
router.get("/transactions/:id", FinanceController.getTransactionById);
router.post("/transactions", FinanceController.createTransaction);
router.patch("/transactions/:id/status", FinanceController.updateTransactionStatus);
router.delete("/transactions/:id", FinanceController.deleteTransaction);

// Invoices & Billing endpoints
router.get("/invoices", FinanceController.getInvoices);
router.post("/invoices", FinanceController.createInvoice);
router.patch("/invoices/:id/status", FinanceController.updateInvoiceStatus);
router.delete("/invoices/:id", FinanceController.deleteInvoice);

export default router;
