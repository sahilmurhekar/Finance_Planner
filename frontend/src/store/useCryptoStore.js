//frontend/src/store/useCryptoStore.js
import { create } from "zustand";
import api from "../lib/axios";

export const useCryptoStore = create((set, get) => ({
    // State
    cryptoHoldings: [],
    isLoading: false,
    error: null,

    // Fetch all crypto holdings
    fetchCryptoHoldings: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get("/crypto");
            set({
                cryptoHoldings: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching crypto holdings:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch crypto holdings",
                isLoading: false,
            });
        }
    },

    // Add crypto holding
    addCryptoHolding: async (holdingData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/crypto", holdingData);
            const newHolding = res.data.data;

            set((state) => ({
                cryptoHoldings: [newHolding, ...state.cryptoHoldings],
                isLoading: false,
            }));

            return newHolding;
        } catch (error) {
            console.error("Error adding crypto holding:", error);
            set({
                error: error.response?.data?.error || "Failed to add crypto holding",
                isLoading: false,
            });
            throw error;
        }
    },

    // Update crypto holding
    updateCryptoHolding: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/crypto/${id}`, updates);
            const updatedHolding = res.data.data;

            set((state) => ({
                cryptoHoldings: state.cryptoHoldings.map((holding) =>
                    holding._id === id ? updatedHolding : holding
                ),
                isLoading: false,
            }));

            return updatedHolding;
        } catch (error) {
            console.error("Error updating crypto holding:", error);
            set({
                error: error.response?.data?.error || "Failed to update crypto holding",
                isLoading: false,
            });
            throw error;
        }
    },

    // Delete crypto holding
    deleteCryptoHolding: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/crypto/${id}`);

            set((state) => ({
                cryptoHoldings: state.cryptoHoldings.filter(
                    (holding) => holding._id !== id
                ),
                isLoading: false,
            }));

            return true;
        } catch (error) {
            console.error("Error deleting crypto holding:", error);
            set({
                error: error.response?.data?.error || "Failed to delete crypto holding",
                isLoading: false,
            });
            throw error;
        }
    },

    // Refresh all prices
    refreshPrices: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/crypto/refresh-prices");

            // Refetch all holdings to get updated prices
            await get().fetchCryptoHoldings();

            return res.data;
        } catch (error) {
            console.error("Error refreshing prices:", error);
            set({
                error: error.response?.data?.error || "Failed to refresh prices",
                isLoading: false,
            });
            throw error;
        }
    },

    // Get single token price
    getTokenPrice: async (symbol) => {
        try {
            const res = await api.get(`/crypto/price/${symbol}`);
            return res.data.data;
        } catch (error) {
            console.error(`Error fetching price for ${symbol}:`, error);
            throw error;
        }
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));