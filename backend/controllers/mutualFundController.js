//backend/controllers/mutualFundController.js
import MutualFund from "../models/MutualFund.js";
import { getMutualFundNAV } from "../utils/binanceCache.js";
import mongoose from "mongoose";

// Get all mutual funds
export const getMutualFunds = async (req, res) => {
    try {
        const funds = await MutualFund.find().sort({ createdAt: -1 });

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

        res.json({ success: true, data: fundsWithNAV });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error fetching mutual funds" });
    }
};

// Create new mutual fund
// Only fund_name and scheme_code are required.
// invested_amount and units default to 0 — SIP installments will populate them.
export const createMutualFund = async (req, res) => {
    try {
        const { fund_name, scheme_code, invested_amount, units, expected_value, purchase_date } = req.body;

        if (!fund_name || !scheme_code) {
            return res.status(400).json({
                success: false,
                error: "Fund name and scheme code are required",
            });
        }

        let current_nav = 0;
        try {
            current_nav = await getMutualFundNAV(scheme_code);
        } catch (error) {
            console.warn("Could not fetch NAV, setting to 0");
        }

        const fund = new MutualFund({
            fund_name,
            scheme_code,
            invested_amount: invested_amount ? parseFloat(invested_amount) : 0,
            units: units ? parseFloat(units) : 0,
            current_nav,
            expected_value: expected_value ? parseFloat(expected_value) : 0,
            purchase_date: purchase_date ? new Date(purchase_date) : new Date(),
        });

        await fund.save();

        res.status(201).json({ success: true, data: fund, message: "Mutual fund created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error creating mutual fund" });
    }
};

// Update mutual fund
export const updateMutualFund = async (req, res) => {
    try {
        const { id } = req.params;
        const { fund_name, scheme_code, invested_amount, units, expected_value, purchase_date } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid fund ID" });
        }

        const updates = {};
        if (fund_name !== undefined) updates.fund_name = fund_name;
        if (scheme_code !== undefined) updates.scheme_code = scheme_code;
        if (invested_amount !== undefined) updates.invested_amount = parseFloat(invested_amount);
        if (units !== undefined) updates.units = parseFloat(units);
        if (expected_value !== undefined) updates.expected_value = parseFloat(expected_value);
        if (purchase_date !== undefined) updates.purchase_date = new Date(purchase_date);

        const fund = await MutualFund.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

        if (!fund) {
            return res.status(404).json({ success: false, error: "Mutual fund not found" });
        }

        try {
            fund.current_nav = await getMutualFundNAV(fund.scheme_code);
            await fund.save();
        } catch (error) {
            console.warn(`Failed to refresh NAV for ${fund.fund_name}`);
        }

        res.json({ success: true, data: fund, message: "Mutual fund updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error updating mutual fund" });
    }
};

// Delete mutual fund
export const deleteMutualFund = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid fund ID" });
        }

        const fund = await MutualFund.findByIdAndDelete(id);

        if (!fund) {
            return res.status(404).json({ success: false, error: "Mutual fund not found" });
        }

        res.json({ success: true, message: "Mutual fund deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error deleting mutual fund" });
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

        res.json({ success: true, message: "NAV refresh completed", results: updates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error refreshing NAVs" });
    }
};

// Add SIP installment to existing fund
export const addSipInstallment = async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, purchase_nav, purchase_date } = req.body;

        if (!amount || !purchase_nav) {
            return res.status(400).json({
                success: false,
                error: "Amount and purchase NAV are required for SIP installment",
            });
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, error: "Invalid fund ID" });
        }

        const fund = await MutualFund.findById(id);

        if (!fund) {
            return res.status(404).json({ success: false, error: "Mutual fund not found" });
        }

        const newUnits = parseFloat(amount) / parseFloat(purchase_nav);

        // Accumulate totals — each SIP adds to invested_amount and units
        fund.invested_amount += parseFloat(amount);
        fund.units += newUnits;

        if (purchase_date) {
            fund.purchase_date = new Date(purchase_date);
        }

        try {
            fund.current_nav = await getMutualFundNAV(fund.scheme_code);
        } catch (error) {
            console.warn(`Failed to refresh NAV for ${fund.fund_name}`);
        }

        await fund.save();

        res.json({ success: true, data: fund, message: "SIP installment added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error adding SIP installment" });
    }
};
