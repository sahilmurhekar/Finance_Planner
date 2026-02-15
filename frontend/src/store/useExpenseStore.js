//frontend/src/store/useExpenseStore.js
import { create } from "zustand";
import api from "../lib/axios";

export const useExpenseStore = create((set, get) => ({
    // State
    expenses: [],
    categories: [],
    selectedDate: new Date().toISOString().split("T")[0],
    isLoading: false,
    error: null,

    // Fetch all expenses
    fetchExpenses: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
            const params = new URLSearchParams();
            if (filters.date) params.append("date", filters.date);
            if (filters.month) params.append("month", filters.month);
            if (filters.category) params.append("category", filters.category);
            if (filters.limit) params.append("limit", filters.limit);
            if (filters.offset) params.append("offset", filters.offset);

            const res = await api.get(`/expenses?${params.toString()}`);
            set({
                expenses: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching expenses:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch expenses",
                isLoading: false,
            });
        }
    },

    // Create expense
    addExpense: async (expenseData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/expenses", expenseData);
            const newExpense = res.data.data;

            // Add to local state
            set((state) => ({
                expenses: [newExpense, ...state.expenses],
                isLoading: false,
            }));

            return newExpense;
        } catch (error) {
            console.error("Error adding expense:", error);
            set({
                error: error.response?.data?.error || "Failed to add expense",
                isLoading: false,
            });
            throw error;
        }
    },

    // Update expense
    updateExpense: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/expenses/${id}`, updates);
            const updatedExpense = res.data.data;

            // Update in local state
            set((state) => ({
                expenses: state.expenses.map((exp) =>
                    exp._id === id ? updatedExpense : exp
                ),
                isLoading: false,
            }));

            return updatedExpense;
        } catch (error) {
            console.error("Error updating expense:", error);
            set({
                error: error.response?.data?.error || "Failed to update expense",
                isLoading: false,
            });
            throw error;
        }
    },

    // Delete expense
    deleteExpense: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/expenses/${id}`);

            // Remove from local state
            set((state) => ({
                expenses: state.expenses.filter((exp) => exp._id !== id),
                isLoading: false,
            }));

            return true;
        } catch (error) {
            console.error("Error deleting expense:", error);
            set({
                error: error.response?.data?.error || "Failed to delete expense",
                isLoading: false,
            });
            throw error;
        }
    },

    // Fetch all categories
    fetchCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.get("/categories");
            set({
                categories: res.data.data,
                isLoading: false,
            });
            return res.data.data;
        } catch (error) {
            console.error("Error fetching categories:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch categories",
                isLoading: false,
            });
        }
    },

    // Create category
    addCategory: async (categoryData) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.post("/categories", categoryData);
            const newCategory = res.data.data;

            set((state) => ({
                categories: [...state.categories, newCategory],
                isLoading: false,
            }));

            return newCategory;
        } catch (error) {
            console.error("Error adding category:", error);
            set({
                error: error.response?.data?.error || "Failed to add category",
                isLoading: false,
            });
            throw error;
        }
    },

    // Update category
    updateCategory: async (id, updates) => {
        set({ isLoading: true, error: null });
        try {
            const res = await api.put(`/categories/${id}`, updates);
            const updatedCategory = res.data.data;

            set((state) => ({
                categories: state.categories.map((cat) =>
                    cat._id === id ? updatedCategory : cat
                ),
                isLoading: false,
            }));

            return updatedCategory;
        } catch (error) {
            console.error("Error updating category:", error);
            set({
                error: error.response?.data?.error || "Failed to update category",
                isLoading: false,
            });
            throw error;
        }
    },

    // Delete category
    deleteCategory: async (id) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/categories/${id}`);

            set((state) => ({
                categories: state.categories.filter((cat) => cat._id !== id),
                isLoading: false,
            }));

            return true;
        } catch (error) {
            console.error("Error deleting category:", error);
            set({
                error: error.response?.data?.error || "Failed to delete category",
                isLoading: false,
            });
            throw error;
        }
    },

    // Set selected date
    setSelectedDate: (date) => {
        set({ selectedDate: date });
    },

    // Clear error
    clearError: () => {
        set({ error: null });
    },
}));