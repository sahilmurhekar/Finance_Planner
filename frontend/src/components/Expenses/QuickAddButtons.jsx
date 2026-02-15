//frontend/src/components/Expenses/QuickAddButtons.jsx
import React, { useState, useEffect } from "react";
import { useExpenseStore } from "../../store/useExpenseStore";
import { Plus } from "lucide-react";

const QuickAddButtons = () => {
    const { categories, fetchCategories, addExpense, isLoading } =
        useExpenseStore();
    const [quickAmount, setQuickAmount] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleQuickAdd = async (category) => {
        if (!quickAmount || parseFloat(quickAmount) <= 0) {
            setMessage("Please enter a valid amount");
            return;
        }

        try {
            await addExpense({
                category,
                amount: parseFloat(quickAmount),
                note: "",
                date: new Date().toISOString().split("T")[0],
            });

            setMessage(`${category} expense added!`);
            setQuickAmount("");
            setTimeout(() => setMessage(""), 2000);
        } catch (err) {
            setMessage("Failed to add expense");
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Add Expense
            </h3>

            {message && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-blue-800 text-sm">{message}</p>
                </div>
            )}

            {/* Amount Input */}
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                </label>
                <input
                    type="number"
                    value={quickAmount}
                    onChange={(e) => setQuickAmount(e.target.value)}
                    placeholder="Enter amount"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Quick Category Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {categories.slice(0, 6).map((cat) => (
                    <button
                        key={cat._id}
                        onClick={() => handleQuickAdd(cat.name)}
                        disabled={isLoading || !quickAmount}
                        className="flex items-center justify-center gap-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                    >
                        <Plus className="w-3 h-3" />
                        {cat.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default QuickAddButtons;