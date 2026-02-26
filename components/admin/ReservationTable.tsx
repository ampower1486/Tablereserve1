"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Reservation } from "@/lib/types";
import { updateReservation, cancelReservation, createAdminReservation } from "@/app/actions/admin";
import {
    CalendarDays,
    Clock,
    Users,
    X,
    Edit,
    Plus,
    Loader2,
    AlertTriangle,
} from "lucide-react";
import { format, parseISO } from "date-fns";

interface ReservationTableProps {
    initialReservations: Reservation[];
    availableRestaurants: { id: string; name: string }[];
}

const STATUS_LABELS: Record<string, string> = {
    confirmed: "Confirmed",
    cancelled: "Cancelled",
    completed: "Completed",
    no_show: "No Show",
};

export function ReservationTable({ initialReservations, availableRestaurants }: ReservationTableProps) {
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [filter, setFilter] = useState("all");
    const [liveTag, setLiveTag] = useState(false);

    // Supabase Realtime
    useEffect(() => {
        const supabase = createClient();
        const channel = supabase
            .channel("reservations-realtime")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "reservations" },
                (payload) => {
                    setLiveTag(true);
                    setTimeout(() => setLiveTag(false), 3000);

                    if (payload.eventType === "INSERT") {
                        setReservations((prev) => [payload.new as Reservation, ...prev]);
                    } else if (payload.eventType === "UPDATE") {
                        setReservations((prev) =>
                            prev.map((r) =>
                                r.id === payload.new.id ? (payload.new as Reservation) : r
                            )
                        );
                    } else if (payload.eventType === "DELETE") {
                        setReservations((prev) =>
                            prev.filter((r) => r.id !== payload.old.id)
                        );
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const filtered =
        filter === "all"
            ? reservations
            : reservations.filter((r) => r.status === filter);

    const handleCancel = async (id: string) => {
        setCancellingId(id);
        await cancelReservation(id);
        setCancellingId(null);
    };

    return (
        <div>
            {/* Filter tabs */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                    {["all", "confirmed", "completed", "cancelled", "no_show"].map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${filter === f
                                ? "bg-white text-carmelita-dark shadow-sm"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            {f === "all" ? "All" : STATUS_LABELS[f]}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    {liveTag && (
                        <div className="flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium animate-fade-in">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Live update received
                        </div>
                    )}
                    <button
                        onClick={() => setIsCreating(true)}
                        className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4" />
                        Create Reservation
                    </button>
                </div>
            </div>

            {/* Table */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                    <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No reservations found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((res) => (
                        <ReservationCard
                            key={res.id}
                            reservation={res}
                            onEdit={() => setEditingId(res.id)}
                            onCancel={() => handleCancel(res.id)}
                            isCancelling={cancellingId === res.id}
                        />
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            {editingId && (
                <EditModal
                    reservation={reservations.find((r) => r.id === editingId)!}
                    onClose={() => setEditingId(null)}
                    onSave={async (updates) => {
                        await updateReservation(editingId, updates);
                        setEditingId(null);
                    }}
                />
            )}

            {/* Create Modal */}
            {isCreating && (
                <CreateModal
                    availableRestaurants={availableRestaurants}
                    onClose={() => setIsCreating(false)}
                    onCreate={async (data) => {
                        await createAdminReservation(data);
                        setIsCreating(false);
                    }}
                />
            )}
        </div>
    );
}

function ReservationCard({
    reservation,
    onEdit,
    onCancel,
    isCancelling,
}: {
    reservation: Reservation;
    onEdit: () => void;
    onCancel: () => void;
    isCancelling: boolean;
}) {
    const [showConfirm, setShowConfirm] = useState(false);

    return (
        <div className="card p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Code + Status */}
                <div className="flex items-center gap-3 sm:w-32">
                    <div>
                        <span className="font-mono font-bold text-carmelita-dark text-sm">
                            {reservation.code}
                        </span>
                        <div className="mt-0.5">
                            <StatusBadge status={reservation.status} />
                        </div>
                    </div>
                </div>

                {/* Guest info */}
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-carmelita-dark truncate">
                        {reservation.guest_name}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5 space-x-2">
                        <span>{reservation.guest_email}</span>
                        {reservation.guest_phone && (
                            <span className="inline-flex items-center gap-1 text-gray-500">
                                <span>•</span>
                                <span>{reservation.guest_phone}</span>
                            </span>
                        )}
                    </div>
                </div>

                {/* Booking details */}
                <div className="flex items-center gap-4 text-xs text-gray-600 flex-wrap">
                    <div className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-carmelita-red" />
                        {format(parseISO(reservation.date), "MMM d, yyyy")}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-carmelita-red" />
                        {reservation.time_slot}
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-carmelita-red" />
                        {reservation.party_size}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={onEdit}
                        className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-carmelita-dark transition-colors"
                        title="Edit"
                        disabled={reservation.status === "cancelled"}
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                    {reservation.status !== "cancelled" && (
                        <>
                            {showConfirm ? (
                                <div className="flex items-center gap-2 animate-fade-in">
                                    <span className="text-xs text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" /> Cancel?
                                    </span>
                                    <button
                                        onClick={() => { setShowConfirm(false); onCancel(); }}
                                        className="btn-danger py-1 px-2 text-xs"
                                        disabled={isCancelling}
                                    >
                                        {isCancelling ? <Loader2 className="w-3 h-3 animate-spin" /> : "Yes"}
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="text-xs text-gray-500 hover:text-gray-700"
                                    >
                                        No
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowConfirm(true)}
                                    className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    title="Cancel reservation"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {reservation.notes && (
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-1.5">
                    📝 {reservation.notes}
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const classes: Record<string, string> = {
        confirmed: "badge-confirmed",
        cancelled: "badge-cancelled",
        completed: "badge-completed",
        no_show: "badge-no_show",
    };
    return (
        <span className={classes[status] || "badge"}>
            {STATUS_LABELS[status] || status}
        </span>
    );
}

function EditModal({
    reservation,
    onClose,
    onSave,
}: {
    reservation: Reservation;
    onClose: () => void;
    onSave: (updates: Record<string, string>) => Promise<void>;
}) {
    const [form, setForm] = useState({
        date: reservation.date,
        time_slot: reservation.time_slot,
        party_size: String(reservation.party_size),
        status: reservation.status,
        notes: reservation.notes || "",
    });
    const [isPending, setIsPending] = useState(false);

    const handleSave = async () => {
        setIsPending(true);
        await onSave({
            date: form.date,
            time_slot: form.time_slot,
            party_size: form.party_size,
            status: form.status,
            notes: form.notes,
        });
        setIsPending(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="font-display text-xl font-bold">Edit Reservation</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-carmelita-cream rounded-xl px-4 py-2 text-sm">
                        <span className="text-gray-500">Reservation code: </span>
                        <span className="font-mono font-bold">{reservation.code}</span>
                        {" — "}
                        <span className="font-medium">{reservation.guest_name}</span>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Date</label>
                        <input
                            type="date"
                            className="input-field"
                            value={form.date}
                            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Time Slot</label>
                        <input
                            className="input-field"
                            value={form.time_slot}
                            onChange={(e) => setForm((p) => ({ ...p, time_slot: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Party Size</label>
                        <input
                            type="number"
                            min={1}
                            max={20}
                            className="input-field"
                            value={form.party_size}
                            onChange={(e) => setForm((p) => ({ ...p, party_size: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Status</label>
                        <select
                            className="input-field"
                            value={form.status}
                            onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as "confirmed" | "cancelled" | "completed" | "no_show" }))}
                        >
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="no_show">No Show</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            className="input-field resize-none"
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="flex gap-3 px-6 pb-6">
                    <button onClick={onClose} className="btn-secondary flex-1 py-2.5">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                            "Save Changes"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CreateModal({
    availableRestaurants,
    onClose,
    onCreate,
}: {
    availableRestaurants: { id: string; name: string }[];
    onClose: () => void;
    onCreate: (data: {
        restaurant_id: string;
        date: string;
        time_slot: string;
        party_size: number;
        guest_name: string;
        guest_email: string;
        guest_phone?: string;
        notes?: string;
    }) => Promise<void>;
}) {
    const [form, setForm] = useState({
        restaurant_id: availableRestaurants[0]?.id || "",
        date: new Date().toISOString().split("T")[0],
        time_slot: "12:00 PM",
        party_size: "2",
        guest_name: "",
        guest_email: "",
        guest_phone: "",
        notes: "Created via Admin Dashboard (Override)",
    });
    const [isPending, setIsPending] = useState(false);

    const handleCreate = async () => {
        setIsPending(true);
        await onCreate({
            restaurant_id: form.restaurant_id,
            date: form.date,
            time_slot: form.time_slot,
            party_size: parseInt(form.party_size, 10),
            guest_name: form.guest_name,
            guest_email: form.guest_email,
            guest_phone: form.guest_phone,
            notes: form.notes,
        });
        setIsPending(false);
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <h3 className="font-display text-xl font-bold">Create Reservation</h3>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="bg-orange-50 text-orange-700 rounded-xl px-4 py-3 text-sm flex gap-2">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p>Reservations created here bypass all capacity and advance booking checks.</p>
                    </div>

                    {availableRestaurants.length > 1 && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Restaurant</label>
                            <select
                                className="input-field"
                                value={form.restaurant_id}
                                onChange={(e) => setForm((p) => ({ ...p, restaurant_id: e.target.value }))}
                            >
                                {availableRestaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Date</label>
                            <input
                                type="date"
                                className="input-field"
                                value={form.date}
                                onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Time</label>
                            <input
                                type="time"
                                className="input-field"
                                value={form.time_slot.split(" ")[0]}
                                onChange={(e) => {
                                    const time = e.target.value;
                                    const hour = parseInt(time.split(":")[0]);
                                    const period = hour >= 12 ? "PM" : "AM";
                                    const formattedHour = hour % 12 || 12;
                                    setForm((p) => ({ ...p, time_slot: `${formattedHour}:${time.split(":")[1]} ${period}` }));
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Party Size</label>
                        <input
                            type="number"
                            min={1}
                            className="input-field"
                            value={form.party_size}
                            onChange={(e) => setForm((p) => ({ ...p, party_size: e.target.value }))}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Guest Name</label>
                        <input
                            type="text"
                            required
                            className="input-field"
                            value={form.guest_name}
                            onChange={(e) => setForm((p) => ({ ...p, guest_name: e.target.value }))}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Guest Email</label>
                            <input
                                type="email"
                                required
                                className="input-field"
                                value={form.guest_email}
                                onChange={(e) => setForm((p) => ({ ...p, guest_email: e.target.value }))}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Guest Phone</label>
                            <input
                                type="tel"
                                className="input-field"
                                value={form.guest_phone}
                                onChange={(e) => setForm((p) => ({ ...p, guest_phone: e.target.value }))}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Notes</label>
                        <textarea
                            className="input-field resize-none"
                            rows={2}
                            value={form.notes}
                            onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                        />
                    </div>
                </div>
                <div className="flex gap-3 px-6 pb-6 pt-2 bg-white sticky bottom-0 border-t border-gray-100">
                    <button onClick={onClose} className="btn-secondary flex-1 py-2.5">
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        disabled={isPending || !form.guest_name || !form.guest_email}
                        className="btn-primary flex-1 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isPending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                        ) : (
                            "Create Reservation"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
