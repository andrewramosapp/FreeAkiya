import { NextRequest, NextResponse } from "next/server";
import { getMember } from "@/lib/member";
import { supabase } from "@/lib/db";

export async function POST(req: NextRequest) {
  const member = await getMember();
  if (!member) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { listing_id, action } = await req.json(); // action: "save" | "unsave"
  if (!listing_id) return NextResponse.json({ error: "Missing listing_id" }, { status: 400 });

  if (action === "unsave") {
    await supabase.from("saved_listings")
      .delete()
      .eq("member_email", member.email)
      .eq("listing_id", listing_id);
    return NextResponse.json({ saved: false });
  }

  const { error } = await supabase.from("saved_listings").insert({
    member_email: member.email,
    listing_id,
  });

  if (error && error.code !== "23505") { // ignore duplicate key
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ saved: true });
}

export async function GET(req: NextRequest) {
  const member = await getMember();
  if (!member) return NextResponse.json({ saved: [] });

  const { data } = await supabase
    .from("saved_listings")
    .select("listing_id")
    .eq("member_email", member.email);

  return NextResponse.json({ saved: (data || []).map(r => r.listing_id) });
}
