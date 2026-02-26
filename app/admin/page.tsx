import { getAllReservations, getAdminStats, getMyProfile } from "@/app/actions/admin";
import { getRestaurants } from "@/app/actions/restaurants";
import { signOut } from "@/app/actions/auth";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays, Users, CheckCircle, TrendingUp, Store, UserCog, LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/supabase/server";

export default async function AdminPage({
    searchParams,
}: {
    searchParams: Promise<{ filter?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const resolvedParams = await searchParams;
    const filterParam = resolvedParams.filter;

    // Get admin's profile and linked restaurant
    const profile = await getMyProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "super_admin")) redirect("/");

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

    const isSuperAdmin = profile.role === "super_admin";

    const [reservations, stats] = await Promise.all([
        getAllReservations(filterParam),
        getAdminStats(),
    ]);

    const activeFilterText = filterParam === "today" ? "Today's" :
        filterParam === "today_confirmed" ? "Today's Confirmed" :
            filterParam === "confirmed" ? "Confirmed" : "All";

    // Fetch restaurants for the Create Reservation modal
    let availableRestaurants: { id: string; name: string }[] = [];
    if (isSuperAdmin) {
        const { data } = await supabase.from("restaurants").select("id, name").order("name");
        availableRestaurants = data || [];
    } else if (profile.restaurant_id && restaurantName) {
        availableRestaurants = [{ id: profile.restaurant_id, name: restaurantName }];
    }

    const confirmedToday = reservations.filter((r) => {
        const today = new Date().toISOString().split("T")[0];
        return r.date === today && r.status === "confirmed";
    }).length;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Admin Header */}
            <div className="bg-carmelita-dark text-white py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="font-display text-2xl font-bold">
                                Welcome, {profile.full_name || "Admin"}
                            </h1>
                            <p className="text-gray-400 text-sm mt-0.5">
                                {isSuperAdmin
                                    ? "Tablereserve · All restaurants"
                                    : restaurantName ? `Tablereserve · ${restaurantName}` : "Tablereserve Dashboard"}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Logged in as</div>
                            <div className="text-sm font-medium">{user?.email}</div>
                            <div className="flex items-center justify-end gap-2 mt-2 flex-wrap">
                                {/* Super admin only nav links */}
                                {isSuperAdmin && (
                                    <>
                                        <Link
                                            href="/admin/restaurants"
                                            className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            <Store className="w-3.5 h-3.5" />
                                            Restaurants
                                        </Link>
                                        <Link
                                            href="/admin/users"
                                            className="inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors"
                                        >
                                            <UserCog className="w-3.5 h-3.5" />
                                            Admin Users
                                        </Link>
                                    </>
                                )}
                                <div className="flex items-center gap-1.5 ml-2 border-r border-white/20 pr-3">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span className="text-xs text-green-400">Live</span>
                                </div>
                                <form action={signOut}>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-full transition-colors ml-1"
                                    >
                                        <LogOut className="w-3.5 h-3.5" />
                                        Log Out
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <Link href="/admin/calendar" className="block transition-transform hover:scale-[1.02]">
                        <StatCard
                            title="Total Reservations"
                            value={stats.total}
                            icon={<CalendarDays className="w-5 h-5" />}
                            color="blue"
                        />
                    </Link>
                    <Link href="/admin?filter=confirmed" className="block transition-transform hover:scale-[1.02]">
                        <StatCard
                            title="Confirmed"
                            value={stats.confirmed}
                            icon={<CheckCircle className="w-5 h-5" />}
                            color="green"
                        />
                    </Link>
                    <Link href="/admin?filter=today" className="block transition-transform hover:scale-[1.02]">
                        <StatCard
                            title="Today"
                            value={stats.today}
                            icon={<TrendingUp className="w-5 h-5" />}
                            color="orange"
                        />
                    </Link>
                    <Link href="/admin?filter=today_confirmed" className="block transition-transform hover:scale-[1.02]">
                        <StatCard
                            title="Today Confirmed"
                            value={confirmedToday}
                            icon={<Users className="w-5 h-5" />}
                            color="purple"
                        />
                    </Link>
                </div>

                {/* Reservations Panel */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex flex-col">
                            <h2 className="font-display text-xl font-bold text-carmelita-dark">
                                {restaurantName ? `${restaurantName} Reservations` : "All Reservations"}
                            </h2>
                            {filterParam && (
                                <div className="text-sm text-carmelita-red mt-1 flex items-center gap-2">
                                    <span>Showing: <strong>{activeFilterText}</strong></span>
                                    <Link href="/admin" className="text-gray-400 hover:text-carmelita-dark underline text-xs">
                                        Clear Filter
                                    </Link>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Updating in real-time
                        </div>
                    </div>
                    <ReservationTable
                        initialReservations={reservations}
                        availableRestaurants={availableRestaurants}
                    />
                </div>
            </div>
        </div>
    );
}

function StatCard({
    title,
    value,
    icon,
    color,
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: "blue" | "green" | "orange" | "purple";
}) {
    const colors = {
        blue: "bg-blue-50 text-blue-600",
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
        purple: "bg-purple-50 text-purple-600",
    };

    return (
        <div className="card p-4">
            <div className={`inline-flex p-2 rounded-lg mb-3 ${colors[color]}`}>
                {icon}
            </div>
            <div className="text-2xl font-bold text-carmelita-dark">{value}</div>
            <div className="text-xs text-gray-500 font-medium mt-0.5">{title}</div>
        </div>
    );
}
