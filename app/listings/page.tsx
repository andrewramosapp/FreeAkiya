import Nav from "@/app/components/Nav";
export const dynamic = "force-dynamic";
import { getListings } from "@/lib/db";
import { getMember } from "@/lib/member";
import Link from "next/link";
import ListingsGrid from "@/app/components/ListingsGrid";
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export default async function ListingsPage() {
  const sorted = await getListings();
  const member = await getMember();
  const isPremium = member?.tier === "premium";

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

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
