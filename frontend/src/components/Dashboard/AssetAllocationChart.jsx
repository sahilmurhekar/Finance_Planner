//frontend/src/components/Dashboard/AssetAllocationChart.jsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const AssetAllocationChart = ({ stats }) => {
    if (!stats || !stats.asset_allocation) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Allocation</h3>
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-pulse">Loading chart...</div>
                </div>
            </div>
        );
    }

    const { mutual_funds, crypto } = stats.asset_allocation;

    const data = [
        {
            name: "Mutual Funds",
            value: parseFloat(mutual_funds.amount),
            percentage: parseFloat(mutual_funds.percentage),
        },
        {
            name: "Crypto",
            value: parseFloat(crypto.amount),
            percentage: parseFloat(crypto.percentage),
        },
    ].filter((item) => item.value > 0);

    const COLORS = {
        "Mutual Funds": "#3B82F6", // blue
        Crypto: "#F59E0B", // orange
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
                    <p className="font-semibold text-gray-900">{payload[0].name}</p>
                    <p className="text-gray-600">₹{payload[0].value.toLocaleString()}</p>
                    <p className="text-gray-500 text-sm">{payload[0].payload.percentage}%</p>
                </div>
            );
        }
        return null;
    };

    if (data.length === 0) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Allocation</h3>
                <div className="h-64 flex items-center justify-center text-gray-500">
                    No data available. Add investments to see your asset allocation.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Asset Allocation</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ percentage }) => `${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default AssetAllocationChart;