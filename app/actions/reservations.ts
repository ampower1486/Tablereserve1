"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { BookingFormData } from "@/lib/types";

function generateCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export async function getRestaurant() {
    const supabase = await createClient();
    const slug = process.env.NEXT_PUBLIC_RESTAURANT_SLUG || "carmelitas";
    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) return null;
    return data;
}

export async function getRestaurantBySlug(slug: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error || !data) return null;
    return data;
}

export async function getAvailableSlots(restaurantId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("restaurants")
        .select("time_slots, max_party_size")
        .eq("id", restaurantId)
        .single();

    if (error || !data) return { timeSlots: [], maxPartySize: 10 };
    return { timeSlots: data.time_slots, maxPartySize: data.max_party_size };
}

export async function createReservation(
    formData: BookingFormData,
    restaurantId: string
) {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!formData.date || !formData.timeSlot) {
        return { error: "Date and time slot are required" };
    }

    // Generate a unique code
    let code = generateCode();
    let attempts = 0;
    while (attempts < 10) {
        const { data: existing } = await supabase
            .from("reservations")
            .select("id")
            .eq("code", code)
            .single();
        if (!existing) break;
        code = generateCode();
        attempts++;
    }

    const reservationDate = formData.date.toISOString().split("T")[0];

    const { data, error } = await supabase
        .from("reservations")
        .insert({
            code,
            restaurant_id: restaurantId,
            user_id: user?.id || null,
            guest_name: formData.guestName,
            guest_email: formData.guestEmail,
            guest_phone: formData.guestPhone || null,
            date: reservationDate,
            time_slot: formData.timeSlot,
            party_size: formData.partySize,
            notes: formData.notes || null,
            status: "confirmed",
        })
        .select()
        .single();

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/admin");
    return { data, code };
}

export async function getReservationByCode(code: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("reservations")
        .select(`*, restaurants(name, address, phone)`)
        .eq("code", code.toUpperCase())
        .single();

    if (error || !data) return null;
    return data;
}

export async function getUserReservations() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("reservations")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

    return data || [];
}
