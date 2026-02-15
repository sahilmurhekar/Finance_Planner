//frontend/src/components/Expenses/ExpensesList.jsx
import React, { useEffect, useState } from "react";
import { useExpenseStore } from "../../store/useExpenseStore";
import { Edit2, Trash2 } from "lucide-react";

const ExpensesList = ({ selectedDate = null }) => {
    const {
        expenses,
        fetchExpenses,
        deleteExpense,
        isLoading,
        selectedDate: storeDate,
    } = useExpenseStore();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
    const [editingId, setEditingId] = useState(null);

    const dateToShow = selectedDate || storeDate;

    useEffect(() => {
        fetchExpenses({ date: dateToShow });
    }, [dateToShow, fetchExpenses]);

    const handleDelete = async (id) => {
        try {
            await deleteExpense(id);
            setShowDeleteConfirm(null);
        } catch (err) {
            console.error("Failed to delete:", err);
        }
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
                <p className="text-gray-500">No expenses for this date.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Category
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Amount
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Note
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Date
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {expenses.map((expense) => (
                            <tr
                                key={expense._id}
                                className="hover:bg-gray-50 transition-colors"
                            >
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    {expense.category}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                    ₹{expense.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {expense.note || "-"}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {new Date(expense.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button
                                        onClick={() => setEditingId(expense._id)}
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

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delete Expense?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this expense? This action cannot
                            be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpensesList;