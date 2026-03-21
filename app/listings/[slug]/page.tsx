import { listings, getListing } from "@/lib/listings";
export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ImageGallery from "./ImageGallery";
import MapEmbed from "./MapEmbed";
import SubscribeForm from "@/app/components/SubscribeForm";
import { getMember } from "@/lib/member";

export async function generateStaticParams() {
  return listings.map((l) => ({ slug: l.slug }));
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListing(slug);
  if (!listing) notFound();
  const member = await getMember();
  const isPremium = member?.tier === "premium";
  const isSubscribed = !!member; // free or premium

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🏯</span>
          <span className="font-bold text-lg tracking-tight">CheapAkiya</span>
        </Link>
        <Link href="/listings" className="text-gray-400 hover:text-white text-sm transition">← All listings</Link>
      </nav>

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
                  <a href="/join" className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold py-4 rounded-full transition text-lg">
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
            <h1 className="text-3xl font-black leading-tight mb-2">{listing.name}</h1>
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

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {listing.tags.map((tag) => (
                <span key={tag} className="bg-white/5 border border-white/10 text-gray-400 text-xs px-3 py-1 rounded-full">#{tag}</span>
              ))}
            </div>

            {/* Map */}
            <MapEmbed city={listing.city} prefecture={listing.prefecture} />

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
