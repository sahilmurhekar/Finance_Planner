//frontend/src/components/Expenses/SpendingTrendChart.jsx
import React, { useEffect } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { useStatsStore } from "../../store/useStatsStore";

const SpendingTrendChart = () => {
    const { trendStats, fetchTrendStats } = useStatsStore();

    useEffect(() => {
        fetchTrendStats();
    }, [fetchTrendStats]);

    if (!trendStats || trendStats.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-500">No trend data available</p>
            </div>
        );
    }

    const data = trendStats.map((item) => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        }),
        amount: item.amount,
    }));

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                7-Day Spending Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                        formatter={(value) => `₹${value.toFixed(2)}`}
                        labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Line
                        type="monotone"
                        dataKey="amount"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: "#3B82F6", r: 4 }}
                        activeDot={{ r: 6 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SpendingTrendChart;