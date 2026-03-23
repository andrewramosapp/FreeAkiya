import { NextRequest, NextResponse } from "next/server";
import { checkStripeSubscription, isGiftedPremium, signMemberCookie, COOKIE_NAME, COOKIE_MAX_AGE } from "@/lib/member";

const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY ?? "";
const BEEHIIV_PUB_ID = "pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015";

async function checkBeehiivSubscriber(email: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions?email=${encodeURIComponent(email)}&status=active`,
      { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
    );
    const data = await res.json();
    return (data?.data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check premium first (Stripe or gifted)
    const isPremium = isGiftedPremium(cleanEmail) || await checkStripeSubscription(cleanEmail);
    if (isPremium) {
      const token = await signMemberCookie(cleanEmail, "premium");
      const res = NextResponse.json({ success: true, tier: "premium" });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true, secure: true, sameSite: "lax",
        maxAge: COOKIE_MAX_AGE, path: "/",
      });
      return res;
    }

    // Check free (Beehiiv)
    const isFree = await checkBeehiivSubscriber(cleanEmail);
    if (isFree) {
      const token = await signMemberCookie(cleanEmail, "free");
      const res = NextResponse.json({ success: true, tier: "free" });
      res.cookies.set(COOKIE_NAME, token, {
        httpOnly: true, secure: true, sameSite: "lax",
        maxAge: COOKIE_MAX_AGE, path: "/",
      });
      return res;
    }

    return NextResponse.json(
      { error: "No subscription found. Join free to get access." },
      { status: 403 }
    );
  } catch (err) {
    console.error("verify-member error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
