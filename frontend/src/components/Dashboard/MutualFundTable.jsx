//frontend/src/components/Dashboard/MutualFundTable.jsx
import React, { useState, useEffect } from "react";
import { useMutualFundStore } from "../../store/useMutualFundStore";
import { Plus, Edit2, Trash2, RefreshCw } from "lucide-react";

const MutualFundTable = () => {
    const { mutualFunds, isLoading, fetchMutualFunds, addMutualFund, updateMutualFund, deleteMutualFund, refreshNAVs } = useMutualFundStore();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        fund_name: "",
        scheme_code: "",
        invested_amount: "",
        units: "",
        expected_value: "",
    });

    useEffect(() => {
        fetchMutualFunds();
    }, [fetchMutualFunds]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateMutualFund(editingId, formData);
            } else {
                await addMutualFund(formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({
                fund_name: "",
                scheme_code: "",
                invested_amount: "",
                units: "",
                expected_value: "",
            });
        } catch (error) {
            console.error("Error saving mutual fund:", error);
        }
    };

    const handleEdit = (fund) => {
        setEditingId(fund._id);
        setFormData({
            fund_name: fund.fund_name,
            scheme_code: fund.scheme_code,
            invested_amount: fund.invested_amount,
            units: fund.units,
            expected_value: fund.expected_value,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this fund?")) {
            try {
                await deleteMutualFund(id);
            } catch (error) {
                console.error("Error deleting fund:", error);
            }
        }
    };

    const handleRefresh = async () => {
        try {
            await refreshNAVs();
        } catch (error) {
            console.error("Error refreshing NAVs:", error);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Mutual Funds</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh NAV
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Fund
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Fund Name"
                            value={formData.fund_name}
                            onChange={(e) => setFormData({ ...formData, fund_name: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Scheme Code"
                            value={formData.scheme_code}
                            onChange={(e) => setFormData({ ...formData, scheme_code: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Invested Amount"
                            value={formData.invested_amount}
                            onChange={(e) => setFormData({ ...formData, invested_amount: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                            step="0.01"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Units"
                            value={formData.units}
                            onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                            step="0.01"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Expected Value (Optional)"
                            value={formData.expected_value}
                            onChange={(e) => setFormData({ ...formData, expected_value: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                            step="0.01"
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                        >
                            {editingId ? "Update" : "Add"} Fund
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData({
                                    fund_name: "",
                                    scheme_code: "",
                                    invested_amount: "",
                                    units: "",
                                    expected_value: "",
                                });
                            }}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Fund Name</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Invested</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Current NAV</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Current Value</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Gain</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Return %</th>
                            <th className="text-center py-3 px-4 text-gray-600 text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {mutualFunds.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-gray-500">
                                    No mutual funds added yet. Click "Add Fund" to get started.
                                </td>
                            </tr>
                        ) : (
                            mutualFunds.map((fund) => (
                                <tr key={fund._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-900 font-medium">{fund.fund_name}</td>
                                    <td className="py-3 px-4 text-right text-gray-900">₹{parseFloat(fund.invested_amount).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">₹{parseFloat(fund.current_nav).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-gray-900 font-semibold">₹{parseFloat(fund.current_value).toLocaleString()}</td>
                                    <td className={`py-3 px-4 text-right font-semibold ${parseFloat(fund.gain) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        ₹{parseFloat(fund.gain).toLocaleString()}
                                    </td>
                                    <td className={`py-3 px-4 text-right font-semibold ${parseFloat(fund.return_percentage) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {fund.return_percentage}%
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(fund)}
                                                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(fund._id)}
                                                className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MutualFundTable;