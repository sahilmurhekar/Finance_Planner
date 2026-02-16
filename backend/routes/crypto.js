//backend/routes/crypto.js
import express from "express";
import {
    getCryptoHoldings,
    createCryptoHolding,
    updateCryptoHolding,
    deleteCryptoHolding,
    refreshAllPrices,
    getTokenPrice,
} from "../controllers/cryptoController.js";

const router = express.Router();

// Get all crypto holdings
router.get("/", getCryptoHoldings);

// Create new crypto holding
router.post("/", createCryptoHolding);

// Update crypto holding
router.put("/:id", updateCryptoHolding);

// Delete crypto holding
router.delete("/:id", deleteCryptoHolding);

// Refresh all prices
router.post("/refresh-prices", refreshAllPrices);

// Get single token price
router.get("/price/:symbol", getTokenPrice);

export default router;