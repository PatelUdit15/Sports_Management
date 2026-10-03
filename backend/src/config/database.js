/**
 * Database Configuration
 * Prisma Client initialization
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});

// Test database connection
export const connectDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("✅ PostgreSQL Connected via Prisma");
    console.log(`📊 Database: skyline_sportsclub`);
  } catch (error) {
    console.error("❌ PostgreSQL connection failed:", error.message);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
  console.log("🔌 Prisma disconnected");
});

export default prisma;
