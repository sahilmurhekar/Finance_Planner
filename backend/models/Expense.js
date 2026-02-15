//backend/models/Expense.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            required: true,
            trim: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0.01,
        },
        note: {
            type: String,
            trim: true,
            default: "",
        },
        date: {
            type: Date,
            required: true,
            default: () => new Date().setHours(0, 0, 0, 0),
        },
    },
    { timestamps: true }
);

// Index on date for faster queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

export default mongoose.model("Expense", expenseSchema);