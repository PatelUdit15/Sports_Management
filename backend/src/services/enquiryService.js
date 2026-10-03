/**
 * Enquiry Service
 * Business logic for CRM enquiries — trial requests, membership queries, etc.
 * Uses in-memory store per club (same pattern as StaffService).
 */

import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";

// In-memory runtime store: Map<clubId, Enquiry[]>
const clubEnquiriesState = new Map();

// Auto-incrementing ID counter per club
const clubIdCounters = new Map();

function getNextId(clubId) {
  const current = clubIdCounters.get(clubId) || 200;
  const next = current + 1;
  clubIdCounters.set(clubId, next);
  return `ENQ-${next}`;
}

export class EnquiryService {
  /**
   * Initialise clean in-memory storage for a club (runs once per club)
   */
  static _init(clubId) {
    if (!clubEnquiriesState.has(clubId)) {
      clubIdCounters.set(clubId, 100);
      clubEnquiriesState.set(clubId, []);
    }
    return clubEnquiriesState.get(clubId);
  }

  /**
   * List all enquiries for a club
   */
  static async getEnquiries(clubId, { status, search } = {}) {
    let enquiries = this._init(clubId);

    // Filter by status
    if (status && status !== "ALL") {
      enquiries = enquiries.filter(
        (e) => e.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Search by name, phone, email, sport, or type
    if (search) {
      const term = search.toLowerCase();
      enquiries = enquiries.filter(
        (e) =>
          (e.name || "").toLowerCase().includes(term) ||
          (e.phone || "").includes(term) ||
          (e.email || "").toLowerCase().includes(term) ||
          (e.sport || "").toLowerCase().includes(term) ||
          (e.type || "").toLowerCase().includes(term)
      );
    }

    // Return newest first
    return [...enquiries].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  /**
   * Get summary KPI counts
   */
  static async getStats(clubId) {
    const all = this._init(clubId);
    return {
      total: all.length,
      new: all.filter((e) => e.status === "New").length,
      contacted: all.filter((e) => e.status === "Contacted").length,
      converted: all.filter((e) => e.status === "Converted").length,
      closed: all.filter((e) => e.status === "Closed").length,
    };
  }

  /**
   * Create a new enquiry
   */
  static async createEnquiry(clubId, data, updatedBy = "Staff") {
    const { name, phone, email, sport, type, source, notes } = data;

    if (!name || !phone) {
      throw new AppError(
        "Name and phone number are required.",
        HTTP_STATUS.BAD_REQUEST,
        "VALIDATION_ERROR"
      );
    }

    const enquiries = this._init(clubId);
    const now = new Date().toISOString();
    const initialNote = (notes || "").trim();

    const newEnquiry = {
      id: getNextId(clubId),
      name: name.trim(),
      email: (email || "").trim(),
      phone: phone.trim(),
      sport: (sport || "General").trim(),
      type: (type || "General Enquiry").trim(),
      source: (source || "Walk-in").trim(),
      notes: initialNote,
      status: "New",
      conversationLog: [
        {
          id: `LOG-${Date.now()}`,
          fromStatus: null,
          toStatus: "New",
          description: initialNote || "Lead initially logged into system",
          updatedBy,
          timestamp: now,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    enquiries.unshift(newEnquiry);
    return newEnquiry;
  }

  /**
   * Update enquiry status (New → Contacted → Converted / Closed)
   * Forward-only flow: Once a status advances, it cannot be reversed.
   * Mandatory description required when changing status to Contacted, Converted, or Closed.
   */
  static async updateEnquiryStatus(clubId, enquiryId, status, notes, updatedBy = "Staff") {
    const validStatuses = ["New", "Contacted", "Converted", "Closed"];
    if (!validStatuses.includes(status)) {
      throw new AppError(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
        HTTP_STATUS.BAD_REQUEST,
        "VALIDATION_ERROR"
      );
    }

    const enquiries = this._init(clubId);
    const idx = enquiries.findIndex((e) => e.id === enquiryId);

    if (idx === -1) {
      throw new AppError("Enquiry not found.", HTTP_STATUS.NOT_FOUND);
    }

    const prevStatus = enquiries[idx].status;

    // Forward-only status flow definition
    const ALLOWED_STATUS_TRANSITIONS = {
      New: ["Contacted", "Converted", "Closed"],
      Contacted: ["Converted", "Closed"],
      Converted: [],
      Closed: [],
    };

    // If changing to a different status, verify that it moves forward only
    if (status !== prevStatus) {
      const allowedNext = ALLOWED_STATUS_TRANSITIONS[prevStatus] || [];
      if (!allowedNext.includes(status)) {
        throw new AppError(
          `Status flow cannot be reversed. An enquiry in "${prevStatus}" cannot be changed to "${status}".`,
          HTTP_STATUS.BAD_REQUEST,
          "INVALID_STATUS_TRANSITION"
        );
      }
    }

    const trimmedNotes = typeof notes === "string" ? notes.trim() : "";

    // Require description for Contacted, Converted, and Closed
    if (["Contacted", "Converted", "Closed"].includes(status)) {
      if (!trimmedNotes) {
        let msg = "A description of the conversation with the customer is required.";
        if (status === "Contacted") {
          msg = "Please provide a description of what conversation you had with the customer.";
        } else if (status === "Converted") {
          msg = "Please provide details regarding the conversion (agreed plan, package, or trial outcome).";
        } else if (status === "Closed") {
          msg = "Please provide a reason/description for closing this enquiry.";
        }
        throw new AppError(msg, HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
      }
    }

    const now = new Date().toISOString();

    enquiries[idx].status = status;
    enquiries[idx].updatedAt = now;
    if (trimmedNotes) {
      enquiries[idx].notes = trimmedNotes;
    }

    if (!Array.isArray(enquiries[idx].conversationLog)) {
      enquiries[idx].conversationLog = [];
    }

    enquiries[idx].conversationLog.unshift({
      id: `LOG-${Date.now()}`,
      fromStatus: prevStatus,
      toStatus: status,
      description: trimmedNotes || `Status updated to ${status}`,
      updatedBy,
      timestamp: now,
    });

    return enquiries[idx];
  }

  /**
   * Delete an enquiry
   */
  static async deleteEnquiry(clubId, enquiryId) {
    const enquiries = this._init(clubId);
    const idx = enquiries.findIndex((e) => e.id === enquiryId);

    if (idx === -1) {
      throw new AppError("Enquiry not found.", HTTP_STATUS.NOT_FOUND);
    }

    const [deleted] = enquiries.splice(idx, 1);
    return deleted;
  }
}
