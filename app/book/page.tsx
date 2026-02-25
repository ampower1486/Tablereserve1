import { getRestaurant, getAvailableSlots } from "@/app/actions/reservations";
import { BookingForm } from "@/components/booking/BookingForm";
import { CalendarDays } from "lucide-react";

export default async function BookPage() {
    const restaurant = await getRestaurant();

    if (!restaurant) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">Restaurant not found.</p>
            </div>
        );
    }

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
                <p className="text-gray-600 max-w-md mx-auto">
                    Join us for an authentic culinary journey. Book up to 14 days in
                    advance.
                </p>
                <div className="flex items-center justify-center gap-4 mt-3 text-sm text-gray-500">
                    <span>📍 {restaurant.address}</span>
                    <span>📞 {restaurant.phone}</span>
                </div>
            </div>

            <BookingForm
                restaurantId={restaurant.id}
                timeSlots={timeSlots}
                maxPartySize={maxPartySize}
            />
        </div>
    );
}
