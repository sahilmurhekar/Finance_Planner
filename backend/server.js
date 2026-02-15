//backend/server.js (UPDATED)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import { verifyJWT } from "./middleware/auth.js";

dotenv.config();

if (!process.env.JWT_SECRET || !process.env.PIN_CODE || !process.env.MONGODB_URI) {
    console.error("Missing required env vars: JWT_SECRET, PIN_CODE, MONGODB_URI");
    process.exit(1);
}

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    dbName: "FINANCE_DB"
})
    .then(() => console.log("✓ MongoDB connected to FINANCE_DB"))
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

app.use("/api", protectedRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));