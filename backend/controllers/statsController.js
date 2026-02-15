//backend/controllers/statsController.js (UPDATED - MONTHLY TRACKING)
import Expense from "../models/Expense.js";
import Category from "../models/Category.js";
import UserProfile from "../models/UserProfile.js";

// Get monthly statistics (current month only by default)
export const getDailyStats = async (req, res) => {
    try {
        const { month } = req.query;
        const query = {};
        let startDate, endDate;

        // Get current month by default, or specific month if provided
        const now = new Date();
        const requestedMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const [year, monthNum] = requestedMonth.split("-");
        startDate = new Date(year, parseInt(monthNum) - 1, 1);
        endDate = new Date(year, parseInt(monthNum), 0);

        // Set time bounds - get only this specific month
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        query.date = { $gte: startDate, $lte: endDate };

        // Fetch expenses for the CURRENT MONTH ONLY
        const expenses = await Expense.find(query);
        const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        // Get category breakdown
        const categoryBreakdown = {};
        expenses.forEach((exp) => {
            categoryBreakdown[exp.category] =
                (categoryBreakdown[exp.category] || 0) + exp.amount;
        });

        // Get user profile for monthly limit and salary
        const profile = await UserProfile.getProfile();
        const monthlyLimit = profile.allocations.expenses || 0;
        const monthlySalary = profile.monthly_salary || 0;

        // Calculate days info for current month
        const today = new Date();
        const currentDayOfMonth = today.getDate();
        const lastDayOfMonth = endDate.getDate();
        const daysRemaining = lastDayOfMonth - currentDayOfMonth;
        const daysUsed = currentDayOfMonth;
        const percentageUsed = monthlyLimit ? (totalExpense / monthlyLimit) * 100 : 0;

        // Calculate daily average
        const averageDailyExpense = daysUsed > 0 ? totalExpense / daysUsed : 0;
        const projectedMonthlyExpense = averageDailyExpense * lastDayOfMonth;

        // Salary breakdown
        const salaryRemaining = monthlySalary - totalExpense;
        const investmentAllocation = profile.allocations.crypto + profile.allocations.mf || 0;

        res.json({
            success: true,
            data: {
                // Current month expenses
                totalExpense,
                monthlyLimit,
                percentageUsed: Math.round(percentageUsed * 100) / 100,
                categoryBreakdown,

                // Salary information (from settings)
                monthlySalary,
                investmentAllocation,
                salaryRemaining,

                // Time information
                daysRemaining,
                daysUsed,
                lastDayOfMonth,

                // Projections
                averageDailyExpense: Math.round(averageDailyExpense * 100) / 100,
                projectedMonthlyExpense: Math.round(projectedMonthlyExpense * 100) / 100,

                // Period info
                month: requestedMonth,
                startDate,
                endDate,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error fetching stats" });
    }
};

// Get spending trend for last 7 days (current week only)
export const getTrendStats = async (req, res) => {
    try {
        const endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
        const startDate = new Date(endDate);
        startDate.setDate(startDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);

        const query = { date: { $gte: startDate, $lte: endDate } };
        const expenses = await Expense.find(query).sort({ date: 1 });

        // Group by date
        const trendData = {};
        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split("T")[0];
            trendData[dateStr] = 0;
        }

        expenses.forEach((exp) => {
            const dateStr = exp.date.toISOString().split("T")[0];
            trendData[dateStr] = (trendData[dateStr] || 0) + exp.amount;
        });

        const data = Object.entries(trendData).map(([date, amount]) => ({
            date,
            amount,
        }));

        res.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error fetching trend" });
    }
};

// Get daily totals for month (calendar view - CURRENT MONTH ONLY)
export const getCalendarStats = async (req, res) => {
    try {
        const { month } = req.query;
        let startDate, endDate;

        // Get current month by default
        const now = new Date();
        const requestedMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const [year, monthNum] = requestedMonth.split("-");
        startDate = new Date(year, parseInt(monthNum) - 1, 1);
        endDate = new Date(year, parseInt(monthNum), 0);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const query = { date: { $gte: startDate, $lte: endDate } };
        const expenses = await Expense.find(query);

        // Group by date
        const calendarData = {};
        const lastDay = endDate.getDate();

        for (let i = 1; i <= lastDay; i++) {
            const dateStr = `${startDate.getFullYear()}-${String(
                startDate.getMonth() + 1
            ).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
            calendarData[dateStr] = 0;
        }

        expenses.forEach((exp) => {
            const dateStr = exp.date.toISOString().split("T")[0];
            calendarData[dateStr] = (calendarData[dateStr] || 0) + exp.amount;
        });

        res.json({
            success: true,
            data: calendarData,
            month: requestedMonth,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error fetching calendar" });
    }
};

// Get spending per category with limits (CURRENT MONTH ONLY)
export const getCategoryLimitStats = async (req, res) => {
    try {
        const { month } = req.query;
        let startDate, endDate;

        // Get current month by default
        const now = new Date();
        const requestedMonth = month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

        const [year, monthNum] = requestedMonth.split("-");
        startDate = new Date(year, parseInt(monthNum) - 1, 1);
        endDate = new Date(year, parseInt(monthNum), 0);

        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        // Get all categories and expenses for THIS MONTH ONLY
        const categories = await Category.find();
        const query = { date: { $gte: startDate, $lte: endDate } };
        const expenses = await Expense.find(query);

        // Calculate spending per category
        const categoryStats = categories.map((cat) => {
            const spent = expenses
                .filter((exp) => exp.category === cat.name)
                .reduce((sum, exp) => sum + exp.amount, 0);

            return {
                categoryId: cat._id,
                name: cat.name,
                limit: cat.monthly_limit,
                spent,
                percentageUsed: cat.monthly_limit
                    ? Math.round((spent / cat.monthly_limit) * 100 * 100) / 100
                    : 0,
            };
        });

        res.json({
            success: true,
            data: categoryStats,
            month: requestedMonth,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error fetching category limits",
        });
    }
};

// NEW: Get monthly comparison (current month vs previous months)
export const getMonthlyComparison = async (req, res) => {
    try {
        const now = new Date();
        const monthsToCompare = 3; // Compare last 3 months

        const comparisonData = [];

        for (let i = 0; i < monthsToCompare; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const monthStr = `${year}-${String(month).padStart(2, "0")}`;

            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(23, 59, 59, 999);

            const expenses = await Expense.find({
                date: { $gte: startDate, $lte: endDate },
            });

            const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);

            comparisonData.push({
                month: monthStr,
                total: Math.round(totalExpense * 100) / 100,
                expenses: expenses.length,
            });
        }

        res.json({
            success: true,
            data: comparisonData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: "Error fetching monthly comparison",
        });
    }
};