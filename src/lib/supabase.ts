import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SUPABASE_URL and SUPABASE_ANON_KEY are intentionally public (anon key has RLS applied).
const SUPABASE_URL = 'https://vgimmkgssmfgnokdnami.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnaW1ta2dzc21mZ25va2RuYW1pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwODc5MjAsImV4cCI6MjA4OTY2MzkyMH0.GrwKp_lnR_4yZQZ1K5YhMkgGQJzXdCfGZcOaUFxMUQs';

// AsyncStorage adapter is REQUIRED for PKCE OAuth on React Native.
// Without it, the code verifier is stored in memory, lost when the
// browser opens, and exchangeCodeForSession silently fails.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // React Native handles URLs manually
    flowType: 'pkce',           // Explicit PKCE — required for native apps
  },
});

export type Listing = {
  id: string;
  slug: string;
  source?: string;
  name_en: string;
  notes_en: string | null;
  city_en: string | null;
  prefecture_en: string | null;
  region: string | null;
  price_usd: number | null;
  price_jpy?: number | null;
  price_text: string | null;
  beds: number | null;
  size_sqft: number | null;
  size_sqm?: number | null;
  year_built: number | null;
  parking_spots?: number | null;
  images: string[];
  is_premium: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  contact_email: string | null;
  contact_phone: string | null;
  agency_name?: string | null;
  condition: string | null;
  condition_score?: number | null;
  station_name: string | null;
  station_walk_min: number | null;
  station_distance_km?: number | null;
  subsidy_available: boolean | null;
  subsidy_amount_jpy?: number | null;
  subsidy_notes?: string | null;
  subsidy_url?: string | null;
  flood_risk?: string | null;
  earthquake_risk?: string | null;
  disaster_risk_score: number | null;
  internet_type: string | null;
  internet_speed_mbps?: number | null;
  convenience_store_km?: number | null;
  hospital_km?: number | null;
  lat: number | null;
  lng: number | null;
  scraped_at?: string | null;
};

const SELECT = `id,slug,source,name_en,notes_en,city_en,prefecture_en,region,price_usd,price_jpy,price_text,beds,size_sqft,size_sqm,year_built,parking_spots,images,is_premium,is_active,is_featured,contact_email,contact_phone,agency_name,condition,condition_score,station_name,station_walk_min,station_distance_km,subsidy_available,subsidy_amount_jpy,subsidy_notes,subsidy_url,flood_risk,earthquake_risk,disaster_risk_score,internet_type,internet_speed_mbps,convenience_store_km,hospital_km,lat,lng,scraped_at`;

export function displayPrice(listing: Pick<Listing, 'price_text' | 'price_usd'>) {
  if (listing.price_usd === 0) return 'FREE';
  if (listing.price_text && !/[¥円万]/.test(listing.price_text)) return listing.price_text;
  return `$${(listing.price_usd || 0).toLocaleString()}`;
}

export async function getListings(p?: {
  region?: string;
  hasPhotos?: boolean;
  page?: number;
  pageSize?: number;
  premiumOnly?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest';
}) : Promise<Listing[]> {
  const page = p?.page || 0;
  const pageSize = p?.pageSize || 30;
  const from = page * pageSize;
  const to = from + pageSize - 1;

  let q = supabase
    .from('listings')
    .select(SELECT)
    .eq('is_active', true)
    .range(from, to);

  if (p?.region) q = q.eq('region', p.region);
  if (p?.hasPhotos) q = q.not('images', 'is', null);
  if (p?.premiumOnly) q = q.eq('is_premium', true);

  if (p?.sort === 'newest') q = q.order('scraped_at', { ascending: false, nullsFirst: false });
  else if (p?.sort === 'price_desc') q = q.order('price_usd', { ascending: false, nullsFirst: false });
  else q = q.order('price_usd', { ascending: true, nullsFirst: false });

  const { data } = await q;
  return (data || []) as Listing[];
}

export async function getListing(slug: string): Promise<Listing | null> {
  const { data } = await supabase
    .from('listings')
    .select(SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return (data as Listing) || null;
}
