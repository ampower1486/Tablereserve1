import { getAllReservations, getAdminStats } from "@/app/actions/admin";
import { ReservationTable } from "@/components/admin/ReservationTable";
import { createClient } from "@/lib/supabase/server";
import { CalendarDays, Users, CheckCircle, TrendingUp } from "lucide-react";

export default async function AdminPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const [reservations, stats] = await Promise.all([
        getAllReservations(),
        getAdminStats(),
    ]);

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
                                Admin Dashboard
                            </h1>
                            <p className="text-gray-400 text-sm mt-0.5">
                                Carmelitas Mexican Restaurant
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-400">Logged in as</div>
                            <div className="text-sm font-medium">{user?.email}</div>
                            <div className="flex items-center justify-end gap-1.5 mt-1">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                <span className="text-xs text-green-400">Live</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        title="Total Reservations"
                        value={stats.total}
                        icon={<CalendarDays className="w-5 h-5" />}
                        color="blue"
                    />
                    <StatCard
                        title="Confirmed"
                        value={stats.confirmed}
                        icon={<CheckCircle className="w-5 h-5" />}
                        color="green"
                    />
                    <StatCard
                        title="Today"
                        value={stats.today}
                        icon={<TrendingUp className="w-5 h-5" />}
                        color="orange"
                    />
                    <StatCard
                        title="Today Confirmed"
                        value={confirmedToday}
                        icon={<Users className="w-5 h-5" />}
                        color="purple"
                    />
                </div>

                {/* Reservations Panel */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-display text-xl font-bold text-carmelita-dark">
                            Reservations
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Updating in real-time
                        </div>
                    </div>
                    <ReservationTable initialReservations={reservations} />
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
