/**
 * Main Server File
 * Express.js server with all middleware and routes
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import env from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import { errorHandler } from "./utils/errorHandler.js";

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import clubRoutes from "./routes/clubRoutes.js";

const app = express();

// =====================================
// Middleware
// =====================================

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Cookie parser
app.use(cookieParser());

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// =====================================
// Routes
// =====================================

// Health check
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Champions Club Sports Management API",
    version: "1.0.0",
    environment: env.NODE_ENV,
  });
});

// API routes
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/club", clubRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// =====================================
// Start Server
// =====================================

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Start listening
    app.listen(env.PORT, () => {
      console.log(`\n🚀 Server running on port ${env.PORT}`);
      console.log(`📍 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 CORS Origin: ${env.CORS_ORIGIN}`);
      console.log(`\n✅ Server is ready to accept requests\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
