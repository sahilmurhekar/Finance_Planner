//frontend/src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { useUserStore } from "../store/useUserStore";
import { Save } from "lucide-react";

const Settings = () => {
  const { profile, fetchProfile, updateProfile, isLoading } = useUserStore();
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [monthlySalary, setMonthlySalary] = useState("");
  const [crypto, setCrypto] = useState("");
  const [mf, setMf] = useState("");
  const [expenses, setExpenses] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDesignation(profile.designation || "");
      setMonthlySalary(profile.monthly_salary || "");
      setCrypto(profile.allocations.crypto || "");
      setMf(profile.allocations.mf || "");
      setExpenses(profile.allocations.expenses || "");
      setCurrency(profile.currency);
    }
  }, [profile]);

  const total = (Number(crypto) || 0) + (Number(mf) || 0) + (Number(expenses) || 0);
  const remaining = (Number(monthlySalary) || 0) - total;

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!monthlySalary) {
      setError("Monthly salary is required");
      return;
    }

    if (total !== Number(monthlySalary)) {
      setError(`Allocations must sum to monthly salary (${monthlySalary}). Current total: ${total}`);
      return;
    }

    try {
      await updateProfile({
        name,
        designation,
        monthly_salary: Number(monthlySalary),
        allocations: {
          crypto: Number(crypto) || 0,
          mf: Number(mf) || 0,
          expenses: Number(expenses) || 0,
        },
        currency,
      });
      setMessage("Settings saved successfully!");
      setTimeout(() => setMessage(""), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save settings");
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Configure your profile and salary allocation</p>

        {message && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Profile Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation/Job Title
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g., Software Engineer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Monthly Salary */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Salary</h2>
            <input
              type="number"
              value={monthlySalary}
              onChange={(e) => setMonthlySalary(e.target.value)}
              placeholder="Enter monthly salary"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Allocation Inputs */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Salary Allocation</h2>

            <div className="space-y-4">
              {/* Crypto */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crypto Investment
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={crypto}
                    onChange={(e) => setCrypto(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-2.5 text-gray-500 text-sm">
                    {crypto ? ((Number(crypto) / Number(monthlySalary)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Mutual Funds */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mutual Funds
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={mf}
                    onChange={(e) => setMf(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-2.5 text-gray-500 text-sm">
                    {mf ? ((Number(mf) / Number(monthlySalary)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Daily Expenses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Expenses
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-4 top-2.5 text-gray-500 text-sm">
                    {expenses ? ((Number(expenses) / Number(monthlySalary)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Allocated:</span>
                  <span className="font-semibold text-blue-600">{total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Salary:</span>
                  <span className="font-semibold text-gray-900">{monthlySalary || 0}</span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className={remaining === 0 ? "text-green-600" : "text-gray-600"}>
                    Remaining:
                  </span>
                  <span className={remaining === 0 ? "font-semibold text-green-600" : "font-semibold"}>
                    {remaining}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;