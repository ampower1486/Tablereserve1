"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarProps {
    selected: Date | null;
    onSelect: (date: Date) => void;
    minDate?: Date;
    maxDate?: Date;
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function startOfDay(date: Date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}

export function Calendar({ selected, onSelect, minDate, maxDate }: CalendarProps) {
    const today = startOfDay(new Date());
    const [viewDate, setViewDate] = useState(() => {
        const d = new Date();
        return { year: d.getFullYear(), month: d.getMonth() };
    });

    const min = minDate ? startOfDay(minDate) : today;
    const max = maxDate ? startOfDay(maxDate) : null;

    function getDaysInMonth(year: number, month: number) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(year: number, month: number) {
        return new Date(year, month, 1).getDay();
    }

    const { year, month } = viewDate;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const isDisabled = (day: number) => {
        const date = startOfDay(new Date(year, month, day));
        if (date < min) return true;
        if (max && date > max) return true;
        return false;
    };

    const isSelected = (day: number) => {
        if (!selected) return false;
        return isSameDay(new Date(year, month, day), selected);
    };

    const isToday = (day: number) => {
        return isSameDay(new Date(year, month, day), today);
    };

    const goPrev = () => {
        setViewDate((v) => {
            if (v.month === 0) return { year: v.year - 1, month: 11 };
            return { ...v, month: v.month - 1 };
        });
    };

    const goNext = () => {
        setViewDate((v) => {
            if (v.month === 11) return { year: v.year + 1, month: 0 };
            return { ...v, month: v.month + 1 };
        });
    };

    // Disable prev nav if current month is the min month
    const canGoPrev =
        year > min.getFullYear() ||
        (year === min.getFullYear() && month > min.getMonth());

    // Disable next nav if current month is the max month
    const canGoNext = !max
        ? true
        : year < max.getFullYear() ||
        (year === max.getFullYear() && month < max.getMonth());

    const cells: (number | null)[] = [
        ...Array(firstDay).fill(null),
        ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];

    // Pad to complete last row
    while (cells.length % 7 !== 0) cells.push(null);

    return (
        <div className="select-none w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button
                    type="button"
                    onClick={goPrev}
                    disabled={!canGoPrev}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <span className="font-semibold text-carmelita-dark text-base">
                    {MONTHS[month]} {year}
                </span>
                <button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 mb-2">
                {DAYS.map((d) => (
                    <div
                        key={d}
                        className="text-center text-xs font-semibold text-gray-400 py-1"
                    >
                        {d}
                    </div>
                ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-y-1">
                {cells.map((day, idx) => {
                    if (!day) {
                        return <div key={`empty-${idx}`} />;
                    }

                    const disabled = isDisabled(day);
                    const selected_ = isSelected(day);
                    const today_ = isToday(day);

                    return (
                        <button
                            type="button"
                            key={day}
                            disabled={disabled}
                            onClick={() => {
                                if (!disabled) onSelect(new Date(year, month, day));
                            }}
                            className={[
                                "mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-all",
                                selected_
                                    ? "bg-carmelita-dark text-white shadow-md"
                                    : today_ && !disabled
                                        ? "border-2 border-carmelita-red text-carmelita-red hover:bg-carmelita-red hover:text-white"
                                        : disabled
                                            ? "text-gray-300 cursor-not-allowed"
                                            : "text-carmelita-dark hover:bg-carmelita-cream hover:text-carmelita-red cursor-pointer",
                            ].join(" ")}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
