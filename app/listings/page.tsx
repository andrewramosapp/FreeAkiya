export const dynamic = "force-dynamic";
import { getListings } from "@/lib/db";
import { getMember } from "@/lib/member";
import Link from "next/link";
import ListingsGrid from "@/app/components/ListingsGrid";

export default async function ListingsPage() {
  const sorted = await getListings();
  const member = await getMember();
  const isPremium = member?.tier === "premium";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🏯</span>
          <span className="font-bold text-lg tracking-tight">CheapAkiya</span>
        </Link>
        <div className="flex items-center gap-3">
          {member ? (
            <Link href="/members" className="text-gray-400 hover:text-white text-sm transition">
              {member.tier === "premium" ? "🔒 Premium" : "✓ Free"} · {member.email.split("@")[0]}
            </Link>
          ) : (
            <Link href="/join" className="bg-[#e85d2f] hover:bg-[#d44f23] text-white text-sm font-semibold px-4 py-2 rounded-full transition">
              Get Free Listings
            </Link>
          )}
        </div>
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

        <ListingsGrid listings={sorted} isPremium={isPremium} />
      </div>
    </main>
  );
}
