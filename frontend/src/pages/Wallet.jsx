//frontend/src/pages/Wallet.jsx
import React, { useEffect, useState } from 'react';
import { RotateCw, Search, AlertCircle, TrendingUp, Wallet as WalletIcon, DollarSign, BarChart2 } from 'lucide-react';
import { useWalletStore } from '../store/useWalletStore';

const Wallet = () => {
    const {
        holdings,
        totalUsdValue,
        isLoading,
        error,
        lastUpdated,
        fetchHoldings,
        clearError,
    } = useWalletStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [rate, setRate] = useState(83.5);
    const [sortBy, setSortBy] = useState('value'); // 'value' | 'name' | 'share'
    const [investedMap, setInvestedMap] = useState({});

    useEffect(() => {
        fetchHoldings();
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr')
            .then(r => r.json())
            .then(d => setRate(d.tether?.inr || 83.5))
            .catch(() => {});
        const stored = JSON.parse(localStorage.getItem('binanceInvested') || '{}');
        setInvestedMap(stored);
    }, []);

    const totalInvestedInr = Object.values(investedMap).reduce((s, v) => s + parseFloat(v || 0), 0);
    const totalCurrentInr = totalUsdValue * rate;
    const totalGainInr = totalCurrentInr - totalInvestedInr;
    const totalReturnPct = totalInvestedInr > 0 ? ((totalGainInr / totalInvestedInr) * 100).toFixed(2) : '0.00';
    const isPositive = totalGainInr >= 0;

    const fmt = (n) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const fmtUsd = (n) => n >= 0.01
        ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : '<$0.01';
    const fmtQty = (n) => {
        const v = Number(n);
        if (v === 0) return '0';
        if (v < 0.0001) return v.toExponential(4);
        return v.toLocaleString('en-US', { maximumFractionDigits: 6 });
    };

    const sorted = [...holdings]
        .filter(h => h.asset.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'name') return a.asset.localeCompare(b.asset);
            if (sortBy === 'share') return b.usdValue - a.usdValue;
            return b.usdValue - a.usdValue; // default: value
        });

    const topAsset = holdings.length > 0
        ? holdings.reduce((a, b) => a.usdValue > b.usdValue ? a : b, holdings[0])
        : null;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Binance Wallet</h1>
                        <p className="text-gray-500 text-sm">
                            Live spot holdings from your Binance account
                            {lastUpdated && (
                                <span className="ml-2 text-gray-400">
                                    · Updated {new Date(lastUpdated).toLocaleTimeString()}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        onClick={fetchHoldings}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition text-sm"
                    >
                        <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        {isLoading ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-red-800">Failed to fetch holdings</p>
                                <p className="text-sm text-red-600 mt-0.5">{error}</p>
                            </div>
                        </div>
                        <button onClick={clearError} className="text-red-400 hover:text-red-600 text-xl font-bold leading-none">×</button>
                    </div>
                )}

                {/* Summary Cards */}
                {totalUsdValue > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {/* Total Current Value */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-500 text-sm font-medium">Current Value</p>
                                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                                    <WalletIcon className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">₹{fmt(totalCurrentInr)}</p>
                            <p className="text-xs text-gray-400 mt-1">{fmtUsd(totalUsdValue)} · {holdings.length} assets</p>
                        </div>

                        {/* Total Invested */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-500 text-sm font-medium">Total Invested</p>
                                <div className="p-2 rounded-lg bg-green-50 text-green-600">
                                    <DollarSign className="w-4 h-4" />
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-gray-900">₹{fmt(totalInvestedInr)}</p>
                            <p className="text-xs text-gray-400 mt-1">Manually tracked</p>
                        </div>

                        {/* Gain / Loss */}
                        <div className={`border rounded-xl p-5 hover:shadow-md transition-shadow ${isPositive ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                            <div className="flex items-center justify-between mb-4">
                                <p className={`text-sm font-medium ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                                    Overall Gain
                                </p>
                                <div className={`p-2 rounded-lg ${isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <TrendingUp className="w-4 h-4" />
                                </div>
                            </div>
                            <p className={`text-2xl font-bold ${isPositive ? 'text-green-700' : 'text-red-700'}`}>
                                {isPositive ? '+' : ''}₹{fmt(totalGainInr)}
                            </p>
                            <p className={`text-xs mt-1 font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                {isPositive ? '▲' : '▼'} {Math.abs(totalReturnPct)}% all time
                            </p>
                        </div>
                    </div>
                )}

                {/* Loading Skeleton */}
                {isLoading && holdings.length === 0 && (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gray-200 rounded-full" />
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded w-16 mb-1.5" />
                                            <div className="h-3 bg-gray-100 rounded w-24" />
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="h-4 bg-gray-200 rounded w-20 mb-1.5" />
                                        <div className="h-3 bg-gray-100 rounded w-14" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Holdings List */}
                {(!isLoading || holdings.length > 0) && (
                    <>
                        {/* Search + Sort Bar */}
                        <div className="flex items-center gap-3 mb-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search asset…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                                />
                            </div>
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                            >
                                <option value="value">Sort: Value</option>
                                <option value="name">Sort: Name</option>
                                <option value="share">Sort: Share %</option>
                            </select>
                        </div>

                        {/* Empty State */}
                        {sorted.length === 0 && !isLoading && (
                            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
                                <BarChart2 className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">
                                    {holdings.length === 0
                                        ? 'No holdings found in your Binance Spot account.'
                                        : 'No assets match your search.'}
                                </p>
                            </div>
                        )}

                        {/* Table Header */}
                        {sorted.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50">
                                            <th className="text-left py-3 px-5 text-gray-500 text-xs font-semibold uppercase tracking-wide">Asset</th>
                                            <th className="text-right py-3 px-5 text-gray-500 text-xs font-semibold uppercase tracking-wide">Quantity</th>
                                            <th className="text-right py-3 px-5 text-gray-500 text-xs font-semibold uppercase tracking-wide">Price</th>
                                            <th className="text-right py-3 px-5 text-gray-500 text-xs font-semibold uppercase tracking-wide">Value (₹)</th>
                                            <th className="text-right py-3 px-5 text-gray-500 text-xs font-semibold uppercase tracking-wide hidden md:table-cell">Portfolio %</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sorted.map((h, idx) => {
                                            const sharePercent = totalUsdValue > 0
                                                ? ((h.usdValue / totalUsdValue) * 100).toFixed(1)
                                                : '0.0';
                                            const currentInr = h.usdValue * rate;
                                            const isTop = topAsset?.asset === h.asset;

                                            return (
                                                <tr
                                                    key={h.asset}
                                                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors last:border-0"
                                                >
                                                    {/* Asset */}
                                                    <td className="py-4 px-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs flex-shrink-0">
                                                                {h.asset.slice(0, 3)}
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-semibold text-gray-900 text-sm">{h.asset}</p>
                                                                    {isTop && (
                                                                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Top</span>
                                                                    )}
                                                                </div>
                                                                {Number(h.locked) > 0 && (
                                                                    <p className="text-xs text-orange-500 mt-0.5">
                                                                        {fmtQty(h.locked)} locked
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Quantity */}
                                                    <td className="py-4 px-5 text-right">
                                                        <span className="font-mono text-sm text-gray-700">{fmtQty(h.free)}</span>
                                                    </td>

                                                    {/* Price */}
                                                    <td className="py-4 px-5 text-right">
                                                        <span className="text-sm text-gray-500">
                                                            {h.price ? fmtUsd(h.price) : '—'}
                                                        </span>
                                                    </td>

                                                    {/* Value INR */}
                                                    <td className="py-4 px-5 text-right">
                                                        <p className="font-semibold text-gray-900 text-sm">₹{fmt(currentInr)}</p>
                                                        <p className="text-xs text-gray-400">{fmtUsd(h.usdValue)}</p>
                                                    </td>

                                                    {/* Portfolio % with bar */}
                                                    <td className="py-4 px-5 hidden md:table-cell">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <div className="w-20 bg-gray-100 rounded-full h-1.5">
                                                                <div
                                                                    className="bg-blue-500 h-1.5 rounded-full"
                                                                    style={{ width: `${Math.min(parseFloat(sharePercent), 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-sm text-gray-600 font-medium w-10 text-right">
                                                                {sharePercent}%
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>

                                    {/* Footer total */}
                                    {sorted.length > 1 && (
                                        <tfoot>
                                            <tr className="border-t-2 border-gray-200 bg-gray-50">
                                                <td className="py-3 px-5 font-bold text-gray-900 text-sm">Total</td>
                                                <td className="py-3 px-5" />
                                                <td className="py-3 px-5" />
                                                <td className="py-3 px-5 text-right font-bold text-gray-900 text-sm">
                                                    ₹{fmt(totalCurrentInr)}
                                                    <p className="text-xs text-gray-400 font-normal">{fmtUsd(totalUsdValue)}</p>
                                                </td>
                                                <td className="py-3 px-5 hidden md:table-cell text-right font-bold text-gray-600 text-sm">100%</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Wallet;
