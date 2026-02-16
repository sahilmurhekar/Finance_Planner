//backend/controllers/mutualFundController.js
import MutualFund from "../models/MutualFund.js";
import { getMutualFundNAV } from "../utils/binanceCache.js";
import mongoose from "mongoose";

// Get all mutual funds
export const getMutualFunds = async (req, res) => {
    try {
        const funds = await MutualFund.find().sort({ createdAt: -1 });

        // Fetch current NAV for each fund
        const fundsWithNAV = await Promise.all(
            funds.map(async (fund) => {
                try {
                    const currentNAV = await getMutualFundNAV(fund.scheme_code);
                    fund.current_nav = currentNAV;
                    await fund.save();
                } catch (error) {
                    console.warn(`Failed to fetch NAV for ${fund.fund_name}`);
                }
                return fund;
            })
        );

        res.json({
            success: true,
            data: fundsWithNAV,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error fetching mutual funds",
        });
    }
};

// Create new mutual fund
export const createMutualFund = async (req, res) => {
    try {
        const {
            fund_name,
            scheme_code,
            invested_amount,
            units,
            expected_value,
            purchase_date,
        } = req.body;

        if (!fund_name || !scheme_code || !invested_amount || !units) {
            return res.status(400).json({
                success: false,
                error: "Fund name, scheme code, invested amount, and units are required",
            });
        }

        // Fetch current NAV
        let current_nav = 0;
        try {
            current_nav = await getMutualFundNAV(scheme_code);
        } catch (error) {
            console.warn("Could not fetch NAV, setting to 0");
        }

        const fund = new MutualFund({
            fund_name,
            scheme_code,
            invested_amount: parseFloat(invested_amount),
            units: parseFloat(units),
            current_nav,
            expected_value: expected_value ? parseFloat(expected_value) : 0,
            purchase_date: purchase_date || Date.now(),
        });

        await fund.save();

        res.status(201).json({
            success: true,
            data: fund,
            message: "Mutual fund added successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error creating mutual fund",
        });
    }
};

// Update mutual fund
export const updateMutualFund = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            fund_name,
            scheme_code,
            invested_amount,
            units,
            expected_value,
            purchase_date,
        } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid fund ID",
            });
        }

        const updates = {};
        if (fund_name !== undefined) updates.fund_name = fund_name;
        if (scheme_code !== undefined) updates.scheme_code = scheme_code;
        if (invested_amount !== undefined)
            updates.invested_amount = parseFloat(invested_amount);
        if (units !== undefined) updates.units = parseFloat(units);
        if (expected_value !== undefined)
            updates.expected_value = parseFloat(expected_value);
        if (purchase_date !== undefined) updates.purchase_date = purchase_date;

        // Fetch latest NAV if scheme_code changed
        if (scheme_code) {
            try {
                const current_nav = await getMutualFundNAV(scheme_code);
                updates.current_nav = current_nav;
            } catch (error) {
                console.warn("Could not fetch updated NAV");
            }
        }

        const fund = await MutualFund.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!fund) {
            return res.status(404).json({
                success: false,
                error: "Mutual fund not found",
            });
        }

        res.json({
            success: true,
            data: fund,
            message: "Mutual fund updated successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error updating mutual fund",
        });
    }
};

// Delete mutual fund
export const deleteMutualFund = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid fund ID",
            });
        }

        const fund = await MutualFund.findByIdAndDelete(id);

        if (!fund) {
            return res.status(404).json({
                success: false,
                error: "Mutual fund not found",
            });
        }

        res.json({
            success: true,
            message: "Mutual fund deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error deleting mutual fund",
        });
    }
};

// Refresh NAV for all funds
export const refreshAllNAVs = async (req, res) => {
    try {
        const funds = await MutualFund.find();

        const updates = await Promise.all(
            funds.map(async (fund) => {
                try {
                    const currentNAV = await getMutualFundNAV(fund.scheme_code);
                    fund.current_nav = currentNAV;
                    await fund.save();
                    return { fund: fund.fund_name, success: true };
                } catch (error) {
                    return { fund: fund.fund_name, success: false };
                }
            })
        );

        res.json({
            success: true,
            message: "NAV refresh completed",
            results: updates,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error refreshing NAVs",
        });
    }
};