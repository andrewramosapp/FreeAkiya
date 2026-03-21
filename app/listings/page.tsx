import { listings } from "@/lib/listings";
export const dynamic = "force-dynamic";
import { getMember } from "@/lib/member";
import Link from "next/link";
import Image from "next/image";

export default async function ListingsPage() {
  const sorted = [...listings].sort((a, b) => a.priceNum - b.priceNum);
  const member = await getMember();
  const isPremium = member?.tier === "premium";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🏯</span>
          <span className="font-bold text-lg tracking-tight">CheapAkiya</span>
        </Link>
        <Link href="/#signup" className="bg-[#e85d2f] hover:bg-[#d44f23] text-white text-sm font-semibold px-4 py-2 rounded-full transition">
          Get Free Listings
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">All Listings</h1>
            <p className="text-gray-400">Sorted cheapest first. Updated weekly.</p>
          </div>
          <span className="bg-[#e85d2f]/10 text-[#e85d2f] text-sm font-medium px-3 py-1 rounded-full">
            {sorted.length} listings
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {sorted.map((l) => {
            const locked = l.isPremium && !isPremium;

            return locked ? (
              // Blurred premium card — clicking goes to /join
              <Link key={l.slug} href={isPremium ? `/listings/${l.slug}` : "/join"}
                className="bg-white/5 rounded-2xl overflow-hidden border border-[#e85d2f]/30 hover:border-[#e85d2f] transition group block relative">
                {/* Blurred image */}
                <div className="relative h-44 w-full overflow-hidden">
                  <Image src={l.images[0]} alt={l.name} fill
                    className="object-cover blur-sm scale-110 brightness-50" unoptimized />
                  {/* Members only badge overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <div className="bg-[#e85d2f] text-white text-xs font-bold px-3 py-1 rounded-full">
                      🔒 MEMBERS ONLY
                    </div>
                    <div className="text-white text-2xl font-black">{l.price}</div>
                  </div>
                </div>
                <div className="p-5 relative">
                  {/* Blurred content */}
                  <div className="blur-sm select-none pointer-events-none">
                    <div className="flex items-start justify-between mb-2">
                      <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">🇯🇵 {l.prefecture}</span>
                    </div>
                    <h3 className="font-semibold text-sm mb-2 leading-snug">{l.name}</h3>
                    <div className="text-xs text-gray-500">
                      <div>{l.beds} bed · {l.size} · Built {l.built}</div>
                    </div>
                  </div>
                  {/* Unlock CTA */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#e85d2f] group-hover:bg-[#d44f23] text-white font-bold text-sm px-5 py-2 rounded-full transition shadow-lg">
                      Unlock — $12/mo →
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              // Normal card
              <Link key={l.slug} href={`/listings/${l.slug}`}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#e85d2f]/50 transition group block">
                <div className="relative h-44 w-full">
                  <Image src={l.images[0]} alt={l.name} fill
                    className="object-cover group-hover:scale-105 transition duration-500" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-2xl font-black text-white">{l.price}</div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">🇯🇵 {l.prefecture}</span>
                    <div className="flex items-center gap-2">
                      {l.isPremium && (
                        <span className="bg-white/10 text-xs px-2 py-0.5 rounded-full text-gray-400">🔒 Premium</span>
                      )}
                      <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">🇯🇵 {l.prefecture}</span>
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
      </div>
    </main>
  );
}
