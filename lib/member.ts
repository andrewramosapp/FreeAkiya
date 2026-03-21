import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import Stripe from "stripe";

const COOKIE_NAME = "ca_member";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const s = process.env.MEMBER_COOKIE_SECRET ?? "fallback-dev-secret-32chars!!";
  return new TextEncoder().encode(s);
}

export async function signMemberCookie(email: string): Promise<string> {
  return new SignJWT({ email, premium: true })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(getSecret());
}

export async function getMemberEmail(): Promise<string | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    return (payload.email as string) ?? null;
  } catch {
    return null;
  }
}

export async function checkStripeSubscription(email: string): Promise<boolean> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    const customers = await stripe.customers.list({ email, limit: 5 });
    if (!customers.data.length) return false;

    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({
        customer: customer.id,
        status: "active",
        limit: 5,
      });
      if (subs.data.length > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
