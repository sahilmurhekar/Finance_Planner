//frontend/src/components/Expenses/BudgetLimitProgress.jsx (UPDATED)
import React, { useEffect } from "react";
import { useStatsStore } from "../../store/useStatsStore";
import { useUserStore } from "../../store/useUserStore";
import { TrendingDown, AlertCircle, CheckCircle } from "lucide-react";

const BudgetLimitProgress = ({ selectedDate = null }) => {
    const { dailyStats, fetchDailyStats } = useStatsStore();
    const { profile } = useUserStore();

    // Extract month from selectedDate or use current month
    const getMonthFromDate = (date) => {
        if (!date) {
            const now = new Date();
            return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        }
        return date.slice(0, 7); // YYYY-MM format
    };

    const month = getMonthFromDate(selectedDate);

    useEffect(() => {
        fetchDailyStats(month);
    }, [month, fetchDailyStats]);

    if (!dailyStats) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-500">Loading budget...</p>
            </div>
        );
    }

    const {
        totalExpense,
        monthlyLimit,
        percentageUsed,
        monthlySalary,
        salaryRemaining,
        daysUsed,
        daysRemaining,
        averageDailyExpense,
        projectedMonthlyExpense,
    } = dailyStats;

    // Determine color and status based on percentage
    let progressColor = "bg-green-500";
    let statusText = "On Track";
    let statusColor = "text-green-600";
    let statusIcon = CheckCircle;

    if (percentageUsed >= 100) {
        progressColor = "bg-red-500";
        statusText = "Budget Exceeded";
        statusColor = "text-red-600";
        statusIcon = AlertCircle;
    } else if (percentageUsed >= 80) {
        progressColor = "bg-yellow-500";
        statusText = "Warning";
        statusColor = "text-yellow-600";
        statusIcon = AlertCircle;
    }

    const StatusIcon = statusIcon;

    return (
        <div className="space-y-6">
            {/* Main Budget Progress Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                        Monthly Budget Status
                    </h3>
                    <div className="flex items-center gap-2">
                        <StatusIcon className="w-5 h-5" style={{ color: statusColor.replace("text-", "") }} />
                        <span className={`text-sm font-medium ${statusColor}`}>{statusText}</span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">
                            ₹{totalExpense.toFixed(2)} / ₹{monthlyLimit.toFixed(2)}
                        </span>
                        <span className="text-sm font-semibold text-gray-900">
                            {percentageUsed.toFixed(1)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                            className={`h-full ${progressColor} transition-all duration-300`}
                            style={{
                                width: `${Math.min(percentageUsed, 100)}%`,
                            }}
                        />
                    </div>
                </div>

                {/* Budget Info */}
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                        {percentageUsed >= 100
                            ? `⚠️ You've exceeded your budget by ₹${(
                                totalExpense - monthlyLimit
                            ).toFixed(2)}`
                            : `✓ ₹${(monthlyLimit - totalExpense).toFixed(2)} remaining this month`}
                    </p>
                </div>
            </div>

            {/* Salary Information Card (from Settings) */}
            {profile && profile.monthly_salary > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Monthly Salary */}
                    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
                        <p className="text-xs font-medium text-blue-600 mb-1">Monthly Salary</p>
                        <p className="text-2xl font-bold text-blue-900">₹{profile.monthly_salary.toFixed(2)}</p>
                        <p className="text-xs text-blue-600 mt-2">From Settings</p>
                    </div>

                    {/* Expenses This Month */}
                    <div className="bg-red-50 rounded-lg border border-red-200 p-4">
                        <p className="text-xs font-medium text-red-600 mb-1">Spent This Month</p>
                        <p className="text-2xl font-bold text-red-900">₹{totalExpense.toFixed(2)}</p>
                        <p className="text-xs text-red-600 mt-2">{percentageUsed.toFixed(1)}% of limit</p>
                    </div>

                    {/* Remaining After Expenses */}
                    <div className={`rounded-lg border p-4 ${salaryRemaining >= 0
                            ? "bg-green-50 border-green-200"
                            : "bg-orange-50 border-orange-200"
                        }`}>
                        <p className={`text-xs font-medium mb-1 ${salaryRemaining >= 0 ? "text-green-600" : "text-orange-600"
                            }`}>
                            Remaining
                        </p>
                        <p className={`text-2xl font-bold ${salaryRemaining >= 0 ? "text-green-900" : "text-orange-900"
                            }`}>
                            ₹{salaryRemaining.toFixed(2)}
                        </p>
                        <p className={`text-xs mt-2 ${salaryRemaining >= 0 ? "text-green-600" : "text-orange-600"
                            }`}>
                            {salaryRemaining >= 0 ? "Available for investments" : "Deficit!"}
                        </p>
                    </div>
                </div>
            )}

            {/* Daily Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Days Progress */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Days Progress</p>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                            {daysUsed} / {daysUsed + daysRemaining}
                        </span>
                        <span className="text-sm font-semibold">
                            {Math.round((daysUsed / (daysUsed + daysRemaining)) * 100)}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{
                                width: `${(daysUsed / (daysUsed + daysRemaining)) * 100}%`,
                            }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {daysRemaining} days remaining
                    </p>
                </div>

                {/* Daily Average */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Daily Average</p>
                    <p className="text-2xl font-bold text-gray-900">
                        ₹{averageDailyExpense.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">Per day (actual)</p>
                </div>

                {/* Projected Monthly */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <p className="text-xs font-medium text-gray-600 mb-2">Projected Monthly</p>
                    <p className={`text-2xl font-bold ${projectedMonthlyExpense > monthlyLimit
                            ? "text-orange-600"
                            : "text-green-600"
                        }`}>
                        ₹{projectedMonthlyExpense.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                        {projectedMonthlyExpense > monthlyLimit
                            ? `₹${(projectedMonthlyExpense - monthlyLimit).toFixed(2)} over limit`
                            : `₹${(monthlyLimit - projectedMonthlyExpense).toFixed(2)} under limit`
                        }
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BudgetLimitProgress;