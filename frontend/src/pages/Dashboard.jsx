//frontend/src/pages/Dashboard.jsx
import React, { useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import { useWalletStore } from "../store/useWalletStore";
import SummaryCards from "../components/Dashboard/SummaryCards";
import MutualFundTable from "../components/Dashboard/MutualFundTable";
import CryptoTable from "../components/Dashboard/CryptoTable";
import AssetAllocationChart from "../components/Dashboard/AssetAllocationChart";
import MonthlyGrowthChart from "../components/Dashboard/MonthlyGrowthChart";
import NetWorthCalculator from "../components/Dashboard/NetWorthCalculator";
import { RefreshCw, TrendingUp } from "lucide-react";

const Dashboard = () => {
    const { dashboardStats, isLoading, fetchDashboardStats } = useDashboardStore();
    const {
        holdings,
        totalUsdValue,
        isLoading: walletLoading,
        lastUpdated,
        fetchHoldings,
    } = useWalletStore();

    // Fetch both dashboard stats and Binance holdings on mount
    useEffect(() => {
        fetchDashboardStats();
        fetchHoldings();
    }, [fetchDashboardStats]);

    const handleRefreshAll = async () => {
        await Promise.all([fetchDashboardStats(), fetchHoldings()]);
    };

    const formatUsd = (val) =>
        Number(val).toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });

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
                        disabled={isLoading || walletLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${(isLoading || walletLoading) ? "animate-spin" : ""}`} />
                        Refresh All
                    </button>
                </div>

                {/* Binance Portfolio Banner */}
                {(holdings.length > 0 || walletLoading) && (
                    <div className="mb-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-900 text-sm font-medium mb-1 flex items-center gap-1">
                                    <TrendingUp className="w-4 h-4" />
                                    Binance Spot Portfolio
                                </p>
                                {walletLoading ? (
                                    <div className="h-8 w-40 bg-yellow-300 animate-pulse rounded" />
                                ) : (
                                    <p className="text-3xl font-bold text-black">
                                        {formatUsd(totalUsdValue)}
                                    </p>
                                )}
                                <p className="text-yellow-800 text-xs mt-1">
                                    {holdings.length} asset{holdings.length !== 1 ? "s" : ""} ·
                                    {lastUpdated
                                        ? ` Updated ${new Date(lastUpdated).toLocaleTimeString()}`
                                        : " Loading…"}
                                </p>
                            </div>

                            {/* Top 3 assets */}
                            {!walletLoading && holdings.length > 0 && (
                                <div className="hidden sm:flex gap-3">
                                    {holdings.slice(0, 3).map((h) => (
                                        <div
                                            key={h.asset}
                                            className="bg-white bg-opacity-40 rounded-lg px-3 py-2 text-center min-w-[72px]"
                                        >
                                            <p className="font-bold text-black text-sm">{h.asset}</p>
                                            <p className="text-yellow-900 text-xs">
                                                {Number(h.usdValue) >= 0.01
                                                    ? formatUsd(h.usdValue)
                                                    : "<$0.01"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
                        💡 <strong>Binance Sync:</strong> Your Binance Spot holdings are fetched
                        automatically on page load. Hit <strong>Refresh All</strong> to pull the
                        latest balances and prices at any time.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;