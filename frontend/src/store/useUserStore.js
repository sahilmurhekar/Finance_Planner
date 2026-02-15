//frontend/src/store/useUserStore.js
import { create } from "zustand";
import api from "../lib/axios";

export const useUserStore = create((set) => ({
    profile: null,
    isLoading: false,

    fetchProfile: async () => {
        set({ isLoading: true });
        try {
            const res = await api.get("/user/profile");
            set({ profile: res.data, isLoading: false });
        } catch (error) {
            console.error("Error fetching profile:", error);
            set({ isLoading: false });
        }
    },

    updateProfile: async (updates) => {
        set({ isLoading: true });
        try {
            const res = await api.put("/user/profile", updates);
            set({ profile: res.data.profile, isLoading: false });
            return res.data.profile;
        } catch (error) {
            console.error("Error updating profile:", error);
            set({ isLoading: false });
            throw error;
        }
    },

    getTheme: () => get().profile?.theme ?? "light",
    getCurrency: () => get().profile?.currency ?? "INR",
}));