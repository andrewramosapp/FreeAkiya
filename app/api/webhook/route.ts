import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");
const BEEHIIV_API_KEY = process.env.BEEHIIV_API_KEY ?? "";
const BEEHIIV_PUB_ID = "pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015";

async function upgradeBeehiivSubscriber(email: string) {
  // First subscribe (or reactivate) as premium tier
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
        send_welcome_email: false,
        tier: "premium",
      }),
    }
  );
  const data = await res.json();
  console.log("Beehiiv upgrade:", email, res.status, data?.data?.id ?? data?.errors);
  return res.ok;
}

async function downgradeBeehiivSubscriber(email: string) {
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
        send_welcome_email: false,
        tier: "free",
      }),
    }
  );
  console.log("Beehiiv downgrade:", email, res.status);
  return res.ok;
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.customer_email ?? session.customer_details?.email;
    if (email) {
      console.log("New premium member:", email);
      await upgradeBeehiivSubscriber(email);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    // Get email from customer
    try {
      const customer = await stripe.customers.retrieve(sub.customer as string) as Stripe.Customer;
      const email = customer.email;
      if (email) {
        console.log("Subscription cancelled:", email);
        await downgradeBeehiivSubscriber(email);
      }
    } catch (err) {
      console.error("Failed to get customer for downgrade:", err);
    }
  }

  return NextResponse.json({ received: true });
}
