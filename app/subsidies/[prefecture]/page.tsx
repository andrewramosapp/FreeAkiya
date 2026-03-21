import Nav from "@/app/components/Nav";
import Link from "next/link";
import { notFound } from "next/navigation";

// Curated subsidy data per prefecture
// Sources: prefectural government sites, iju-join.jp, soumu.go.jp
const SUBSIDY_DATA: Record<string, {
  name: string;
  programs: { title: string; amount: string; description: string; eligibility: string; }[];
  notes: string;
  national: string;
}> = {
  "shimane": {
    name: "Shimane",
    programs: [
      {
        title: "Migration Support Grant",
        amount: "Up to ¥1,000,000 (~$6,700)",
        description: "Shimane offers one of Japan's most generous relocation packages for people moving from urban areas. Families receive higher amounts.",
        eligibility: "Moving from outside Shimane prefecture, purchasing or renting an akiya, minimum 5-year residency commitment.",
      },
      {
        title: "Akiya Renovation Grant",
        amount: "Up to ¥500,000 (~$3,350)",
        description: "Subsidy for renovating a vacant home to make it livable. Must use a certified local contractor.",
        eligibility: "Purchasing a registered akiya (empty house) in Shimane and renovating within 1 year of purchase.",
      },
    ],
    notes: "Shimane has one of Japan's highest akiya vacancy rates (~18%) and actively incentivizes migration. Some individual towns (Tsuwano, Oki Islands) offer additional local grants on top of prefectural programs.",
    national: "https://www.pref.shimane.lg.jp/life/sumai/jutaku/akiya/",
  },
  "tottori": {
    name: "Tottori",
    programs: [
      {
        title: "U-turn / I-turn Migration Grant",
        amount: "Up to ¥1,000,000 (~$6,700)",
        description: "Grant for people relocating to Tottori from major urban centers (Tokyo, Osaka, Nagoya metro areas).",
        eligibility: "Relocating from Tokyo metropolitan area or other designated urban zones. Remote workers and self-employed may also qualify.",
      },
      {
        title: "Akiya Purchase Subsidy",
        amount: "Up to ¥300,000 (~$2,000)",
        description: "Direct subsidy on purchase of a registered vacant home.",
        eligibility: "Purchasing from the official Tottori akiya bank registry.",
      },
    ],
    notes: "Tottori is Japan's least populous prefecture and actively recruits new residents. The Tottori akiya bank portal has English support.",
    national: "https://furusato.tottori.lg.jp/",
  },
  "wakayama": {
    name: "Wakayama",
    programs: [
      {
        title: "Rural Migration Support",
        amount: "Up to ¥2,000,000 (~$13,400)",
        description: "One of Japan's largest migration subsidies. Wakayama offers substantial support for families willing to relocate to rural areas.",
        eligibility: "Families with children receive higher amounts. Must commit to residency for at least 5 years.",
      },
      {
        title: "Home Renovation Grant",
        amount: "Up to ¥500,000 (~$3,350)",
        description: "For renovating a vacant home. Some municipalities within Wakayama offer additional matching grants.",
        eligibility: "Purchasing and renovating an akiya within Wakayama.",
      },
    ],
    notes: "Wakayama (~20% vacancy rate) borders Nara and Osaka — relatively accessible while still qualifying for rural migration grants.",
    national: "https://www.pref.wakayama.lg.jp/prefg/032000/akiya/",
  },
  "nagasaki": {
    name: "Nagasaki",
    programs: [
      {
        title: "Island Migration Support",
        amount: "Up to ¥500,000+ (~$3,350+)",
        description: "Nagasaki has over 500 islands, many with dedicated migration support. Island relocation packages can be significantly higher.",
        eligibility: "Relocating to Nagasaki, especially to island communities.",
      },
    ],
    notes: "Individual cities and islands in Nagasaki (Goto Islands, Tsushima, Iki) often have separate programs worth researching. Some offer free land alongside the home.",
    national: "https://www.pref.nagasaki.jp/bunrui/machidukuri-sumai/sumai-tochi/akiyabank/",
  },
  "nagano": {
    name: "Nagano",
    programs: [
      {
        title: "Migration Support Grant",
        amount: "Up to ¥500,000 (~$3,350)",
        description: "Nagano supports rural migration with grants for purchasing or renovating vacant homes.",
        eligibility: "Moving from outside Nagano. Remote workers especially welcomed — Nagano has good fiber coverage.",
      },
    ],
    notes: "Nagano is popular with remote workers due to excellent internet coverage, mountains, skiing, and proximity to Tokyo (1.5hrs by shinkansen). Individual towns like Karuizawa have their own programs.",
    national: "https://www.pref.nagano.lg.jp/kikaku/akiya/index.html",
  },
  "hokkaido": {
    name: "Hokkaido",
    programs: [
      {
        title: "Rural Migration Support",
        amount: "Up to ¥1,000,000 (~$6,700)",
        description: "Hokkaido offers grants for migration to rural towns. Sapporo area is excluded — must be moving to smaller communities.",
        eligibility: "Relocating to a designated rural community in Hokkaido.",
      },
    ],
    notes: "Individual Hokkaido towns (Kamishihoro, Shimokawa, etc.) offer their own generous programs — sometimes including free land. Research the specific town you're interested in.",
    national: "https://www.pref.hokkaido.lg.jp/kn/tks/akiyabank.html",
  },
  "fukushima": {
    name: "Fukushima",
    programs: [
      {
        title: "Recovery Migration Support",
        amount: "Up to ¥2,000,000 (~$13,400)",
        description: "As part of post-disaster recovery efforts, Fukushima offers some of Japan's highest migration grants. Coastal exclusion zones have lifted in most areas.",
        eligibility: "Relocating to designated recovery areas in Fukushima.",
      },
    ],
    notes: "Radiation levels in most of Fukushima are now at normal background levels. The government offers substantial incentives. Worth researching specific towns carefully.",
    national: "https://www.pref.fukushima.lg.jp/sec/16045b/akiyabank.html",
  },
  "kochi": {
    name: "Kochi",
    programs: [
      {
        title: "Kochi Migration Support",
        amount: "Up to ¥3,000,000 (~$20,100) for families",
        description: "One of Japan's highest migration grants. Kochi is serious about attracting new residents — families with children receive the highest amounts.",
        eligibility: "Relocating to Kochi. Families with children under 18 qualify for maximum amounts.",
      },
    ],
    notes: "Kochi has Japan's highest akiya vacancy rate (~21%) and some of the most aggressive migration incentives. Beautiful Pacific coast, excellent food culture.",
    national: "https://www.pref.kochi.lg.jp/soshiki/060501/akiyabank.html",
  },
};

