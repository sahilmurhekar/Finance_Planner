//backend/controllers/expenseController.js
import Expense from "../models/Expense.js";
import Category from "../models/Category.js";

// Get all expenses with filters
export const getExpenses = async (req, res) => {
    try {
        const { date, month, category, limit = 50, offset = 0 } = req.query;
        const query = {};

        // Filter by specific date
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        // Filter by month (YYYY-MM)
        if (month) {
            const [year, monthNum] = month.split("-");
            const startDate = new Date(year, parseInt(monthNum) - 1, 1);
            const endDate = new Date(year, parseInt(monthNum), 0);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        const expenses = await Expense.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(offset));

        const total = await Expense.countDocuments(query);

        res.json({
            success: true,
            data: expenses,
            total,
            limit: parseInt(limit),
            offset: parseInt(offset),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error fetching expenses" });
    }
};

// Create new expense
export const createExpense = async (req, res) => {
    try {
        const { category, amount, note, date } = req.body;

        if (!category || amount === undefined) {
            return res.status(400).json({
                success: false,
                error: "Category and amount are required",
            });
        }

        if (amount < 0.01) {
            return res.status(400).json({
                success: false,
                error: "Amount must be greater than 0",
            });
        }

        const expense = new Expense({
            category,
            amount: parseFloat(amount),
            note: note || "",
            date: date ? new Date(date) : new Date(),
        });

        await expense.save();

        res.status(201).json({
            success: true,
            data: expense,
            message: "Expense created successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error creating expense" });
    }
};

// Update expense
export const updateExpense = async (req, res) => {
    try {
        const { id } = req.params;
        const { category, amount, note, date } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid expense ID",
            });
        }

        const updates = {};
        if (category !== undefined) updates.category = category;
        if (amount !== undefined) {
            if (amount < 0.01) {
                return res.status(400).json({
                    success: false,
                    error: "Amount must be greater than 0",
                });
            }
            updates.amount = parseFloat(amount);
        }
        if (note !== undefined) updates.note = note;
        if (date !== undefined) updates.date = new Date(date);

        const expense = await Expense.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: "Expense not found",
            });
        }

        res.json({
            success: true,
            data: expense,
            message: "Expense updated successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error updating expense" });
    }
};

// Delete expense
export const deleteExpense = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                error: "Invalid expense ID",
            });
        }

        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return res.status(404).json({
                success: false,
                error: "Expense not found",
            });
        }

        res.json({
            success: true,
            message: "Expense deleted successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Error deleting expense" });
    }
};