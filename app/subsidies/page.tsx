import Nav from "@/app/components/Nav";
import Link from "next/link";

const PREFECTURES_WITH_PAGES = [
  { slug: "shimane", name: "Shimane", amount: "¥1,500,000", highlight: "Highest vacancy rate in Japan" },
  { slug: "tottori", name: "Tottori", amount: "¥1,300,000", highlight: "English support available" },
  { slug: "wakayama", name: "Wakayama", amount: "¥2,000,000", highlight: "Near Osaka — best of both worlds" },
  { slug: "kochi", name: "Kochi", amount: "¥3,000,000", highlight: "Japan's most generous grant" },
  { slug: "nagasaki", name: "Nagasaki", amount: "¥500,000+", highlight: "Island migration bonuses" },
  { slug: "hokkaido", name: "Hokkaido", amount: "¥1,000,000", highlight: "Individual towns offer more" },
  { slug: "nagano", name: "Nagano", amount: "¥500,000", highlight: "Great fiber internet + mountains" },
  { slug: "fukushima", name: "Fukushima", amount: "¥2,000,000", highlight: "Recovery grants available" },
];

export default function SubsidiesIndexPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-2 inline-block mb-6">
          <span className="text-green-400 text-sm font-bold">🏛️ Government Subsidy Guide</span>
        </div>

        <h1 className="text-4xl font-black mb-4">Japan pays you to move there</h1>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl leading-relaxed">
          Japan's rural depopulation crisis means many prefectures actively pay people to relocate. 
          Subsidies range from ¥500,000 to ¥3,000,000+ — on top of already cheap property prices.
          Foreign nationals are eligible for most programs.
        </p>

        {/* Key facts */}
        <div className="grid sm:grid-cols-3 gap-4 mb-12">
          {[
            { stat: "¥3M+", label: "Maximum available grant" },
            { stat: "47", label: "Prefectures with programs" },
            { stat: "0", label: "Restrictions on foreign buyers" },
          ].map(item => (
            <div key={item.stat} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center">
              <div className="text-3xl font-black text-[#e85d2f] mb-1">{item.stat}</div>
              <div className="text-gray-400 text-sm">{item.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-black mb-6">Prefectures with detailed guides</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {PREFECTURES_WITH_PAGES.map(p => (
            <Link key={p.slug} href={`/subsidies/${p.slug}`}
              className="bg-white/5 border border-white/10 hover:border-[#e85d2f]/50 rounded-2xl p-5 transition group">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-lg group-hover:text-[#e85d2f] transition">{p.name}</h3>
                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">{p.amount}</span>
              </div>
              <p className="text-gray-500 text-sm">{p.highlight}</p>
              <p className="text-[#e85d2f] text-xs mt-3 opacity-0 group-hover:opacity-100 transition">View grant details →</p>
            </Link>
          ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h3 className="font-bold mb-3">How to apply</h3>
          <ol className="space-y-3 text-gray-400 text-sm">
            <li className="flex gap-3"><span className="text-[#e85d2f] font-bold">1.</span>Find a property you like on CheapAkiya</li>
            <li className="flex gap-3"><span className="text-[#e85d2f] font-bold">2.</span>Contact the prefecture's migration support office (links on each page)</li>
            <li className="flex gap-3"><span className="text-[#e85d2f] font-bold">3.</span>Register your intention to migrate before purchasing</li>
            <li className="flex gap-3"><span className="text-[#e85d2f] font-bold">4.</span>Purchase the property and establish residency</li>
            <li className="flex gap-3"><span className="text-[#e85d2f] font-bold">5.</span>Apply for the grant — most are paid within 1 year of residency</li>
          </ol>
          <p className="text-gray-600 text-xs mt-4">Note: Programs change. Always verify current amounts directly with the prefecture before purchasing.</p>
        </div>
      </div>
    </main>
  );
}
