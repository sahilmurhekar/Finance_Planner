//frontend/src/components/Dashboard/PortfolioGrowthChart.jsx
import React, { useState, useMemo } from "react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";
import { useMutualFundStore } from "../../store/useMutualFundStore";
import { useWalletStore } from "../../store/useWalletStore";

const FILTERS = [
    { label: "1D",  days: 1 },
    { label: "1W",  days: 7 },
    { label: "1M",  days: 30 },
    { label: "6M",  days: 180 },
    { label: "1Y",  days: 365 },
    { label: "3Y",  days: 365 * 3 },
    { label: "5Y",  days: 365 * 5 },
];

/**
 * Generates synthetic daily gain data points by interpolating from
 * each fund's purchase_date to today, simulating a smooth growth curve.
 * In production you'd replace this with real historical NAV data from your backend.
 */
function generateDataPoints(funds, binanceGainToday, days) {
    const today = new Date();
    const points = [];

    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.offsetDay = i;
        date.setDate(today.getDate() - i);
        const dayLabel = date;

        // For each fund, calculate how much was invested by this date
        // and estimate gain using a linear interpolation toward current gain
        let mfInvested = 0;
        let mfGain = 0;

        funds.forEach((fund) => {
            const purchaseDate = fund.purchase_date ? new Date(fund.purchase_date) : new Date();
            if (date >= purchaseDate) {
                const invested = parseFloat(fund.invested_amount) || 0;
                const units = parseFloat(fund.units) || 0;
                const nav = parseFloat(fund.current_nav) || 0;
                const currentGain = units * nav - invested;

                // How far through the fund's life is this date?
                const fundAgeDays = Math.max(1, (today - purchaseDate) / (1000 * 60 * 60 * 24));
                const pointAgeDays = Math.max(0, (date - purchaseDate) / (1000 * 60 * 60 * 24));
                const progress = Math.min(1, pointAgeDays / fundAgeDays);

                // Simulate S-curve growth: slow start, accelerating middle
                const eased = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                mfInvested += invested;
                mfGain += currentGain * eased;
            }
        });

        // Binance gain: scale linearly over the period
        const binanceProgress = Math.min(1, (days - i) / days);
        const binanceEased = binanceProgress < 0.5
            ? 2 * binanceProgress * binanceProgress
            : 1 - Math.pow(-2 * binanceProgress + 2, 2) / 2;
        const binanceGain = binanceGainToday * binanceEased;

        const totalGain = mfGain + binanceGain;

        points.push({
            date: dayLabel,
            mfGain: parseFloat(mfGain.toFixed(2)),
            binanceGain: parseFloat(binanceGain.toFixed(2)),
            totalGain: parseFloat(totalGain.toFixed(2)),
        });
    }

    return points;
}

function formatDateLabel(date, days) {
    if (days <= 1) {
        return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    } else if (days <= 30) {
        return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    } else if (days <= 365) {
        return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    } else {
        return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    }
}

