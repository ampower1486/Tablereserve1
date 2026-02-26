"use client";

import { useState, useTransition } from "react";
import { setUserRestaurant, promoteToAdmin } from "@/app/actions/admin";
import { getRestaurants } from "@/app/actions/restaurants";
import { UserCog, Store, ShieldCheck, Loader2, Check } from "lucide-react";
import type { Restaurant } from "@/lib/types";

interface User {
    id: string;
    full_name: string | null;
    role: string;
    restaurant_id: string | null;
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

    const admins = users.filter((u) => u.role === "admin");
    const customers = users.filter((u) => u.role !== "admin");

    return (
        <div className="space-y-8">
            {/* Admin users */}
            <div>
                <h3 className="font-semibold text-carmelita-dark mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-carmelita-red" />
                    Admin Accounts
                </h3>
                <div className="space-y-3">
                    {admins.map((user) => {
                        const assignedRestaurant = restaurants.find(
                            (r) => r.id === user.restaurant_id
                        );
                        return (
                            <div
                                key={user.id}
                                className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-4 shadow-sm"
                            >
                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <div className="w-9 h-9 bg-carmelita-dark rounded-full flex items-center justify-center shrink-0">
                                        <UserCog className="w-4 h-4 text-white" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-carmelita-dark text-sm truncate">
                                            {user.full_name || "Unnamed"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {user.restaurant_id
                                                ? `🏪 ${assignedRestaurant?.name ?? "Unknown restaurant"}`
                                                : "⭐ Super Admin — all restaurants"}
                                        </p>
                                    </div>
                                </div>

                                {/* Restaurant selector */}
                                <div className="flex items-center gap-2">
                                    <select
                                        defaultValue={user.restaurant_id ?? "all"}
                                        onChange={(e) =>
                                            handleAssign(user.id, e.target.value)
                                        }
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
                                    {savedId === user.id && (
                                        <span className="text-green-500">
                                            <Check className="w-4 h-4" />
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Regular users — can be promoted */}
            {customers.length > 0 && (
                <div>
                    <h3 className="font-semibold text-carmelita-dark mb-3 flex items-center gap-2">
                        <Store className="w-4 h-4 text-gray-400" />
                        Regular Users
                        <span className="text-xs text-gray-400 font-normal">
                            — promote to give admin access
                        </span>
                    </h3>
                    <div className="space-y-3">
                        {customers.map((user) => (
                            <div
                                key={user.id}
                                className="bg-gray-50 border border-gray-100 rounded-2xl p-4 flex flex-wrap items-center gap-4"
                            >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                                        <UserCog className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <p className="font-medium text-gray-700 text-sm truncate">
                                        {user.full_name || "Unnamed user"}
                                    </p>
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
                </div>
            )}
        </div>
    );
}
