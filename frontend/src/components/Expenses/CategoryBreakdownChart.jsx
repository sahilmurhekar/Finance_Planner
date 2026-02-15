//frontend/src/components/Expenses/CategoryBreakdownChart.jsx
import React, { useEffect } from "react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import { useStatsStore } from "../../store/useStatsStore";

const CategoryBreakdownChart = ({ selectedDate = null }) => {
    const { dailyStats, fetchDailyStats } = useStatsStore();

    useEffect(() => {
        fetchDailyStats(selectedDate);
    }, [selectedDate, fetchDailyStats]);

    if (!dailyStats || !dailyStats.categoryBreakdown) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-500">Loading chart...</p>
            </div>
        );
    }

    const categories = Object.entries(dailyStats.categoryBreakdown).map(
        ([name, amount]) => ({
            name,
            value: parseFloat(amount.toFixed(2)),
        })
    );

    const COLORS = [
        "#3B82F6",
        "#EF4444",
        "#10B981",
        "#F59E0B",
        "#8B5CF6",
        "#EC4899",
        "#14B8A6",
        "#F97316",
    ];

    if (categories.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
                <p className="text-gray-500">No expenses to display</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Spending by Category
            </h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={categories}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) =>
                            `${name}: ₹${value.toFixed(2)}`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                    >
                        {categories.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                            />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value) => `₹${value.toFixed(2)}`}
                    />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>

            {/* Category List */}
            <div className="mt-6 space-y-2">
                {categories.map((cat, idx) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                            />
                            <span className="text-gray-700">{cat.name}</span>
                        </div>
                        <span className="font-semibold text-gray-900">
                            ₹{cat.value.toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryBreakdownChart;