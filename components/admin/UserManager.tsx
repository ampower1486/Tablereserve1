"use client";

import { useState, useTransition } from "react";
import { setUserRestaurant, promoteToAdmin } from "@/app/actions/admin";
import { UserCog, Store, ShieldCheck, Loader2, Check, Search, Save } from "lucide-react";
import type { Restaurant } from "@/lib/types";

interface User {
    id: string;
    full_name: string | null;
    role: string;
    restaurant_id: string | null;
    email?: string | null;
}

export function UserManager({
    users,
    restaurants,
}: {
    users: User[];
    restaurants: Restaurant[];
}) {
    const [pending, startTransition] = useTransition();
    const [savedId, setSavedId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    function handleAssign(userId: string, restaurantId: string) {
        startTransition(async () => {
            const rid = restaurantId === "all" ? null : restaurantId;
            await setUserRestaurant(userId, rid);
            setSavedId(userId);
            setTimeout(() => setSavedId(null), 2000);
        });
    }

    function handlePromote(userId: string, restaurantId: string) {
        startTransition(async () => {
            const rid = restaurantId === "all" ? null : restaurantId;
            await promoteToAdmin(userId, rid);
            setSavedId(userId);
            setTimeout(() => setSavedId(null), 2000);
            window.location.reload();
        });
    }

    const filteredUsers = users.filter((u) => {
        const query = searchQuery.toLowerCase();
        return (
            (u.full_name?.toLowerCase().includes(query)) ||
            (u.email?.toLowerCase().includes(query))
        );
    });

    const admins = filteredUsers.filter((u) => u.role === "admin" || u.role === "super_admin");
    const customers = filteredUsers.filter((u) => u.role !== "admin" && u.role !== "super_admin");

    return (
        <div className="space-y-6">
            {/* Search Bar */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search users by name or email..."
                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-carmelita-red/30 focus:border-carmelita-red/30 sm:text-sm transition-colors"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Admin users */}
            <div>
                <h3 className="font-semibold text-carmelita-dark mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-carmelita-red" />
                    Admin Accounts
                </h3>
                {admins.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center bg-white border border-gray-100 rounded-2xl">No admin users found.</p>
                ) : (
                    <div className="space-y-3">
                        {admins.map((user) => {
                            const assignedRestaurant = restaurants.find(
                                (r) => r.id === user.restaurant_id
                            );
                            return (
                                <div
                                    key={user.id}
                                    className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm"
                                >
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-9 h-9 bg-carmelita-dark rounded-full flex items-center justify-center shrink-0">
                                            <UserCog className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-carmelita-dark text-sm truncate flex items-center gap-2">
                                                {user.full_name || "Unnamed"}
                                                {user.email && (
                                                    <span className="text-xs text-gray-500 font-normal">({user.email})</span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                {user.restaurant_id
                                                    ? `🏪 ${assignedRestaurant?.name ?? "Unknown restaurant"}`
                                                    : "⭐ Super Admin — all restaurants"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Restaurant selector & Save Button */}
                                    <div className="flex items-center gap-2">
                                        <select
                                            id={`assign-${user.id}`}
                                            defaultValue={user.restaurant_id ?? "all"}
                                            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white text-carmelita-dark focus:outline-none focus:ring-2 focus:ring-carmelita-red/30"
                                            disabled={pending}
                                        >
                                            <option value="all">⭐ All restaurants</option>
                                            {restaurants.map((r) => (
                                                <option key={r.id} value={r.id}>
                                                    {r.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={() => {
                                                const sel = document.getElementById(
                                                    `assign-${user.id}`
                                                ) as HTMLSelectElement;
                                                handleAssign(user.id, sel.value);
                                            }}
                                            disabled={pending}
                                            className={`text-sm px-4 py-2 flex items-center gap-1.5 rounded-xl font-medium transition-colors ${savedId === user.id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                                        >
                                            {pending && savedId !== user.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : savedId === user.id ? (
                                                <><Check className="w-4 h-4" /> Saved</>
                                            ) : (
                                                <><Save className="w-4 h-4" /> Save</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Regular users — can be promoted */}
            <div>
                <h3 className="font-semibold text-carmelita-dark mb-3 flex items-center gap-2">
                    <Store className="w-4 h-4 text-gray-400" />
                    Regular Users
                    <span className="text-xs text-gray-400 font-normal">
                        — promote to give admin access
                    </span>
                </h3>
                {customers.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center bg-gray-50 border border-gray-100 rounded-2xl">No regular users found.</p>
                ) : (
                    <div className="space-y-3">
                        {customers.map((user) => (
                            <div
                                key={user.id}
                                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                        <UserCog className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-gray-700 text-sm truncate flex items-center gap-2">
                                            {user.full_name || "Unnamed user"}
                                            {user.email && (
                                                <span className="text-xs text-gray-500 font-normal">({user.email})</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <select
                                        id={`promote-${user.id}`}
                                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-carmelita-red/30"
                                        defaultValue=""
                                    >
                                        <option value="">Select restaurant…</option>
                                        <option value="all">⭐ All restaurants</option>
                                        {restaurants.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {r.name}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        disabled={pending}
                                        onClick={() => {
                                            const sel = document.getElementById(
                                                `promote-${user.id}`
                                            ) as HTMLSelectElement;
                                            if (!sel.value) return;
                                            handlePromote(user.id, sel.value);
                                        }}
                                        className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
                                    >
                                        {pending ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        )}
                                        Make Admin
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
