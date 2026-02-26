"use client";

import { useState } from "react";
import type { Reservation } from "@/lib/types";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight, CalendarDays, Clock, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReservationTable } from "./ReservationTable";

interface CalendarViewProps {
    reservations: Reservation[];
    availableRestaurants: { id: string; name: string }[];
}

export function CalendarView({ reservations, availableRestaurants }: CalendarViewProps) {
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(new Date()));
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calendar grid calculation
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
        for (let i = 0; i < 7; i++) {
            formattedDate = format(day, dateFormat);
            const cloneDay = day;

            // Collect reservations for this day
            const dayString = format(day, "yyyy-MM-dd");
            const dayReservations = reservations.filter(r => r.date === dayString && r.status !== "cancelled");
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);

            days.push(
                <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(cloneDay)}
                    className={`min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer transition-colors
                        ${!isCurrentMonth ? "bg-gray-50/50 text-gray-400" : "bg-white text-carmelita-dark"}
                        ${isSelected ? "ring-2 ring-inset ring-carmelita-red bg-red-50/10" : "hover:bg-gray-50"}
                    `}
                >
                    <div className="flex justify-between items-start">
                        <span className={`text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full ${isSelected ? 'bg-carmelita-red text-white' : ''}`}>
                            {formattedDate}
                        </span>
                        {dayReservations.length > 0 && (
                            <span className="text-xs font-bold text-carmelita-red bg-red-100 px-1.5 py-0.5 rounded-md">
                                {dayReservations.length}
                            </span>
                        )}
                    </div>
                    <div className="mt-2 flex flex-col gap-1">
                        {/* Preview first 3 reservations */}
                        {dayReservations.slice(0, 3).map(res => (
                            <div key={res.id} className="text-[10px] truncate px-1 py-0.5 bg-green-50 text-green-700 rounded border border-green-100">
                                {res.time_slot} • {res.guest_name}
                            </div>
                        ))}
                        {dayReservations.length > 3 && (
                            <div className="text-[10px] text-gray-500 font-medium px-1">
                                +{dayReservations.length - 3} more
                            </div>
                        )}
                    </div>
                </div>
            );
            day = addDays(day, 1);
        }
        rows.push(
            <div className="grid grid-cols-7" key={day.toISOString()}>
                {days}
            </div>
        );
        days = [];
    }

    const selectedDateString = format(selectedDate, "yyyy-MM-dd");
    const selectedReservations = reservations.filter(r => r.date === selectedDateString);

    return (
        <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h2 className="text-xl font-display font-bold text-carmelita-dark">
                            {format(currentMonth, "MMMM yyyy")}
                        </h2>
                    </div>
                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button onClick={nextMonth} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                <div className="card border border-gray-200 overflow-hidden">
                    <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50">
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
                            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r border-gray-100">
                                {d}
                            </div>
                        ))}
                    </div>
                    {rows}
                </div>
            </div>

            <div className="w-full lg:w-[450px] flex flex-col gap-4">
                <div className="card p-5">
                    <h3 className="font-display text-lg font-bold text-carmelita-dark mb-1">
                        {format(selectedDate, "EEEE, MMMM do")}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                        {selectedReservations.length} reservations
                    </p>

                    <ReservationTable
                        initialReservations={selectedReservations}
                        availableRestaurants={availableRestaurants}
                    />
                </div>
            </div>
        </div>
    );
}
