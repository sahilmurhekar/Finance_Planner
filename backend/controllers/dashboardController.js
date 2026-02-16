//backend/controllers/dashboardController.js
import MutualFund from "../models/MutualFund.js";
import CryptoHolding from "../models/CryptoHolding.js";
import Expense from "../models/Expense.js";
import UserProfile from "../models/UserProfile.js";
import { getBinancePrice, getMutualFundNAV } from "../utils/binanceCache.js";

// Get complete dashboard statistics
export const getDashboardStats = async (req, res) => {
    try {
        // Fetch all data in parallel
        const [mutualFunds, cryptoHoldings, profile] = await Promise.all([
            MutualFund.find(),
            CryptoHolding.find(),
            UserProfile.getProfile(),
        ]);

        // Calculate current month expenses
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);

        const monthlyExpenses = await Expense.find({
            date: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const totalMonthlyExpense = monthlyExpenses.reduce(
            (sum, exp) => sum + exp.amount,
            0
        );

        // Update prices for MF and Crypto
        await Promise.all([
            ...mutualFunds.map(async (fund) => {
                try {
                    const nav = await getMutualFundNAV(fund.scheme_code);
                    fund.current_nav = nav;
                    await fund.save();
                } catch (err) {
                    console.warn(`NAV fetch failed for ${fund.fund_name}`);
                }
            }),
            ...cryptoHoldings.map(async (holding) => {
                try {
                    const price = await getBinancePrice(`${holding.token_symbol}USDT`);
                    holding.current_price = price;
                    await holding.save();
                } catch (err) {
                    console.warn(`Price fetch failed for ${holding.token_symbol}`);
                }
            }),
        ]);

        // Calculate MF totals
        const mfInvested = mutualFunds.reduce(
            (sum, fund) => sum + fund.invested_amount,
            0
        );
        const mfCurrent = mutualFunds.reduce(
            (sum, fund) => sum + fund.current_value,
            0
        );
        const mfGain = mfCurrent - mfInvested;
        const mfReturnPercentage =
            mfInvested > 0 ? ((mfGain / mfInvested) * 100).toFixed(2) : 0;

        // Calculate Crypto totals
        const cryptoInvested = cryptoHoldings.reduce(
            (sum, holding) => sum + holding.invested_amount,
            0
        );
        const cryptoCurrent = cryptoHoldings.reduce(
            (sum, holding) => sum + holding.current_value,
            0
        );
        const cryptoGain = cryptoCurrent - cryptoInvested;
        const cryptoReturnPercentage =
            cryptoInvested > 0 ? ((cryptoGain / cryptoInvested) * 100).toFixed(2) : 0;

        // Overall totals
        const totalInvested = mfInvested + cryptoInvested;
        const totalCurrent = mfCurrent + cryptoCurrent;
        const totalGain = totalCurrent - totalInvested;
        const totalReturnPercentage =
            totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : 0;

        // Net worth calculation (with/without expenses)
        const netWorthWithExpenses = totalCurrent - totalMonthlyExpense;
        const netWorthWithoutExpenses = totalCurrent;

        // Asset allocation
        const assetAllocation = {
            mutual_funds: {
                amount: mfCurrent,
                percentage:
                    totalCurrent > 0 ? ((mfCurrent / totalCurrent) * 100).toFixed(2) : 0,
            },
            crypto: {
                amount: cryptoCurrent,
                percentage:
                    totalCurrent > 0
                        ? ((cryptoCurrent / totalCurrent) * 100).toFixed(2)
                        : 0,
            },
        };

        // Category breakdown for MF
        const mfBreakdown = mutualFunds.map((fund) => ({
            name: fund.fund_name,
            invested: fund.invested_amount,
            current: fund.current_value,
            gain: fund.gain,
            return_percentage: fund.return_percentage,
        }));

        // Category breakdown for Crypto
        const cryptoBreakdown = cryptoHoldings.map((holding) => ({
            token: holding.token_symbol,
            name: holding.token_name,
            quantity: holding.quantity,
            invested: holding.invested_amount,
            current: holding.current_value,
            gain: holding.gain,
            return_percentage: holding.return_percentage,
            current_price: holding.current_price,
        }));

        // Response
        res.json({
            success: true,
            data: {
                summary: {
                    total_invested: totalInvested.toFixed(2),
                    total_current: totalCurrent.toFixed(2),
                    total_gain: totalGain.toFixed(2),
                    total_return_percentage: totalReturnPercentage,
                    monthly_expense: totalMonthlyExpense.toFixed(2),
                    net_worth_with_expenses: netWorthWithExpenses.toFixed(2),
                    net_worth_without_expenses: netWorthWithoutExpenses.toFixed(2),
                },
                mutual_funds: {
                    total_invested: mfInvested.toFixed(2),
                    total_current: mfCurrent.toFixed(2),
                    total_gain: mfGain.toFixed(2),
                    return_percentage: mfReturnPercentage,
                    breakdown: mfBreakdown,
                },
                crypto: {
                    total_invested: cryptoInvested.toFixed(2),
                    total_current: cryptoCurrent.toFixed(2),
                    total_gain: cryptoGain.toFixed(2),
                    return_percentage: cryptoReturnPercentage,
                    breakdown: cryptoBreakdown,
                },
                asset_allocation: assetAllocation,
                profile: {
                    salary: profile.monthly_salary || 0,
                    expense_limit: profile.allocations?.expenses || 0,
                    investment_allocation:
                        (profile.allocations?.crypto || 0) + (profile.allocations?.mf || 0),
                },
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        res.status(500).json({
            success: false,
            error: "Error fetching dashboard statistics",
        });
    }
};

// Get monthly growth trend (last 6 months)
export const getMonthlyGrowthTrend = async (req, res) => {
    try {
        const monthsToFetch = 6;
        const trendData = [];

        for (let i = monthsToFetch - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const year = date.getFullYear();
            const month = date.getMonth();

            const startDate = new Date(year, month, 1);
            const endDate = new Date(year, month + 1, 0);
            endDate.setHours(23, 59, 59, 999);

            // Get expenses for this month
            const expenses = await Expense.find({
                date: { $gte: startDate, $lte: endDate },
            });

            const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

            // Get investments (assuming they grow over time)
            // For simplicity, we'll use current values (in real app, track historical)
            const [mutualFunds, cryptoHoldings] = await Promise.all([
                MutualFund.find(),
                CryptoHolding.find(),
            ]);

            const mfValue = mutualFunds.reduce(
                (sum, fund) => sum + fund.current_value,
                0
            );
            const cryptoValue = cryptoHoldings.reduce(
                (sum, holding) => sum + holding.current_value,
                0
            );

            trendData.push({
                month: `${date.toLocaleString("default", { month: "short" })} ${year}`,
                investments: (mfValue + cryptoValue).toFixed(2),
                expenses: totalExpense.toFixed(2),
            });
        }

        res.json({
            success: true,
            data: trendData,
        });
    } catch (error) {
        console.error("Monthly growth trend error:", error);
        res.status(500).json({
            success: false,
            error: "Error fetching monthly growth trend",
        });
    }
};