"use client";

import { useState, useTransition } from "react";
import type { Restaurant } from "@/lib/types";
import {
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
} from "@/app/actions/restaurants";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    Store,
    MapPin,
    Phone,
    Clock,
    Users,
    ChevronDown,
    ChevronUp,
    Loader2,
    Check,
} from "lucide-react";

/* ─────────────────────────────────────────── */
/*  Default time slots                         */
/* ─────────────────────────────────────────── */
const DEFAULT_SLOTS = [
    "11:30 AM", "12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM",
    "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM", "8:00 PM", "8:30 PM",
].join(", ");

/* ─────────────────────────────────────────── */
/*  Restaurant Form (add / edit)               */
/* ─────────────────────────────────────────── */
function RestaurantForm({
    initial,
    onCancel,
    onDone,
}: {
    initial?: Restaurant;
    onCancel: () => void;
    onDone: () => void;
}) {
    const [pending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
            try {
                if (initial) {
                    await updateRestaurant(initial.id, fd);
                } else {
                    await createRestaurant(fd);
                }
                onDone();
            } catch (err) {
                setError(err instanceof Error ? err.message : "Something went wrong");
            }
        });
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Restaurant Name *
                    </label>
                    <input
                        name="name"
                        required
                        defaultValue={initial?.name ?? ""}
                        placeholder="e.g. Carmelitas Mexican Restaurant"
                        className="input-field"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Slug * (URL identifier)
                    </label>
                    <input
                        name="slug"
                        required
                        defaultValue={initial?.slug ?? ""}
                        placeholder="e.g. carmelitas"
                        className="input-field"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Address
                    </label>
                    <input
                        name="address"
                        defaultValue={initial?.address ?? ""}
                        placeholder="1234 Main St, City, State"
                        className="input-field"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Phone
                    </label>
                    <input
                        name="phone"
                        defaultValue={initial?.phone ?? ""}
                        placeholder="(555) 867-5309"
                        className="input-field"
                    />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Max Party Size
                    </label>
                    <input
                        name="max_party_size"
                        type="number"
                        min="1"
                        max="100"
                        required
                        defaultValue={initial?.max_party_size ?? 20}
                        className="input-field"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Description
                    </label>
                    <textarea
                        name="description"
                        rows={2}
                        defaultValue={initial?.description ?? ""}
                        placeholder="Short description of the restaurant"
                        className="input-field resize-none"
                    />
                </div>
                <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                        Time Slots (comma-separated)
                    </label>
                    <textarea
                        name="time_slots"
                        rows={3}
                        defaultValue={
                            initial?.time_slots?.join(", ") ?? DEFAULT_SLOTS
                        }
                        placeholder="11:30 AM, 12:00 PM, 6:00 PM, ..."
                        className="input-field resize-none text-sm font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Separate each time slot with a comma. Use 12-hour format (e.g. 6:30 PM).
                    </p>
                </div>
            </div>

            <div className="flex gap-3 pt-2">
                <button
                    type="submit"
                    disabled={pending}
                    className="btn-primary flex items-center gap-2"
                >
                    {pending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Check className="w-4 h-4" />
                    )}
                    {initial ? "Save Changes" : "Add Restaurant"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="btn-secondary"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}

