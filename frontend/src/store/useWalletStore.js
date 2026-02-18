//frontend/src/store/useWalletStore.js
import { create } from 'zustand';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL;

export const useWalletStore = create((set, get) => ({
    // State
    holdings: [],          // [{ asset, free, locked, usdValue, price }]
    totalUsdValue: 0,
    isLoading: false,
    error: null,
    lastUpdated: null,

    // Fetch all Binance Spot holdings (with USD values) from backend
    fetchHoldings: async () => {
        set({ isLoading: true, error: null });
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API_BASE}/api/binance/holdings`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            // data: { holdings: [...], totalUsdValue: number }
            set({
                holdings: data.holdings || [],
                totalUsdValue: data.totalUsdValue || 0,
                isLoading: false,
                lastUpdated: Date.now(),
                error: null,
            });
        } catch (err) {
            const message =
                err?.response?.data?.error ||
                err?.message ||
                'Failed to fetch Binance holdings';
            set({ isLoading: false, error: message });
        }
    },

    clearError: () => set({ error: null }),
}));
