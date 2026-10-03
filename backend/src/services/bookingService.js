/**
 * Booking Service
 * Business logic for court reservations, slot allocations, and daily ledger.
 * Uses clean in-memory per-club storage.
 */

import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import { CourtService } from "./courtService.js";
import { AuditService } from "./auditService.js";

// In-memory runtime store: Map<clubId, Booking[]>
const clubBookingsState = new Map();
const clubBookingCounters = new Map();

function getNextBookingId(clubId) {
  const current = clubBookingCounters.get(clubId) || 9500;
  const next = current + 1;
  clubBookingCounters.set(clubId, next);
  return `BK-${next}`;
}

export class BookingService {
  /**
   * Initialise clean in-memory booking store for a club (empty array, NO dummy data)
   */
  static _init(clubId) {
    if (!clubBookingsState.has(clubId)) {
      clubBookingCounters.set(clubId, 9500);
      clubBookingsState.set(clubId, []);
    }
    return clubBookingsState.get(clubId);
  }

  /**
   * List bookings for a club with optional filtering
   */
  static async getBookings(clubId, { date, courtId, status, search } = {}) {
    let bookings = this._init(clubId);

    // Filter by date (YYYY-MM-DD)
    if (date) {
      bookings = bookings.filter((b) => {
        const bDate = b.date || (b.startTime ? b.startTime.split("T")[0] : "");
        return bDate === date;
      });
    }

    // Filter by court
    if (courtId && courtId !== "ALL") {
      bookings = bookings.filter(
        (b) => b.courtId === courtId || b.court?.id === courtId
      );
    }

    // Filter by status
    if (status && status !== "ALL") {
      bookings = bookings.filter(
        (b) => b.status.toLowerCase() === status.toLowerCase()
      );
    }

    // Search query
    if (search) {
      const term = search.toLowerCase();
      bookings = bookings.filter((b) => {
        const name = (b.guestName || b.member?.name || "").toLowerCase();
        const courtName = (b.court?.name || "").toLowerCase();
        const id = (b.id || "").toLowerCase();
        const phone = (b.member?.phone || "").toLowerCase();
        return (
          name.includes(term) ||
          courtName.includes(term) ||
          id.includes(term) ||
          phone.includes(term)
        );
      });
    }

    // Return chronological order by startTime
    return [...bookings].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  /**
   * Helper to get bookings for today
   */
  static getTodayBookings(clubId) {
    const todayStr = new Date().toISOString().split("T")[0];
    const bookings = this._init(clubId);
    return bookings.filter((b) => {
      const bDate = b.date || (b.startTime ? b.startTime.split("T")[0] : "");
      return bDate === todayStr;
    });
  }

  /**
   * Get single booking by ID
   */
  static async getBookingById(clubId, bookingId) {
    const bookings = this._init(clubId);
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }
    return booking;
  }

