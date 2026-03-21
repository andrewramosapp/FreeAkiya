import { NextRequest, NextResponse } from "next/server";
import { checkStripeSubscription, signMemberCookie, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/member";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const isPremium = await checkStripeSubscription(email.toLowerCase().trim());
    if (!isPremium) {
      return NextResponse.json({ error: "No active subscription found for this email." }, { status: 403 });
    }

    const token = await signMemberCookie(email.toLowerCase().trim());
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return res;
  } catch (err) {
    console.error("verify-member error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
