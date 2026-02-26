import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAllUsers } from "@/app/actions/admin";
import { getRestaurants } from "@/app/actions/restaurants";
import { UserManager } from "@/components/admin/UserManager";
import { Users } from "lucide-react";
import Link from "next/link";

export default async function AdminUsersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // Only super admins (restaurant_id = null) can manage users
    const { data: profile } = await supabase
        .from("profiles")
        .select("role, restaurant_id")
        .eq("id", user.id)
        .single();

    if (!profile || profile.role !== "admin" || profile.restaurant_id !== null) {
        redirect("/admin");
    }

    const [users, restaurants] = await Promise.all([
        getAllUsers(),
        getRestaurants(),
    ]);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {/* Back link */}
                <div className="mb-6">
                    <Link href="/admin" className="text-sm text-gray-400 hover:text-carmelita-dark transition-colors">
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-carmelita-dark rounded-2xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-carmelita-gold" />
                    </div>
                    <div>
                        <h1 className="font-display text-3xl font-bold text-carmelita-dark">
                            Admin Users
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Assign admin access to restaurant owners
                        </p>
                    </div>
                </div>

                {/* Instructions box */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-sm text-amber-800">
                    <p className="font-semibold mb-1">How it works:</p>
                    <ul className="list-disc list-inside space-y-1 text-amber-700">
                        <li>Restaurant owners must first <strong>create an account</strong> at <span className="font-mono">/register</span></li>
                        <li>Then find them below and click <strong>Make Admin</strong> for their restaurant</li>
                        <li>They'll only see reservations for their restaurant in the dashboard</li>
                        <li><strong>All restaurants</strong> = super admin, sees everything</li>
                    </ul>
                </div>

                <UserManager users={users} restaurants={restaurants} />
            </div>
        </div>
    );
}
