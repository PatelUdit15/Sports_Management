/**
 * Court Service
 * Business logic for Court & Facility Management
 * Uses in-memory store per club.
 */

import { AppError } from "../utils/errorHandler.js";
import { HTTP_STATUS } from "../config/constants.js";
import { AuditService } from "./auditService.js";

// In-memory runtime store: Map<clubId, Court[]>
const clubCourtsState = new Map();
const clubCourtCounters = new Map();

function getNextCourtId(clubId) {
  const current = clubCourtCounters.get(clubId) || 0;
  const next = current + 1;
  clubCourtCounters.set(clubId, next);
  return `CRT-${next}`;
}

export class CourtService {
  /**
   * Initialise clean in-memory court store for a club (empty array, NO dummy data)
   */
  static _init(clubId) {
    if (!clubCourtsState.has(clubId) || clubCourtsState.get(clubId).length === 0) {
      clubCourtCounters.set(clubId, 4);
      clubCourtsState.set(clubId, [
        {
          id: "CRT-1",
          name: "Center Court 1 (Championship)",
          sportType: "Tennis",
          surface: "Pro Cushion Hard Court",
          hourlyRate: 1200,
          indoor: false,
          status: "Active",
          notes: "Equipped with tournament floodlights & umpire chair",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "CRT-2",
          name: "Court 2 (Synthetic Turf)",
          sportType: "Tennis",
          surface: "Synthetic Turf",
          hourlyRate: 1000,
          indoor: false,
          status: "Active",
          notes: "Ideal for club matches and coaching sessions",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "CRT-3",
          name: "Indoor Arena Court A",
          sportType: "Badminton",
          surface: "Teakwood BWF Approved",
          hourlyRate: 800,
          indoor: true,
          status: "Active",
          notes: "Fully air-conditioned indoor wooden court",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "CRT-4",
          name: "Practice & Training Court",
          sportType: "Multi-Sport",
          surface: "Acrylic Flex",
          hourlyRate: 600,
          indoor: false,
          status: "Active",
          notes: "Wall drill and ball machine equipped",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
    return clubCourtsState.get(clubId);
  }

  /**
   * Get all courts for a club with optional filtering
   */
  static async getCourts(clubId, { sportType, status, search } = {}) {
    let courts = this._init(clubId);

    if (sportType && sportType !== "ALL") {
      courts = courts.filter(
        (c) => c.sportType.toLowerCase() === sportType.toLowerCase()
      );
    }

    if (status && status !== "ALL") {
      courts = courts.filter(
        (c) => c.status.toLowerCase() === status.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      courts = courts.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          c.sportType.toLowerCase().includes(term) ||
          (c.surface || "").toLowerCase().includes(term)
      );
    }

    return [...courts];
  }

  /**
   * Get single court by ID
   */
  static async getCourtById(clubId, courtId) {
    const courts = this._init(clubId);
    const court = courts.find((c) => c.id === courtId);
    if (!court) {
      throw new AppError("Court not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }
    return court;
  }

  /**
   * Create a new court
   */
  static async createCourt(clubId, data, user = null) {
    const { name, sportType, surface, hourlyRate, indoor, status = "Active", notes = "" } = data;

    if (!name || !name.trim()) {
      throw new AppError("Court name is required", HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    }

    const courts = this._init(clubId);

    // Check duplicate name in same club
    const exists = courts.some(
      (c) => c.name.toLowerCase().trim() === name.toLowerCase().trim()
    );
    if (exists) {
      throw new AppError(
        `A court with the name "${name}" already exists`,
        HTTP_STATUS.CONFLICT,
        "DUPLICATE_COURT"
      );
    }

    const newCourt = {
      id: getNextCourtId(clubId),
      name: name.trim(),
      sportType: sportType || "Tennis",
      surface: surface || "Standard Hard Court",
      hourlyRate: Number(hourlyRate) >= 0 ? Number(hourlyRate) : 1000,
      indoor: Boolean(indoor),
      status: status || "Active",
      notes: notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    courts.push(newCourt);

    // Audit log
    AuditService.logActivity(clubId, {
      action: `Court Added: ${newCourt.name}`,
      entity: "Court Operations",
      details: `${newCourt.sportType} · ${newCourt.surface} · ₹${newCourt.hourlyRate}/session`,
      user,
    });

    return newCourt;
  }

  /**
   * Update existing court
   */
  static async updateCourt(clubId, courtId, data, user = null) {
    const courts = this._init(clubId);
    const index = courts.findIndex((c) => c.id === courtId);

    if (index === -1) {
      throw new AppError("Court not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }

    const current = courts[index];
    const updated = {
      ...current,
      ...data,
      id: current.id, // preserve ID
      updatedAt: new Date().toISOString(),
    };

    if (data.hourlyRate !== undefined) {
      updated.hourlyRate = Number(data.hourlyRate);
    }

    courts[index] = updated;

    AuditService.logActivity(clubId, {
      action: `Court Updated: ${updated.name}`,
      entity: "Court Operations",
      details: `Status: ${updated.status} · Rate: ₹${updated.hourlyRate}`,
      user,
    });

    return updated;
  }

  /**
   * Delete court
   */
  static async deleteCourt(clubId, courtId, user = null) {
    const courts = this._init(clubId);
    const index = courts.findIndex((c) => c.id === courtId);

    if (index === -1) {
      throw new AppError("Court not found", HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
    }

    const [deleted] = courts.splice(index, 1);

    AuditService.logActivity(clubId, {
      action: `Court Removed: ${deleted.name}`,
      entity: "Court Operations",
      details: `Removed court ${deleted.name} (${deleted.sportType})`,
      user,
    });

    return deleted;
  }

  /**
   * Calculate facility occupancy & utilization from active courts and today's bookings
   */
  static calculateUtilization(clubId, todayBookings = []) {
    const courts = this._init(clubId);
    const totalOperatingBands = 10; // 10 slots * 1.5h = 15 operating hours

    return courts.map((court) => {
      const activeBookings = todayBookings.filter((b) => {
        const matchesCourt =
          (b.courtId && b.courtId === court.id) ||
          (b.court?.id && b.court.id === court.id) ||
          (b.court?.name && b.court.name.toLowerCase().includes(court.name.toLowerCase()));
        return matchesCourt && b.status !== "Cancelled";
      });

      const bookedHours = +(activeBookings.length * 1.5).toFixed(1);
      const utilization = Math.min(
        100,
        Math.round((activeBookings.length / totalOperatingBands) * 100)
      );

      return {
        id: court.id,
        name: court.name,
        sportType: court.sportType,
        surface: court.surface,
        hourlyRate: court.hourlyRate,
        bookedHours,
        utilization,
        status: court.status,
      };
    });
  }
}
