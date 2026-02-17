//backend/routes/walletIntegration.js (UPDATED)
import express from "express";
import {
    syncBinanceBalances,
    syncMetaMaskWallet,
    getAggregatedHoldings,
    checkBinanceConfig,
} from "../controllers/walletIntegrationController.js";

const router = express.Router();

// Check if Binance API is configured
router.get("/binance-config", checkBinanceConfig);

// Sync Binance account balances
router.post("/sync-binance", syncBinanceBalances);

// Sync MetaMask wallet tokens
router.post("/sync-metamask", syncMetaMaskWallet);

// Get aggregated holdings (Binance + Wallet)
router.get("/aggregated", getAggregatedHoldings);

export default router;