//frontend/src/components/Dashboard/MutualFundTable.jsx
import React, { useState, useEffect } from "react";
import { useMutualFundStore } from "../../store/useMutualFundStore";
import { Plus, Edit2, Trash2, RefreshCw } from "lucide-react";

const MutualFundTable = () => {
    const {
        mutualFunds,
        isLoading,
        fetchMutualFunds,
        addMutualFund,
        updateMutualFund,
        deleteMutualFund,
        refreshNAVs,
        addSipInstallment,
    } = useMutualFundStore();

    const [showForm, setShowForm] = useState(false);
    const [formMode, setFormMode] = useState("add"); // "add" | "sip" | "edit"
    const [editingId, setEditingId] = useState(null);

    const [addFundData, setAddFundData] = useState({ fund_name: "", scheme_code: "" });
    const [sipData, setSipData] = useState({ fund_id: "", amount: "", purchase_nav: "", purchase_date: "" });
    const [editData, setEditData] = useState({ fund_name: "", scheme_code: "" });

    useEffect(() => {
        fetchMutualFunds();
    }, [fetchMutualFunds]);

    const resetForms = () => {
        setShowForm(false);
        setFormMode("add");
        setEditingId(null);
        setAddFundData({ fund_name: "", scheme_code: "" });
        setSipData({ fund_id: "", amount: "", purchase_nav: "", purchase_date: "" });
        setEditData({ fund_name: "", scheme_code: "" });
    };

    const handleAddFundSubmit = async (e) => {
        e.preventDefault();
        try {
            await addMutualFund({
                fund_name: addFundData.fund_name,
                scheme_code: addFundData.scheme_code,
                invested_amount: 0,
                units: 0,
            });
            resetForms();
        } catch (error) {
            console.error("Error adding fund:", error);
        }
    };

    const handleSipSubmit = async (e) => {
        e.preventDefault();
        try {
            await addSipInstallment(sipData.fund_id, {
                amount: sipData.amount,
                purchase_nav: sipData.purchase_nav,
                purchase_date: sipData.purchase_date || undefined,
            });
            resetForms();
        } catch (error) {
            console.error("Error adding SIP installment:", error);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateMutualFund(editingId, editData);
            resetForms();
        } catch (error) {
            console.error("Error updating fund:", error);
        }
    };

    const handleEdit = (fund) => {
        setEditingId(fund._id);
        setEditData({ fund_name: fund.fund_name, scheme_code: fund.scheme_code });
        setFormMode("edit");
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

    // Compute derived values per fund
    const fundsWithCalc = mutualFunds.map((fund) => {
        const invested = parseFloat(fund.invested_amount) || 0;
        const units = parseFloat(fund.units) || 0;
        const nav = parseFloat(fund.current_nav) || 0;
        const currentValue = units * nav;
        const gain = currentValue - invested;
        const returnPct = invested > 0 ? ((gain / invested) * 100).toFixed(2) : "0.00";
        return { ...fund, invested, units, nav, currentValue, gain, returnPct };
    });

    const fmt = (n) =>
        n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    if (isLoading && mutualFunds.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Mutual Funds</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse text-gray-500">Loading funds...</div>
                </div>
            </div>
        );
    }

    // Totals
    const totalInvested = fundsWithCalc.reduce((s, f) => s + f.invested, 0);
    const totalValue = fundsWithCalc.reduce((s, f) => s + f.currentValue, 0);
    const totalGain = totalValue - totalInvested;
    const totalReturn = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : "0.00";
    const totalPositive = totalGain >= 0;

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Mutual Funds</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => { setFormMode("add"); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Fund
                    </button>
                    <button
                        onClick={() => { setFormMode("sip"); setShowForm(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add SIP
                    </button>
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh NAVs
                    </button>
                </div>
            </div>

            {/* Add Fund Form — only name + scheme code */}
            {showForm && formMode === "add" && (
                <form onSubmit={handleAddFundSubmit} className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-green-800 mb-3">Register a new Mutual Fund</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Fund Name"
                            value={addFundData.fund_name}
                            onChange={(e) => setAddFundData({ ...addFundData, fund_name: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Scheme Code"
                            value={addFundData.scheme_code}
                            onChange={(e) => setAddFundData({ ...addFundData, scheme_code: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium">
                            Add Fund
                        </button>
                        <button type="button" onClick={resetForms} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Add SIP Form — fund selector + amount + nav + date */}
            {showForm && formMode === "sip" && (
                <form onSubmit={handleSipSubmit} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-blue-800 mb-3">Add SIP Installment</p>
                    <div className="grid grid-cols-2 gap-4">
                        <select
                            value={sipData.fund_id}
                            onChange={(e) => setSipData({ ...sipData, fund_id: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm col-span-2"
                            required
                        >
                            <option value="">Select Fund</option>
                            {mutualFunds.map((fund) => (
                                <option key={fund._id} value={fund._id}>
                                    {fund.fund_name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="number"
                            placeholder="SIP Amount (₹)"
                            value={sipData.amount}
                            onChange={(e) => setSipData({ ...sipData, amount: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm"
                            step="0.01"
                            min="0"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Purchase NAV (₹)"
                            value={sipData.purchase_nav}
                            onChange={(e) => setSipData({ ...sipData, purchase_nav: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm"
                            step="0.0001"
                            min="0"
                            required
                        />
                        <input
                            type="date"
                            value={sipData.purchase_date}
                            onChange={(e) => setSipData({ ...sipData, purchase_date: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm text-gray-500"
                        />
                        {sipData.amount && sipData.purchase_nav && parseFloat(sipData.purchase_nav) > 0 && (
                            <div className="flex items-center text-sm text-blue-700 font-medium px-1">
                                Units to be added: {(parseFloat(sipData.amount) / parseFloat(sipData.purchase_nav)).toFixed(4)}
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                            Add Installment
                        </button>
                        <button type="button" onClick={resetForms} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Edit Fund Form — only name + scheme code */}
            {showForm && formMode === "edit" && (
                <form onSubmit={handleEditSubmit} className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Edit Fund Details</p>
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Fund Name"
                            value={editData.fund_name}
                            onChange={(e) => setEditData({ ...editData, fund_name: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Scheme Code"
                            value={editData.scheme_code}
                            onChange={(e) => setEditData({ ...editData, scheme_code: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2 text-sm"
                            required
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium">
                            Update Fund
                        </button>
                        <button type="button" onClick={resetForms} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium">
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {/* Table */}
            {fundsWithCalc.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-gray-500 text-sm">
                    No mutual funds added yet. Click "Add Fund" to register one, then use "Add SIP" to log installments.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                                <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Fund Name</th>
                                <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Scheme Code</th>
                                <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Total Invested</th>
                                <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Total Units</th>
                                <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Current NAV</th>
                                <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Current Value</th>
                                <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Gain / Loss</th>
                                <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Return %</th>
                                <th className="text-center py-3 px-4 text-gray-600 text-sm font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fundsWithCalc.map((fund) => {
                                const isPositive = fund.gain >= 0;
                                const hasSips = fund.invested > 0;
                                return (
                                    <tr key={fund._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 text-gray-900 font-medium">{fund.fund_name}</td>
                                        <td className="py-3 px-4 text-right text-gray-500 text-sm">{fund.scheme_code}</td>
                                        <td className="py-3 px-4 text-right text-gray-700">
                                            {hasSips
                                                ? `₹${fmt(fund.invested)}`
                                                : <span className="text-gray-400 text-xs italic">No SIPs yet</span>}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-600">
                                            {fund.units > 0 ? fund.units.toFixed(4) : "—"}
                                        </td>
                                        <td className="py-3 px-4 text-right text-gray-600">
                                            {fund.nav > 0 ? `₹${fund.nav.toFixed(2)}` : "—"}
                                        </td>
                                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                                            {fund.currentValue > 0 ? `₹${fmt(fund.currentValue)}` : "—"}
                                        </td>
                                        <td className={`py-3 px-4 text-right font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                            {hasSips
                                                ? `${isPositive ? "+" : ""}₹${fmt(fund.gain)}`
                                                : "—"}
                                        </td>
                                        <td className={`py-3 px-4 text-right font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                                            {hasSips ? `${isPositive ? "+" : ""}${fund.returnPct}%` : "—"}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(fund)}
                                                    className="p-1 hover:bg-blue-50 text-blue-600 rounded transition"
                                                    title="Edit fund name / scheme code"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(fund._id)}
                                                    className="p-1 hover:bg-red-50 text-red-600 rounded transition"
                                                    title="Delete fund"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}

                            {/* Portfolio totals row */}
                            {fundsWithCalc.length > 1 && (
                                <tr className="border-t-2 border-gray-300 bg-gray-50 font-bold">
                                    <td className="py-3 px-4 text-gray-900">Portfolio Total</td>
                                    <td className="py-3 px-4" />
                                    <td className="py-3 px-4 text-right text-gray-900">₹{fmt(totalInvested)}</td>
                                    <td className="py-3 px-4" />
                                    <td className="py-3 px-4" />
                                    <td className="py-3 px-4 text-right text-gray-900">₹{fmt(totalValue)}</td>
                                    <td className={`py-3 px-4 text-right ${totalPositive ? "text-green-600" : "text-red-600"}`}>
                                        {totalPositive ? "+" : ""}₹{fmt(totalGain)}
                                    </td>
                                    <td className={`py-3 px-4 text-right ${totalPositive ? "text-green-600" : "text-red-600"}`}>
                                        {totalPositive ? "+" : ""}{totalReturn}%
                                    </td>
                                    <td className="py-3 px-4" />
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default MutualFundTable;
