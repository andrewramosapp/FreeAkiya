import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

export type DbListing = {
  id: string;
  slug: string;
  source: string;
  source_url: string;
  name_en: string;
  notes_en: string | null;
  city_en: string | null;
  prefecture_en: string | null;
  region: string | null;
  price_usd: number | null;
  price_jpy: number | null;
  price_text: string | null;
  beds: number | null;
  size_sqft: number | null;
  size_sqm: number | null;
  year_built: number | null;
  parking_spots: number | null;
  images: string[];
  contact_email: string | null;
  contact_phone: string | null;
  agency_name: string | null;
  tags: string[];
  is_premium: boolean;
  is_active: boolean;
  manually_added: boolean;
  // Enriched fields
  condition: string | null;
  condition_score: number | null;
  station_name: string | null;
  station_walk_min: number | null;
  station_distance_km: number | null;
  subsidy_available: boolean | null;
  subsidy_amount_jpy: number | null;
  subsidy_notes: string | null;
  subsidy_url: string | null;
  flood_risk: string | null;
  earthquake_risk: string | null;
  disaster_risk_score: number | null;
  internet_type: string | null;
  internet_speed_mbps: number | null;
  convenience_store_km: number | null;
  hospital_km: number | null;
  lat: number | null;
  lng: number | null;
};

// Convert DB listing to the Listing type used by the app
export function dbToListing(db: DbListing & { id?: string }) {
  const price = db.price_usd ?? 0;
  return {
    id: db.id,
    slug: db.slug,
    price: db.price_text ?? `$${price.toLocaleString()}`,
    priceNum: price,
    priceJPY: db.price_jpy ? `¥${db.price_jpy.toLocaleString()}` : "",
    name: db.name_en,
    city: db.city_en ?? "",
    prefecture: db.prefecture_en ?? "Japan",
    region: db.region ?? "Japan",
    beds: db.beds ?? 0,
    size: db.size_sqft ? `${db.size_sqft.toLocaleString()} sq ft` : "NA",
    built: db.year_built?.toString() ?? "Unknown",
    parking: db.parking_spots ? `${db.parking_spots} spot${db.parking_spots !== 1 ? "s" : ""}` : "None",
    notes: db.notes_en ?? "",
    isPremium: db.is_premium,
    contact: db.contact_email ?? "",
    tags: db.tags ?? [],
    images: db.images?.length > 0 ? db.images : [
      "https://cdn.prod.website-files.com/6789dd1a798234106f5e335b/67b79a9861e5eb11ee3fe0ac_OLD%20HOUSES%20JAPAN%20(4).png"
    ],
    // Enriched data
    condition: db.condition,
    conditionScore: db.condition_score,
    stationName: db.station_name,
    stationWalkMin: db.station_walk_min,
    subsidyAvailable: db.subsidy_available ?? false,
    subsidyAmountJPY: db.subsidy_amount_jpy,
    subsidyNotes: db.subsidy_notes,
    subsidyUrl: db.subsidy_url,
    floodRisk: db.flood_risk,
    earthquakeRisk: db.earthquake_risk,
    disasterScore: db.disaster_risk_score,
    internetType: db.internet_type,
    internetSpeedMbps: db.internet_speed_mbps,
    convenienceStoreKm: db.convenience_store_km,
    hospitalKm: db.hospital_km,
    lat: db.lat,
    lng: db.lng,
  };
}

export async function getListings() {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("is_active", true)
    .order("price_usd", { ascending: true });

  if (error) {
    console.error("Supabase error:", error);
    return [];
  }
  return (data as DbListing[]).map(dbToListing);
}

export async function getListing(slug: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("id, *")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return dbToListing(data as DbListing);
}
