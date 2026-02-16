//frontend/src/store/useDashboardStore.js
import { create } from "zustand";
import api from "../lib/axios";

export const useDashboardStore = create((set) => ({
    // State
    dashboardStats: null,
    monthlyTrend: [],
    isLoading: false,
    error: null,

    // Fetch dashboard statistics
    fetchDashboardStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get("/dashboard/stats");
            set({
                dashboardStats: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch dashboard statistics",
                isLoading: false,
            });
        }
    },

    // Fetch monthly growth trend
    fetchMonthlyTrend: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get("/dashboard/monthly-trend");
            set({
                monthlyTrend: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching monthly trend:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch monthly trend",
                isLoading: false,
            });
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));