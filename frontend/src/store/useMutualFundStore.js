//frontend/src/store/useMutualFundStore.js
import { create } from "zustand";
import api from "../lib/axios";

export const useMutualFundStore = create((set, get) => ({
    // State
    mutualFunds: [],
    isLoading: false,
    error: null,

    // Fetch all mutual funds
    fetchMutualFunds: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get("/mutual-funds");
            set({
                mutualFunds: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching mutual funds:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch mutual funds",
                isLoading: false,
            });
        }
    },

    // Add new mutual fund (lump-sum or initial setup)
    addMutualFund: async (fundData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/mutual-funds", fundData);
            const newFund = res.data.data;

            set((state) => ({
                mutualFunds: [newFund, ...state.mutualFunds],
                isLoading: false,
            }));

            return newFund;
        } catch (error) {
            console.error("Error adding mutual fund:", error);
            set({
                error: error.response?.data?.error || "Failed to add mutual fund",
                isLoading: false,
            });
            throw error;
        }
    },

    // Update mutual fund
    updateMutualFund: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/mutual-funds/${id}`, updates);
            const updatedFund = res.data.data;

            set((state) => ({
                mutualFunds: state.mutualFunds.map((fund) =>
                    fund._id === id ? updatedFund : fund
                ),
                isLoading: false,
            }));

            return updatedFund;
        } catch (error) {
            console.error("Error updating mutual fund:", error);
            set({
                error: error.response?.data?.error || "Failed to update mutual fund",
                isLoading: false,
            });
            throw error;
        }
    },

    // Delete mutual fund
    deleteMutualFund: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/mutual-funds/${id}`);

            set((state) => ({
                mutualFunds: state.mutualFunds.filter((fund) => fund._id !== id),
                isLoading: false,
            }));

            return true;
        } catch (error) {
            console.error("Error deleting mutual fund:", error);
            set({
                error: error.response?.data?.error || "Failed to delete mutual fund",
                isLoading: false,
            });
            throw error;
        }
    },

    // Refresh all NAVs
    refreshNAVs: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/mutual-funds/refresh-nav");

            // Refetch to get updated values
            await get().fetchMutualFunds();

            return res.data;
        } catch (error) {
            console.error("Error refreshing NAVs:", error);
            set({
                error: error.response?.data?.error || "Failed to refresh NAVs",
                isLoading: false,
            });
            throw error;
        }
    },

    // NEW: Add SIP installment to an existing mutual fund
    addSipInstallment: async (fundId, installmentData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post(`/mutual-funds/${fundId}/installment`, installmentData);
            const updatedFund = res.data.data;

            set((state) => ({
                mutualFunds: state.mutualFunds.map((fund) =>
                    fund._id === fundId ? updatedFund : fund
                ),
                isLoading: false,
            }));

            return updatedFund;
        } catch (error) {
            console.error("Error adding SIP installment:", error);
            set({
                error: error.response?.data?.error || "Failed to add SIP installment",
                isLoading: false,
            });
            throw error;
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));
