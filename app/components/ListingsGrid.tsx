"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Listing } from "@/lib/listings";
import PriceRangeSlider from "./PriceRangeSlider";

const REGIONS = ["Hokkaido", "Tohoku", "Kanto", "Chubu", "Kansai", "Chugoku", "Shikoku", "Kyushu"];
const MAX_PRICE = 70000;

export default function ListingsGrid({
  listings,
  isPremium,
}: {
  listings: Listing[];
  isPremium: boolean;
}) {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(MAX_PRICE);
  const [minBeds, setMinBeds] = useState(0);
  const [region, setRegion] = useState("All");
  const [tier, setTier] = useState<"all" | "free" | "premium">("all");
  const [condition, setCondition] = useState<"all" | "move_in_ready" | "renovation_needed">("all");
  const [subsidyOnly, setSubsidyOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    return listings.filter((l) => {
      if (l.priceNum < minPrice) return false;
      if (l.priceNum > maxPrice) return false;
      if (minBeds > 0 && l.beds < minBeds) return false;
      if (region !== "All" && l.region !== region) return false;
      if (tier === "free" && l.isPremium) return false;
      if (tier === "premium" && !l.isPremium) return false;
      if (condition !== "all" && (l as any).condition !== condition) return false;
      if (subsidyOnly && !(l as any).subsidyAvailable) return false;
      return true;
    });
  }, [listings, maxPrice, minBeds, region, tier]);

  const activeFilters =
    (minPrice > 0 ? 1 : 0) +
    (maxPrice < MAX_PRICE ? 1 : 0) +
    (minBeds > 0 ? 1 : 0) +
    (region !== "All" ? 1 : 0) +
    (tier !== "all" ? 1 : 0) +
    (condition !== "all" ? 1 : 0) +
    (subsidyOnly ? 1 : 0);

  const resetFilters = () => {
    setMinPrice(0);
    setMaxPrice(MAX_PRICE);
    setMinBeds(0);
    setRegion("All");
    setTier("all");
    setCondition("all");
    setSubsidyOnly(false);
  };

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${
              filtersOpen || activeFilters > 0
                ? "bg-[#e85d2f]/10 border-[#e85d2f] text-[#e85d2f]"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
            }`}
          >
            <span>⚙ Filters</span>
            {activeFilters > 0 && (
              <span className="bg-[#e85d2f] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>

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
          <div className="mt-4 bg-white/5 border border-white/10 rounded-2xl p-6 grid sm:grid-cols-3 gap-6">
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

            {/* Subsidy */}
            <div>
              <label className="block text-xs font-bold text-gray-400 mb-3">Subsidies</label>
              <button onClick={() => setSubsidyOnly(!subsidyOnly)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${subsidyOnly ? "bg-[#e85d2f] text-white" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                🏛️ Subsidy available
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-gray-500 text-sm">
          {filtered.length} listing{filtered.length !== 1 ? "s" : ""}
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((l) => {
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
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">🇯🇵 {l.prefecture}</span>
                    <span className="text-gray-600 text-xs">{l.region}</span>
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
      )}
    </div>
  );
}
