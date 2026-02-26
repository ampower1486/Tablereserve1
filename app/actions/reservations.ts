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

    const reservationDate = formData.date.toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];

    // ── 1-hour advance booking check ──────────────────────────
    if (reservationDate === today) {
        const [timePart, period] = formData.timeSlot.split(" ");
        const [hoursStr, minutesStr] = timePart.split(":");
        let hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        if (period === "PM" && hours !== 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;
        const slotTime = new Date();
        slotTime.setHours(hours, minutes, 0, 0);
        const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
        if (slotTime < oneHourFromNow) {
            return { error: "Reservations must be made at least 1 hour in advance. Please choose a later time." };
        }
    }

    // ── Per-slot capacity check ────────────────────────────────
    const { data: restaurantData } = await supabase
        .from("restaurants")
        .select("max_reservations_per_slot")
        .eq("id", restaurantId)
        .single();
    const maxPerSlot = restaurantData?.max_reservations_per_slot ?? 10;
    const { count: slotCount } = await supabase
        .from("reservations")
        .select("id", { count: "exact", head: true })
        .eq("restaurant_id", restaurantId)
        .eq("date", reservationDate)
        .eq("time_slot", formData.timeSlot)
        .eq("status", "confirmed");
    if ((slotCount ?? 0) >= maxPerSlot) {
        return { error: "This time slot is fully booked. Please choose a different time." };
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

    // (reservationDate already declared above)

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

    // Send SMS confirmation if guest provided a phone number
    if (formData.guestPhone) {
        try {
            // Fetch restaurant info for the message
            const { data: restaurant } = await supabase
                .from("restaurants")
                .select("name, phone")
                .eq("id", restaurantId)
                .single();

            const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL ||
                (process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : "http://localhost:3000");

            // Fire-and-forget — don't block the reservation on SMS success
            fetch(`${baseUrl}/api/notify/sms`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    guestPhone: formData.guestPhone,
                    guestName: formData.guestName,
                    restaurantName: restaurant?.name ?? "",
                    restaurantPhone: restaurant?.phone ?? "",
                    reservationCode: code,
                    date: reservationDate,
                    timeSlot: formData.timeSlot,
                    partySize: formData.partySize,
                }),
            }).catch(() => {
                // Silently ignore SMS errors — reservation is already saved
            });
        } catch {
            // Don't fail the reservation if SMS prep fails
        }
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
