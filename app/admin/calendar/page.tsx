import { getAllReservations, getMyProfile } from "@/app/actions/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/admin/CalendarView";

export default async function AdminCalendarPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const profile = await getMyProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) redirect("/");

    const isSuperAdmin = profile.role === "super_admin";

    // If restaurant-scoped, fetch that restaurant's name
    let restaurantName: string | null = null;
    if (profile.restaurant_id) {
        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("name")
            .eq("id", profile.restaurant_id)
            .single();
        restaurantName = restaurant?.name ?? null;
    }

    const reservations = await getAllReservations();

    let availableRestaurants: { id: string; name: string }[] = [];
    if (isSuperAdmin) {
        const { data } = await supabase.from("restaurants").select("id, name").order("name");
        availableRestaurants = data || [];
    } else if (profile.restaurant_id && restaurantName) {
        availableRestaurants = [{ id: profile.restaurant_id, name: restaurantName }];
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-[1600px] mx-auto">
                <CalendarView reservations={reservations} availableRestaurants={availableRestaurants} />
            </div>
        </div>
    );
}
