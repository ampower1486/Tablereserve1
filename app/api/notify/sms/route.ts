import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const {
            guestPhone,
            guestName,
            restaurantName,
            restaurantPhone,
            reservationCode,
            date,
            timeSlot,
            partySize,
        } = await request.json();

        if (!guestPhone || !reservationCode) {
            return NextResponse.json(
                { error: "guestPhone and reservationCode are required" },
                { status: 400 }
            );
        }

        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const fromNumber = process.env.TWILIO_PHONE_NUMBER;

        if (!accountSid || !authToken || !fromNumber) {
            return NextResponse.json(
                { error: "Twilio credentials not configured" },
                { status: 503 }
            );
        }

        const restaurant = restaurantName || "the restaurant";
        const contactLine = restaurantPhone
            ? ` Questions? Call us at ${restaurantPhone}.`
            : "";

        const message =
            `✅ Reservation Confirmed!\n\n` +
            `Hi ${guestName}, you're all set at ${restaurant}.\n\n` +
            `📅 ${date}\n` +
            `🕐 ${timeSlot}\n` +
            `👥 ${partySize} guest${partySize !== 1 ? "s" : ""}\n` +
            `🔖 Code: ${reservationCode}\n` +
            `${contactLine}\n\n` +
            `See you soon! — Tablereserve`;

        const twilioResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${Buffer.from(
                        `${accountSid}:${authToken}`
                    ).toString("base64")}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    From: fromNumber,
                    To: guestPhone,
                    Body: message,
                }),
            }
        );

        if (!twilioResponse.ok) {
            const err = await twilioResponse.json();
            throw new Error(err.message || "Failed to send SMS");
        }

        const data = await twilioResponse.json();
        return NextResponse.json({ success: true, sid: data.sid });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