  /**
   * Create a new booking
   */
  static async createBooking(clubId, data, user = null) {
    const {
      guestName,
      phone,
      courtId,
      courtName,
      date,
      slot,
      bookingType,
      fee,
      notes = "",
      status = "Confirmed",
    } = data;

    if (!guestName || !guestName.trim()) {
      throw new AppError("Player / Guest Name is required", HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    }

    if (!slot) {
      throw new AppError("Time slot is required", HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    }

    const bookingDateStr = date || new Date().toISOString().split("T")[0];

    // Resolve court
    const courts = await CourtService.getCourts(clubId);
    let court = null;
    if (courtId) {
      court = courts.find((c) => c.id === courtId);
    }
    if (!court && courtName) {
      court = courts.find(
        (c) =>
          c.name.toLowerCase().trim() === courtName.toLowerCase().trim() ||
          c.name.toLowerCase().includes(courtName.toLowerCase())
      );
    }
    if (!court && courts.length > 0) {
      court = courts[0];
    }
    if (!court) {
      // Auto-create court if none exists or custom name provided
      court = await CourtService.createCourt(
        clubId,
        {
          name: courtName || "Court 1 - Main Court",
          sportType: "Tennis",
          surface: "Standard Hard Court",
          hourlyRate: Number(fee) || 1200,
        },
        user
      );
    }

    // Parse time slot (e.g. "08:00–09:30" or "08:00-09:30")
    const cleanSlot = slot.replace("—", "-").replace("–", "-");
    const [startPart, endPart] = cleanSlot.split("-").map((s) => s.trim());
    const [startH, startM = "00"] = (startPart || "08:00").split(":");
    const [endH, endM = "00"] = (endPart || "09:30").split(":");

    const startDateTime = new Date(`${bookingDateStr}T${startH.padStart(2, "0")}:${startM.padStart(2, "0")}:00`);
    const endDateTime = new Date(`${bookingDateStr}T${endH.padStart(2, "0")}:${endM.padStart(2, "0")}:00`);

    // Check slot collision on the same court
    const bookings = this._init(clubId);
    const hasConflict = bookings.some((b) => {
      if (b.status === "Cancelled") return false;
      const bCourtId = b.courtId || b.court?.id;
      if (bCourtId !== court.id) return false;
      const bDate = b.date || (b.startTime ? b.startTime.split("T")[0] : "");
      if (bDate !== bookingDateStr) return false;

      // Check slot overlap
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      const newStart = startDateTime.getTime();
      const newEnd = endDateTime.getTime();

      return newStart < bEnd && newEnd > bStart;
    });

    if (hasConflict) {
      throw new AppError(
        `This court (${court.name}) is already booked for the ${slot} time slot on ${bookingDateStr}.`,
        HTTP_STATUS.CONFLICT,
        "SLOT_CONFLICT"
      );
    }

    const calculatedFee =
      fee !== undefined && fee !== null && fee !== ""
        ? Number(fee)
        : court.hourlyRate || 1000;

    const newBooking = {
      id: getNextBookingId(clubId),
      courtId: court.id,
      court: {
        id: court.id,
        name: court.name,
        sportType: court.sportType,
      },
      guestName: guestName.trim(),
      member: {
        name: guestName.trim(),
        phone: phone || "+91 98000 00000",
      },
      date: bookingDateStr,
      slot: slot,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      bookingType: bookingType || `${court.sportType || "Court"} • Reservation`,
      fee: calculatedFee,
      status: status || "Confirmed",
      notes: notes || "",
      bookedBy: user?.name || "Reception Staff",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    bookings.push(newBooking);

    // Audit Log
    AuditService.logActivity(clubId, {
      action: `Court Booking Confirmed (${court.name})`,
      entity: "Court Reservations",
      details: `Player: ${newBooking.guestName} · Slot: ${newBooking.slot} · Fee: ₹${newBooking.fee}`,
      user,
    });

    return newBooking;
  }

  /**
   * Update booking status
   */
  static async updateBookingStatus(clubId, bookingId, status, user = null) {
    const validStatuses = ["Confirmed", "In Progress", "Completed", "Pending Payment", "Cancelled"];
    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid status "${status}". Allowed: ${validStatuses.join(", ")}`, HTTP_STATUS.BAD_REQUEST);
    }

    const bookings = this._init(clubId);
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }

    const oldStatus = booking.status;
    booking.status = status;
    booking.updatedAt = new Date().toISOString();

    AuditService.logActivity(clubId, {
      action: `Booking #${bookingId} marked ${status}`,
      entity: "Court Reservations",
      details: `Player: ${booking.guestName} (${booking.court?.name}) changed from ${oldStatus} to ${status}`,
      user,
    });

    return booking;
  }

  /**
   * Delete booking
   */
  static async deleteBooking(clubId, bookingId, user = null) {
    const bookings = this._init(clubId);
    const index = bookings.findIndex((b) => b.id === bookingId);
    if (index === -1) {
      throw new AppError("Booking not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }

    const [deleted] = bookings.splice(index, 1);

    AuditService.logActivity(clubId, {
      action: `Booking #${bookingId} Cancelled & Removed`,
      entity: "Court Reservations",
      details: `Removed reservation for ${deleted.guestName} on ${deleted.court?.name}`,
      user,
    });

    return deleted;
  }

  /**
   * Build live daily financial ledger from real bookings
   */
  static getDailyLedger(clubId, { date } = {}) {
    const targetDate = date || new Date().toISOString().split("T")[0];
    const bookings = this._init(clubId).filter((b) => {
      const bDate = b.date || (b.startTime ? b.startTime.split("T")[0] : "");
      return bDate === targetDate;
    });

    const rows = bookings.map((b, i) => ({
      txn: `#TXN-${b.id.replace("BK-", "")}`,
      bookingId: b.id,
      category: "Court Booking",
      desc: `Court Booking – ${b.court?.name || "Court"}`,
      player: b.guestName || "Member",
      amount: Number(b.fee) || 0,
      status: b.status,
      time: b.startTime,
    }));

    const total = rows.reduce((sum, r) => sum + r.amount, 0);
    const confirmedAmt = rows
      .filter((r) => r.status === "Confirmed" || r.status === "Completed")
      .reduce((sum, r) => sum + r.amount, 0);
    const pendingAmt = rows
      .filter((r) => r.status === "Pending Payment" || r.status === "In Progress")
      .reduce((sum, r) => sum + r.amount, 0);

    return {
      date: targetDate,
      rows,
      summary: {
        total,
        confirmedAmt,
        pendingAmt,
        transactionCount: rows.length,
      },
    };
  }
}
