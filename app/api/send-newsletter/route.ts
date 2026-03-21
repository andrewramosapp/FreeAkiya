import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";

const resend = new Resend(process.env.RESEND_API_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY ?? "";
const BEEHIIV_PUB_ID = "pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015";
const FROM = "CheapAkiya <onboarding@resend.dev>";

async function getPremiumEmails(): Promise<string[]> {
  const emails: string[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const params: Record<string, string | number> = { status: "active", limit: 100 };
    if (startingAfter) params.starting_after = startingAfter;

    const subs = await stripe.subscriptions.list(params as Parameters<typeof stripe.subscriptions.list>[0]);

    for (const sub of subs.data) {
      const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
      if (customer.email) emails.push(customer.email);
    }

    hasMore = subs.has_more;
    if (subs.data.length > 0) startingAfter = subs.data[subs.data.length - 1].id;
    else break;
  }

  return [...new Set(emails)]; // dedupe
}

async function getFreeEmails(): Promise<string[]> {
  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${BEEHIIV_PUB_ID}/subscriptions?status=active&limit=100`,
      { headers: { Authorization: `Bearer ${BEEHIIV_API_KEY}` } }
    );
    const data = await res.json();
    return (data?.data ?? []).map((s: { email: string }) => s.email).filter(Boolean);
  } catch {
    return [];
  }
}

function freeTemplate(subject: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px">
    <div style="margin-bottom:32px">
      <span style="font-size:24px">🏯</span>
      <span style="font-weight:900;font-size:18px;margin-left:8px">CheapAkiya</span>
    </div>
    <h1 style="font-size:28px;font-weight:900;line-height:1.2;margin-bottom:24px">${subject}</h1>
    <div style="color:#ccc;font-size:15px;line-height:1.7">${body}</div>
    <hr style="border:none;border-top:1px solid #222;margin:40px 0">
    <div style="background:#e85d2f15;border:1px solid #e85d2f40;border-radius:12px;padding:24px;margin-bottom:32px">
      <p style="color:#e85d2f;font-weight:700;margin:0 0 8px">🔒 Want contact info + 60 more listings?</p>
      <p style="color:#999;font-size:14px;margin:0 0 16px">Premium members get direct contact info for every listing, move-in ready filter, and new listings 48hrs early.</p>
      <a href="https://cheapakiya.com/join" style="background:#e85d2f;color:#fff;font-weight:700;padding:12px 24px;border-radius:999px;text-decoration:none;display:inline-block">Unlock Premium — $12/mo →</a>
    </div>
    <p style="color:#444;font-size:12px">You're receiving this because you subscribed at cheapakiya.com. <a href="{{unsubscribe_url}}" style="color:#666">Unsubscribe</a></p>
  </div>
</body>
</html>`;
}

function premiumTemplate(subject: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#0a0a0a;color:#fff;font-family:system-ui,sans-serif;margin:0;padding:0">
  <div style="max-width:600px;margin:0 auto;padding:40px 24px">
    <div style="margin-bottom:8px">
      <span style="font-size:24px">🏯</span>
      <span style="font-weight:900;font-size:18px;margin-left:8px">CheapAkiya</span>
      <span style="background:#e85d2f;color:#fff;font-size:11px;font-weight:700;padding:3px 10px;border-radius:999px;margin-left:8px;vertical-align:middle">PREMIUM</span>
    </div>
    <p style="color:#e85d2f;font-size:13px;margin:0 0 32px">Members-only newsletter</p>
    <h1 style="font-size:28px;font-weight:900;line-height:1.2;margin-bottom:24px">${subject}</h1>
    <div style="color:#ccc;font-size:15px;line-height:1.7">${body}</div>
    <hr style="border:none;border-top:1px solid #222;margin:40px 0">
    <div style="text-align:center;margin-bottom:24px">
      <a href="https://cheapakiya.com/listings" style="background:#e85d2f;color:#fff;font-weight:700;padding:12px 28px;border-radius:999px;text-decoration:none;display:inline-block">Browse All Listings →</a>
    </div>
    <p style="color:#444;font-size:12px;text-align:center">You're a CheapAkiya Premium member. Questions? Reply to this email.</p>
  </div>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  // Auth check
  const auth = req.headers.get("x-admin-secret");
  if (auth !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { subject, body, tier } = await req.json();
  if (!subject || !body || !tier) {
    return NextResponse.json({ error: "Missing subject, body, or tier" }, { status: 400 });
  }

  let recipients: string[] = [];
  let html: string;

  if (tier === "premium") {
    recipients = await getPremiumEmails();
    html = premiumTemplate(subject, body);
  } else {
    recipients = await getFreeEmails();
    html = freeTemplate(subject, body);
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: "No recipients found", tier }, { status: 400 });
  }

  // Send in batches of 50 (Resend batch limit)
  const BATCH = 50;
  let sent = 0;
  const errors: string[] = [];

  for (let i = 0; i < recipients.length; i += BATCH) {
    const batch = recipients.slice(i, i + BATCH);
    try {
      await resend.batch.send(
        batch.map((to) => ({
          from: FROM,
          to,
          subject,
          html,
        }))
      );
      sent += batch.length;
    } catch (err) {
      errors.push(`Batch ${i}-${i + BATCH}: ${err}`);
    }
  }

  return NextResponse.json({ success: true, sent, total: recipients.length, errors });
}
