//backend/routes/dashboard.js
import express from "express";
import {
    getDashboardStats,
    getMonthlyGrowthTrend,
} from "../controllers/dashboardController.js";

const router = express.Router();

// Get complete dashboard statistics
router.get("/stats", getDashboardStats);

// Get monthly growth trend (last 6 months)
router.get("/monthly-trend", getMonthlyGrowthTrend);

export default router;