//frontend/src/components/Dashboard/BinancePortfolio.jsx
import React, { useState, useEffect } from "react";
import { useWalletStore } from "../../store/useWalletStore";
import { Edit2, RefreshCw } from "lucide-react";

const BinancePortfolio = () => {
    const { holdings, totalUsdValue, isLoading, lastUpdated, fetchHoldings } = useWalletStore();
    const [rate, setRate] = useState(0);
    const [localHoldings, setLocalHoldings] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingAsset, setEditingAsset] = useState(null);
    const [formData, setFormData] = useState({ invested_amount: "" });

    useEffect(() => {
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr')
            .then(res => res.json())
            .then(data => setRate(data.tether.inr))
            .catch(error => console.error('Error fetching rate:', error));
    }, []);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('binanceInvested') || '{}');
        const updated = holdings.map(h => ({
            ...h,
            invested: parseFloat(stored[h.asset] || 0),
            current_price: h.usdValue / parseFloat(h.free || 1),
        }));
        setLocalHoldings(updated);
    }, [holdings]);

    const handleEdit = (holding) => {
        setEditingAsset(holding.asset);
        setFormData({ invested_amount: holding.invested.toString() });
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const invested = parseFloat(formData.invested_amount);
        const stored = JSON.parse(localStorage.getItem('binanceInvested') || '{}');
        stored[editingAsset] = invested;
        localStorage.setItem('binanceInvested', JSON.stringify(stored));

        const updated = localHoldings.map(h =>
            h.asset === editingAsset ? { ...h, invested } : h
        );
        setLocalHoldings(updated);
        setShowForm(false);
        setEditingAsset(null);
    };

    const handleRefresh = async () => {
        await fetchHoldings();
    };

    if (isLoading || rate === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Binance Portfolio</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse">Loading portfolio...</div>
                </div>
            </div>
        );
    }

    if (holdings.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Binance Portfolio</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    No holdings found in Binance.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Binance Holdings</h2>
                <div className="flex gap-2">
                    <button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition text-sm font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 gap-4">
                        <input
                            type="number"
                            placeholder="Invested Amount (INR)"
                            value={formData.invested_amount}
                            onChange={(e) => setFormData({ ...formData, invested_amount: e.target.value })}
                            className="border border-gray-300 rounded px-3 py-2"
                            step="0.01"
                            required
                        />
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
                        >
                            Update Invested
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 text-gray-600 text-sm font-semibold">Asset</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Quantity</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Invested (₹)</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Current Price ($)</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Current Value (₹)</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Gain (₹)</th>
                            <th className="text-right py-3 px-4 text-gray-600 text-sm font-semibold">Return %</th>
                            <th className="text-center py-3 px-4 text-gray-600 text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {localHoldings.map((holding) => {
                            const currentValueInr = holding.usdValue * rate;
                            const gain = currentValueInr - holding.invested;
                            const returnPercentage = holding.invested > 0 ? ((gain / holding.invested) * 100).toFixed(2) : '0.00';
                            return (
                                <tr key={holding.asset} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 text-gray-900 font-medium">{holding.asset}</td>
                                    <td className="py-3 px-4 text-right text-gray-900">{Number(holding.free).toFixed(8)}</td>
                                    <td className="py-3 px-4 text-right text-gray-900">₹{holding.invested.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">${holding.current_price.toFixed(2)}</td>
                                    <td className="py-3 px-4 text-right text-gray-900 font-semibold">₹{currentValueInr.toLocaleString()}</td>
                                    <td className={`py-3 px-4 text-right font-semibold ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        ₹{gain.toLocaleString()}
                                    </td>
                                    <td className={`py-3 px-4 text-right font-semibold ${gain >= 0 ? "text-green-600" : "text-red-600"}`}>
                                        {returnPercentage}%
                                    </td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleEdit(holding)}
                                                className="p-1 hover:bg-blue-50 text-blue-600 rounded transition"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            <div className="mt-4 flex justify-end">
                <p className="text-lg font-bold text-gray-900">Total Current: ₹{(totalUsdValue * rate).toLocaleString()}</p>
            </div>
        </div>
    );
};

export default BinancePortfolio;
