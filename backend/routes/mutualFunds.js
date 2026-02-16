//backend/routes/mutualFunds.js
import express from "express";
import {
    getMutualFunds,
    createMutualFund,
    updateMutualFund,
    deleteMutualFund,
    refreshAllNAVs,
} from "../controllers/mutualFundController.js";

const router = express.Router();

// Get all mutual funds
router.get("/", getMutualFunds);

// Create new mutual fund
router.post("/", createMutualFund);

// Update mutual fund
router.put("/:id", updateMutualFund);

// Delete mutual fund
router.delete("/:id", deleteMutualFund);

// Refresh all NAVs
router.post("/refresh-nav", refreshAllNAVs);

export default router;