import { listings } from "@/lib/listings";
import Link from "next/link";

export default function ListingsPage() {
  const sorted = [...listings].sort((a, b) => a.priceNum - b.priceNum);

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
          {sorted.map((l) => (
            <Link key={l.slug} href={`/listings/${l.slug}`}
              className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-[#e85d2f]/50 transition group block">
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl font-black text-[#e85d2f]">{l.price}</div>
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
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
