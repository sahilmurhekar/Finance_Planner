//frontend/src/components/Dashboard/MonthlyGrowthChart.jsx
import React, { useEffect } from "react";
import { useDashboardStore } from "../../store/useDashboardStore";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const MonthlyGrowthChart = () => {
  const { monthlyTrend, fetchMonthlyTrend } = useDashboardStore();

  useEffect(() => {
    fetchMonthlyTrend();
  }, [fetchMonthlyTrend]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-gray-900 mb-2">{payload[0].payload.month}</p>
          <p className="text-blue-600">Investments: ₹{parseFloat(payload[0].value).toLocaleString()}</p>
          <p className="text-red-600">Expenses: ₹{parseFloat(payload[1].value).toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  if (!monthlyTrend || monthlyTrend.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Growth Trend</h3>
        <div className="h-80 flex items-center justify-center">
          <div className="animate-pulse">Loading trend data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Growth Trend (Last 6 Months)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={monthlyTrend}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="investments"
            stroke="#3B82F6"
            strokeWidth={2}
            name="Investments"
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#EF4444"
            strokeWidth={2}
            name="Expenses"
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlyGrowthChart;