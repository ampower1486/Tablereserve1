import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { guestEmail, guestName, reservationCode, date, timeSlot, partySize } =
            await request.json();

        if (!guestEmail || !reservationCode) {
            return NextResponse.json(
                { error: "guestEmail and reservationCode are required" },
                { status: 400 }
            );
        }

        const resendApiKey = process.env.RESEND_API_KEY;

        if (!resendApiKey) {
            return NextResponse.json(
                { error: "Resend API key not configured" },
                { status: 503 }
            );
        }

        const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Reservation is Confirmed</title>
</head>
<body style="background:#FDF6E3; margin:0; padding:20px; font-family:sans-serif;">
  <div style="max-width:520px; margin:0 auto; background:white; border-radius:24px; overflow:hidden; box-shadow:0 4px 40px rgba(0,0,0,0.1);">
    <div style="background:#1A0A00; padding:24px; text-align:center;">
      <h1 style="color:#D4A520; font-size:24px; margin:0;">🌮 Carmelitas</h1>
      <p style="color:#9CA3AF; font-size:12px; margin:4px 0 0;">Mexican Restaurant</p>
    </div>
    <div style="padding:32px; text-align:center;">
      <h2 style="color:#1A0A00; font-size:20px; margin:0 0 8px;">Reservation Confirmed!</h2>
      <p style="color:#6B7280; margin:0 0 24px;">Hi ${guestName}, we can't wait to host you!</p>
      <div style="background:#FDF6E3; border-radius:16px; padding:24px; margin-bottom:24px;">
        <p style="color:#9CA3AF; font-size:11px; text-transform:uppercase; letter-spacing:2px; margin:0 0 8px;">Reservation Code</p>
        <p style="color:#1A0A00; font-size:40px; font-weight:900; letter-spacing:8px; margin:0; font-family:monospace;">${reservationCode}</p>
      </div>
      <table style="width:100%; border-collapse:collapse; text-align:left;">
        <tr>
          <td style="color:#6B7280; font-size:13px; padding:6px 0; border-bottom:1px solid #F3F4F6;">Date</td>
          <td style="color:#1A0A00; font-size:13px; font-weight:600; padding:6px 0; border-bottom:1px solid #F3F4F6; text-align:right;">${date}</td>
        </tr>
        <tr>
          <td style="color:#6B7280; font-size:13px; padding:6px 0; border-bottom:1px solid #F3F4F6;">Time</td>
          <td style="color:#1A0A00; font-size:13px; font-weight:600; padding:6px 0; border-bottom:1px solid #F3F4F6; text-align:right;">${timeSlot}</td>
        </tr>
        <tr>
          <td style="color:#6B7280; font-size:13px; padding:6px 0;">Party Size</td>
          <td style="color:#1A0A00; font-size:13px; font-weight:600; padding:6px 0; text-align:right;">${partySize} guests</td>
        </tr>
      </table>
    </div>
    <div style="background:#FDF6E3; padding:16px; text-align:center;">
      <p style="color:#9CA3AF; font-size:12px; margin:0;">1234 Avenida de la Abuela, Puebla District, CA 90210 | (555) 867-5309</p>
    </div>
  </div>
</body>
</html>`;

        const resendResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: "Carmelitas <noreply@carmelitas.restaurant>",
                to: [guestEmail],
                subject: `🌮 Your reservation is confirmed! Code: ${reservationCode}`,
                html: htmlBody,
            }),
        });

        if (!resendResponse.ok) {
            const err = await resendResponse.json();
            throw new Error(err.message || "Failed to send email");
        }

        const data = await resendResponse.json();
        return NextResponse.json({ success: true, id: data.id });
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