/* ─────────────────────────────────────────── */
/*  Single restaurant card                     */
/* ─────────────────────────────────────────── */
function RestaurantCard({
    restaurant,
    onRefresh,
}: {
    restaurant: Restaurant;
    onRefresh: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const [editing, setEditing] = useState(false);
    const [deleting, startDelete] = useTransition();
    const [confirmDelete, setConfirmDelete] = useState(false);

    function handleDelete() {
        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        startDelete(async () => {
            await deleteRestaurant(restaurant.id);
            onRefresh();
        });
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-carmelita-cream rounded-xl flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-carmelita-red" />
                    </div>
                    <div className="min-w-0">
                        <p className="font-semibold text-carmelita-dark truncate">
                            {restaurant.name}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                            /{restaurant.slug}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <button
                        onClick={() => { setEditing(true); setExpanded(true); }}
                        className="p-2 text-gray-400 hover:text-carmelita-dark hover:bg-gray-100 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className={`p-2 rounded-lg transition-colors ${confirmDelete
                            ? "bg-red-100 text-red-600 hover:bg-red-200"
                            : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                            }`}
                        title={confirmDelete ? "Click again to confirm" : "Delete"}
                    >
                        {deleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Trash2 className="w-4 h-4" />
                        )}
                    </button>
                    {confirmDelete && (
                        <button
                            onClick={() => setConfirmDelete(false)}
                            className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="p-2 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        {expanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>
                </div>
            </div>

            {/* Quick info pills */}
            <div className="px-6 pb-4 flex flex-wrap gap-2">
                {restaurant.address && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                        <MapPin className="w-3 h-3" />
                        {restaurant.address}
                    </span>
                )}
                {restaurant.phone && (
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                        <Phone className="w-3 h-3" />
                        {restaurant.phone}
                    </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                    <Users className="w-3 h-3" />
                    Up to {restaurant.max_party_size} guests
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {restaurant.time_slots?.length ?? 0} time slots
                </span>
            </div>

            {/* Booking URL */}
            <div className="px-6 pb-4">
                <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                    <span className="text-xs text-gray-400 shrink-0">🔗</span>
                    <span className="text-xs font-mono text-gray-600 truncate flex-1">
                        {typeof window !== "undefined" ? window.location.origin : "https://tablereserve1.vercel.app"}/book/{restaurant.slug}
                    </span>
                    <button
                        onClick={() => {
                            const url = `${window.location.origin}/book/${restaurant.slug}`;
                            navigator.clipboard.writeText(url);
                        }}
                        className="text-xs text-carmelita-red hover:underline shrink-0 font-medium"
                    >
                        Copy
                    </button>
                </div>
            </div>

            {/* Expanded panel */}
            {expanded && (
                <div className="px-6 pb-6 border-t border-gray-50 pt-4">
                    {editing ? (
                        <RestaurantForm
                            initial={restaurant}
                            onCancel={() => setEditing(false)}
                            onDone={() => { setEditing(false); onRefresh(); }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {restaurant.description && (
                                <p className="text-sm text-gray-500">
                                    {restaurant.description}
                                </p>
                            )}
                            <div>
                                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                    Time Slots
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {restaurant.time_slots?.map((slot) => (
                                        <span
                                            key={slot}
                                            className="text-xs bg-carmelita-cream text-carmelita-dark px-2.5 py-1 rounded-full font-medium"
                                        >
                                            {slot}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────── */
/*  Main RestaurantManager component           */
/* ─────────────────────────────────────────── */
export function RestaurantManager({
    initialRestaurants,
}: {
    initialRestaurants: Restaurant[];
}) {
    const [restaurants, setRestaurants] = useState(initialRestaurants);
    const [showAddForm, setShowAddForm] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    function refresh() {
        // Re-fetch by incrementing key — parent will reload via router.refresh
        setRefreshKey((k) => k + 1);
        window.location.reload();
    }

    return (
        <div className="space-y-6">
            {/* Add new restaurant button / form */}
            {showAddForm ? (
                <div className="bg-white rounded-2xl border border-carmelita-red/20 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-display font-bold text-lg text-carmelita-dark">
                            Add New Restaurant
                        </h3>
                        <button
                            onClick={() => setShowAddForm(false)}
                            className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    <RestaurantForm
                        onCancel={() => setShowAddForm(false)}
                        onDone={() => { setShowAddForm(false); refresh(); }}
                    />
                </div>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-carmelita-red text-gray-400 hover:text-carmelita-red rounded-2xl py-5 transition-all duration-200 group"
                >
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Add New Restaurant</span>
                </button>
            )}

            {/* Restaurant list */}
            {restaurants.length === 0 && !showAddForm ? (
                <div className="text-center py-16 text-gray-400">
                    <Store className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No restaurants yet</p>
                    <p className="text-sm mt-1">
                        Add your first restaurant to start accepting reservations.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {restaurants.map((r) => (
                        <RestaurantCard
                            key={`${r.id}-${refreshKey}`}
                            restaurant={r}
                            onRefresh={refresh}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
