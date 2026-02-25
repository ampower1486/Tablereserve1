export type Reservation = {
    id: string;
    code: string;
    restaurant_id: string;
    user_id: string | null;
    guest_name: string;
    guest_email: string;
    guest_phone: string | null;
    date: string;
    time_slot: string;
    party_size: number;
    status: "confirmed" | "cancelled" | "completed" | "no_show";
    notes: string | null;
    created_at: string;
    updated_at: string;
};

export type Restaurant = {
    id: string;
    name: string;
    slug: string;
    address: string | null;
    phone: string | null;
    description: string | null;
    time_slots: string[];
    max_party_size: number;
    created_at: string;
};

export type Profile = {
    id: string;
    full_name: string | null;
    phone: string | null;
    role: "customer" | "admin";
    created_at: string;
    updated_at: string;
};

export type BookingFormData = {
    date: Date | null;
    timeSlot: string;
    partySize: number;
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    notes: string;
};