// Thin out points to avoid overcrowded X-axis
function samplePoints(points, days) {
    if (days <= 1) return points;
    const maxPoints = days <= 7 ? points.length : days <= 30 ? 15 : days <= 180 ? 12 : 12;
    if (points.length <= maxPoints) return points;
    const step = Math.ceil(points.length / maxPoints);
    return points.filter((_, i) => i % step === 0 || i === points.length - 1);
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const total = payload.find(p => p.dataKey === "totalGain");
    const mf = payload.find(p => p.dataKey === "mfGain");
    const bin = payload.find(p => p.dataKey === "binanceGain");
    const isPos = (total?.value ?? 0) >= 0;

    return (
        <div className="bg-gray-900 text-white rounded-xl p-3 shadow-2xl border border-gray-700 text-sm min-w-[170px]">
            <p className="text-gray-400 text-xs mb-2">
                {label instanceof Date
                    ? label.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : label}
            </p>
            <p className={`text-base font-bold mb-2 ${isPos ? "text-green-400" : "text-red-400"}`}>
                {isPos ? "+" : ""}₹{Math.abs(total?.value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
            <div className="space-y-1 border-t border-gray-700 pt-2">
                <div className="flex justify-between gap-4">
                    <span className="text-blue-400 text-xs">Mutual Funds</span>
                    <span className="text-xs font-medium">₹{(mf?.value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between gap-4">
                    <span className="text-yellow-400 text-xs">Binance</span>
                    <span className="text-xs font-medium">₹{(bin?.value ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
            </div>
        </div>
    );
};

const PortfolioGrowthChart = () => {
    const { mutualFunds } = useMutualFundStore();
    const { totalUsdValue } = useWalletStore();
    const [activeFilter, setActiveFilter] = useState("1M");
    const [rate] = useState(() => {
        // Use a cached rate; SummaryCards already fetches the live rate.
        // Fallback to a reasonable default if not yet available.
        return 83.5;
    });
    const [view, setView] = useState("total"); // "total" | "split"

    const filterDays = FILTERS.find(f => f.label === activeFilter)?.days ?? 30;

    // Compute today's gains
    const mfInvested = mutualFunds.reduce((s, f) => s + (parseFloat(f.invested_amount) || 0), 0);
    const mfCurrent = mutualFunds.reduce((s, f) => {
        const units = parseFloat(f.units) || 0;
        const nav = parseFloat(f.current_nav) || 0;
        return s + units * nav;
    }, 0);
    const mfGainToday = mfCurrent - mfInvested;

    const binanceCurrent = totalUsdValue * rate;
    const binanceInvested = (() => {
        const stored = JSON.parse(localStorage.getItem("binanceInvested") || "{}");
        return Object.values(stored).reduce((s, v) => s + parseFloat(v || 0), 0);
    })();
    const binanceGainToday = binanceCurrent - binanceInvested;

    const totalGainToday = mfGainToday + binanceGainToday;
    const totalInvested = mfInvested + binanceInvested;
    const totalReturnPct = totalInvested > 0 ? ((totalGainToday / totalInvested) * 100).toFixed(2) : "0.00";
    const isPositive = totalGainToday >= 0;

    const rawPoints = useMemo(
        () => generateDataPoints(mutualFunds, binanceGainToday, filterDays),
        [mutualFunds, binanceGainToday, filterDays]
    );

    const chartData = useMemo(() => {
        const sampled = samplePoints(rawPoints, filterDays);
        return sampled.map(p => ({
            ...p,
            label: formatDateLabel(p.date, filterDays),
        }));
    }, [rawPoints, filterDays]);

    const minGain = Math.min(...chartData.map(p => p.totalGain));
    const maxGain = Math.max(...chartData.map(p => p.totalGain));
    const yPadding = Math.max(500, (maxGain - minGain) * 0.15);

    const gradientId = isPositive ? "gainGradient" : "lossGradient";

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            {/* Header row */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Portfolio Gain</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Estimated daily gain across all investments</p>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? "+" : ""}₹{Math.abs(totalGainToday).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {isPositive ? "▲" : "▼"} {Math.abs(totalReturnPct)}%
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 items-end">
                    {/* Time filter */}
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
                        {FILTERS.map(f => (
                            <button
                                key={f.label}
                                onClick={() => setActiveFilter(f.label)}
                                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                                    activeFilter === f.label
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* Split / Total toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
                        {["total", "split"].map(v => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize ${
                                    view === v
                                        ? "bg-white text-gray-900 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700"
                                }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Sub-stats */}
            <div className="flex gap-6 mb-5 text-sm">
                <div>
                    <span className="text-gray-400 text-xs">MF Gain</span>
                    <p className={`font-semibold ${mfGainToday >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {mfGainToday >= 0 ? "+" : ""}₹{Math.abs(mfGainToday).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <span className="text-gray-400 text-xs">Binance Gain</span>
                    <p className={`font-semibold ${binanceGainToday >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {binanceGainToday >= 0 ? "+" : ""}₹{Math.abs(binanceGainToday).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <span className="text-gray-400 text-xs">Total Invested</span>
                    <p className="font-semibold text-gray-700">
                        ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 10, bottom: 0 }}>
                    <defs>
                        <linearGradient id="gainGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="lossGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="mfGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="binGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `₹${Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                        domain={[minGain - yPadding, maxGain + yPadding]}
                        width={65}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke="#e5e7eb" strokeDasharray="4 4" />

                    {view === "total" ? (
                        <Area
                            type="monotone"
                            dataKey="totalGain"
                            stroke={isPositive ? "#22c55e" : "#ef4444"}
                            strokeWidth={2.5}
                            fill={`url(#${gradientId})`}
                            dot={false}
                            activeDot={{ r: 5, strokeWidth: 0 }}
                        />
                    ) : (
                        <>
                            <Area
                                type="monotone"
                                dataKey="mfGain"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#mfGradient)"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                name="Mutual Funds"
                            />
                            <Area
                                type="monotone"
                                dataKey="binanceGain"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fill="url(#binGradient)"
                                dot={false}
                                activeDot={{ r: 4, strokeWidth: 0 }}
                                name="Binance"
                            />
                        </>
                    )}
                </AreaChart>
            </ResponsiveContainer>

            {/* Legend for split view */}
            {view === "split" && (
                <div className="flex gap-5 mt-3 justify-center">
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
                        Mutual Funds
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
                        Binance
                    </div>
                </div>
            )}

            <p className="text-xs text-gray-400 mt-4 text-center">
                * Chart uses estimated growth curves based on current NAV and purchase dates.
                Connect a historical NAV API for precise day-by-day data.
            </p>
        </div>
    );
};

export default PortfolioGrowthChart;
