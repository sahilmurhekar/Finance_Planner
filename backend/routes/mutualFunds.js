//backend/routes/mutualFunds.js
import express from "express";
import {
    getMutualFunds,
    createMutualFund,
    updateMutualFund,
    deleteMutualFund,
    refreshAllNAVs,
    addSipInstallment,
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

// Add SIP installment
router.post("/:id/installment", addSipInstallment);

export default router;
