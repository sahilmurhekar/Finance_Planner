//frontend/src/pages/Personal.jsx (UPDATED - MONTHLY TRACKING)
import React, { useState, useEffect } from "react";
import ExpenseEntryForm from "../components/Expenses/ExpenseEntryForm";
import ExpensesList from "../components/Expenses/ExpensesList";
import BudgetLimitProgress from "../components/Expenses/BudgetLimitProgress";
import CategoryBreakdownChart from "../components/Expenses/CategoryBreakdownChart";
import QuickAddButtons from "../components/Expenses/QuickAddButtons";
import AverageDailySpending from "../components/Expenses/AverageDailySpending";
import SpendingTrendChart from "../components/Expenses/SpendingTrendChart";
import MonthCalendarView from "../components/Expenses/MonthCalendarView";
import CategoryManagement from "../components/Expenses/CategoryManagement";
import CategoryLimitProgress from "../components/Expenses/CategoryLimitProgress";
import { useExpenseStore } from "../store/useExpenseStore";
import { useStatsStore } from "../store/useStatsStore";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const Personal = () => {
  const { setSelectedDate: setStoreDate } = useExpenseStore();
  const { fetchDailyStats } = useStatsStore();

  // State for month navigation
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeTab, setActiveTab] = useState("overview");

  // Update store when selected date changes
  useEffect(() => {
    setStoreDate(selectedDate);
  }, [selectedDate, setStoreDate]);

  // Fetch stats for current month on mount and when month changes
  useEffect(() => {
    fetchDailyStats(currentMonth);
  }, [currentMonth, fetchDailyStats]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handlePreviousMonth = () => {
    const [year, month] = currentMonth.split("-");
    const prevDate = new Date(parseInt(year), parseInt(month) - 1 - 1, 1);
    const prevMonth = `${prevDate.getFullYear()}-${String(
      prevDate.getMonth() + 1
    ).padStart(2, "0")}`;
    setCurrentMonth(prevMonth);
  };

  const handleNextMonth = () => {
    const [year, month] = currentMonth.split("-");
    const nextDate = new Date(parseInt(year), parseInt(month) - 1 + 1, 1);
    const nextMonth = `${nextDate.getFullYear()}-${String(
      nextDate.getMonth() + 1
    ).padStart(2, "0")}`;
    setCurrentMonth(nextMonth);
  };

  const handleCurrentMonth = () => {
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(
      now.getMonth() + 1
    ).padStart(2, "0")}`;
    setCurrentMonth(thisMonth);
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const getMonthName = (monthStr) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "expenses", label: "Expenses" },
    { id: "budget", label: "Budget & Stats" },
    { id: "calendar", label: "Calendar" },
    { id: "categories", label: "Categories" },
  ];

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Daily Expense Tracker
          </h1>
          <p className="text-gray-600 mb-6">
            Track and manage your monthly expenses efficiently
          </p>

          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-white border border-gray-300 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-4">
              {/* Previous Month Button */}
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Previous month"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              {/* Current Month Display */}
              <div className="text-center min-w-[200px]">
                <p className="text-lg font-semibold text-gray-900">
                  {getMonthName(currentMonth)}
                </p>
                <p className="text-xs text-gray-500">(Monthly View)</p>
              </div>

              {/* Next Month Button */}
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Next month"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>

              {/* Current Month Button */}
              <button
                onClick={handleCurrentMonth}
                className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Current Month
              </button>
            </div>

            {/* Date Picker for specific date within month */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-300 rounded-lg px-4 py-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border-none focus:outline-none focus:ring-0 w-40 bg-gray-50"
              />
            </div>
          </div>

          {/* Info Alert - Monthly Tracking */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              📅 <strong>Monthly Tracking:</strong> All expenses shown are for{" "}
              <strong>{getMonthName(currentMonth)}</strong> only. Use the arrow
              buttons to view other months. Previous months' data is separate.
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB: OVERVIEW */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Budget Progress with Salary Info */}
            <BudgetLimitProgress selectedDate={currentMonth} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CategoryBreakdownChart selectedDate={currentMonth} />
              <QuickAddButtons />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AverageDailySpending month={currentMonth} />
              <SpendingTrendChart />
            </div>
          </div>
        )}

        {/* TAB: EXPENSES */}
        {activeTab === "expenses" && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                📝 Showing expenses for <strong>{getMonthName(currentMonth)}</strong>
              </p>
            </div>
            <ExpenseEntryForm />
            <ExpensesList selectedDate={currentMonth} />
          </div>
        )}

        {/* TAB: BUDGET & STATS */}
        {activeTab === "budget" && (
          <div className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-800">
                💰 Budget analysis for <strong>{getMonthName(currentMonth)}</strong>
              </p>
            </div>
            <BudgetLimitProgress selectedDate={currentMonth} />
            <CategoryLimitProgress month={currentMonth} />
            <SpendingTrendChart />
          </div>
        )}

        {/* TAB: CALENDAR */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                📅 Calendar view for <strong>{getMonthName(currentMonth)}</strong>
              </p>
            </div>
            <MonthCalendarView
              onDateSelect={handleDateSelect}
              month={currentMonth}
            />
            <ExpensesList selectedDate={currentMonth} />
          </div>
        )}

        {/* TAB: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
              <p className="text-sm text-indigo-800">
                🏷️ Category limits for <strong>{getMonthName(currentMonth)}</strong>
              </p>
            </div>
            <CategoryManagement />
            <CategoryLimitProgress month={currentMonth} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Personal;