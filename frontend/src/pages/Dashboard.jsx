// frontend/src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import SummaryCards from "../components/Dashboard/SummaryCards";
import PortfolioGrowthChart from "../components/Dashboard/PortfolioGrowthChart";
import MutualFundTable from "../components/Dashboard/MutualFundTable";
import { RefreshCw } from "lucide-react";

const Dashboard = () => {
    const { dashboardStats, isLoading, fetchDashboardStats } = useDashboardStore();

    useEffect(() => {
        fetchDashboardStats();
    }, [fetchDashboardStats]);

    const handleRefreshAll = async () => {
        await fetchDashboardStats();
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">
                            Welcome back! Here's your prioritized financial overview.
                        </p>
                    </div>
                    <button
                        onClick={handleRefreshAll}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${(isLoading) ? "animate-spin" : ""}`} />
                        Refresh All
                    </button>
                </div>

                <div className="mb-8">
                    <SummaryCards />
                </div>

                <div className="mb-8">
                    <PortfolioGrowthChart />
                </div>

                <div className="mb-8">
                    <MutualFundTable />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;