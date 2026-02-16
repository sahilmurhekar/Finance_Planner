//frontend/src/components/Dashboard/CryptoTable.jsx
import React, { useState, useEffect } from "react";
import { useCryptoStore } from "../../store/useCryptoStore";
import { Plus, Edit2, Trash2, RefreshCw } from "lucide-react";

const CryptoTable = () => {
    const { cryptoHoldings, isLoading, fetchCryptoHoldings, addCryptoHolding, updateCryptoHolding, deleteCryptoHolding, refreshPrices } = useCryptoStore();

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        token_symbol: "",
        token_name: "",
        quantity: "",
        invested_amount: "",
        network: "Ethereum",
        wallet_address: "",
    });

    useEffect(() => {
        fetchCryptoHoldings();
    }, [fetchCryptoHoldings]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateCryptoHolding(editingId, formData);
            } else {
                await addCryptoHolding(formData);
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({
                token_symbol: "",
                token_name: "",
                quantity: "",
                invested_amount: "",
                network: "Ethereum",
                wallet_address: "",
            });
        } catch (error) {
            console.error("Error saving crypto holding:", error);
        }
    };

    const handleEdit = (holding) => {
        setEditingId(holding._id);
        setFormData({
            token_symbol: holding.token_symbol,
            token_name: holding.token_name,
            quantity: holding.quantity,
            invested_amount: holding.invested_amount,
            network: holding.network,
            wallet_address: holding.wallet_address,
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this holding?")) {
            try {
                await deleteCryptoHolding(id);
            } catch (error) {
                console.error("Error deleting holding:", error);
            }
        }
    };

    const handleRefresh = async () => {
        try {
            await refreshPrices();
        } catch (error) {
            console.error("Error refreshing prices:", error);
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Crypto Holdings</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh Prices
                    </button>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Add Holding
                    </button>
                </div>
            </div>

            {/* Add/Edit Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Token Symbol (e.g., BTC)"
                            value={formData.token_symbol}
                            onChange={(e) => setFormData({ ...formData, token_symbol: e.target.value.toUpperCase() })}
                            className="border border-gray-300 rounded px-3 py-2"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Token Name (e.g., Bitcoin)"
                            value={formData.token_name}
                            onChange={(e) => setFormData({ ...formData, token_name: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                            required
                        />
                        <input
                            type="number"
                            placeholder="Quantity"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                            step="0.00000001"
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
                        <select
                            value={formData.network}
                            onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                        >
                            <option value="Ethereum">Ethereum</option>
                            <option value="BSC">BSC</option>
                            <option value="Polygon">Polygon</option>
                            <option value="Other">Other</option>
                        </select>
                        <input
                            type="text"
                            placeholder="Wallet Address (Optional)"
                            value={formData.wallet_address}
                            onChange={(e) => setFormData({ ...formData, wallet_address: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                        >
                            {editingId ? "Update" : "Add"} Holding
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setEditingId(null);
                                setFormData({
                                    token_symbol: "",
                                    token_name: "",
                                    quantity: "",
                                    invested_amount: "",
                                    network: "Ethereum",
                                    wallet_address: "",
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
                            <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Token</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Quantity</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Invested</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Current Price</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Current Value</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Gain</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Return %</th>
                            <th className="text-center py-3 px-4 text-gray-600 text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cryptoHoldings.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="text-center py-8 text-gray-500">
                                    No crypto holdings added yet. Click "Add Holding" to get started.
                                </td>
                            </tr>
                        ) : (
                            cryptoHoldings.map((holding) => (
                                <tr key={holding._id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div>
                                            <p className="text-gray-900 font-medium">{holding.token_symbol}</p>
                                            <p className="text-gray-500 text-sm">{holding.token_name}</p>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-right text-gray-900">{parseFloat(holding.quantity).toFixed(8)}</td>
                                    <td className="py-3 px-4 text-right text-gray-900">₹{parseFloat(holding.invested_amount).toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">${parseFloat(holding.current_price).toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-gray-900 font-semibold">₹{parseFloat(holding.current_value).toLocaleString()}</td>
                                    <td className={`py-3 px-4 text-right font-semibold ${parseFloat(holding.gain) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        ₹{parseFloat(holding.gain).toLocaleString()}
                                    </td>
                                    <td className={`py-3 px-4 text-right font-semibold ${parseFloat(holding.return_percentage) >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {holding.return_percentage}%
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(holding)}
                                                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(holding._id)}
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

export default CryptoTable;