// Map prefecture slugs to canonical names
const PREFECTURE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(SUBSIDY_DATA).map(([k, v]) => [k, v.name])
);

export async function generateStaticParams() {
  return Object.keys(SUBSIDY_DATA).map(p => ({ prefecture: p }));
}

export default async function SubsidyPage({ params }: { params: Promise<{ prefecture: string }> }) {
  const { prefecture } = await params;
  const data = SUBSIDY_DATA[prefecture.toLowerCase()];
  if (!data) notFound();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-2">
          <Link href="/listings" className="text-gray-500 hover:text-white text-sm transition">← Back to listings</Link>
        </div>

        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl px-4 py-2 inline-block mb-6 mt-4">
          <span className="text-green-400 text-sm font-bold">🏛️ Government Subsidy Programs</span>
        </div>

        <h1 className="text-4xl font-black mb-2">{data.name} Prefecture</h1>
        <p className="text-gray-400 mb-10">Migration incentives and akiya grants available to foreign buyers</p>

        <div className="space-y-6 mb-10">
          {data.programs.map((p, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="font-bold text-lg">{p.title}</h2>
                <span className="bg-green-500/20 text-green-400 text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">{p.amount}</span>
              </div>
              <p className="text-gray-300 mb-4 leading-relaxed">{p.description}</p>
              <div className="bg-black/20 rounded-xl p-4">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-wide mb-1">Eligibility</p>
                <p className="text-gray-400 text-sm">{p.eligibility}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 mb-8">
          <p className="text-amber-400 font-bold mb-2">ℹ️ Local notes</p>
          <p className="text-gray-300 text-sm leading-relaxed">{data.notes}</p>
        </div>

        <div className="border-t border-white/10 pt-8">
          <p className="text-gray-500 text-sm mb-4">For official information and to apply:</p>
          <div className="flex flex-wrap gap-3">
            <a href={data.national} target="_blank" rel="noopener noreferrer"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-4 py-2 rounded-full transition">
              🏛️ {data.name} Official Akiya Bank →
            </a>
            <a href={`https://www.soumu.go.jp/main_sosiki/jichi_gyousei/c-gyousei/teiju/`} target="_blank" rel="noopener noreferrer"
              className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-sm px-4 py-2 rounded-full transition">
              📋 National Migration Support Portal →
            </a>
          </div>
          <p className="text-gray-600 text-xs mt-4">Note: Grant amounts and eligibility change. Always verify with the prefecture office before purchasing.</p>
        </div>
      </div>
    </main>
  );
}
