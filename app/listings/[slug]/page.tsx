import { listings, getListing } from "@/lib/listings";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export async function generateStaticParams() {
  return listings.map((l) => ({ slug: l.slug }));
}

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const listing = getListing(slug);
  if (!listing) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🏯</span>
          <span className="font-bold text-lg tracking-tight">CheapAkiya</span>
        </Link>
        <Link href="/listings" className="text-gray-400 hover:text-white text-sm transition">← All listings</Link>
      </nav>

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
        <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden mb-8 h-72">
          <div className="col-span-2 relative">
            <Image src={listing.images[0]} alt={listing.name} fill className="object-cover" unoptimized />
          </div>
          <div className="grid grid-rows-2 gap-2">
            {listing.images.slice(1, 3).map((img, i) => (
              <div key={i} className="relative">
                <Image src={img} alt={`${listing.name} ${i + 2}`} fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>

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

            <div className="text-sm text-gray-600 border-t border-white/10 pt-4">
              Listing curated by CheapAkiya.com
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4 sticky top-6">
              <h3 className="font-bold text-lg mb-4">Interested?</h3>
              {!listing.isPremium && listing.contact ? (
                <>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-4">
                    <div className="text-green-400 text-sm font-medium mb-1">✓ Contact info included</div>
                    <div className="text-gray-300 text-sm">{listing.contact}</div>
                  </div>
                  <Link href="/join"
                    className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold text-center py-3 rounded-full transition">
                    Get Full Access →
                  </Link>
                </>
              ) : (
                <>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-4">
                    <div className="text-amber-400 text-sm font-medium mb-1">🔒 Contact info locked</div>
                    <div className="text-gray-400 text-sm">Premium members get direct contact info, move-in ready filter, and listings 48hrs early.</div>
                  </div>
                  <Link href="/join"
                    className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold text-center py-3 rounded-full transition mb-3">
                    Unlock — Join Free or Premium
                  </Link>

                </>
              )}

              {/* Newsletter */}
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="text-sm font-bold mb-2">📩 Free weekly listings</div>
                <form action="https://www.beehiiv.com/subscribe" method="POST">
                  <input type="hidden" name="publication_id" value="pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015" />
                  <input type="email" name="email" required placeholder="your@email.com"
                    className="w-full px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-[#e85d2f] mb-3 transition" />
                  <button type="submit" className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2 rounded-full text-sm transition">
                    Subscribe Free →
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
