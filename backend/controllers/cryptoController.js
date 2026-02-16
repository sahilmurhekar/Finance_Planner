//backend/controllers/cryptoController.js
import CryptoHolding from "../models/CryptoHolding.js";
import { getBinancePrice } from "../utils/binanceCache.js";
import mongoose from "mongoose";

// Get all crypto holdings
export const getCryptoHoldings = async (req, res) => {
    try {
        const holdings = await CryptoHolding.find().sort({ createdAt: -1 });

        // Fetch current prices for each holding
        const holdingsWithPrices = await Promise.all(
            holdings.map(async (holding) => {
                try {
                    const symbol = `${holding.token_symbol}USDT`;
                    const currentPrice = await getBinancePrice(symbol);
                    holding.current_price = currentPrice;
                    await holding.save();
                } catch (error) {
                    console.warn(`Failed to fetch price for ${holding.token_symbol}`);
                }
                return holding;
            })
        );

        res.json({
            success: true,
            data: holdingsWithPrices,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error fetching crypto holdings",
        });
    }
};

// Create new crypto holding
export const createCryptoHolding = async (req, res) => {
    try {
        const {
            token_symbol,
            token_name,
            quantity,
            invested_amount,
            network,
            wallet_address,
            purchase_date,
        } = req.body;

        if (!token_symbol || !token_name || !quantity || !invested_amount) {
            return res.status(400).json({
                success: false,
                error: "Token symbol, name, quantity, and invested amount are required",
            });
        }

        // Fetch current price
        let current_price = 0;
        try {
            const symbol = `${token_symbol.toUpperCase()}USDT`;
            current_price = await getBinancePrice(symbol);
        } catch (error) {
            console.warn("Could not fetch price, setting to 0");
        }

        const holding = new CryptoHolding({
            token_symbol: token_symbol.toUpperCase(),
            token_name,
            quantity: parseFloat(quantity),
            invested_amount: parseFloat(invested_amount),
            network: network || "Ethereum",
            wallet_address: wallet_address || "",
            current_price,
            purchase_date: purchase_date || Date.now(),
        });

        await holding.save();

        res.status(201).json({
            success: true,
            data: holding,
            message: "Crypto holding added successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error creating crypto holding",
        });
    }
};

// Update crypto holding
export const updateCryptoHolding = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            token_symbol,
            token_name,
            quantity,
            invested_amount,
            network,
            wallet_address,
            purchase_date,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid holding ID",
            });
        }

        const updates = {};
        if (token_symbol !== undefined)
            updates.token_symbol = token_symbol.toUpperCase();
        if (token_name !== undefined) updates.token_name = token_name;
        if (quantity !== undefined) updates.quantity = parseFloat(quantity);
        if (invested_amount !== undefined)
            updates.invested_amount = parseFloat(invested_amount);
        if (network !== undefined) updates.network = network;
        if (wallet_address !== undefined) updates.wallet_address = wallet_address;
        if (purchase_date !== undefined) updates.purchase_date = purchase_date;

        // Fetch latest price if token changed
        if (token_symbol) {
            try {
                const symbol = `${token_symbol.toUpperCase()}USDT`;
                const current_price = await getBinancePrice(symbol);
                updates.current_price = current_price;
            } catch (error) {
                console.warn("Could not fetch updated price");
            }
        }

        const holding = await CryptoHolding.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!holding) {
            return res.status(404).json({
                success: false,
                error: "Crypto holding not found",
            });
        }

        res.json({
            success: true,
            data: holding,
            message: "Crypto holding updated successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error updating crypto holding",
        });
    }
};

// Delete crypto holding
export const deleteCryptoHolding = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid holding ID",
            });
        }

        const holding = await CryptoHolding.findByIdAndDelete(id);

        if (!holding) {
            return res.status(404).json({
                success: false,
                error: "Crypto holding not found",
            });
        }

        res.json({
            success: true,
            message: "Crypto holding deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error deleting crypto holding",
        });
    }
};

// Refresh prices for all holdings
export const refreshAllPrices = async (req, res) => {
    try {
        const holdings = await CryptoHolding.find();

        const updates = await Promise.all(
            holdings.map(async (holding) => {
                try {
                    const symbol = `${holding.token_symbol}USDT`;
                    const currentPrice = await getBinancePrice(symbol);
                    holding.current_price = currentPrice;
                    await holding.save();
                    return { token: holding.token_symbol, success: true };
                } catch (error) {
                    return { token: holding.token_symbol, success: false };
                }
            })
        );

        res.json({
            success: true,
            message: "Price refresh completed",
            results: updates,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error refreshing prices",
        });
    }
};

// Get single token price (for quick checks)
export const getTokenPrice = async (req, res) => {
    try {
        const { symbol } = req.params;

        if (!symbol) {
            return res.status(400).json({
                success: false,
                error: "Token symbol is required",
            });
        }

        const tradingPair = `${symbol.toUpperCase()}USDT`;
        const price = await getBinancePrice(tradingPair);

        res.json({
            success: true,
            data: {
                symbol: symbol.toUpperCase(),
                price,
                trading_pair: tradingPair,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: error.message || "Error fetching token price",
        });
    }
};