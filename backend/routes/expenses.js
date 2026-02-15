//backend/routes/expenses.js
import express from "express";
import {
    getExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
} from "../controllers/expenseController.js";

const router = express.Router();

// Get all expenses (with filters)
router.get("/", getExpenses);

// Create new expense
router.post("/", createExpense);

// Update expense
router.put("/:id", updateExpense);

// Delete expense
router.delete("/:id", deleteExpense);

export default router;