"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Restaurant } from "@/lib/types";

export async function getRestaurants(): Promise<Restaurant[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("restaurants")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function createRestaurant(formData: FormData) {
    const supabase = await createClient();

    const timeSlotsRaw = (formData.get("time_slots") as string) ?? "";
    const timeSlots = timeSlotsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const { error } = await supabase.from("restaurants").insert({
        name: formData.get("name") as string,
        slug: (formData.get("slug") as string)
            .toLowerCase()
            .replace(/\s+/g, "-"),
        address: formData.get("address") as string,
        phone: formData.get("phone") as string,
        description: formData.get("description") as string,
        time_slots: timeSlots,
        max_party_size: parseInt(formData.get("max_party_size") as string, 10),
    });

    if (error) throw new Error(error.message);
    revalidatePath("/admin/restaurants");
}

export async function updateRestaurant(id: string, formData: FormData) {
    const supabase = await createClient();

    const timeSlotsRaw = (formData.get("time_slots") as string) ?? "";
    const timeSlots = timeSlotsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

    const { error } = await supabase
        .from("restaurants")
        .update({
            name: formData.get("name") as string,
            slug: (formData.get("slug") as string)
                .toLowerCase()
                .replace(/\s+/g, "-"),
            address: formData.get("address") as string,
            phone: formData.get("phone") as string,
            description: formData.get("description") as string,
            time_slots: timeSlots,
            max_party_size: parseInt(
                formData.get("max_party_size") as string,
                10
            ),
        })
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/restaurants");
}

export async function deleteRestaurant(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("restaurants")
        .delete()
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/restaurants");
}
