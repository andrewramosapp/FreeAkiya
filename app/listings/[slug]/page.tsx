import Nav from "@/app/components/Nav";
import { getListing, getListings } from "@/lib/db";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) return {};
  const title = `${listing.name} — ${listing.price} in ${listing.prefecture}, Japan`;
  const desc = `${listing.beds} bed · ${listing.size} · Built ${listing.built}. ${listing.notes?.slice(0, 200)}`;
  const img = listing.images?.[0];
  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      images: img ? [{ url: img, width: 800, height: 600 }] : [],
      url: `https://cheapakiya.com/listings/${slug}`,
      type: "article",
    },
    twitter: { card: "summary_large_image", title, description: desc, images: img ? [img] : [] },
  };
}
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ImageGallery from "./ImageGallery";
import MapEmbed from "./MapEmbed";
import SubscribeForm from "@/app/components/SubscribeForm";
import HeartButton from "@/app/components/HeartButton";
import { getMember } from "@/lib/member";
import { supabase } from "@/lib/db";

export async function generateStaticParams() {
  const listings = await getListings();
  return listings.map((l) => ({ slug: l.slug }));
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = await getListing(slug);
  if (!listing) notFound();
  const member = await getMember();
  const isPremium = member?.tier === "premium";
  const isSubscribed = !!member;

  // Check if member has saved this listing
  let isSaved = false;
  if (member && listing.id) {
    const { data } = await supabase
      .from("saved_listings")
      .select("id")
      .eq("member_email", member.email)
      .eq("listing_id", listing.id)
      .single();
    isSaved = !!data;
  } // free or premium

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      {/* Gate overlay — show for non-subscribers OR free members on premium listings */}
      {(!isSubscribed || (member?.tier === "free" && listing.isPremium)) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center px-6 bg-[#0a0a0a]/90 backdrop-blur-lg">
          <div className="w-full max-w-md text-center">
            <div className="text-5xl mb-4">🏯</div>
            {!isSubscribed ? (
              <>
                <h2 className="text-3xl font-black mb-3">Join free to view listings</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  Subscribe to our free weekly newsletter to unlock all listing details — real homes, real prices, all in English.
                </p>
                <div className="space-y-3">
                  <a href="/join" className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold py-4 rounded-full transition text-lg">
                    Subscribe Free →
                  </a>
                  <a href="/join" className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition">
                    Get Premium — $12/mo
                  </a>
                </div>
                <p className="text-gray-600 text-sm mt-6">Already subscribed? <a href="/members" className="text-[#e85d2f] hover:underline">Sign in →</a></p>
              </>
            ) : (
              <>
                <div className="bg-[#e85d2f]/10 border border-[#e85d2f]/30 rounded-2xl px-4 py-2 inline-block mb-4">
                  <span className="text-[#e85d2f] text-sm font-bold">🔒 Members Only Listing</span>
                </div>
                <h2 className="text-3xl font-black mb-3">Upgrade to Premium</h2>
                <p className="text-gray-400 mb-8 leading-relaxed">
                  This listing is for premium members only. Upgrade to get access to exclusive listings, direct contact info, and early access.
                </p>
                <div className="space-y-3">
                  <a href="/upgrade" className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold py-4 rounded-full transition text-lg">
                    Upgrade to Premium — $12/mo →
                  </a>
                  <a href="/listings" className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition">
                    ← Back to Listings
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* BREADCRUMB */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-white transition">Listings</Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-xs">{listing.name}</span>
        </div>

        {/* IMAGE GALLERY */}
        <ImageGallery images={listing.images} name={listing.name} />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* MAIN */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl font-black leading-tight">{listing.name}</h1>
              {isSubscribed && listing.id && (
                <HeartButton
                  listingId={listing.id}
                  initialSaved={isSaved}
                  requiresLogin={false}
                />
              )}
              {!isSubscribed && (
                <HeartButton listingId={listing.id || ""} requiresLogin={true} />
              )}
            </div>
            <p className="text-gray-400 mb-6">🇯🇵 {listing.city}, {listing.prefecture} — {listing.region} region</p>

            {/* Price */}
            <div className="bg-[#e85d2f]/10 border border-[#e85d2f]/30 rounded-2xl p-6 mb-6">
              <div className="text-5xl font-black text-[#e85d2f] mb-1">{listing.price}</div>
              <div className="text-gray-400">{listing.priceJPY} · CheapAkiya.com</div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Bedrooms", value: `${listing.beds} bed` },
                { label: "Size", value: listing.size },
                { label: "Year Built", value: listing.built },
                { label: "Parking", value: listing.parking },
              ].map((d) => (
                <div key={d.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="text-gray-500 text-xs mb-1">{d.label}</div>
                  <div className="font-semibold text-sm">{d.value}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">About this property</h2>
              <p className="text-gray-300 leading-relaxed">{listing.notes}</p>
            </div>

            {/* Enriched data cards — with hover tooltips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {listing.condition && listing.condition !== "unknown" && (
                <div className="group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 cursor-help transition">
                  <div className="text-gray-500 text-xs mb-1">Condition</div>
                  <div className={`font-semibold text-sm ${listing.condition === "move_in_ready" ? "text-green-400" : listing.condition === "tear_down" ? "text-red-400" : "text-amber-400"}`}>
                    {listing.condition === "move_in_ready" ? "✓ Move-in ready" : listing.condition === "tear_down" ? "⚠ Tear down" : "🔧 Needs renovation"}
                  </div>
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 border border-white/10 rounded-xl p-3 text-xs text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl">
                    {listing.condition === "move_in_ready" ? "This property is habitable without major work. May still benefit from cosmetic updates." : listing.condition === "tear_down" ? "Structural issues make this a land-value purchase. Plan for full demolition and rebuild." : "This property needs significant renovation before it's livable. Factor in ¥2M–10M+ renovation costs."}
                  </div>
                </div>
              )}
              {listing.stationName && (
                <div className="group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 cursor-help transition">
                  <div className="text-gray-500 text-xs mb-1">Nearest Station</div>
                  <div className="font-semibold text-sm">{listing.stationName}</div>
                  {listing.stationWalkMin && <div className="text-gray-500 text-xs">{listing.stationWalkMin} min walk</div>}
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 border border-white/10 rounded-xl p-3 text-xs text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl">
                    Walking distance to nearest train station. In rural Japan, a car is often still necessary even with train access. {(listing.stationWalkMin || 0) > 30 ? "This is a long walk — budget for a car or bicycle." : "Reasonable walking distance."}
                  </div>
                </div>
              )}
              {listing.disasterScore && (
                <div className="group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 cursor-help transition">
                  <div className="text-gray-500 text-xs mb-1">Disaster Safety Score</div>
                  <div className="font-semibold text-sm">{"⭐".repeat(listing.disasterScore)}{"☆".repeat(5 - listing.disasterScore)}</div>
                  <div className="text-gray-500 text-xs">{listing.disasterScore}/5 — {listing.disasterScore >= 4 ? "Low risk" : listing.disasterScore >= 3 ? "Moderate risk" : "Higher risk"}</div>
                  <div className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 border border-white/10 rounded-xl p-3 text-xs text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl">
                    <strong className="text-white">⭐⭐⭐⭐⭐ = safest.</strong> More stars = lower natural disaster risk. Covers flood + earthquake risk only — not crime (Japan is one of the world&apos;s safest countries). Based on elevation data and prefectural seismic zones. Always verify with the official municipal hazard map before purchasing.
                    <br /><br />Flood: {listing.floodRisk || "?"} · EQ: {listing.earthquakeRisk || "?"}
                  </div>
                </div>
              )}
              {listing.internetType && (
                <div className="group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 cursor-help transition">
                  <div className="text-gray-500 text-xs mb-1">Internet</div>
                  <div className="font-semibold text-sm capitalize">{listing.internetType}</div>
                  {listing.internetSpeedMbps && <div className="text-gray-500 text-xs">~{listing.internetSpeedMbps} Mbps typical</div>}
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 border border-white/10 rounded-xl p-3 text-xs text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl">
                    {listing.internetType === "fiber" ? "Fiber broadband is available in this area — ideal for remote work. Japan's fiber networks are fast and reliable." : "DSL or limited coverage. May be sufficient for basic use but not ideal for video calls or heavy remote work."}
                  </div>
                </div>
              )}
              {listing.convenienceStoreKm && (
                <div className="group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 cursor-help transition">
                  <div className="text-gray-500 text-xs mb-1">Nearest Conbini</div>
                  <div className="font-semibold text-sm">{listing.convenienceStoreKm} km</div>
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 border border-white/10 rounded-xl p-3 text-xs text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl">
                    Distance to the nearest convenience store (コンビニ). In Japan, conbinis are essential — ATM, food, medicine, bill payment all in one. {(listing.convenienceStoreKm || 0) > 5 ? "This is remote — a car is a must." : "Accessible distance."}
                  </div>
                </div>
              )}
              {listing.hospitalKm && (
                <div className="group relative bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 cursor-help transition">
                  <div className="text-gray-500 text-xs mb-1">Nearest Hospital</div>
                  <div className="font-semibold text-sm">{listing.hospitalKm} km</div>
                  <div className="absolute bottom-full left-0 mb-2 w-56 bg-gray-900 border border-white/10 rounded-xl p-3 text-xs text-gray-300 leading-relaxed opacity-0 group-hover:opacity-100 transition pointer-events-none z-20 shadow-xl">
                    Distance to nearest hospital. Important for families, elderly residents, or anyone with health considerations. Rural Japan medical access can vary significantly.
                  </div>
                </div>
              )}
            </div>

            {/* Subsidy banner */}
            {listing.subsidyAvailable && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5 mb-8">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🏛️</span>
                  <div className="flex-1">
                    <div className="text-green-400 font-bold mb-1">Government Subsidy Available</div>
                    <p className="text-gray-300 text-sm">{listing.subsidyNotes}</p>
                    {listing.subsidyAmountJPY && (
                      <p className="text-green-400 text-sm font-semibold mt-1">
                        Up to ¥{listing.subsidyAmountJPY.toLocaleString()} (≈${Math.round(listing.subsidyAmountJPY * 0.0067).toLocaleString()})
                      </p>
                    )}
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {(listing as any).subsidyUrl && (
                        <a href={(listing as any).subsidyUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 text-xs px-3 py-1.5 rounded-full transition">
                          🏛️ {listing.prefecture} subsidy guide →
                        </a>
                      )}
                      <a href="https://www.realestatejapan.com/japan-real-estate-guide/akiya-guide/" target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-white/5 hover:bg-white/10 text-gray-400 text-xs px-3 py-1.5 rounded-full transition">
                        📖 Akiya buyer's guide (English) →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {listing.tags.map((tag) => (
                <span key={tag} className="bg-white/5 border border-white/10 text-gray-400 text-xs px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>

            {/* Map */}
            <MapEmbed city={listing.city} prefecture={listing.prefecture} lat={listing.lat} lng={listing.lng} />

            <div className="text-sm text-gray-600 border-t border-white/10 pt-4">
              Listing curated by CheapAkiya.com
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Interested?</h3>
              {isPremium || !listing.isPremium ? (
                <>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                    <div className="text-green-400 text-sm font-medium mb-1">✓ Contact info</div>
                    <div className="text-gray-300 text-sm break-all">{listing.contact}</div>
                  </div>
                  {member && (
                    <p className="text-xs text-gray-600 text-center mb-3">
                      Signed in as {member.email}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                    <div className="text-amber-400 text-sm font-medium mb-1">🔒 Contact info locked</div>
                    <div className="text-gray-400 text-sm">Premium members get direct contact info, move-in ready filter, and listings 48hrs early.</div>
                  </div>
                  <Link href="/members"
                    className="block w-full bg-white/10 hover:bg-white/20 text-white font-bold text-center py-3 rounded-full transition mb-3">
                    Sign In →
                  </Link>
                  <Link href="/join"
                    className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold text-center py-3 rounded-full transition">
                    Unlock — $12/mo →
                  </Link>
                </>
              )}

              {/* Newsletter */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm font-bold mb-2">📩 Free weekly listings</div>
                <SubscribeForm
                  placeholder="your@email.com"
                  buttonText="Subscribe Free →"
                  layout="column"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
