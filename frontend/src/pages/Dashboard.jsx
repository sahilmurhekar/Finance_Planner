//frontend/src/pages/Dashboard.jsx (UPDATED - COMPLETE)
import React, { useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import SummaryCards from "../components/Dashboard/SummaryCards";
import MutualFundTable from "../components/Dashboard/MutualFundTable";
import CryptoTable from "../components/Dashboard/CryptoTable";
import AssetAllocationChart from "../components/Dashboard/AssetAllocationChart";
import MonthlyGrowthChart from "../components/Dashboard/MonthlyGrowthChart";
import NetWorthCalculator from "../components/Dashboard/NetWorthCalculator";
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
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
                        <p className="text-gray-600">
                            Welcome back! Here's your complete financial overview.
                        </p>
                    </div>
                    <button
                        onClick={handleRefreshAll}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh All
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="mb-8">
                    <SummaryCards stats={dashboardStats} />
                </div>

                {/* Net Worth & Asset Allocation Row */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <NetWorthCalculator stats={dashboardStats} />
                    <AssetAllocationChart stats={dashboardStats} />
                </div>

                {/* Monthly Growth Chart */}
                <div className="mb-8">
                    <MonthlyGrowthChart />
                </div>

                {/* Mutual Funds Table */}
                <div className="mb-8">
                    <MutualFundTable />
                </div>

                {/* Crypto Holdings Table */}
                <div className="mb-8">
                    <CryptoTable />
                </div>

                {/* Footer Info */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600">
                        💡 All prices are updated automatically. Click "Refresh" buttons to get
                        the latest data from Binance and MFApi.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;