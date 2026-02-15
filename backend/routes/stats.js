//backend/routes/stats.js
import express from "express";
import {
    getDailyStats,
    getTrendStats,
    getCalendarStats,
    getCategoryLimitStats,
} from "../controllers/statsController.js";

const router = express.Router();

// Get daily statistics
router.get("/daily", getDailyStats);

// Get 7-day trend
router.get("/trend", getTrendStats);

// Get calendar data (all days in month)
router.get("/calendar", getCalendarStats);

// Get category spending vs limits
router.get("/category-limits", getCategoryLimitStats);

export default router;