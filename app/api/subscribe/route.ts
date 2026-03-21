import { NextRequest, NextResponse } from "next/server";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY ?? "";
const BEEHIIV_PUB_ID = "pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email ?? "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Subscribe to Beehiiv
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${BEEHIIV_API_KEY}`,
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: true,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Beehiiv error:", data);
      // Still return success to user — we don't want to expose API errors
      return NextResponse.json({ success: true, note: "queued" });
    }

    return NextResponse.json({ success: true, id: data?.data?.id });
  } catch (err) {
    console.error("Subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
