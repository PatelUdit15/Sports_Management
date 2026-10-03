/**
 * Public & Member Service
 * Manages public sports club discovery, membership plans, member accounts,
 * payment confirmation, and club-specific Member ID generation.
 */

import prisma from "../config/database.js";
import bcrypt from "bcryptjs";

// Standard SaaS membership tiers for clubs
export const CLUB_TIERS = {
  GOLD: {
    tier: "GOLD",
    name: "Gold All-Access VIP",
    price: 4999,
    period: "month",
    badge: "Most Popular • VIP",
    color: "#F59E0B", // gold
    accent: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
    features: [
      "Unlimited Court Bookings (All Sports & Times)",
      "Priority Peak Hour Reservation (7 days ahead)",
      "Heated Olympic Pool & State-of-the-Art Gym",
      "Personal Coaching & Fitness Consultation (2/mo)",
      "25% Discount at Skyline Sports Cafe & Pro Shop",
      "VIP Lounge & Spa Access with 2 Free Guest Passes",
    ],
  },
  SILVER: {
    tier: "SILVER",
    name: "Silver Court & Fitness",
    price: 2999,
    period: "month",
    badge: "Best Value",
    color: "#94A3B8", // silver
    accent: "linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)",
    features: [
      "Standard & Peak Court Access (2 hrs/day)",
      "Advance Court Booking (3 days ahead)",
      "Full Gym, Weights & Cardio Center Access",
      "Locker Room, Steam & Sauna Privileges",
      "10% Discount at Pro Shop & Cafe Counter",
    ],
  },
  BRONZE: {
    tier: "BRONZE",
    name: "Bronze Social Play",
    price: 1499,
    period: "month",
    badge: "Essential",
    color: "#D97706", // bronze
    accent: "linear-gradient(135deg, #F97316 0%, #B45309 100%)",
    features: [
      "Off-Peak Court Access (Weekdays 6am-4pm)",
      "Standard Locker Room Facilities",
      "Invitations to Club Social Nights & Tournaments",
      "Digital Member ID Card & Booking App Access",
    ],
  },
};

/**
 * Generate a unique club-specific Member ID
 * Example format: SSC-GLD-8421 or CLUB-SIL-3912
 */
export const generateClubMemberId = (clubName, tier) => {
  // Determine prefix from club name
  let prefix = "SSC";
  if (clubName) {
    const words = clubName.replace(/[^a-zA-Z\s]/g, "").trim().split(/\s+/);
    if (words.length >= 2) {
      prefix = (words[0][0] + words[1][0] + (words[2] ? words[2][0] : "C")).toUpperCase();
    } else if (words.length === 1 && words[0].length >= 3) {
      prefix = words[0].slice(0, 3).toUpperCase();
    }
  }

  const tierCode = (tier || "MEM").slice(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);

  return `${prefix}-${tierCode}-${year}-${randomSuffix}`;
};

