import { getRestaurantBySlug, getAvailableSlots } from "@/app/actions/reservations";
import { BookingForm } from "@/components/booking/BookingForm";
import { CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Logo } from "@/components/ui/Logo";

interface BookSlugPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookSlugPageProps): Promise<Metadata> {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const restaurant = await getRestaurantBySlug(decodedSlug);
    if (!restaurant) return { title: "Restaurant Not Found" };
    return {
        title: `Book a Table | ${restaurant.name}`,
        description: `Reserve your table at ${restaurant.name}. Easy online booking.`,
    };
}

export default async function BookSlugPage({ params }: BookSlugPageProps) {
    const { slug } = await params;
    const decodedSlug = decodeURIComponent(slug);
    const restaurant = await getRestaurantBySlug(decodedSlug);

    if (!restaurant) notFound();

    const { timeSlots, maxPartySize } = await getAvailableSlots(restaurant.id);

    return (
        <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white py-12 px-4 sm:px-6 lg:px-8">
            {/* Page header */}
            <div className="text-center mb-10 animate-slide-up flex flex-col items-center">
                <div className="mb-8 flex justify-center w-full transform scale-[0.80] sm:scale-95">
                    <Logo />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-carmelita-dark mb-2">
                    Reserve Your Table
                </h1>
                <p className="text-gray-600 font-semibold text-lg">
                    {restaurant.name}
                </p>
                <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                    {restaurant.address && (
                        <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center hover:text-carmelita-red hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-carmelita-red focus:ring-offset-2 rounded"
                        >
                            <span className="mr-1">📍</span> {restaurant.address}
                        </a>
                    )}
                    {restaurant.phone && (
                        <a
                            href={`tel:${restaurant.phone.replace(/[^0-9+]/g, '')}`}
                            className="flex items-center hover:text-carmelita-red hover:underline transition-colors focus:outline-none focus:ring-2 focus:ring-carmelita-red focus:ring-offset-2 rounded"
                        >
                            <span className="mr-1">📞</span> {restaurant.phone}
                        </a>
                    )}
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
