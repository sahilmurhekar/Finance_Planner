//frontend/src/components/Expenses/ExpenseEntryForm.jsx
import React, { useState, useEffect } from "react";
import { useExpenseStore } from "../../store/useExpenseStore";
import { Plus } from "lucide-react";

const ExpenseEntryForm = () => {
    const { categories, addExpense, isLoading, fetchCategories } =
        useExpenseStore();
    const [formData, setFormData] = useState({
        category: "",
        amount: "",
        note: "",
        date: new Date().toISOString().split("T")[0],
    });
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        // Validation
        if (!formData.category) {
            setError("Please select a category");
            return;
        }
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        try {
            await addExpense({
                category: formData.category,
                amount: parseFloat(formData.amount),
                note: formData.note,
                date: formData.date,
            });

            setMessage("Expense added successfully!");
            setFormData({
                category: "",
                amount: "",
                note: "",
                date: new Date().toISOString().split("T")[0],
            });

            setTimeout(() => setMessage(""), 3000);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to add expense");
        }
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Add Expense</h2>

            {message && (
                <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm">{message}</p>
                </div>
            )}

            {error && (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat.name}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount
                        </label>
                        <input
                            type="number"
                            name="amount"
                            value={formData.amount}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Note */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Note (Optional)
                    </label>
                    <textarea
                        name="note"
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Add a note..."
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>

                {/* Submit Button */}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {isLoading ? "Adding..." : "Add Expense"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ExpenseEntryForm;