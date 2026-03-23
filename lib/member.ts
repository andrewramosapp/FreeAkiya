import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import Stripe from "stripe";

export const COOKIE_NAME = "ca_member";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function getSecret() {
  const s = process.env.MEMBER_COOKIE_SECRET ?? "fallback-dev-secret-32chars!!";
  return new TextEncoder().encode(s);
}

export type MemberTier = "free" | "premium";

export async function signMemberCookie(email: string, tier: MemberTier): Promise<string> {
  return new SignJWT({ email, tier })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setIssuedAt()
    .sign(getSecret());
}

export async function getMember(): Promise<{ email: string; tier: MemberTier } | null> {
  try {
    const store = await cookies();
    const token = store.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, getSecret());
    const email = payload.email as string;
    const tier = (payload.tier as MemberTier) ?? "free";
    if (!email) return null;
    return { email, tier };
  } catch {
    return null;
  }
}

export async function getMemberEmail(): Promise<string | null> {
  const m = await getMember();
  return m?.email ?? null;
}

export async function isGiftedPremium(email: string): Promise<boolean> {
  // Check env var list first (fast, no DB call)
  const envList = (process.env.GIFTED_PREMIUM_EMAILS ?? "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  if (envList.includes(email.toLowerCase().trim())) return true;
  // Check gifted_members table in Supabase
  try {
    const res = await fetch(
      `${SB_URL}/rest/v1/gifted_members?email=eq.${encodeURIComponent(email.toLowerCase())}&is_active=eq.true&select=id&limit=1`,
      { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } }
    );
    const data = await res.json();
    return Array.isArray(data) && data.length > 0;
  } catch {
    return false;
  }
}

export async function checkStripeSubscription(email: string): Promise<boolean> {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
    const customers = await stripe.customers.list({ email, limit: 5 });
    if (!customers.data.length) return false;
    for (const customer of customers.data) {
      const subs = await stripe.subscriptions.list({ customer: customer.id, status: "active", limit: 5 });
      if (subs.data.length > 0) return true;
    }
    return false;
  } catch {
    return false;
  }
}
