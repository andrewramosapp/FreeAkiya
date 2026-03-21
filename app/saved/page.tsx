import Nav from "@/app/components/Nav";
export const dynamic = "force-dynamic";
import { getMember } from "@/lib/member";
import { supabase, dbToListing } from "@/lib/db";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

export default async function SavedPage() {
  const member = await getMember();
  if (!member) redirect("/members");

  const { data } = await supabase
    .from("saved_listings")
    .select("listing_id, saved_at, listings(*)")
    .eq("member_email", member.email)
    .order("saved_at", { ascending: false });

  const listings = (data || [])
    .filter(r => r.listings)
    .map(r => dbToListing(r.listings as any));

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Saved Listings</h1>
            <p className="text-gray-400 text-sm">{member.email}</p>
          </div>
          <span className="bg-[#e85d2f]/10 text-[#e85d2f] text-sm px-3 py-1 rounded-full">
            {listings.length} saved
          </span>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🤍</div>
            <p className="text-gray-400 mb-6">No saved listings yet.</p>
            <Link href="/listings" className="bg-[#e85d2f] text-white font-bold px-6 py-3 rounded-full hover:bg-[#d44f23] transition">
              Browse Listings →
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {listings.map(l => (
              <Link key={l.slug} href={`/listings/${l.slug}`}
                className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#e85d2f]/50 transition group block">
                <div className="relative h-44 w-full">
                  <Image src={l.images[0]} alt={l.name} fill className="object-cover group-hover:scale-105 transition duration-500" unoptimized />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-2xl font-black text-white">{l.price}</div>
                </div>
                <div className="p-5">
                  <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300 mb-2 inline-block">🇯🇵 {l.prefecture}</span>
                  <h3 className="font-semibold text-sm mb-1 group-hover:text-[#e85d2f] transition leading-snug">{l.name}</h3>
                  <p className="text-xs text-gray-500">{l.beds} bed · {l.size} · Built {l.built}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
