import { getRestaurants } from "@/app/actions/restaurants";
import Link from "next/link";
import { CalendarDays, MapPin, Phone, ArrowRight } from "lucide-react";

export default async function BookPage() {
    const restaurants = await getRestaurants();

    return (
        <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12 animate-slide-up">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-carmelita-red/10 rounded-full mb-4">
                        <CalendarDays className="w-7 h-7 text-carmelita-red" />
                    </div>
                    <h1 className="font-display text-4xl font-bold text-carmelita-dark mb-2">
                        Choose a Restaurant
                    </h1>
                    <p className="text-gray-500">
                        Select a restaurant to make a reservation
                    </p>
                </div>

                {/* Restaurant list */}
                {restaurants.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <p>No restaurants available yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {restaurants.map((r) => (
                            <Link
                                key={r.id}
                                href={`/book/${r.slug}`}
                                className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-carmelita-red/30 hover:shadow-md transition-all duration-200 p-6"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="min-w-0">
                                        <h2 className="font-display font-bold text-xl text-carmelita-dark group-hover:text-carmelita-red transition-colors">
                                            {r.name}
                                        </h2>
                                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                                            {r.address && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                    {r.address}
                                                </span>
                                            )}
                                            {r.phone && (
                                                <span className="flex items-center gap-1">
                                                    <Phone className="w-3.5 h-3.5 shrink-0" />
                                                    {r.phone}
                                                </span>
                                            )}
                                        </div>
                                        {r.description && (
                                            <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                                                {r.description}
                                            </p>
                                        )}
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-carmelita-red group-hover:translate-x-1 transition-all shrink-0 ml-4" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
