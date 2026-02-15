//frontend/src/store/useStatsStore.js
import { create } from "zustand";
import api from "../lib/axios";

export const useStatsStore = create((set) => ({
    // Daily Stats
    dailyStats: null,
    trendStats: [],
    calendarStats: {},
    categoryLimitStats: [],
    isLoading: false,
    error: null,

    // Fetch daily stats
    fetchDailyStats: async (date = null) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (date) params.append("date", date);

            const res = await api.get(`/stats/daily?${params.toString()}`);
            set({
                dailyStats: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching daily stats:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch daily stats",
                isLoading: false,
            });
        }
    },

    // Fetch trend stats (7 days)
    fetchTrendStats: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get("/stats/trend");
            set({
                trendStats: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching trend stats:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch trend stats",
                isLoading: false,
            });
        }
    },

    // Fetch calendar stats
    fetchCalendarStats: async (month = null) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (month) params.append("month", month);

            const res = await api.get(`/stats/calendar?${params.toString()}`);
            set({
                calendarStats: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching calendar stats:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch calendar stats",
                isLoading: false,
            });
        }
    },

    // Fetch category limit stats
    fetchCategoryLimitStats: async (month = null) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (month) params.append("month", month);

            const res = await api.get(`/stats/category-limits?${params.toString()}`);
            set({
                categoryLimitStats: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching category limit stats:", error);
            set({
                error:
                    error.response?.data?.error ||
                    "Failed to fetch category limit stats",
                isLoading: false,
            });
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));