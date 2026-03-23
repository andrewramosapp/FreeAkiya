import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADMIN_SECRET = process.env.ADMIN_SECRET || "cheapakiya-admin";

export async function GET(req: NextRequest) {
  // Auth
  const secret = req.headers.get("x-admin-secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const sb = createClient(SB_URL, SB_KEY);

  let query = sb
    .from("referral_leads")
    .select(`
      submitted_at,
      name,
      email,
      phone,
      message,
      source,
      property_slug,
      listings (name_en, prefecture_en, price_usd)
    `)
    .order("submitted_at", { ascending: false });

  if (from) query = query.gte("submitted_at", from + "T00:00:00Z");
  if (to)   query = query.lte("submitted_at", to + "T23:59:59Z");

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length === 0) {
    // Return empty CSV with headers
    const headers = "submitted_at,name,email,phone,property_slug,property_name,prefecture,price_usd,message,source\n";
    return new NextResponse(headers, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="leads_empty.csv"`,
      },
    });
  }

  // Build CSV
  const escape = (val: unknown): string => {
    if (val == null) return "";
    const str = String(val).replace(/"/g, '""');
    return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
  };

  const cols = ["submitted_at","name","email","phone","property_slug","property_name","prefecture","price_usd","message","source"];
  const rows = [cols.join(",")];

  for (const lead of data) {
    const listing = lead.listings as { name_en?: string; prefecture_en?: string; price_usd?: number } | null;
    rows.push([
      escape(lead.submitted_at),
      escape(lead.name),
      escape(lead.email),
      escape(lead.phone),
      escape(lead.property_slug),
      escape(listing?.name_en),
      escape(listing?.prefecture_en),
      escape(listing?.price_usd),
      escape(lead.message),
      escape(lead.source),
    ].join(","));
  }

  const csv = rows.join("\n");
  const label = from || to ? `leads_${from || "start"}_to_${to || "now"}` : "leads_all";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${label}.csv"`,
    },
  });
}
