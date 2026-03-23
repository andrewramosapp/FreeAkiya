import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

export async function GET(req: NextRequest) {
  if (!ADMIN_SECRET || req.headers.get("x-admin-secret") !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = supabase
    .from("referrals")
    .select("created_at, name, email, phone, budget, timeline, message, listing_name, listing_price, listing_slug, listing_url, status, notes, referral_fee, agent_name")
    .order("created_at", { ascending: false });

  if (from) query = query.gte("created_at", from + "T00:00:00Z");
  if (to)   query = query.lte("created_at", to + "T23:59:59Z");

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const esc = (v: unknown) => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };

  const cols = ["submitted_at","name","email","phone","budget","timeline","listing_name","listing_price","listing_slug","status","referral_fee","agent_name","notes","message"];
  const rows = [cols.join(",")];

  for (const r of (data || [])) {
    rows.push([
      esc(r.created_at), esc(r.name), esc(r.email), esc(r.phone),
      esc(r.budget), esc(r.timeline), esc(r.listing_name), esc(r.listing_price),
      esc(r.listing_slug), esc(r.status), esc(r.referral_fee), esc(r.agent_name),
      esc(r.notes), esc(r.message),
    ].join(","));
  }

  const label = from || to ? `referrals_${from||"start"}_to_${to||"now"}` : "referrals_all";
  return new NextResponse(rows.join("\n"), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${label}.csv"`,
    },
  });
}
