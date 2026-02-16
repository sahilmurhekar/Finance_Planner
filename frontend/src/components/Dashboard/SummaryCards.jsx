//frontend/src/components/Dashboard/SummaryCards.jsx
import React from "react";
import { TrendingUp, DollarSign, PieChart, CreditCard } from "lucide-react";

const SummaryCards = ({ stats }) => {
    if (!stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                    </div>
                ))}
            </div>
        );
    }

    const { summary } = stats;

    const cards = [
        {
            title: "Total Invested",
            value: `₹${parseFloat(summary.total_invested).toLocaleString()}`,
            icon: DollarSign,
            color: "blue",
        },
        {
            title: "Current Value",
            value: `₹${parseFloat(summary.total_current).toLocaleString()}`,
            icon: PieChart,
            color: "green",
        },
        {
            title: "Total Gains",
            value: `₹${parseFloat(summary.total_gain).toLocaleString()}`,
            subValue: `${summary.total_return_percentage}%`,
            icon: TrendingUp,
            color: parseFloat(summary.total_gain) >= 0 ? "green" : "red",
        },
        {
            title: "Monthly Expense",
            value: `₹${parseFloat(summary.monthly_expense).toLocaleString()}`,
            icon: CreditCard,
            color: "orange",
        },
    ];

    const colorClasses = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        red: "bg-red-50 text-red-600",
        orange: "bg-orange-50 text-orange-600",
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                            <div className={`p-2 rounded-lg ${colorClasses[card.color]}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                            {card.subValue && (
                                <p
                                    className={`text-sm mt-1 font-semibold ${card.color === "green" ? "text-green-600" : "text-red-600"
                                        }`}
                                >
                                    {card.subValue}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;