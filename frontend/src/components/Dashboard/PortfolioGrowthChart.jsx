// frontend/src/components/Dashboard/PortfolioGrowthChart.jsx
import React, { useState, useMemo, useEffect } from "react";
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

const FILTERS = [
    { label: "1D", days: 1 },
    { label: "1W", days: 7 },
    { label: "1M", days: 30 },
    { label: "6M", days: 180 },
    { label: "1Y", days: 365 },
    { label: "3Y", days: 365 * 3 },
    { label: "5Y", days: 365 * 5 },
];

function generateDataPoints(funds, days) {
    const today = new Date();
    const points = [];

    for (let i = days; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        let mfGain = 0;

        funds.forEach((fund) => {
            const purchaseDate = fund.purchase_date ? new Date(fund.purchase_date) : new Date();
            if (date >= purchaseDate) {
                const invested = parseFloat(fund.invested_amount) || 0;
                const units = parseFloat(fund.units) || 0;
                const nav = parseFloat(fund.current_nav) || 0;
                const currentGain = units * nav - invested;

                const fundAgeDays = Math.max(1, (today - purchaseDate) / (1000 * 60 * 60 * 24));
                const pointAgeDays = Math.max(0, (date - purchaseDate) / (1000 * 60 * 60 * 24));
                const progress = Math.min(1, pointAgeDays / fundAgeDays);

                const eased = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;

                mfGain += currentGain * eased;
            }
        });

        points.push({
            date,
            mfGain: parseFloat(mfGain.toFixed(2)),
            totalGain: parseFloat(mfGain.toFixed(2)),
        });
    }
    return points;
}

function formatDateLabel(date, days) {
    if (days <= 1) return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    if (days <= 30) return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
    if (days <= 365) return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    return date.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function samplePoints(points, days) {
    if (days <= 1) return points;
    const maxPoints = days <= 7 ? points.length : days <= 30 ? 15 : 12;
    if (points.length <= maxPoints) return points;
    const step = Math.ceil(points.length / maxPoints);
    return points.filter((_, i) => i % step === 0 || i === points.length - 1);
}

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const total = payload.find(p => p.dataKey === "totalGain");
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
        </div>
    );
};

const PortfolioGrowthChart = () => {
    const { mutualFunds } = useMutualFundStore();
    const [activeFilter, setActiveFilter] = useState("1M");

    const filterDays = FILTERS.find(f => f.label === activeFilter)?.days ?? 30;

    const chartData = useMemo(() => {
        const points = generateDataPoints(mutualFunds, filterDays);
        return samplePoints(points, filterDays).map((p) => ({
            ...p,
            label: formatDateLabel(p.date, filterDays),
        }));
    }, [mutualFunds, filterDays]);

    // Today's MF values (only asset left)
    const mfInvested = mutualFunds.reduce((s, f) => s + (parseFloat(f.invested_amount) || 0), 0);
    const mfCurrent = mutualFunds.reduce((s, f) => {
        const units = parseFloat(f.units) || 0;
        const nav = parseFloat(f.current_nav) || 0;
        return s + units * nav;
    }, 0);
    const mfGainToday = mfCurrent - mfInvested;

    const totalInvested = mfInvested;
    const totalGainToday = mfGainToday;
    const totalReturnPct = mfInvested > 0 ? ((mfGainToday / mfInvested) * 100).toFixed(2) : "0.00";
    const isPositive = totalGainToday >= 0;

    const minGain = Math.min(...chartData.map(p => p.totalGain), 0);
    const maxGain = Math.max(...chartData.map(p => p.totalGain), 0);
    const yPadding = Math.max(500, (maxGain - minGain) * 0.15);

    const gradientId = isPositive ? "gainGradient" : "lossGradient";

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Portfolio Gain</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Estimated daily gain across your mutual funds</p>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className={`text-3xl font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                            {isPositive ? "+" : ""}₹{Math.abs(totalGainToday).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${isPositive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                            {isPositive ? "▲" : "▼"} {Math.abs(totalReturnPct)}%
                        </span>
                    </div>
                </div>

                <div className="flex bg-gray-100 rounded-lg p-1 gap-0.5">
                    {FILTERS.map(f => (
                        <button
                            key={f.label}
                            onClick={() => setActiveFilter(f.label)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${activeFilter === f.label
                                ? "bg-white text-gray-900 shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex gap-6 mb-5 text-sm">
                <div>
                    <span className="text-gray-400 text-xs">MF Gain</span>
                    <p className={`font-semibold ${mfGainToday >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {mfGainToday >= 0 ? "+" : ""}₹{Math.abs(mfGainToday).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div>
                    <span className="text-gray-400 text-xs">Total Invested</span>
                    <p className="font-semibold text-gray-700">
                        ₹{totalInvested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

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

                    <Area
                        type="monotone"
                        dataKey="totalGain"
                        stroke={isPositive ? "#22c55e" : "#ef4444"}
                        strokeWidth={2.5}
                        fill={`url(#${gradientId})`}
                        dot={false}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                    />
                </AreaChart>
            </ResponsiveContainer>

            <p className="text-xs text-gray-400 mt-4 text-center">
                * Chart uses estimated growth curves based on current NAV and purchase dates.
            </p>
        </div>
    );
};

export default PortfolioGrowthChart;