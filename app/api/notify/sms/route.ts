import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { guestPhone, guestName, reservationCode, date, timeSlot } =
            await request.json();

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

        const message = `🌮 Carmelitas Confirmation! Hi ${guestName}, your reservation (Code: ${reservationCode}) is confirmed for ${date} at ${timeSlot}. We look forward to seeing you! For changes call (555) 867-5309.`;

        const twilioResponse = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
                method: "POST",
                headers: {
                    Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
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
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
