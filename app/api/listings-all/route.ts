import { NextResponse } from "next/server";
import { getListings } from "@/lib/db";

// Cache for 5 minutes — same strategy as map-pins
export const revalidate = 300;

export async function GET() {
  try {
    const listings = await getListings();
    return NextResponse.json(
      { listings, total: listings.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
