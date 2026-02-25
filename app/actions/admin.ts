"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getAllReservations(filter?: string) {
    const supabase = await createClient();

    let query = supabase
        .from("reservations")
        .select("*")
        .order("date", { ascending: true })
        .order("time_slot", { ascending: true });

    if (filter && filter !== "all") {
        query = query.eq("status", filter);
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
    const today = new Date().toISOString().split("T")[0];

    const [confirmedRes, todayRes, totalRes] = await Promise.all([
        supabase
            .from("reservations")
            .select("id", { count: "exact" })
            .eq("status", "confirmed"),
        supabase
            .from("reservations")
            .select("id", { count: "exact" })
            .eq("date", today),
        supabase.from("reservations").select("id", { count: "exact" }),
    ]);

    return {
        confirmed: confirmedRes.count || 0,
        today: todayRes.count || 0,
        total: totalRes.count || 0,
    };
}
