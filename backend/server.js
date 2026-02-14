//backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import { verifyJWT } from "./middleware/auth.js";

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET || !process.env.PIN_CODE) {
    console.error("Missing required environment variables: JWT_SECRET, PIN_CODE");
    process.exit(1);
}

const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

// Public routes
app.use("/api/auth", authRoutes);

// Protected routes
const protectedRouter = express.Router();
protectedRouter.use(verifyJWT);

app.use("/api", protectedRouter);

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
});