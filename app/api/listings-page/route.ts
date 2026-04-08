import { NextRequest, NextResponse } from "next/server";
import { supabase, dbToListing, DbListing } from "@/lib/db";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 48;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "0", 10);
    const sort = searchParams.get("sort") ?? "newest";

    // Count total
    const { count } = await supabase
      .from("listings")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    // Build query
    let query = supabase
      .from("listings")
      .select(
        "id,slug,source,source_url,name_en,notes_en,city_en,prefecture_en,region," +
        "price_usd,price_jpy,price_text,beds,size_sqft,size_sqm,year_built," +
        "parking_spots,images,contact_email,contact_phone,agency_name,tags," +
        "is_premium,is_active,manually_added,condition,condition_score," +
        "station_name,station_walk_min,station_distance_km," +
        "subsidy_available,subsidy_amount_jpy,subsidy_notes,subsidy_url," +
        "flood_risk,earthquake_risk,disaster_risk_score," +
        "internet_type,internet_speed_mbps,convenience_store_km,hospital_km,lat,lng,scraped_at"
      )
      .eq("is_active", true);

    // Sorting
    if (sort === "price_asc") {
      query = query.order("price_usd", { ascending: true });
    } else if (sort === "price_desc") {
      query = query.order("price_usd", { ascending: false });
    } else {
      // newest = by scraped_at desc
      query = query.order("scraped_at", { ascending: false });
    }

    query = query.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const listings = (data as (DbListing & { scraped_at?: string })[]).map(dbToListing);
    const hasMore = (page + 1) * PAGE_SIZE < (count ?? 0);

    return NextResponse.json(
      { listings, total: count ?? 0, page, hasMore },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=60",
        },
      }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Failed" }, { status: 500 });
  }
}
