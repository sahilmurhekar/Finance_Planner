import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import authRoutes from "../routes/auth.js";
import userRoutes from "../routes/user.js";
import expenseRoutes from "../routes/expenses.js";
import categoryRoutes from "../routes/categories.js";
import statsRoutes from "../routes/stats.js";
import mutualFundRoutes from "../routes/mutualFunds.js";
import cryptoRoutes from "../routes/crypto.js";
import dashboardRoutes from "../routes/dashboard.js";
import walletIntegrationRoutes from "../routes/walletIntegration.js";
import binanceRoutes from "../routes/binance.js";
import { verifyJWT } from "../middleware/auth.js";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json());

/* ---------------- MongoDB Connection (Serverless Safe) ---------------- */

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(process.env.MONGODB_URI, {
        dbName: "FINANCE_DB",
      })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// Middleware to ensure DB connection
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

/* ---------------- Routes ---------------- */

// Public
app.use("/api/auth", authRoutes);

// Protected
const protectedRouter = express.Router();
protectedRouter.use(verifyJWT);
protectedRouter.use("/user", userRoutes);
protectedRouter.use("/expenses", expenseRoutes);
protectedRouter.use("/categories", categoryRoutes);
protectedRouter.use("/stats", statsRoutes);
protectedRouter.use("/mutual-funds", mutualFundRoutes);
protectedRouter.use("/crypto", cryptoRoutes);
protectedRouter.use("/dashboard", dashboardRoutes);
protectedRouter.use("/wallet-integration", walletIntegrationRoutes);
protectedRouter.use("/binance", binanceRoutes);

app.use("/api", protectedRouter);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

export default app;
