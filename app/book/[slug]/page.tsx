import { getRestaurantBySlug, getAvailableSlots } from "@/app/actions/reservations";
import { BookingForm } from "@/components/booking/BookingForm";
import { CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface BookSlugPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookSlugPageProps): Promise<Metadata> {
    const { slug } = await params;
    const restaurant = await getRestaurantBySlug(slug);
    if (!restaurant) return { title: "Restaurant Not Found" };
    return {
        title: `Book a Table | ${restaurant.name}`,
        description: `Reserve your table at ${restaurant.name}. Easy online booking.`,
    };
}

export default async function BookSlugPage({ params }: BookSlugPageProps) {
    const { slug } = await params;
    const restaurant = await getRestaurantBySlug(slug);

    if (!restaurant) notFound();

    const { timeSlots, maxPartySize } = await getAvailableSlots(restaurant.id);

    return (
        <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white py-12 px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            <div className="text-center mb-10 animate-slide-up">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-carmelita-red/10 rounded-full mb-4">
                    <CalendarDays className="w-7 h-7 text-carmelita-red" />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-carmelita-dark mb-2">
                    Reserve Your Table
                </h1>
                <p className="text-gray-600 font-semibold text-lg">
                    {restaurant.name}
                </p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    {restaurant.address && <span>📍 {restaurant.address}</span>}
                    {restaurant.phone && <span>📞 {restaurant.phone}</span>}
                </div>
                {restaurant.description && (
                    <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                        {restaurant.description}
                    </p>
                )}
            </div>

            <BookingForm
                restaurantId={restaurant.id}
                timeSlots={timeSlots}
                maxPartySize={maxPartySize}
            />
        </div>
    );
}
