//frontend/src/components/Expenses/AverageDailySpending.jsx (UPDATED)
import React, { useEffect, useState } from "react";
import { useExpenseStore } from "../../store/useExpenseStore";
import { TrendingDown, TrendingUp } from "lucide-react";

const AverageDailySpending = ({ month = null }) => {
    const { fetchExpenses, expenses } = useExpenseStore();
    const [averageSpending, setAverageSpending] = useState(0);
    const [daysInMonth, setDaysInMonth] = useState(0);
    const [totalMonthlySpending, setTotalMonthlySpending] = useState(0);

    useEffect(() => {
        // Get current month if not provided
        const monthToUse = month || (() => {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        })();

        // Fetch expenses for THIS MONTH ONLY
        fetchExpenses({ month: monthToUse }).then((data) => {
            if (data && data.length > 0) {
                // Calculate days in month
                const [year, monthNum] = monthToUse.split("-");
                const lastDay = new Date(year, parseInt(monthNum), 0).getDate();

                const total = data.reduce((sum, exp) => sum + exp.amount, 0);
                const avg = total / lastDay;

                setAverageSpending(avg);
                setDaysInMonth(lastDay);
                setTotalMonthlySpending(total);
            }
        });
    }, [month, fetchExpenses]);

    // Determine trend
    const trend = averageSpending < 1000 ? "down" : "up";
    const trendColor = trend === "down" ? "text-green-600" : "text-orange-600";
    const trendIcon = trend === "down" ? TrendingDown : TrendingUp;
    const TrendIcon = trendIcon;

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                        Monthly Spending Insights
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Current month only</p>
                </div>
                <TrendIcon className={`w-6 h-6 ${trendColor}`} />
            </div>

            {/* Key Metrics */}
            <div className="space-y-4">
                {/* Daily Average */}
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <p className="text-xs font-medium text-blue-600 mb-1">Daily Average</p>
                    <p className="text-2xl font-bold text-blue-900">
                        ₹{averageSpending.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">Per day this month</p>
                </div>

                {/* Total Monthly */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <p className="text-xs font-medium text-purple-600 mb-1">Total Monthly</p>
                    <p className="text-2xl font-bold text-purple-900">
                        ₹{totalMonthlySpending.toFixed(2)}
                    </p>
                    <p className="text-xs text-purple-600 mt-1">Out of {daysInMonth} days</p>
                </div>

                {/* Days Completed */}
                <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                    <p className="text-xs font-medium text-gray-600 mb-1">Days in Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {daysInMonth} days
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Total days this month</p>
                </div>
            </div>

            {/* Info */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                    💡 This analysis covers only expenses from the current month. Previous months
                    are tracked separately when you navigate to them.
                </p>
            </div>
        </div>
    );
};

export default AverageDailySpending;