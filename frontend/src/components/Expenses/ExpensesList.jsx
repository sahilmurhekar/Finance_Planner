// frontend/src/components/Expenses/ExpensesList.jsx (UPDATED WITH FULL EDIT SUPPORT)

import React, { useEffect, useState } from "react";
import { useExpenseStore } from "../../store/useExpenseStore";
import { Edit2, Trash2 } from "lucide-react";

const ExpensesList = ({ selectedDate = null }) => {
    const {
        expenses,
        fetchExpenses,
        deleteExpense,
        updateExpense,      // ← NEW (add this to your store if missing)
        categories,
        fetchCategories,
        isLoading,
        selectedDate: storeDate,
    } = useExpenseStore();

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        category: "",
        amount: "",
        note: "",
        date: "",
    });
    const [error, setError] = useState("");

    const dateToShow = selectedDate || storeDate;

    useEffect(() => {
        fetchExpenses({ date: dateToShow });
        fetchCategories();
    }, [dateToShow, fetchExpenses, fetchCategories]);

    const handleDelete = async (id) => {
        try {
            await deleteExpense(id);
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete:", err);
        }
    };

    // ==================== EDIT HANDLERS ====================
    const handleEditClick = (expense) => {
        setEditingId(expense._id);
        setEditFormData({
            category: expense.category,
            amount: expense.amount.toString(),
            note: expense.note || "",
            date: expense.date.split("T")[0],
        });
        setError("");
        setShowEditModal(true);
    };

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setError("");

        if (!editFormData.category || !editFormData.amount || parseFloat(editFormData.amount) <= 0) {
            setError("Please select a category and enter a valid amount");
            return;
        }

        try {
            await updateExpense(editingId, {
                category: editFormData.category,
                amount: parseFloat(editFormData.amount),
                note: editFormData.note,
                date: editFormData.date,
            });

            setShowEditModal(false);
            setEditingId(null);
            setEditFormData({ category: "", amount: "", note: "", date: "" });

            // Refresh the list (works for both daily & monthly views)
            fetchExpenses({ date: dateToShow });
        } catch (err) {
            setError(err.response?.data?.error || "Failed to update expense");
        }
    };

    const handleCancelEdit = () => {
        setShowEditModal(false);
        setEditingId(null);
        setEditFormData({ category: "", amount: "", note: "", date: "" });
        setError("");
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-500">Loading expenses...</p>
            </div>
        );
    }

    if (expenses.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No expenses for this period.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Amount</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Note</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {expenses.map((expense) => (
                            <tr key={expense._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{expense.category}</td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">₹{expense.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{expense.note || "-"}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(expense.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button
                                        onClick={() => handleEditClick(expense)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(expense._id)}
                                        className="text-red-600 hover:text-red-800 transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Confirmation Modal (unchanged) */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Expense?</h3>
                        <p className="text-gray-600 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ==================== NEW EDIT MODAL ==================== */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Edit Expense</h3>
                            <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 text-xl">
                                ✕
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    name="category"
                                    value={editFormData.category}
                                    onChange={handleEditChange}
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

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={editFormData.amount}
                                    onChange={handleEditChange}
                                    step="0.01"
                                    min="0"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={editFormData.date}
                                    onChange={handleEditChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Note (Optional)</label>
                                <textarea
                                    name="note"
                                    value={editFormData.note}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                                >
                                    {isLoading ? "Updating..." : "Update Expense"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesList;