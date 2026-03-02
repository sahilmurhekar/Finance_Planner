// frontend/src/components/Expenses/ExpensesList.jsx (FIXED - Monthly + Daily support + Full Edit)

import React, { useEffect, useState } from "react";
import { useExpenseStore } from "../../store/useExpenseStore";
import { Edit2, Trash2 } from "lucide-react";

const ExpensesList = ({ selectedDate = null }) => {
    const {
        expenses,
        fetchExpenses,
        deleteExpense,
        updateExpense,        // ← now used
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

    // Use month when we get YYYY-MM, use date when we get full YYYY-MM-DD
    const dateToShow = selectedDate || storeDate;
    const isMonthView = dateToShow && dateToShow.length === 7;

    useEffect(() => {
        if (!dateToShow) return;

        console.log(`Fetching expenses → ${isMonthView ? "MONTH" : "DAY"}:`, dateToShow);

        if (isMonthView) {
            fetchExpenses({ month: dateToShow });
        } else {
            fetchExpenses({ date: dateToShow });
        }
    }, [dateToShow, fetchExpenses]);

    // ==================== EDIT ====================
    const openEditModal = (expense) => {
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
        if (!editFormData.category || parseFloat(editFormData.amount) <= 0) {
            setError("Category and valid amount required");
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
        } catch (err) {
            setError(err.response?.data?.error || "Update failed");
        }
    };

    const closeEditModal = () => {
        setShowEditModal(false);
        setEditingId(null);
        setError("");
    };

    // ==================== DELETE ====================
    const handleDelete = async (id) => {
        try {
            await deleteExpense(id);
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) return <div className="bg-white rounded-lg border border-gray-200 p-6">Loading expenses...</div>;
    if (expenses.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No expenses found for this {isMonthView ? "month" : "date"}.</p>
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
                        {expenses.map((exp) => (
                            <tr key={exp._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{exp.category}</td>
                                <td className="px-6 py-4 font-semibold">₹{exp.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-gray-600">{exp.note || "-"}</td>
                                <td className="px-6 py-4 text-gray-600">
                                    {new Date(exp.date).toLocaleDateString("en-IN")}
                                </td>
                                <td className="px-6 py-4 flex gap-3">
                                    <button onClick={() => openEditModal(exp)} title="Edit">
                                        <Edit2 className="w-4 h-4 text-blue-600 hover:text-blue-800" />
                                    </button>
                                    <button onClick={() => setShowDeleteConfirm(exp._id)} title="Delete">
                                        <Trash2 className="w-4 h-4 text-red-600 hover:text-red-800" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Delete Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-sm w-full mx-4">
                        <h3 className="font-semibold mb-4">Delete Expense?</h3>
                        <p className="text-gray-600 mb-6">This action cannot be undone.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold mb-4">Edit Expense</h3>
                        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1">Category</label>
                                <select
                                    name="category"
                                    value={editFormData.category}
                                    onChange={handleEditChange}
                                    className="w-full border rounded-lg p-2"
                                >
                                    {categories.map((c) => (
                                        <option key={c._id} value={c.name}>{c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    name="amount"
                                    value={editFormData.amount}
                                    onChange={handleEditChange}
                                    step="0.01"
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Date</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={editFormData.date}
                                    onChange={handleEditChange}
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm mb-1">Note</label>
                                <textarea
                                    name="note"
                                    value={editFormData.note}
                                    onChange={handleEditChange}
                                    rows="3"
                                    className="w-full border rounded-lg p-2"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                                >
                                    Update Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={closeEditModal}
                                    className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
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