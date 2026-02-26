"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/** Returns the current user's profile including restaurant_id */
export async function getMyProfile() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
        .from("profiles")
        .select("id, role, restaurant_id")
        .eq("id", user.id)
        .single();
    return data;
}

/**
 * Returns reservations scoped to the admin's restaurant.
 * Super admins (restaurant_id = null) see all restaurants.
 * Restaurant admins only see their own restaurant.
 */
export async function getAllReservations(filter?: string) {
    const supabase = await createClient();
    const profile = await getMyProfile();

    let query = supabase
        .from("reservations")
        .select("*")
        .order("date", { ascending: true })
        .order("time_slot", { ascending: true });

    if (filter && filter !== "all") {
        query = query.eq("status", filter);
    }

    // Scope to restaurant if not a super admin
    if (profile?.restaurant_id) {
        query = query.eq("restaurant_id", profile.restaurant_id);
    }

    const { data, error } = await query;
    if (error) return [];
    return data || [];
}

export async function updateReservation(
    id: string,
    updates: {
        date?: string;
        time_slot?: string;
        party_size?: number;
        status?: string;
        notes?: string;
    }
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("reservations")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

    if (error) return { error: error.message };
    revalidatePath("/admin");
    return { data };
}

export async function cancelReservation(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("reservations")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", id);

    if (error) return { error: error.message };
    revalidatePath("/admin");
    return { success: true };
}

export async function getAdminStats() {
    const supabase = await createClient();
    const profile = await getMyProfile();
    const today = new Date().toISOString().split("T")[0];

    const rid = profile?.restaurant_id;

    const [confirmedRes, todayRes, totalRes] = await Promise.all([
        rid
            ? supabase.from("reservations").select("id", { count: "exact" }).eq("status", "confirmed").eq("restaurant_id", rid)
            : supabase.from("reservations").select("id", { count: "exact" }).eq("status", "confirmed"),
        rid
            ? supabase.from("reservations").select("id", { count: "exact" }).eq("date", today).eq("restaurant_id", rid)
            : supabase.from("reservations").select("id", { count: "exact" }).eq("date", today),
        rid
            ? supabase.from("reservations").select("id", { count: "exact" }).eq("restaurant_id", rid)
            : supabase.from("reservations").select("id", { count: "exact" }),
    ]);

    return {
        confirmed: confirmedRes.count || 0,
        today: todayRes.count || 0,
        total: totalRes.count || 0,
    };
}

/* ── User management (super admin only) ── */

export async function getAllAdminUsers() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, restaurant_id")
        .eq("role", "admin")
        .order("full_name");
    if (error) return [];
    // Enrich with email from auth.users via a join workaround
    return data || [];
}

export async function setUserRestaurant(userId: string, restaurantId: string | null) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("profiles")
        .update({ restaurant_id: restaurantId })
        .eq("id", userId);
    if (error) return { error: error.message };
    revalidatePath("/admin/users");
    return { success: true };
}

export async function promoteToAdmin(userId: string, restaurantId: string | null) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("profiles")
        .update({ role: "admin", restaurant_id: restaurantId })
        .eq("id", userId);
    if (error) return { error: error.message };
    revalidatePath("/admin/users");
    return { success: true };
}

export async function getAllUsers() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, restaurant_id")
        .order("role")
        .order("full_name");
    if (error) return [];
    return data || [];
}
