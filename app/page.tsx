import Link from "next/link";
import SubscribeForm from "@/app/components/SubscribeForm";
import Image from "next/image";
import { getListings } from "@/lib/db";
export const dynamic = "force-dynamic";

export default async function Home() {
  const allListings = await getListings();
  const featured = allListings.filter(l => !l.isPremium).slice(0, 6);
  const total = allListings.length;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <span className="font-black text-xl tracking-tight text-white">CheapAkiya</span>
        <div className="flex items-center gap-4">
          <Link href="/listings" className="hidden sm:block text-gray-400 hover:text-white text-sm transition">Listings</Link>
          <Link href="/members" className="hidden sm:block text-gray-400 hover:text-white text-sm transition">Members</Link>
          <a href="#signup" className="bg-[#e85d2f] hover:bg-[#d44f23] text-white text-sm font-semibold px-4 py-2 rounded-full transition">
            Get Free Listings
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-10 pb-16 text-center">
        <div className="inline-block bg-[#e85d2f]/10 text-[#e85d2f] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          🇯🇵 Japan's vacant homes, curated in English
        </div>
        <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
          Own a home in Japan<br />
          <span className="text-[#e85d2f]">for under $10,000.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Japan has over 9 million vacant homes called <em>akiya</em>. Many sell for a few thousand dollars — sometimes less. We find the best ones and deliver them straight to your inbox.
        </p>
        <div id="signup" className="max-w-md mx-auto">
          <SubscribeForm placeholder="Enter your email" buttonText="Get Free Listings →" />
          <p className="text-gray-600 text-sm mt-3">Free weekly listings. No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-t border-white/10 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div><div className="text-3xl font-black text-[#e85d2f]">9M+</div><div className="text-gray-400 text-sm mt-1">Vacant homes in Japan</div></div>
          <div><div className="text-3xl font-black text-[#e85d2f]">$7</div><div className="text-gray-400 text-sm mt-1">Lowest listing this week</div></div>
          <div><div className="text-3xl font-black text-[#e85d2f]">{total}</div><div className="text-gray-400 text-sm mt-1">Active listings under $10k</div></div>
        </div>
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Sample listings</h2>
            <p className="text-gray-400 mt-1">Real homes. Real prices. Subscribe for the full list.</p>
          </div>
          <Link href="/listings" className="text-[#e85d2f] hover:underline text-sm">
            View all {total} listings →
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {featured.map((l) => (
            <Link key={l.slug} href={`/listings/${l.slug}`}
              className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover:border-[#e85d2f]/50 transition group block">
              <div className="relative h-44 w-full">
                <Image src={l.images[0]} alt={l.name} fill className="object-cover group-hover:scale-105 transition duration-500" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-3 text-2xl font-black text-white">{l.price}</div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">🇯🇵 {l.prefecture}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2 group-hover:text-[#e85d2f] transition leading-snug">{l.name}</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>{l.beds} bed · {l.size} · Built {l.built}</div>
                  <div className="text-gray-600 leading-relaxed line-clamp-2">{l.notes}</div>
                </div>
                <div className="mt-3 text-xs text-[#e85d2f] opacity-0 group-hover:opacity-100 transition">View details →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Locked premium teaser */}
        <div className="mt-6 bg-white/3 border border-white/10 rounded-2xl p-6 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-gray-400 text-sm mb-4">{total - featured.length} more listings available — including contact info, move-in ready filter, and new listings before they go public.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/listings" className="text-[#e85d2f] hover:underline text-sm">Browse all free listings →</Link>
            <span className="text-gray-600">·</span>
            <Link href="/members" className="text-[#e85d2f] hover:underline text-sm">Unlock premium access →</Link>
          </div>
        </div>
      </section>

      {/* UNIQUE FEATURES SECTION */}
      <section className="border-t border-white/10 max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black mb-3">More than just listings</h2>
          <p className="text-gray-400 max-w-xl mx-auto">Every listing comes with data you won't find anywhere else in English — so you can make a real decision, not a guess.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: "🏛️",
              title: "Government Subsidy Finder",
              desc: "Many Japanese prefectures pay you to move there — up to ¥3M. We flag every listing that qualifies and tell you exactly how much.",
              badge: "Up to $20,000 free money",
              color: "green",
            },
            {
              icon: "🚉",
              title: "Station Distance",
              desc: "Every listing shows the nearest train station and exact walking time. No more guessing if you can get around without a car.",
              badge: "Real walking times",
              color: "blue",
            },
            {
              icon: "⭐",
              title: "Safety Risk Score",
              desc: "Japan has flood zones, landslide areas, and seismic hot spots. We score every property 1-5 so you know what you're buying into.",
              badge: "Flood + earthquake risk",
              color: "amber",
            },
            {
              icon: "📡",
              title: "Internet Connectivity",
              desc: "Working remotely from rural Japan? We show fiber vs DSL vs no coverage for every listing — critical if you need reliable internet.",
              badge: "Essential for remote workers",
              color: "purple",
            },
            {
              icon: "🔧",
              title: "Condition Rating",
              desc: "Move-in ready, needs renovation, or tear-down? We tag every listing so you can filter to exactly what you're looking for.",
              badge: "Filter by condition",
              color: "orange",
            },
            {
              icon: "🏪",
              title: "Nearest Amenities",
              desc: "Distance to the nearest convenience store and hospital. Rural Japan can be very rural — know what you're committing to.",
              badge: "Real proximity data",
              color: "teal",
            },
          ].map((f) => (
            <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">{f.desc}</p>
              <span className="bg-[#e85d2f]/10 text-[#e85d2f] text-xs px-3 py-1 rounded-full">{f.badge}</span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-white/10 max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: "01", title: "We find them", desc: "We scan Japanese akiya banks and listing sites daily across 20+ prefectures so you don't have to navigate them in Japanese." },
            { step: "02", title: "We enrich them", desc: "Every listing gets translated, scored for risk, checked for subsidies, and enriched with station distance and amenity data." },
            { step: "03", title: "We send them to you", desc: "Free subscribers get weekly roundups. Premium members get contact info, early access, and full data on every listing." },
          ].map((item) => (
            <div key={item.step} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-[#e85d2f] font-black text-sm mb-3">{item.step}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="border-t border-white/10 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-4">Start finding your Japan home.</h2>
          <p className="text-gray-400 mb-8">Free weekly listings delivered to your inbox. No Japanese required.</p>
          <SubscribeForm placeholder="Enter your email" buttonText="Subscribe Free →" className="max-w-md mx-auto" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-gray-600 text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span>🏯</span><span>CheapAkiya.com</span></span>
            <Link href="/listings" className="hover:text-gray-400 transition">Listings</Link>
            <Link href="/members" className="hover:text-gray-400 transition">Members</Link>
          </div>
          <div>© 2026 CheapAkiya. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
