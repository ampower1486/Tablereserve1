"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/booking/Calendar";
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

import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import Link from "next/link";

interface BookingFormProps {
    restaurantId: string;
    timeSlots: string[];
    maxPartySize: number;
}

const STEPS = ["Date", "Time", "Account", "Details", "Confirm"];

export function BookingForm({
    restaurantId,
    timeSlots,
    maxPartySize,
}: BookingFormProps) {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [authMode, setAuthMode] = useState<"login" | "register">("login");
    const [authError, setAuthError] = useState<string | null>(null);
    const [authPending, setAuthPending] = useState(false);
    const [formData, setFormData] = useState<BookingFormData>({
        date: null,
        timeSlot: "",
        partySize: 2,
        guestName: "",
        guestEmail: "",
        guestPhone: "",
        notes: "",
    });

    useEffect(() => {
        const supabase = createClient();

        // Check current session
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                setFormData(p => ({
                    ...p,
                    guestName: currentUser.user_metadata?.full_name || p.guestName,
                    guestEmail: currentUser.email || p.guestEmail,
                    guestPhone: currentUser.user_metadata?.phone || p.guestPhone,
                }));
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                setFormData(p => ({
                    ...p,
                    guestName: currentUser.user_metadata?.full_name || p.guestName,
                    guestEmail: currentUser.email || p.guestEmail,
                    guestPhone: currentUser.user_metadata?.phone || p.guestPhone,
                }));
                // Auto-advance if we're on the account step
                setStep(s => s === 2 ? 3 : s);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = addDays(today, 14);

    const canProceed = () => {
        if (step === 0) return !!formData.date;
        if (step === 1) return !!formData.timeSlot;
        if (step === 2) return !!user;
        if (step === 3)
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
                        <div className="w-full">
                            <Calendar
                                selected={formData.date}
                                onSelect={(date) => setFormData((p) => ({ ...p, date }))}
                                minDate={today}
                                maxDate={maxDate}
                            />
                        </div>
                        {formData.date && (
                            <div className="mt-3 text-center text-sm font-medium text-carmelita-red">
                                Selected: {format(formData.date, "EEEE, MMMM d, yyyy")}
                            </div>
                        )}
                    </div>
                )}

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
                            {timeSlots.map((slot) => {
                                // Filter out same-day slots within 1 hour
                                const isToday =
                                    formData.date &&
                                    formData.date.toISOString().split("T")[0] ===
                                    new Date().toISOString().split("T")[0];
                                let tooSoon = false;
                                if (isToday) {
                                    const [timePart, period] = slot.split(" ");
                                    const [h, m] = timePart.split(":").map(Number);
                                    let hours = h;
                                    if (period === "PM" && h !== 12) hours += 12;
                                    if (period === "AM" && h === 12) hours = 0;
                                    const slotTime = new Date();
                                    slotTime.setHours(hours, m, 0, 0);
                                    tooSoon = slotTime < new Date(Date.now() + 60 * 60 * 1000);
                                }
                                if (tooSoon) return null;
                                return (
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
                                );
                            })}
                        </div>
                    </div>
                )}


                {/* Step 2: Account (New) */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-carmelita-red/10 text-carmelita-red mb-3">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="font-display text-2xl font-bold text-carmelita-dark">
                                {user ? "Account Verified" : "Sign In to Continue"}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {user
                                    ? "You're logged in and ready to finalize your booking."
                                    : "Mandatory step to save your reservation data securely."}
                            </p>
                        </div>

                        {user ? (
                            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 text-center animate-fade-in">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg mb-2">
                                        <Check className="w-7 h-7" />
                                    </div>
                                    <p className="font-bold text-lg text-green-900 leading-tight">
                                        Welcome, {user.user_metadata?.full_name || user.email}!
                                    </p>
                                    <p className="text-sm text-green-700">
                                        Your details will be automatically pre-filled in the next step.
                                    </p>
                                    <button
                                        onClick={() => setStep(3)}
                                        className="mt-4 text-sm font-semibold text-carmelita-red hover:underline"
                                    >
                                        Proceed to Details →
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-slide-up">
                                {/* Tab Switcher */}
                                <div className="flex p-1 bg-gray-100 rounded-xl">
                                    <button
                                        onClick={() => { setAuthMode("login"); setAuthError(null); }}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === "login" ? "bg-white text-carmelita-dark shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => { setAuthMode("register"); setAuthError(null); }}
                                        className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${authMode === "register" ? "bg-white text-carmelita-dark shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                    >
                                        Create Account
                                    </button>
                                </div>

                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        setAuthError(null);
                                        setAuthPending(true);
                                        const supabase = createClient();
                                        const formData = new FormData(e.currentTarget);
                                        const email = formData.get("email") as string;
                                        const password = formData.get("password") as string;

                                        try {
                                            if (authMode === "login") {
                                                const { error } = await supabase.auth.signInWithPassword({ email, password });
                                                if (error) setAuthError(error.message);
                                            } else {
                                                const fullName = formData.get("fullName") as string;
                                                const phone = formData.get("phone") as string;
                                                const { error, data } = await supabase.auth.signUp({
                                                    email,
                                                    password,
                                                    options: {
                                                        data: { full_name: fullName, phone }
                                                    }
                                                });
                                                if (error) {
                                                    setAuthError(error.message);
                                                } else if (data.user) {
                                                    // Also create profile record
                                                    await supabase.from("profiles").upsert({
                                                        id: data.user.id,
                                                        full_name: fullName,
                                                        phone,
                                                        role: "customer",
                                                    });
                                                }
                                            }
                                        } catch (err: any) {
                                            setAuthError(err.message || "An unexpected error occurred");
                                        } finally {
                                            setAuthPending(false);
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    {authMode === "register" && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">Full Name</label>
                                            <input name="fullName" required className="input-field" placeholder="John Doe" />
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">Email Address</label>
                                        <input name="email" type="email" required className="input-field" placeholder="your@email.com" />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between mb-1 px-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                            {authMode === "login" && (
                                                <Link href="/forgot-password" className="text-xs text-carmelita-red hover:underline focus:outline-none focus:ring-2 focus:ring-carmelita-red rounded">
                                                    Forgot password?
                                                </Link>
                                            )}
                                        </div>
                                        <input name="password" type="password" required className="input-field" placeholder="••••••••" minLength={6} />
                                    </div>
                                    {authMode === "register" && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">Phone (Optional)</label>
                                            <input name="phone" className="input-field" placeholder="(555) 000-0000" />
                                        </div>
                                    )}

                                    {authError && (
                                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm animate-shake">
                                            {authError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={authPending}
                                        className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
                                    >
                                        {authPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            authMode === "login" ? "Sign In & Continue" : "Create Account & Continue"
                                        )}
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>
                )}


                {/* Step 3: Party details */}
                {step === 3 && (
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
                                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                                </label>
                                <div className="flex">
                                    {/* Fixed +1 prefix */}
                                    <span className="inline-flex items-center px-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 text-sm font-medium select-none">
                                        +1
                                    </span>
                                    <input
                                        type="tel"
                                        inputMode="numeric"
                                        className="input-field rounded-l-none flex-1"
                                        placeholder="(555) 000-0000"
                                        value={formData.guestPhone}
                                        maxLength={14}
                                        onChange={(e) => {
                                            // Strip all non-digits
                                            const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            // Auto-format as (XXX) XXX-XXXX
                                            let formatted = digits;
                                            if (digits.length > 6) {
                                                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
                                            } else if (digits.length > 3) {
                                                formatted = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
                                            } else if (digits.length > 0) {
                                                formatted = `(${digits}`;
                                            }
                                            setFormData((p) => ({ ...p, guestPhone: formatted }));
                                        }}
                                    />
                                </div>
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

                {/* Step 4: Confirm */}
                {step === 4 && (
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
                {step < 4 ? (
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
