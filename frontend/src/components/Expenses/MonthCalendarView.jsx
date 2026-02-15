//frontend/src/components/Expenses/MonthCalendarView.jsx
import React, { useEffect, useState } from "react";
import { useStatsStore } from "../../store/useStatsStore";
import { ChevronLeft, ChevronRight } from "lucide-react";

const MonthCalendarView = ({ onDateSelect }) => {
    const { calendarStats, fetchCalendarStats } = useStatsStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(null);

    const monthStr = `${currentMonth.getFullYear()}-${String(
        currentMonth.getMonth() + 1
    ).padStart(2, "0")}`;

    useEffect(() => {
        fetchCalendarStats(monthStr);
    }, [monthStr, fetchCalendarStats]);

    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const previousMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
        );
    };

    const nextMonth = () => {
        setCurrentMonth(
            new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
        );
    };

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }

    // Days of the month
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    const getSpendingForDay = (day) => {
        if (!day) return 0;
        const dateStr = `${currentMonth.getFullYear()}-${String(
            currentMonth.getMonth() + 1
        ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        return calendarStats[dateStr] || 0;
    };

    const getIntensityColor = (amount) => {
        if (amount === 0) return "bg-gray-100";
        if (amount < 500) return "bg-blue-100";
        if (amount < 1000) return "bg-blue-300";
        if (amount < 1500) return "bg-blue-500";
        return "bg-blue-700";
    };

    const monthName = currentMonth.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{monthName}</h3>
                <div className="flex gap-2">
                    <button
                        onClick={previousMonth}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Week days header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-sm font-semibold text-gray-600">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {days.map((day, idx) => (
                    <div key={idx}>
                        {day ? (
                            <button
                                onClick={() => {
                                    const dateStr = `${currentMonth.getFullYear()}-${String(
                                        currentMonth.getMonth() + 1
                                    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                                    setSelectedDay(day);
                                    if (onDateSelect) onDateSelect(dateStr);
                                }}
                                className={`w-full aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all ${selectedDay === day
                                        ? "ring-2 ring-blue-500 ring-offset-1"
                                        : ""
                                    } ${getIntensityColor(getSpendingForDay(day))} hover:opacity-80 cursor-pointer`}
                            >
                                <span className="font-semibold text-xs text-gray-900">{day}</span>
                                {getSpendingForDay(day) > 0 && (
                                    <span className="text-xs text-gray-700 mt-0.5">
                                        ₹{getSpendingForDay(day).toFixed(0)}
                                    </span>
                                )}
                            </button>
                        ) : (
                            <div className="w-full aspect-square" />
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex gap-2 flex-wrap text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-100" />
                    <span>No spending</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-100" />
                    <span>&lt; ₹500</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-500" />
                    <span>&gt; ₹1000</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-blue-700" />
                    <span>&gt; ₹1500</span>
                </div>
            </div>
        </div>
    );
};

export default MonthCalendarView;