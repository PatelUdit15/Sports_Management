/**
 * Environment Configuration
 * Load and validate environment variables
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseInt(process.env.PORT, 10) || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET || "default_secret_change_in_production",
  JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS, 10) || 10,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
};

// Validate required environment variables
const requiredEnvVars = ["DATABASE_URL", "JWT_SECRET"];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.warn(`⚠️  Warning: ${envVar} is not set in environment variables`);
  }
}

export default env;
