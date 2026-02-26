import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { phone } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // Report what credentials are present
    const credCheck = {
        TWILIO_ACCOUNT_SID: accountSid ? `${accountSid.slice(0, 6)}...` : "❌ NOT SET",
        TWILIO_AUTH_TOKEN: authToken ? "✅ set (hidden)" : "❌ NOT SET",
        TWILIO_PHONE_NUMBER: fromNumber || "❌ NOT SET",
    };

    if (!accountSid || !authToken || !fromNumber) {
        return NextResponse.json({ error: "Missing credentials", credCheck }, { status: 400 });
    }

    // Normalize phone to E.164
    const digits = phone.replace(/\D/g, "");
    const toNumber = digits.startsWith("1") && digits.length === 11
        ? `+${digits}`
        : digits.length === 10
            ? `+1${digits}`
            : `+${digits}`;

    const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
            method: "POST",
            headers: {
                Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                From: fromNumber,
                To: toNumber,
                Body: "Tablereserve: Test message successful!",
            }),
        }
    );

    const twilioData = await twilioRes.json();

    let finalStatus = twilioData.status;
    let errorCode = twilioData.error_code;
    let errorMessage = twilioData.error_message;

    // Wait 3 seconds to let Twilio process the message
    if (twilioData.sid) {
        await new Promise(resolve => setTimeout(resolve, 3000));
        const statusRes = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages/${twilioData.sid}.json`,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
                },
            }
        );
        const statusData = await statusRes.json();
        finalStatus = statusData.status;
        errorCode = statusData.error_code;
        errorMessage = statusData.error_message;
    }

    return NextResponse.json({
        credCheck,
        toNumber,
        twilioStatus: twilioRes.status,
        finalStatus,
        errorCode,
        errorMessage,
        twilioResponse: twilioData,
    });
}
