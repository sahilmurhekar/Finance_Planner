//backend/server.js (UPDATED WITH WALLET INTEGRATION)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import expenseRoutes from "./routes/expenses.js";
import categoryRoutes from "./routes/categories.js";
import statsRoutes from "./routes/stats.js";
import mutualFundRoutes from "./routes/mutualFunds.js";
import cryptoRoutes from "./routes/crypto.js";
import dashboardRoutes from "./routes/dashboard.js";
import walletIntegrationRoutes from "./routes/walletIntegration.js";
import binanceRoutes from "./routes/binance.js";
import { verifyJWT } from "./middleware/auth.js";

dotenv.config();

const app = express();

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://127.0.0.1:5173",
        credentials: true,
    })
);
app.use(express.json());

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI, {
        dbName: "FINANCE_DB",
    })
    .then(() => console.log("✔ MongoDB connected to FINANCE_DB"))
    .catch((err) => {
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    });

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
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

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✔ Server running on port ${PORT}`));