export class PublicService {
  /**
   * Get all connected sports clubs and their Gold/Silver/Bronze membership plans
   */
  static async getClubs() {
    const clubs = await prisma.club.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      include: {
        moduleConfiguration: true,
      },
    });

    // Ensure flagship club is at top
    clubs.sort((a, b) => {
      const aIsFlagship = a.name.toLowerCase().includes("skyline") || a.clubId === "CLUB-SKYLINE-FLAGSHIP";
      const bIsFlagship = b.name.toLowerCase().includes("skyline") || b.clubId === "CLUB-SKYLINE-FLAGSHIP";
      if (aIsFlagship && !bIsFlagship) return -1;
      if (!aIsFlagship && bIsFlagship) return 1;
      return 0;
    });

    return clubs.map((club) => ({
      id: club.id,
      clubId: club.clubId,
      name: club.name,
      address: club.address,
      email: club.email,
      phone: club.phone,
      sport: club.sport || "Multi-Sport Arena",
      website: club.website || "https://skylinesports.com",
      isFlagship: club.name.toLowerCase().includes("skyline") || club.clubId === "CLUB-SKYLINE-FLAGSHIP",
      tiers: [
        { ...CLUB_TIERS.GOLD },
        { ...CLUB_TIERS.SILVER },
        { ...CLUB_TIERS.BRONZE },
      ],
    }));
  }

  /**
   * Register a new member / user
   */
  static async registerMember({ fullName, email, password, phone, age, birthday, gender }) {
    if (!email || !fullName) {
      const err = new Error("Full name and email are required");
      err.statusCode = 400;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists in members table
    const existing = await prisma.$queryRawUnsafe(
      "SELECT id, email, full_name FROM members WHERE LOWER(email) = $1 LIMIT 1",
      cleanEmail
    );

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    let parsedAge = null;
    if (age) {
      parsedAge = parseInt(age, 10) || null;
    }

    let memberRecord;
    if (existing && existing.length > 0) {
      // Update existing record
      await prisma.$executeRawUnsafe(
        `UPDATE members 
         SET full_name = $1, password = COALESCE($2, password), phone = $3, age = $4, birthday = $5, gender = $6, updated_at = NOW()
         WHERE id = $7`,
        fullName.trim(),
        hashedPassword,
        phone || null,
        parsedAge,
        birthday || null,
        gender || null,
        existing[0].id
      );

      memberRecord = {
        id: existing[0].id,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: phone || "",
        age: parsedAge,
        birthday: birthday || "",
        gender: gender || "",
      };
    } else {
      // Create provisional member record
      const tempId = `PROV-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const result = await prisma.$queryRawUnsafe(
        `INSERT INTO members (member_id, club_id, full_name, email, password, phone, age, birthday, gender, membership_tier, membership_plan, amount_paid, status, start_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), NOW())
         RETURNING id, member_id, full_name, email, phone, age, birthday, gender`,
        tempId,
        "PENDING_SELECTION",
        fullName.trim(),
        cleanEmail,
        hashedPassword,
        phone || null,
        parsedAge,
        birthday || null,
        gender || null,
        "PENDING",
        "None",
        0,
        "PENDING_MEMBERSHIP"
      );

      memberRecord = result[0];
    }

    return {
      success: true,
      message: `Account created successfully! Welcome, ${memberRecord.full_name || fullName}!`,
      user: {
        id: memberRecord.id,
        fullName: memberRecord.full_name || fullName.trim(),
        email: cleanEmail,
        phone: memberRecord.phone || phone || "",
        age: parsedAge,
        birthday: birthday || "",
        gender: gender || "",
      },
    };
  }

  /**
   * Authenticate member by email and password
   */
  static async loginMember({ email, password }) {
    if (!email || !password) {
      const err = new Error("Email and password are required");
      err.statusCode = 400;
      throw err;
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check members table
    const members = await prisma.$queryRawUnsafe(
      "SELECT * FROM members WHERE LOWER(email) = $1 ORDER BY id DESC LIMIT 1",
      cleanEmail
    );

    if (!members || members.length === 0) {
      const err = new Error("Account not found with this email. Please create an account.");
      err.statusCode = 404;
      throw err;
    }

    const member = members[0];
    if (member.password) {
      const valid = await bcrypt.compare(password, member.password);
      if (!valid) {
        const err = new Error("Invalid password");
        err.statusCode = 401;
        throw err;
      }
    }

    return {
      success: true,
      message: "Login successful",
      user: {
        id: member.id,
        memberId: member.member_id,
        fullName: member.full_name,
        email: member.email,
        phone: member.phone,
        age: member.age,
        birthday: member.birthday,
        gender: member.gender,
        clubId: member.club_id,
        membershipTier: member.membership_tier,
        status: member.status,
      },
    };
  }

  /**
   * Confirm payment, assign club membership, and generate Member ID in database
   */
  static async confirmPayment({
    email,
    fullName,
    phone,
    age,
    birthday,
    gender,
    clubId,
    tier,
    amount,
    paymentMethod,
    transactionRef,
  }) {
    if (!clubId || !tier) {
      const err = new Error("Club ID and Membership Tier are required");
      err.statusCode = 400;
      throw err;
    }

    // Verify club exists
    const club = await prisma.club.findFirst({
      where: { clubId: clubId },
    });

    if (!club) {
      const err = new Error("Selected sports club does not exist");
      err.statusCode = 404;
      throw err;
    }

    const cleanEmail = (email || "member@skylinesports.com").trim().toLowerCase();
    const cleanName = (fullName || "Sports Club Member").trim();
    const cleanTier = tier.toUpperCase();
    const tierConfig = CLUB_TIERS[cleanTier] || CLUB_TIERS.GOLD;
    const finalAmount = parseFloat(amount) || tierConfig.price;

    // Generate unique official Member ID for this club
    const officialMemberId = generateClubMemberId(club.name, cleanTier);
    const paymentId = `PAY-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef = transactionRef || `TXN-SKY-${Math.floor(100000 + Math.random() * 900000)}`;

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // 30-day membership validity

    // Check if member already has a record by email
    const existing = await prisma.$queryRawUnsafe(
      "SELECT id FROM members WHERE LOWER(email) = $1 LIMIT 1",
      cleanEmail
    );

    let memberDbId;
    if (existing && existing.length > 0) {
      memberDbId = existing[0].id;
      await prisma.$executeRawUnsafe(
        `UPDATE members
         SET member_id = $1,
             club_id = $2,
             full_name = $3,
             membership_tier = $4,
             membership_plan = $5,
             amount_paid = $6,
             status = 'ACTIVE',
             start_date = $7,
             end_date = $8,
             phone = COALESCE($9, phone),
             updated_at = NOW()
         WHERE id = $10`,
        officialMemberId,
        club.clubId,
        cleanName,
        cleanTier,
        tierConfig.name,
        finalAmount,
        startDate,
        endDate,
        phone || null,
        memberDbId
      );
    } else {
      const created = await prisma.$queryRawUnsafe(
        `INSERT INTO members (member_id, club_id, full_name, email, phone, age, birthday, gender, membership_tier, membership_plan, amount_paid, status, start_date, end_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'ACTIVE', $12, $13, NOW(), NOW())
         RETURNING id`,
        officialMemberId,
        club.clubId,
        cleanName,
        cleanEmail,
        phone || null,
        age ? parseInt(age, 10) : null,
        birthday || null,
        gender || null,
        cleanTier,
        tierConfig.name,
        finalAmount,
        startDate,
        endDate
      );
      memberDbId = created[0].id;
    }

    // Record payment
    await prisma.$executeRawUnsafe(
      `INSERT INTO member_payments (payment_id, member_id, club_id, amount, plan_tier, payment_method, status, transaction_ref, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'COMPLETED', $7, NOW())`,
      paymentId,
      officialMemberId,
      club.clubId,
      finalAmount,
      cleanTier,
      paymentMethod || "CARD",
      txRef
    );

    return {
      success: true,
      message: `Payment confirmed! Welcome to ${club.name}.`,
      membership: {
        memberId: officialMemberId,
        fullName: cleanName,
        email: cleanEmail,
        club: {
          clubId: club.clubId,
          name: club.name,
          sport: club.sport,
          address: club.address,
        },
        tier: cleanTier,
        planName: tierConfig.name,
        amountPaid: finalAmount,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "ACTIVE",
        payment: {
          paymentId,
          transactionRef: txRef,
          paymentMethod: paymentMethod || "CARD",
          paidAt: startDate.toISOString(),
        },
      },
    };
  }

  /**
   * Get member pass details by Member ID
   */
  static async getMemberPass(memberId) {
    const records = await prisma.$queryRawUnsafe(
      `SELECT m.*, c.name as club_name, c.sport as club_sport, c.address as club_address
       FROM members m
       JOIN clubs c ON m.club_id = c.club_id
       WHERE m.member_id = $1
       LIMIT 1`,
      memberId
    );

    if (!records || records.length === 0) {
      const err = new Error("Member not found");
      err.statusCode = 404;
      throw err;
    }

    const m = records[0];
    const tierConfig = CLUB_TIERS[m.membership_tier] || CLUB_TIERS.GOLD;

    return {
      memberId: m.member_id,
      fullName: m.full_name,
      email: m.email,
      phone: m.phone,
      tier: m.membership_tier,
      planName: m.membership_plan || tierConfig.name,
      status: m.status,
      startDate: m.start_date,
      endDate: m.end_date,
      club: {
        clubId: m.club_id,
        name: m.club_name,
        sport: m.club_sport,
        address: m.club_address,
      },
      perks: tierConfig.features,
    };
  }
}
