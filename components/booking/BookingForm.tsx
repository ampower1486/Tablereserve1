"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, addDays, isBefore, startOfToday } from "date-fns";
import { DayPicker } from "react-day-picker";
import {
    CalendarDays,
    Clock,
    Users,
    ChevronRight,
    ChevronLeft,
    Check,
    Loader2,
} from "lucide-react";
import { createReservation } from "@/app/actions/reservations";
import type { BookingFormData } from "@/lib/types";

interface BookingFormProps {
    restaurantId: string;
    timeSlots: string[];
    maxPartySize: number;
}

const STEPS = ["Date", "Time", "Details", "Confirm"];

export function BookingForm({
    restaurantId,
    timeSlots,
    maxPartySize,
}: BookingFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<BookingFormData>({
        date: null,
        timeSlot: "",
        partySize: 2,
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        notes: "",
    });

    const today = startOfToday();
    const maxDate = addDays(today, 14);

    const canProceed = () => {
        if (step === 0) return !!formData.date;
        if (step === 1) return !!formData.timeSlot;
        if (step === 2)
            return (
                formData.guestName.trim() !== "" && formData.guestEmail.trim() !== ""
            );
        return true;
    };

    const handleSubmit = () => {
        setError(null);
        startTransition(async () => {
            const result = await createReservation(formData, restaurantId);
            if (result.error) {
                setError(result.error);
            } else if (result.code) {
                router.push(`/confirmation/${result.code}`);
            }
        });
    };

    return (
        <div className="max-w-lg mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${i < step
                                    ? "bg-carmelita-red text-white"
                                    : i === step
                                        ? "bg-carmelita-dark text-white"
                                        : "bg-gray-200 text-gray-500"
                                    }`}
                            >
                                {i < step ? <Check className="w-4 h-4" /> : i + 1}
                            </div>
                            {i < STEPS.length - 1 && (
                                <div
                                    className={`flex-1 h-1 mx-1 rounded transition-all ${i < step ? "bg-carmelita-red" : "bg-gray-200"
                                        }`}
                                    style={{ minWidth: "32px" }}
                                />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-1">
                    {STEPS.map((s) => (
                        <span key={s}>{s}</span>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="card p-6 animate-slide-up">
                {/* Step 0: Date */}
                {step === 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <CalendarDays className="w-5 h-5 text-carmelita-red" />
                            <h3 className="font-display text-xl font-bold">Choose a Date</h3>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Select a date up to 14 days in advance
                        </p>
                        <div className="flex justify-center">
                            <DayPicker
                                mode="single"
                                selected={formData.date ?? undefined}
                                onSelect={(date) => setFormData((p) => ({ ...p, date: date ?? null }))}
                                defaultMonth={today}
                                startMonth={today}
                                endMonth={maxDate}
                                disabled={(date) =>
                                    isBefore(date, today) || isBefore(maxDate, date)
                                }
                            />
                        </div>
                        {formData.date && (
                            <div className="mt-3 text-center text-sm font-medium text-carmelita-red">
                                Selected: {format(formData.date, "EEEE, MMMM d, yyyy")}
                            </div>
                        )}
                    </div>
                )}

                {/* Step 1: Time */}
                {step === 1 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Clock className="w-5 h-5 text-carmelita-red" />
                            <h3 className="font-display text-xl font-bold">Choose a Time</h3>
                        </div>
                        {formData.date && (
                            <p className="text-sm text-gray-500 mb-4">
                                {format(formData.date, "EEEE, MMMM d, yyyy")}
                            </p>
                        )}
                        <div className="grid grid-cols-3 gap-2">
                            {timeSlots.map((slot) => (
                                <button
                                    key={slot}
                                    onClick={() =>
                                        setFormData((p) => ({ ...p, timeSlot: slot }))
                                    }
                                    className={`py-2.5 px-3 rounded-xl text-sm font-medium border-2 transition-all ${formData.timeSlot === slot
                                        ? "bg-carmelita-dark text-white border-carmelita-dark"
                                        : "border-gray-200 text-gray-700 hover:border-carmelita-red hover:text-carmelita-red"
                                        }`}
                                >
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Party details */}
                {step === 2 && (
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Users className="w-5 h-5 text-carmelita-red" />
                            <h3 className="font-display text-xl font-bold">Your Details</h3>
                        </div>
                        <div className="space-y-4">
                            {/* Party size */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Party Size
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() =>
                                            setFormData((p) => ({
                                                ...p,
                                                partySize: Math.max(1, p.partySize - 1),
                                            }))
                                        }
                                        className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold hover:border-carmelita-red transition-colors"
                                    >
                                        −
                                    </button>
                                    <span className="text-2xl font-bold text-carmelita-dark w-8 text-center">
                                        {formData.partySize}
                                    </span>
                                    <button
                                        onClick={() =>
                                            setFormData((p) => ({
                                                ...p,
                                                partySize: Math.min(maxPartySize, p.partySize + 1),
                                            }))
                                        }
                                        className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold hover:border-carmelita-red transition-colors"
                                    >
                                        +
                                    </button>
                                    <span className="text-sm text-gray-500">guests</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name *
                                </label>
                                <input
                                    className="input-field"
                                    placeholder="Your full name"
                                    value={formData.guestName}
                                    onChange={(e) =>
                                        setFormData((p) => ({ ...p, guestName: e.target.value }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    className="input-field"
                                    placeholder="your@email.com"
                                    value={formData.guestEmail}
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            guestEmail: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    className="input-field"
                                    placeholder="(555) 000-0000"
                                    value={formData.guestPhone}
                                    onChange={(e) =>
                                        setFormData((p) => ({
                                            ...p,
                                            guestPhone: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Special Requests
                                </label>
                                <textarea
                                    className="input-field resize-none"
                                    rows={3}
                                    placeholder="Allergies, special occasions, seating preferences..."
                                    value={formData.notes}
                                    onChange={(e) =>
                                        setFormData((p) => ({ ...p, notes: e.target.value }))
                                    }
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirm */}
                {step === 3 && (
                    <div>
                        <h3 className="font-display text-xl font-bold mb-4">
                            Review & Confirm
                        </h3>
                        <div className="bg-carmelita-cream rounded-xl p-4 space-y-3 mb-4">
                            <SummaryRow
                                label="Date"
                                value={
                                    formData.date
                                        ? format(formData.date, "EEEE, MMMM d, yyyy")
                                        : "—"
                                }
                            />
                            <SummaryRow label="Time" value={formData.timeSlot} />
                            <SummaryRow
                                label="Party"
                                value={`${formData.partySize} guest${formData.partySize !== 1 ? "s" : ""}`}
                            />
                            <div className="border-t border-carmelita-cream-dark pt-3" />
                            <SummaryRow label="Name" value={formData.guestName} />
                            <SummaryRow label="Email" value={formData.guestEmail} />
                            {formData.guestPhone && (
                                <SummaryRow label="Phone" value={formData.guestPhone} />
                            )}
                            {formData.notes && (
                                <SummaryRow label="Notes" value={formData.notes} />
                            )}
                        </div>
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
                                {error}
                            </div>
                        )}
                        <p className="text-xs text-gray-500 text-center">
                            By confirming, you agree to our reservation policy. We&apos;ll
                            hold your table for 15 minutes past the reservation time.
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex gap-3 mt-6">
                {step > 0 && (
                    <button
                        onClick={() => setStep((s) => s - 1)}
                        className="btn-secondary flex items-center gap-2 flex-1"
                        disabled={isPending}
                    >
                        <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                )}
                {step < 3 ? (
                    <button
                        onClick={() => setStep((s) => s + 1)}
                        disabled={!canProceed()}
                        className="btn-primary flex items-center justify-center gap-2 flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue <ChevronRight className="w-4 h-4" />
                    </button>
                ) : (
                    <button
                        onClick={handleSubmit}
                        disabled={isPending}
                        className="btn-primary flex items-center justify-center gap-2 flex-1"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Confirming...
                            </>
                        ) : (
                            <>
                                <Check className="w-4 h-4" />
                                Confirm Reservation
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-sm text-gray-500 shrink-0">{label}</span>
            <span className="text-sm font-medium text-carmelita-dark text-right">
                {value}
            </span>
        </div>
    );
}
