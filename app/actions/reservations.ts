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

    // ── Fetch restaurant info once for both SMS + Email ──────────────────
    const { data: restaurant } = await supabase
        .from("restaurants")
        .select("name, phone, address")
        .eq("id", restaurantId)
        .single();

    const restaurantName = restaurant?.name ?? "the restaurant";
    const restaurantPhone = restaurant?.phone ?? "";
    const restaurantAddress = restaurant?.address ?? "";

    // ── Send SMS directly via Twilio API ────────────────────────────────
    if (formData.guestPhone) {
        try {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const fromNumber = process.env.TWILIO_PHONE_NUMBER;

            if (accountSid && authToken && fromNumber) {
                // Normalize to E.164 — Twilio requires +1XXXXXXXXXX for US numbers
                const digits = formData.guestPhone.replace(/\D/g, "");
                const toNumber = digits.startsWith("1") && digits.length === 11
                    ? `+${digits}`
                    : digits.length === 10
                        ? `+1${digits}`
                        : `+${digits}`; // already international

                const body =
                    `Tablereserve: You're set at ${restaurantName}!\n` +
                    `${reservationDate} @ ${formData.timeSlot}\n` +
                    `${formData.partySize} guests\n` +
                    `Code: ${code}`;

                const twilioRes = await fetch(
                    `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({
                            From: fromNumber,
                            To: toNumber,
                            Body: body,
                        }),
                    }
                );

                if (!twilioRes.ok) {
                    const errBody = await twilioRes.json();
                    console.error("[SMS] Twilio error:", JSON.stringify(errBody));
                } else {
                    console.log("[SMS] Sent to", toNumber);
                }
            }
        } catch (e) {
            console.error("[SMS] Exception:", e);
        }
    }


    // ── Send email confirmation via Resend ───────────────────────────────
    try {
        const resendApiKey = process.env.RESEND_API_KEY;
        if (resendApiKey) {
            const footerLine = [restaurantAddress, restaurantPhone]
                .filter(Boolean)
                .join(" · ");

            const htmlEmail = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Reservation Confirmed</title></head>
<body style="background:#FDF6E3;margin:0;padding:20px;font-family:sans-serif;">
  <div style="max-width:520px;margin:0 auto;background:white;border-radius:24px;overflow:hidden;box-shadow:0 4px 40px rgba(0,0,0,0.1);">
    <div style="background:#1A0A00;padding:24px;text-align:center;">
      <h1 style="color:#D4A520;font-size:22px;margin:0;">${restaurantName}</h1>
      <p style="color:#9CA3AF;font-size:12px;margin:4px 0 0;">Reservation Confirmed</p>
    </div>
    <div style="padding:32px;text-align:center;">
      <h2 style="color:#1A0A00;font-size:20px;margin:0 0 8px;">You're all set! 🎉</h2>
      <p style="color:#6B7280;margin:0 0 24px;">Hi ${formData.guestName}, we can't wait to host you!</p>
      <div style="background:#FDF6E3;border-radius:16px;padding:24px;margin-bottom:24px;">
        <p style="color:#9CA3AF;font-size:11px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px;">Reservation Code</p>
        <p style="color:#1A0A00;font-size:40px;font-weight:900;letter-spacing:8px;margin:0;font-family:monospace;">${code}</p>
        <p style="color:#9CA3AF;font-size:11px;margin:8px 0 0;">Present this at arrival</p>
      </div>
      <table style="width:100%;border-collapse:collapse;text-align:left;">
        <tr>
          <td style="color:#6B7280;font-size:13px;padding:8px 0;border-bottom:1px solid #F3F4F6;">📅 Date</td>
          <td style="color:#1A0A00;font-size:13px;font-weight:600;padding:8px 0;border-bottom:1px solid #F3F4F6;text-align:right;">${reservationDate}</td>
        </tr>
        <tr>
          <td style="color:#6B7280;font-size:13px;padding:8px 0;border-bottom:1px solid #F3F4F6;">🕐 Time</td>
          <td style="color:#1A0A00;font-size:13px;font-weight:600;padding:8px 0;border-bottom:1px solid #F3F4F6;text-align:right;">${formData.timeSlot}</td>
        </tr>
        <tr>
          <td style="color:#6B7280;font-size:13px;padding:8px 0;">👥 Party</td>
          <td style="color:#1A0A00;font-size:13px;font-weight:600;padding:8px 0;text-align:right;">${formData.partySize} guest${formData.partySize !== 1 ? "s" : ""}</td>
        </tr>
      </table>
    </div>
    ${footerLine ? `<div style="background:#FDF6E3;padding:16px;text-align:center;">
      <p style="color:#9CA3AF;font-size:12px;margin:0;">${footerLine}</p>
    </div>` : ""}
  </div>
</body>
</html>`;

            await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: "Tablereserve <onboarding@resend.dev>",
                    to: [formData.guestEmail],
                    subject: `✅ Your reservation is confirmed! Code: ${code}`,
                    html: htmlEmail,
                }),
            });
        }
    } catch {
        // Don't fail the reservation if email fails
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
