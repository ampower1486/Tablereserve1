import { notFound } from "next/navigation";
import Link from "next/link";
import { getReservationByCode } from "@/app/actions/reservations";
import { format, parseISO } from "date-fns";
import { Check, CalendarDays, Clock, Users, UtensilsCrossed, MapPin } from "lucide-react";
import { ConfettiEffect } from "@/components/ConfettiEffect";


interface ConfirmationPageProps {
    params: Promise<{ code: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
    const { code } = await params;
    const reservation = await getReservationByCode(code);

    if (!reservation) notFound();

    const restaurant = reservation.restaurants as {
        name: string;
        address: string;
        phone: string;
    } | null;

    const formattedDate = format(parseISO(reservation.date), "EEEE, MMMM d, yyyy");

    return (
        <div className="min-h-screen bg-gradient-to-b from-carmelita-cream to-white py-12 px-4 sm:px-6">
            <div className="max-w-lg mx-auto animate-slide-up">
                <ConfettiEffect />

                {/* Success Header */}

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="font-display text-3xl font-bold text-carmelita-dark mb-2">
                        You&apos;re confirmed!
                    </h1>
                    <p className="text-gray-600">
                        We look forward to hosting you. A confirmation has been sent to{" "}
                        <strong>{reservation.guest_email}</strong>.
                    </p>
                </div>

                {/* BOARDING PASS CARD */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
                    {/* Top bar */}
                    <div className="bg-carmelita-dark px-6 py-5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-carmelita-red rounded-full flex items-center justify-center">
                                <UtensilsCrossed className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="text-white font-display font-bold text-lg leading-none">
                                    Tablereserve
                                </div>
                                <div className="text-gray-400 text-xs">Carmelitas · Mexican Restaurant</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs text-gray-400 uppercase tracking-wider">Status</div>
                            <div className="inline-flex items-center gap-1 bg-green-500/20 text-green-400 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                                Confirmed
                            </div>
                        </div>
                    </div>

                    {/* Reservation Code */}
                    <div className="px-6 py-6 text-center border-b border-gray-100">
                        <div className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-2">
                            Reservation Code
                        </div>
                        <div className="font-display text-5xl font-black text-carmelita-dark tracking-widest">
                            {reservation.code}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            Present this code at arrival
                        </p>
                    </div>

                    {/* Dashed divider with circles */}
                    <div className="relative px-6">
                        <div className="boarding-pass-divider border-t-2 border-dashed border-gray-200 my-0" />
                    </div>

                    {/* Itinerary */}
                    <div className="px-6 py-6 space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            Reservation Details
                        </h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-carmelita-cream rounded-lg flex items-center justify-center shrink-0">
                                    <CalendarDays className="w-4 h-4 text-carmelita-red" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Date</div>
                                    <div className="text-sm font-bold text-carmelita-dark leading-tight">
                                        {formattedDate}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-carmelita-cream rounded-lg flex items-center justify-center shrink-0">
                                    <Clock className="w-4 h-4 text-carmelita-red" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Time</div>
                                    <div className="text-sm font-bold text-carmelita-dark">
                                        {reservation.time_slot}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-carmelita-cream rounded-lg flex items-center justify-center shrink-0">
                                    <Users className="w-4 h-4 text-carmelita-red" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Party</div>
                                    <div className="text-sm font-bold text-carmelita-dark">
                                        {reservation.party_size}{" "}
                                        {reservation.party_size === 1 ? "guest" : "guests"}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-carmelita-cream rounded-lg flex items-center justify-center shrink-0">
                                    <MapPin className="w-4 h-4 text-carmelita-red" />
                                </div>
                                <div>
                                    <div className="text-xs text-gray-500 font-medium">Location</div>
                                    <div className="text-sm font-bold text-carmelita-dark leading-tight">
                                        {restaurant?.address || "1234 Avenida de la Abuela"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Guest info */}
                        <div className="bg-carmelita-cream rounded-xl p-4 mt-2">
                            <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-500">Guest Name</span>
                                <span className="text-sm font-bold text-carmelita-dark">
                                    {reservation.guest_name}
                                </span>
                            </div>
                            {reservation.notes && (
                                <div className="flex justify-between items-start mt-2">
                                    <span className="text-xs text-gray-500">Notes</span>
                                    <span className="text-sm text-carmelita-dark text-right max-w-[60%]">
                                        {reservation.notes}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="bg-carmelita-cream px-6 py-4 flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                            📞 {restaurant?.phone || "(555) 867-5309"}
                        </div>
                        <div className="text-xs text-gray-400">
                            Hold time: 15 min
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                    <Link href="/book" className="btn-secondary flex-1 text-center py-3">
                        Make Another Booking
                    </Link>
                    <Link href="/" className="btn-primary flex-1 text-center py-3">
                        Back to Home
                    </Link>
                </div>

                {/* Policy note */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    We&apos;ll hold your table for 15 minutes past the reservation time.
                    If you need to cancel, contact us at {restaurant?.phone || "(555) 867-5309"}.
                </p>
            </div>
        </div>
    );
}
