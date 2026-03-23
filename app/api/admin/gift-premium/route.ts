import { NextRequest, NextResponse } from "next/server";

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

function auth(req: NextRequest) {
  return !ADMIN_SECRET || req.headers.get("x-admin-secret") === ADMIN_SECRET;
}

// GET — list gifted members
export async function GET(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const res = await fetch(`${SB_URL}/rest/v1/gifted_members?select=*&order=created_at.desc`,
    { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } });
  const data = await res.json();
  return NextResponse.json({ gifted: Array.isArray(data) ? data : [] });
}

// POST — add gifted member
export async function POST(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email, name, note } = await req.json();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
  const res = await fetch(`${SB_URL}/rest/v1/gifted_members`, {
    method: "POST",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ email: email.toLowerCase().trim(), name: name || "", note: note || "", gifted_by: "admin" }),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data.message || "Failed" }, { status: 400 });
  return NextResponse.json({ success: true, member: Array.isArray(data) ? data[0] : data });
}

// DELETE — revoke gifted access
export async function DELETE(req: NextRequest) {
  if (!auth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { email } = await req.json();
  await fetch(`${SB_URL}/rest/v1/gifted_members?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ is_active: false }),
  });
  return NextResponse.json({ success: true });
}
