import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRestaurants } from "@/app/actions/restaurants";
import { RestaurantManager } from "@/components/admin/RestaurantManager";
import { Store } from "lucide-react";
import Link from "next/link";

export default async function RestaurantsAdminPage() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Verify admin role
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin") redirect("/");

    const restaurants = await getRestaurants();

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/admin"
                            className="text-sm text-gray-400 hover:text-carmelita-dark transition-colors"
                        >
                            ← Back to Dashboard
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-carmelita-dark rounded-2xl flex items-center justify-center">
                        <Store className="w-6 h-6 text-carmelita-gold" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-carmelita-dark">
                            Restaurants
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Manage restaurants and their booking settings
                        </p>
                    </div>
                </div>

                <RestaurantManager initialRestaurants={restaurants} />
            </div>
        </div>
    );
}
