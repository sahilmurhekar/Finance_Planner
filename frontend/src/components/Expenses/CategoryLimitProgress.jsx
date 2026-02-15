//frontend/src/components/Expenses/CategoryLimitProgress.jsx
import React, { useEffect } from "react";
import { useStatsStore } from "../../store/useStatsStore";

const CategoryLimitProgress = ({ month = null }) => {
    const { categoryLimitStats, fetchCategoryLimitStats } = useStatsStore();

    useEffect(() => {
        fetchCategoryLimitStats(month);
    }, [month, fetchCategoryLimitStats]);

    if (!categoryLimitStats || categoryLimitStats.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-500">Loading category limits...</p>
            </div>
        );
    }

    const getProgressColor = (percentageUsed) => {
        if (percentageUsed >= 100) return "bg-red-500";
        if (percentageUsed >= 80) return "bg-yellow-500";
        return "bg-green-500";
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Category Limits
            </h3>

            <div className="space-y-4">
                {categoryLimitStats.map((cat) => (
                    <div key={cat.categoryId}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-gray-900">{cat.name}</span>
                            <span className="text-sm text-gray-600">
                                ₹{cat.spent.toFixed(2)} / ₹{cat.limit.toFixed(2)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className={`h-full ${getProgressColor(
                                    cat.percentageUsed
                                )} transition-all duration-300`}
                                style={{
                                    width: `${Math.min(cat.percentageUsed, 100)}%`,
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {cat.percentageUsed.toFixed(1)}% used
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryLimitProgress;