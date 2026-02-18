//frontend/src/components/Dashboard/SummaryCards.jsx
import React, { useEffect, useState } from "react";
import { TrendingUp, DollarSign, PieChart } from "lucide-react";
import { useMutualFundStore } from "../../store/useMutualFundStore";
import { useWalletStore } from "../../store/useWalletStore";

const SummaryCards = ({ stats }) => {
    const { mutualFunds } = useMutualFundStore();
    const { totalUsdValue } = useWalletStore();
    const [rate, setRate] = useState(0);
    const [binanceInvested, setBinanceInvested] = useState(0);

    useEffect(() => {
        fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=inr')
            .then(res => res.json())
            .then(data => setRate(data.tether.inr))
            .catch(error => console.error('Error fetching rate:', error));
    }, []);

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('binanceInvested') || '{}');
        const total = Object.values(stored).reduce((sum, v) => sum + parseFloat(v || 0), 0);
        setBinanceInvested(total);
    }, [totalUsdValue]);

    if (rate === 0) {
        return <div className="text-gray-500 text-sm">Loading exchange rate...</div>;
    }

    // Compute MF values correctly: current_value = units × current_nav
    const mfInvested = mutualFunds.reduce((sum, f) => sum + (parseFloat(f.invested_amount) || 0), 0);
    const mfCurrent = mutualFunds.reduce((sum, f) => {
        const units = parseFloat(f.units) || 0;
        const nav = parseFloat(f.current_nav) || 0;
        return sum + units * nav;
    }, 0);
    const mfGain = mfCurrent - mfInvested;
    const mfReturnPct = mfInvested > 0 ? ((mfGain / mfInvested) * 100).toFixed(2) : '0.00';

    // Binance values
    const binanceCurrent = totalUsdValue * rate;
    const binanceGain = binanceCurrent - binanceInvested;
    const binanceReturnPct = binanceInvested > 0 ? ((binanceGain / binanceInvested) * 100).toFixed(2) : '0.00';

    // Portfolio totals
    const totalInvested = mfInvested + binanceInvested;
    const totalCurrent = mfCurrent + binanceCurrent;
    const totalGain = totalCurrent - totalInvested;
    const totalReturnPct = totalInvested > 0 ? ((totalGain / totalInvested) * 100).toFixed(2) : '0.00';

    const fmt = (n) => Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const sign = (n) => n >= 0 ? '+' : '-';

    const sections = [
        {
            label: "Mutual Funds",
            invested: mfInvested,
            current: mfCurrent,
            gain: mfGain,
            returnPct: mfReturnPct,
            accentColor: "blue",
        },
        {
            label: "Binance",
            invested: binanceInvested,
            current: binanceCurrent,
            gain: binanceGain,
            returnPct: binanceReturnPct,
            accentColor: "yellow",
        },
        {
            label: "Portfolio Total",
            invested: totalInvested,
            current: totalCurrent,
            gain: totalGain,
            returnPct: totalReturnPct,
            accentColor: "purple",
            highlight: true,
        },
    ];

    const accentMap = {
        blue:   { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   icon: "bg-blue-100 text-blue-600"   },
        yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", icon: "bg-yellow-100 text-yellow-600" },
        purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", icon: "bg-purple-100 text-purple-600" },
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {sections.map((s) => {
                const ac = accentMap[s.accentColor];
                const gainPositive = s.gain >= 0;
                return (
                    <div
                        key={s.label}
                        className={`rounded-xl border p-5 ${s.highlight ? `${ac.bg} ${ac.border}` : "bg-white border-gray-200"} hover:shadow-md transition-shadow`}
                    >
                        {/* Section title */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className={`p-2 rounded-lg ${ac.icon}`}>
                                <PieChart className="w-4 h-4" />
                            </div>
                            <p className={`font-semibold text-sm ${s.highlight ? ac.text : "text-gray-700"}`}>
                                {s.label}
                            </p>
                        </div>

                        {/* Stats grid */}
                        <div className="space-y-3">
                            {/* Invested */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" /> Invested
                                </span>
                                <span className="text-sm font-semibold text-gray-800">
                                    ₹{fmt(s.invested)}
                                </span>
                            </div>

                            {/* Current Value */}
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                    <TrendingUp className="w-3 h-3" /> Current Value
                                </span>
                                <span className="text-sm font-semibold text-gray-900">
                                    ₹{fmt(s.current)}
                                </span>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 pt-2 mt-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-500">Gain / Return</span>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${gainPositive ? "text-green-600" : "text-red-600"}`}>
                                            {sign(s.gain)}₹{fmt(s.gain)}
                                        </span>
                                        <span className={`ml-2 text-xs font-semibold px-1.5 py-0.5 rounded ${gainPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {sign(s.gain)}{Math.abs(s.returnPct)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
