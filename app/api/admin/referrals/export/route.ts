import { NextRequest, NextResponse } from "next/server";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

export async function GET(req: NextRequest) {
  if (!ADMIN_SECRET || req.headers.get("x-admin-secret") !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let url = `${SB_URL}/rest/v1/referrals?select=created_at,name,email,phone,budget,timeline,message,listing_name,listing_price,listing_slug,status,notes&order=created_at.desc&limit=5000`;
  if (from) url += `&created_at=gte.${from}T00:00:00Z`;
  if (to)   url += `&created_at=lte.${to}T23:59:59Z`;

  const res = await fetch(url, {
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  const data: Record<string, unknown>[] = await res.json();

  const esc = (v: unknown): string => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[,"\n]/.test(s) ? `"${s}"` : s;
  };

  const cols = ["submitted_at","name","email","phone","budget","timeline","listing_name","listing_price","listing_slug","status","notes","message"];
  const rows = [cols.join(",")];

  for (const r of data) {
    rows.push([
      esc(r.created_at), esc(r.name), esc(r.email), esc(r.phone),
      esc(r.budget), esc(r.timeline), esc(r.listing_name), esc(r.listing_price),
      esc(r.listing_slug), esc(r.status), esc(r.notes), esc(r.message),
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
