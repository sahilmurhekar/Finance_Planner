//frontend/src/components/Expenses/CategoryManagement.jsx
import React, { useState, useEffect } from "react";
import { useExpenseStore } from "../../store/useExpenseStore";
import { Edit2, Trash2, Plus } from "lucide-react";

const CategoryManagement = () => {
    const {
        categories,
        fetchCategories,
        addCategory,
        updateCategory,
        deleteCategory,
        isLoading,
    } = useExpenseStore();

    const [formData, setFormData] = useState({
        name: "",
        monthly_limit: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
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

        if (!formData.name.trim()) {
            setError("Category name is required");
            return;
        }

        if (!formData.monthly_limit || parseFloat(formData.monthly_limit) <= 0) {
            setError("Monthly limit must be greater than 0");
            return;
        }

        try {
            if (editingId) {
                await updateCategory(editingId, {
                    name: formData.name,
                    monthly_limit: parseFloat(formData.monthly_limit),
                });
                setMessage("Category updated successfully!");
                setEditingId(null);
            } else {
                await addCategory({
                    name: formData.name,
                    monthly_limit: parseFloat(formData.monthly_limit),
                });
                setMessage("Category added successfully!");
            }

            setFormData({ name: "", monthly_limit: "" });
            setTimeout(() => setMessage(""), 2000);
        } catch (err) {
            setError(err.response?.data?.error || "Operation failed");
        }
    };

    const handleEdit = (category) => {
        setEditingId(category._id);
        setFormData({
            name: category.name,
            monthly_limit: category.monthly_limit.toString(),
        });
    };

    const handleDelete = async (id) => {
        try {
            await deleteCategory(id);
            setShowDeleteConfirm(null);
            setMessage("Category deleted successfully!");
            setTimeout(() => setMessage(""), 2000);
        } catch (err) {
            setError("Failed to delete category");
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setFormData({ name: "", monthly_limit: "" });
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Category Management
            </h2>

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

            {/* Form */}
            <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="e.g., Food, Transport"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Monthly Limit (₹)
                        </label>
                        <input
                            type="number"
                            name="monthly_limit"
                            value={formData.monthly_limit}
                            onChange={handleChange}
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {isLoading ? "Processing..." : editingId ? "Update" : "Add"}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            {/* Categories Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Monthly Limit
                            </th>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {categories.map((category) => (
                            <tr key={category._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    {category.name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                    ₹{category.monthly_limit.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-sm flex gap-2">
                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(category._id)}
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

            {categories.length === 0 && (
                <p className="text-center text-gray-500 py-8">No categories yet</p>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Delete Category?
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this category? This action cannot
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

export default CategoryManagement;