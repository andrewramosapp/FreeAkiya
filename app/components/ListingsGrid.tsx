"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/lib/listings";

const PAGE_SIZE = 24;
// Extended listing type that includes enriched fields from DB
type EnrichedListing = Listing & {
  id?: string;
  condition?: string | null;
  conditionScore?: number | null;
  stationName?: string | null;
  stationWalkMin?: number | null;
  subsidyAvailable?: boolean;
  subsidyAmountJPY?: number | null;
  subsidyNotes?: string | null;
  floodRisk?: string | null;
  earthquakeRisk?: string | null;
  disasterScore?: number | null;
  internetType?: string | null;
  internetSpeedMbps?: number | null;
  convenienceStoreKm?: number | null;
  hospitalKm?: number | null;
  lat?: number | null;
  lng?: number | null;
};
import PriceRangeSlider from "./PriceRangeSlider";

const REGIONS = ["Hokkaido", "Tohoku", "Kanto", "Chubu", "Kansai", "Chugoku", "Shikoku", "Kyushu"];
const MAX_PRICE = 70000;

export default function ListingsGrid({
  listings,
  isPremium,
}: {
  listings: EnrichedListing[];
  isPremium: boolean;
}) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minBeds, setMinBeds] = useState(0);
  const [region, setRegion] = useState("All");
  const [tier, setTier] = useState<"all" | "free" | "premium">("all");
  const [condition, setCondition] = useState<"all" | "move_in_ready" | "renovation_needed">("all");
  const [subsidyOnly, setSubsidyOnly] = useState(false);
  const [safeOnly, setSafeOnly] = useState(false);
  const [fiberOnly, setFiberOnly] = useState(false);
  const [stationMax, setStationMax] = useState(0);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (l.priceNum < minPrice) return false;
      if (l.priceNum > maxPrice) return false;
      if (minBeds > 0 && l.beds < minBeds) return false;
      if (region !== "All" && l.region !== region) return false;
      if (tier === "free" && l.isPremium) return false;
      if (tier === "premium" && !l.isPremium) return false;
      if (condition !== "all" && l.condition !== condition) return false;
      if (subsidyOnly && !l.subsidyAvailable) return false;
      if (safeOnly && (l.disasterScore ?? 0) < 4) return false;
      if (fiberOnly && l.internetType !== "fiber") return false;
      if (stationMax > 0 && ( l.stationWalkMin ?? 999) > stationMax) return false;
      return true;
    });
  }, [listings, minPrice, maxPrice, minBeds, region, tier, condition, subsidyOnly, safeOnly, fiberOnly, stationMax]);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [minPrice, maxPrice, minBeds, region, tier, condition, subsidyOnly, safeOnly, fiberOnly, stationMax]);

  // Infinite scroll observer
  const loadMore = useCallback(() => {
    setVisibleCount(prev => Math.min(prev + PAGE_SIZE, filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting) loadMore(); },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const activeFilters =
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < MAX_PRICE ? 1 : 0) +
    (minBeds > 0 ? 1 : 0) +
    (region !== "All" ? 1 : 0) +
    (tier !== "all" ? 1 : 0) +
    (condition !== "all" ? 1 : 0) +
    (subsidyOnly ? 1 : 0) +
    (safeOnly ? 1 : 0) +
    (fiberOnly ? 1 : 0) +
    (stationMax > 0 ? 1 : 0);

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setMinBeds(0);
    setRegion("All");
    setTier("all");
    setCondition("all");
    setSubsidyOnly(false);
    setSafeOnly(false);
    setFiberOnly(false);
    setStationMax(0);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6">
        {/* Full-width orange filter bar */}
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`w-full flex items-center justify-between px-5 py-3 rounded-2xl font-semibold text-sm transition mb-3 ${
            filtersOpen || activeFilters > 0
              ? "bg-[#e85d2f] text-white"
              : "bg-[#e85d2f] hover:bg-[#d44f23] text-white"
          }`}
        >
          <span>⚙ Filters {activeFilters > 0 ? `(${activeFilters} active)` : ""}</span>
          <span className="text-white/70 text-xs">{filtersOpen ? "▲ Hide" : "▼ Show"}</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick region pills */}
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setRegion(region === r ? "All" : r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                region === r
                  ? "bg-[#e85d2f] text-white"
                  : "bg-white/5 border border-white/10 text-gray-400 hover:border-white/20"
              }`}
            >
              {r}
            </button>
          ))}

          {activeFilters > 0 && (
            <button onClick={resetFilters} className="text-xs text-gray-600 hover:text-gray-400 ml-auto transition">
              Reset all
            </button>
          )}
        </div>

        {/* Expanded filter panel */}
        {filtersOpen && (
          <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-6 grid sm:grid-cols-3 gap-6 items-start">
            {/* Price range — single dual-handle slider */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-3">Price Range</label>
              <PriceRangeSlider
                min={0}
                max={MAX_PRICE}
                minVal={minPrice}
                maxVal={maxPrice}
                onChange={(lo, hi) => { setMinPrice(lo); setMaxPrice(hi); }}
              />
            </div>

            {/* Bedrooms */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-3">Min Bedrooms</label>
              <div className="flex gap-2 flex-wrap">
                {[0, 2, 3, 4, 5, 6].map((b) => (
                  <button
                    key={b}
                    onClick={() => setMinBeds(b)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                      minBeds === b
                        ? "bg-[#e85d2f] text-white"
                        : "bg-white/10 text-gray-400 hover:bg-white/20"
                    }`}
                  >
                    {b === 0 ? "Any" : `${b}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Tier */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-3">Access Tier</label>
              <div className="flex gap-2 flex-wrap">
                {(["all", "free", "premium"] as const).map((t) => (
                  <button key={t} onClick={() => setTier(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition capitalize ${tier === t ? "bg-[#e85d2f] text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                    {t === "all" ? "All" : t === "free" ? "Free" : "🔒 Premium"}
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-3">Condition</label>
              <div className="flex gap-2 flex-wrap">
                {[["all","Any"],["move_in_ready","✓ Move-in ready"],["renovation_needed","🔧 Needs work"]] .map(([v,l]) => (
                  <button key={v} onClick={() => setCondition(v as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${condition === v ? "bg-[#e85d2f] text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Subsidy + Safety + Internet + Station — all in one row */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-gray-400 mb-3">Special Filters</label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSubsidyOnly(!subsidyOnly)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${subsidyOnly ? "bg-[#e85d2f] text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                  🏛️ Govt subsidy available
                </button>
                <button onClick={() => setSafeOnly(!safeOnly)}
                  title="Low natural disaster risk (flood + earthquake) — not related to crime"
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${safeOnly ? "bg-[#e85d2f] text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                  🛡️ Low disaster risk
                </button>
                <button onClick={() => setFiberOnly(!fiberOnly)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${fiberOnly ? "bg-[#e85d2f] text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                  📡 Fiber internet
                </button>
                {[0, 15, 30, 60].map(mins => (
                  <button key={mins} onClick={() => setStationMax(stationMax === mins && mins > 0 ? 0 : mins)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${stationMax === mins && mins > 0 ? "bg-[#e85d2f] text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                    🚉 {mins === 0 ? "Any station" : `≤${mins} min walk`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-gray-500 text-sm">
          Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
          {activeFilters > 0 && " (filtered)"}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <div className="text-4xl mb-3">🏯</div>
          <p>No listings match your filters.</p>
          <button onClick={resetFilters} className="mt-3 text-[#e85d2f] hover:underline text-sm">Reset filters</button>
        </div>
      ) : (
        <>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((l) => {
            const locked = l.isPremium && !isPremium;
            return locked ? (
              <Link key={l.slug} href="/upgrade"
                className="bg-white/5 rounded-2xl overflow-hidden border border-[#e85d2f]/30 hover:border-[#e85d2f] transition group block relative">
                <div className="relative h-44 w-full overflow-hidden">
                  <Image src={l.images[0]} alt={l.name} fill
                    className="object-cover blur-sm scale-110 brightness-50" unoptimized />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="bg-[#e85d2f] text-white text-xs font-bold px-3 py-1 rounded-full">
                      🔒 MEMBERS ONLY
                    </div>
                    <div className="text-white text-2xl font-black">{l.price}</div>
                  </div>
                </div>
                <div className="p-5 relative">
                  <div className="blur-sm select-none pointer-events-none">
                    <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">🇯🇵 {l.prefecture}</span>
                    <h3 className="font-semibold text-sm mt-2 mb-1 leading-snug">{l.name}</h3>
                    <div className="text-xs text-gray-500">{l.beds} bed · {l.size} · Built {l.built}</div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#e85d2f] group-hover:bg-[#d44f23] text-white font-bold text-sm px-5 py-2 rounded-full transition shadow-lg">
                      Unlock — $12/mo →
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <Link key={l.slug} href={`/listings/${l.slug}`}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#e85d2f]/50 transition group block">
                <div className="relative h-44 w-full">
                  <Image src={l.images[0]} alt={l.name} fill
                    className="object-cover group-hover:scale-105 transition duration-500" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-2xl font-black text-white">{l.price}</div>
                  {l.isPremium && (
                    <div className="absolute top-3 right-3 bg-[#e85d2f]/90 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      🔒 Premium
                    </div>
                  )}
                  {/* Enrichment badges */}
                  <div className="absolute bottom-3 right-3 flex gap-1">
                    {l.subsidyAvailable && (
                      <span title="Government subsidy available" className="bg-green-600/90 text-white text-xs px-1.5 py-0.5 rounded-full">🏛️</span>
                    )}
                    {l.condition === 'move_in_ready' && (
                      <span title="Move-in ready" className="bg-blue-600/90 text-white text-xs px-1.5 py-0.5 rounded-full">✓</span>
                    )}
                    {(l.disasterScore ?? 0) >= 4 && (
                      <span title={`Low natural disaster risk (${l.disasterScore}/5) — flood & earthquake only, not crime`} className="bg-amber-600/90 text-white text-xs px-1.5 py-0.5 rounded-full">🛡️</span>
                    )}
                    {l.internetType === 'fiber' && (
                      <span title="Fiber internet" className="bg-purple-600/90 text-white text-xs px-1.5 py-0.5 rounded-full">📡</span>
                    )}
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">🇯🇵 {l.prefecture}</span>
                    <div className="flex items-center gap-1 text-gray-600 text-xs">
                      {l.stationWalkMin && <span>🚉 {l.stationWalkMin}m</span>}
                      <span>{l.region}</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm mb-2 group-hover:text-[#e85d2f] transition leading-snug">{l.name}</h3>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>{l.beds} bed · {l.size} · Built {l.built}</div>
                    <div className="text-gray-600 leading-relaxed line-clamp-2">{l.notes}</div>
                  </div>
                  <div className="mt-3 text-xs text-[#e85d2f] opacity-0 group-hover:opacity-100 transition">View details →</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Infinite scroll loader */}
        {hasMore && (
          <div ref={loaderRef} className="flex justify-center py-10">
            <div className="flex items-center gap-3 text-gray-600 text-sm">
              <div className="w-4 h-4 border-2 border-gray-600 border-t-[#e85d2f] rounded-full animate-spin" />
              Loading more...
            </div>
          </div>
        )}

        {/* End of results */}
        {!hasMore && filtered.length > 0 && (
          <p className="text-center text-gray-700 text-sm py-8">
            All {filtered.length} listings shown
          </p>
        )}
        </>
      )}
    </div>
  );
}
