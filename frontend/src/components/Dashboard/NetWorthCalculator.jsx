//frontend/src/components/Dashboard/NetWorthCalculator.jsx
import React, { useState } from "react";
import { Calculator } from "lucide-react";

const NetWorthCalculator = ({ stats }) => {
    const [includeExpenses, setIncludeExpenses] = useState(false);

    if (!stats || !stats.summary) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Net Worth Calculator</h3>
                <div className="h-32 flex items-center justify-center">
                    <div className="animate-pulse">Loading...</div>
                </div>
            </div>
        );
    }

    const { summary } = stats;
    const netWorth = includeExpenses
        ? parseFloat(summary.net_worth_with_expenses)
        : parseFloat(summary.net_worth_without_expenses);

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Net Worth Calculator</h3>
            </div>

            <div className="space-y-4">
                {/* Toggle */}
                <div className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-lg p-4">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Include Monthly Expenses</p>
                        <p className="text-xs text-gray-500">
                            Subtract current month expenses from net worth
                        </p>
                    </div>
                    <button
                        onClick={() => setIncludeExpenses(!includeExpenses)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${includeExpenses ? "bg-blue-600" : "bg-gray-300"
                            }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${includeExpenses ? "translate-x-6" : "translate-x-1"
                                }`}
                        />
                    </button>
                </div>

                {/* Calculation Breakdown */}
                <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600 text-sm">Total Investments</span>
                        <span className="text-gray-900 font-semibold">
                            ₹{parseFloat(summary.total_current).toLocaleString()}
                        </span>
                    </div>

                    {includeExpenses && (
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">Monthly Expenses</span>
                            <span className="text-red-600 font-semibold">
                                - ₹{parseFloat(summary.monthly_expense).toLocaleString()}
                            </span>
                        </div>
                    )}

                    <div className="border-t border-gray-300 pt-3 mt-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-900 font-bold">Net Worth</span>
                            <span className="text-2xl font-bold text-blue-600">
                                ₹{netWorth.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-700 mb-1">Total Gains</p>
                        <p className="text-lg font-bold text-green-600">
                            ₹{parseFloat(summary.total_gain).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            {summary.total_return_percentage}%
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700 mb-1">Invested</p>
                        <p className="text-lg font-bold text-blue-600">
                            ₹{parseFloat(summary.total_invested).toLocaleString()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NetWorthCalculator;