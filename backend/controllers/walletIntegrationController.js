//backend/controllers/walletIntegrationController.js (UPDATED - BETTER ERROR HANDLING)
import CryptoHolding from "../models/CryptoHolding.js";
import { getBinancePrice, getBinanceSpotBalances } from "../utils/binanceCache.js";

/**
 * Sync Binance Spot Balances to Database
 * This will fetch your actual Binance holdings and save them
 */
export const syncBinanceBalances = async (req, res) => {
    try {
        // Check if API keys are configured
        if (!process.env.BINANCE_API_KEY || !process.env.BINANCE_SECRET) {
            return res.status(400).json({
                success: false,
                error: "Binance API credentials not configured in backend .env file",
                message: "Please add BINANCE_API_KEY and BINANCE_SECRET to your .env file",
            });
        }

        const balances = await getBinanceSpotBalances();

        if (balances.length === 0) {
            return res.json({
                success: true,
                message: "No balances found on Binance",
                data: [],
            });
        }

        const synced = [];
        const failed = [];

        for (const balance of balances) {
            // Skip stablecoins and small amounts
            if (balance.total < 0.00001) continue;

            try {
                // Get current price
                const symbol = `${balance.asset}USDT`;
                let currentPrice = 0;

                try {
                    currentPrice = await getBinancePrice(symbol);
                } catch (priceError) {
                    console.warn(`Could not fetch price for ${balance.asset}`);
                }

                // Check if holding exists
                const existing = await CryptoHolding.findOne({
                    token_symbol: balance.asset,
                    network: "Binance",
                });

                if (existing) {
                    // Update existing
                    existing.quantity = balance.total;
                    existing.current_price = currentPrice;
                    await existing.save();
                    synced.push(existing);
                } else {
                    // Create new (no invested_amount, will be 0)
                    const newHolding = new CryptoHolding({
                        token_symbol: balance.asset,
                        token_name: balance.asset,
                        quantity: balance.total,
                        invested_amount: 0, // User can update manually later
                        network: "Binance",
                        wallet_address: "Binance Account",
                        current_price: currentPrice,
                    });
                    await newHolding.save();
                    synced.push(newHolding);
                }
            } catch (error) {
                console.error(`Error syncing ${balance.asset}:`, error.message);
                failed.push({ asset: balance.asset, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Synced ${synced.length} holdings from Binance`,
            data: synced,
            failed: failed.length > 0 ? failed : undefined,
        });
    } catch (error) {
        console.error("Binance sync error:", error);
        res.status(500).json({
            success: false,
            error: error.message || "Failed to sync Binance balances",
            hint: error.message.includes("credentials")
                ? "Add BINANCE_API_KEY and BINANCE_SECRET to your backend .env file"
                : "Check your Binance API keys and permissions",
        });
    }
};

/**
 * Sync MetaMask wallet tokens to database
 * Frontend will send wallet data, backend saves it
 */
export const syncMetaMaskWallet = async (req, res) => {
    try {
        const { address, tokens } = req.body;

        if (!address || !tokens || !Array.isArray(tokens)) {
            return res.status(400).json({
                success: false,
                error: "Wallet address and tokens array required",
            });
        }

        if (tokens.length === 0) {
            return res.json({
                success: true,
                message: "No tokens to sync",
                data: [],
            });
        }

        const synced = [];
        const failed = [];

        for (const token of tokens) {
            try {
                // Get current price
                const symbol = `${token.symbol}USDT`;
                let currentPrice = 0;

                try {
                    currentPrice = await getBinancePrice(symbol);
                } catch (priceError) {
                    console.warn(`Could not fetch price for ${token.symbol}`);
                    // Continue even if price fetch fails
                }

                // Check if holding exists
                const existing = await CryptoHolding.findOne({
                    token_symbol: token.symbol,
                    wallet_address: address,
                });

                if (existing) {
                    // Update existing
                    existing.quantity = token.balance;
                    existing.current_price = currentPrice;
                    existing.token_name = token.name || token.symbol;
                    existing.network = token.network || "Ethereum";
                    await existing.save();
                    synced.push(existing);
                } else {
                    // Create new
                    const newHolding = new CryptoHolding({
                        token_symbol: token.symbol,
                        token_name: token.name || token.symbol,
                        quantity: token.balance,
                        invested_amount: 0, // User can update manually later
                        network: token.network || "Ethereum",
                        wallet_address: address,
                        current_price: currentPrice,
                    });
                    await newHolding.save();
                    synced.push(newHolding);
                }
            } catch (error) {
                console.error(`Error syncing ${token.symbol}:`, error.message);
                failed.push({ symbol: token.symbol, error: error.message });
            }
        }

        res.json({
            success: true,
            message: `Synced ${synced.length} holdings from MetaMask`,
            data: synced,
            failed: failed.length > 0 ? failed : undefined,
        });
    } catch (error) {
        console.error("MetaMask sync error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to sync MetaMask wallet",
            details: error.message,
        });
    }
};

/**
 * Get aggregated holdings from both Binance and Wallet
 */
export const getAggregatedHoldings = async (req, res) => {
    try {
        const holdings = await CryptoHolding.find().sort({ createdAt: -1 });

        // Update all prices
        const updatePromises = holdings.map(async (holding) => {
            try {
                const symbol = `${holding.token_symbol}USDT`;
                const currentPrice = await getBinancePrice(symbol);
                holding.current_price = currentPrice;
                await holding.save();
                return { success: true, symbol: holding.token_symbol };
            } catch (error) {
                console.warn(`Failed to update price for ${holding.token_symbol}`);
                return { success: false, symbol: holding.token_symbol };
            }
        });

        await Promise.all(updatePromises);

        // Refresh holdings after price update
        const updatedHoldings = await CryptoHolding.find().sort({ createdAt: -1 });

        // Group by source
        const binanceHoldings = updatedHoldings.filter((h) => h.network === "Binance");
        const walletHoldings = updatedHoldings.filter((h) => h.network !== "Binance");

        res.json({
            success: true,
            data: {
                all: updatedHoldings,
                binance: binanceHoldings,
                wallet: walletHoldings,
            },
        });
    } catch (error) {
        console.error("Aggregated holdings error:", error);
        res.status(500).json({
            success: false,
            error: "Failed to fetch aggregated holdings",
            details: error.message,
        });
    }
};

/**
 * Check if Binance API is configured
 */
export const checkBinanceConfig = async (req, res) => {
    const isConfigured = !!(process.env.BINANCE_API_KEY && process.env.BINANCE_SECRET);

    res.json({
        success: true,
        data: {
            binanceConfigured: isConfigured,
            message: isConfigured
                ? "Binance API credentials are configured"
                : "Binance API credentials not found in .env",
        },
    });
};