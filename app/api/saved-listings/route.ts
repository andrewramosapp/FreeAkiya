import { NextResponse } from "next/server";
import { getMember } from "@/lib/member";
import { supabase, dbToListing } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const member = await getMember();
  if (!member) return NextResponse.json({ listings: [] });

  const { data } = await supabase
    .from("saved_listings")
    .select("listing_id, saved_at, listings(*)")
    .eq("member_email", member.email)
    .order("saved_at", { ascending: false });

  const listings = (data || [])
    .filter(r => r.listings)
    .map(r => dbToListing(r.listings as any));

  return NextResponse.json({ listings });
}
