import { MetadataRoute } from "next";
import { supabase } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://cheapakiya.com";

  // Static pages
  const static_pages: MetadataRoute.Sitemap = [
    { url: base, priority: 1.0, changeFrequency: "daily" },
    { url: `${base}/listings`, priority: 0.9, changeFrequency: "daily" },
    { url: `${base}/join`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/members`, priority: 0.5, changeFrequency: "monthly" },
    { url: `${base}/subsidies`, priority: 0.8, changeFrequency: "monthly" },
    { url: `${base}/subsidies/shimane`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/subsidies/tottori`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/subsidies/wakayama`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/subsidies/nagasaki`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/subsidies/hokkaido`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/subsidies/nagano`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/subsidies/fukushima`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/subsidies/kochi`, priority: 0.7, changeFrequency: "monthly" },
    { url: `${base}/disclaimer`, priority: 0.3, changeFrequency: "yearly" },
  ];

  // All active listings
  const { data: listings } = await supabase
    .from("listings")
    .select("slug, scraped_at")
    .eq("is_active", true);

  const listing_pages: MetadataRoute.Sitemap = (listings || []).map(l => ({
    url: `${base}/listings/${l.slug}`,
    lastModified: l.scraped_at ? new Date(l.scraped_at) : new Date(),
    priority: 0.7,
    changeFrequency: "weekly" as const,
  }));

  return [...static_pages, ...listing_pages];
}
