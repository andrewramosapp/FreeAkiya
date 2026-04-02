import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

const MAP_SELECT = "id,slug,name_en,price_usd,price_text,lat,lng,is_premium,city_en,prefecture_en,condition,subsidy_available";

export async function GET() {
  try {
    const PAGE_SIZE = 1000;
    let allRows: any[] = [];
    let from = 0;
    let keepGoing = true;

    while (keepGoing) {
      const { data, error } = await supabase
        .from("listings")
        .select(MAP_SELECT)
        .eq("is_active", true)
        .not("lat", "is", null)
        .not("lng", "is", null)
        .range(from, from + PAGE_SIZE - 1);

      if (error || !data?.length) break;
      allRows = allRows.concat(data);
      keepGoing = data.length === PAGE_SIZE;
      from += PAGE_SIZE;
    }

    const pins = allRows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      name: r.name_en || "",
      price: r.price_text
        ? r.price_text
        : r.price_usd === 0
        ? "FREE"
        : r.price_usd
        ? `$${Number(r.price_usd).toLocaleString()}`
        : "—",
      priceNum: r.price_usd ?? 0,
      lat: r.lat,
      lng: r.lng,
      // Send only the first image
      images: Array.isArray(r.images) && r.images.length > 0 ? [r.images[0]] : [],
      isPremium: !!r.is_premium,
      city: r.city_en || "",
      prefecture: r.prefecture_en || "",
      condition: r.condition || null,
      subsidyAvailable: !!r.subsidy_available,
    }));

    return NextResponse.json(pins, {
      headers: {
        "Cache-Control": "s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("map-pins-lite error:", err);
    return NextResponse.json({ error: "Failed to load map pins" }, { status: 500 });
  }
}
