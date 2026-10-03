/**
 * Audit Service
 * Central audit logging for club activities (court operations, reservations, finance, security)
 * Uses in-memory per-club storage.
 */

const clubAuditLogs = new Map();
const clubAuditCounters = new Map();

function getNextId(clubId) {
  const current = clubAuditCounters.get(clubId) || 100;
  const next = current + 1;
  clubAuditCounters.set(clubId, next);
  return `ACT-${next}`;
}

export class AuditService {
  /**
   * Initialise clean in-memory audit store for a club
   */
  static _init(clubId) {
    if (!clubAuditLogs.has(clubId)) {
      clubAuditCounters.set(clubId, 100);
      clubAuditLogs.set(clubId, []);
    }
    return clubAuditLogs.get(clubId);
  }

  /**
   * Record a new audit log
   */
  static logActivity(clubId, { action, entity = "Operations", details = "", user = null }) {
    if (!clubId) return null;
    const logs = this._init(clubId);

    const logEntry = {
      id: getNextId(clubId),
      action,
      entity,
      details,
      createdAt: new Date().toISOString(),
      user: {
        name: user?.name || user?.firstName || "Staff",
        role: user?.role || "RECEPTIONIST",
      },
    };

    logs.unshift(logEntry); // Newest first

    // Keep up to 200 logs per club in memory
    if (logs.length > 200) {
      logs.length = 200;
    }

    return logEntry;
  }

  /**
   * Get audit logs with optional filter and search
   */
  static getAuditLogs(clubId, { entity, search, limit = 50 } = {}) {
    let logs = this._init(clubId);

    if (entity && entity !== "ALL") {
      logs = logs.filter(
        (l) => l.entity.toLowerCase() === entity.toLowerCase()
      );
    }

    if (search) {
      const term = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.action.toLowerCase().includes(term) ||
          l.entity.toLowerCase().includes(term) ||
          (l.details || "").toLowerCase().includes(term) ||
          (l.user?.name || "").toLowerCase().includes(term)
      );
    }

    return logs.slice(0, limit);
  }
}
