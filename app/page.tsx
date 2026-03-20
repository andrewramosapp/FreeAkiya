export default function Home() {
  const listings = [
    { price: "$7", name: "A Rare 1,000-Yen Countryside Home in Joetsu", location: "Niigata", beds: "10 bed", size: "1,367 sq ft", built: "1974", notes: "10-room wooden house on 150-tsubo lot. Ideal for DIY renovation.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$68", name: "Traditional Home in Sasebo", location: "Nagasaki", beds: "4 bed", size: "649 sq ft", built: "Est. 1960s", notes: "Traditional Japanese home in quiet area. Renovation required.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$69", name: "3LDK Home in Hakodate", location: "Hokkaido", beds: "4 bed", size: "682 sq ft", built: "1969", notes: "Quiet residential neighborhood. Classic Hokkaido living.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$640", name: "Spacious 3LDK on Large Lot — Sorachi District", location: "Hokkaido", beds: "3 bed", size: "1,989 sq ft", built: "1961", notes: "Near Sunagawa City. Large lot. Shops and schools nearby.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$1,281", name: "3LDK Home With Garden & Parking in Otaru", location: "Hokkaido", beds: "3 bed", size: "1,024 sq ft", built: "1966", notes: "Coastal city. Convenience store within 10 min walk. Parking included.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$1,921", name: "Wooden Home in Coastal Muroran", location: "Hokkaido", beds: "3 bed", size: "811 sq ft", built: "1976", notes: "Coastal location. Diamond-in-the-rough with renovation potential.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$2,036", name: "Charming Home in Seiyo", location: "Ehime", beds: "2 bed", size: "676 sq ft", built: "1975", notes: "Traditional 4DK with tatami rooms and shoji doors. Quiet residential area.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$2,695", name: "Akiya in Sasebo — Built 1900", location: "Nagasaki", beds: "3 bed", size: "637 sq ft", built: "1900", notes: "Over 100 years old. Affordable coastal property with rich history.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$2,957", name: "6DK Home in Kamijo, Kashiwazaki City", location: "Niigata", beds: "6 bed", size: "2,277 sq ft", built: "1936", notes: "Spacious wooden home with garden. Built in 1936 — loads of character.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$3,312", name: "4DK Home in Tane, Higashiomi", location: "Shiga", beds: "4 bed", size: "1,158 sq ft", built: "1975", notes: "Wooden interiors, tatami rooms. 2 parking spots. Ideal for rural living.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$3,370", name: "Traditional Home in Nagasaki City", location: "Nagasaki", beds: "4 bed", size: "598 sq ft", built: "1968", notes: "Tatami rooms, wood interiors. Culturally rich coastal area.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$3,427", name: "7-Bedroom Village Escape in Imizu", location: "Toyama", beds: "7 bed", size: "1,275 sq ft", built: "1971", notes: "7 bedrooms under $3,500. Classic Japanese countryside.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$4,042", name: "Spacious Akiya in Joetsu", location: "Niigata", beds: "5 bed", size: "1,274 sq ft", built: "1978", notes: "Tatami rooms, traditional charm. Near mountains and sea.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$4,560", name: "Ebino Hillside Hideaway", location: "Miyazaki", beds: "3 bed", size: "896 sq ft", built: "1975", notes: "Large yard and mountain views. Surrounded by nature.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$5,122", name: "Classic 4LDK Home in Otaru", location: "Hokkaido", beds: "4 bed", size: "1,208 sq ft", built: "Est. 1960s", notes: "Quiet residential neighborhood. Peaceful coastal Hokkaido living.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$5,122", name: "Budget 4LDK in Otaru — Suehiro-cho", location: "Hokkaido", beds: "4 bed", size: "875 sq ft", built: "1964", notes: "Rare affordable Hokkaido entry. Potential as guesthouse or rental.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$5,551", name: "Hillside Hideaway in Nagasaki City", location: "Nagasaki", beds: "5 bed", size: "1,139 sq ft", built: "1967", notes: "Mountain views. 5 bedrooms for under $6,000.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$5,786", name: "Mountain View Home in Nakagawa Honmachi", location: "Toyama", beds: "5 bed", size: "640 sq ft", built: "1964", notes: "5 bedrooms with mountain views. Traditional Japanese layout.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$6,245", name: "6DK with Bay Views in Sasebo", location: "Nagasaki", beds: "6 bed", size: "1,303 sq ft", built: "1967", notes: "Bay views, coastal retreat. ¥900,000 listing price.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$6,332", name: "5DK Two-Story House in Kurayoshi", location: "Tottori", beds: "5 bed", size: "1,119 sq ft", built: "1983", notes: "¥1,000,000. Storehouse included. Acquisition subsidy up to ¥400,000 available.", url: "https://www.allakiyas.com/all" },
    { price: "$6,338", name: "Two-Story Home Near Takikawa Station", location: "Hokkaido", beds: "4 bed", size: "1,025 sq ft", built: "1973", notes: "Walk to train station. Full ownership. Under $7,000.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$6,500", name: "3DK Single-Story Home in Kitahara", location: "Fukushima", beds: "3 bed", size: "N/A", built: "1955", notes: "Single-story with parking. 1955 build with renovation potential.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$6,602", name: "Cozy Akiya in Kashiwazaki", location: "Niigata", beds: "7 bed", size: "3,195 sq ft", built: "1974", notes: "Over 3,000 sq ft for under $7,000. Near Sea of Japan. 2 parking spots.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$6,651", name: "5K Home in Nagasaki City", location: "Nagasaki", beds: "5 bed", size: "962 sq ft", built: "1967", notes: "Traditional 5DK with tatami rooms. Quiet residential neighborhood.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$6,854", name: "7-Bedroom Cultural Gem in Tate", location: "Toyama", beds: "7 bed", size: "1,698 sq ft", built: "1969", notes: "7 bedrooms for under $7,000. Spacious traditional home.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$7,590", name: "6DK Home in Saijo City", location: "Ehime", beds: "6 bed", size: "1,919 sq ft", built: "1991", notes: "Newer build (1991). Spacious with garden and mother-in-law suite.", url: "https://www.oldhousesjapan.com/all" },
    { price: "$9,827", name: "4DK Home in Kameoka City", location: "Kyoto", beds: "4 bed", size: "810 sq ft", built: "1977", notes: "Budget-friendly hideaway near Kyoto. Garden + 3 parking spots.", url: "https://www.oldhousesjapan.com/all" },
  ];

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏯</span>
          <span className="font-bold text-lg tracking-tight">CheapAkiya</span>
        </div>
        <a href="#signup" className="bg-[#e85d2f] hover:bg-[#d44f23] text-white text-sm font-semibold px-4 py-2 rounded-full transition">
          Get Free Listings
        </a>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
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
          <form action="https://www.beehiiv.com/subscribe" method="POST" className="flex flex-col sm:flex-row gap-3">
            <input type="hidden" name="publication_id" value="pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015" />
            <input type="email" name="email" required placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] transition" />
            <button type="submit" className="bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold px-6 py-3 rounded-full transition whitespace-nowrap">
              Get Free Listings →
            </button>
          </form>
          <p className="text-gray-600 text-sm mt-3">Free weekly listings. No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* STATS */}
      <section className="border-t border-white/10 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div><div className="text-3xl font-black text-[#e85d2f]">9M+</div><div className="text-gray-400 text-sm mt-1">Vacant homes in Japan</div></div>
          <div><div className="text-3xl font-black text-[#e85d2f]">$7</div><div className="text-gray-400 text-sm mt-1">Lowest listing this week</div></div>
          <div><div className="text-3xl font-black text-[#e85d2f]">27</div><div className="text-gray-400 text-sm mt-1">Active listings under $10k</div></div>
        </div>
      </section>

      {/* LISTINGS */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black">Current listings</h2>
            <p className="text-gray-400 mt-1">All under $10,000 USD. Updated weekly.</p>
          </div>
          <span className="bg-[#e85d2f]/10 text-[#e85d2f] text-sm font-medium px-3 py-1 rounded-full">{listings.length} listings</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {listings.map((l, i) => (
            <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
              className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-[#e85d2f]/50 transition group block">
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl font-black text-[#e85d2f]">{l.price}</div>
                <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">🇯🇵 {l.location}</span>
              </div>
              <h3 className="font-semibold text-sm mb-2 group-hover:text-[#e85d2f] transition leading-snug">{l.name}</h3>
              <div className="text-xs text-gray-500 space-y-1">
                <div>{l.beds} · {l.size} · Built {l.built}</div>
                <div className="text-gray-500 leading-relaxed">{l.notes}</div>
              </div>
              <div className="mt-3 text-xs text-[#e85d2f] opacity-0 group-hover:opacity-100 transition">View listing →</div>
            </a>
          ))}
        </div>
        <p className="text-center text-gray-600 text-sm mt-8">
          Sign up for the newsletter to get new listings as they're found — plus premium members get direct contact info.
        </p>
      </section>

      {/* HOW IT WORKS */}
      <section className="border-t border-white/10 max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            { step: "01", title: "We find them", desc: "We scan Japanese akiya banks and listing sites daily so you don't have to navigate them in Japanese." },
            { step: "02", title: "We curate them", desc: "We filter for the best value homes — price, condition, location — and translate all the key details into English." },
            { step: "03", title: "We send them to you", desc: "Free subscribers get weekly roundups. Premium members get the best listings first, with contact info included." },
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
          <form action="https://www.beehiiv.com/subscribe" method="POST" className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input type="hidden" name="publication_id" value="pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015" />
            <input type="email" name="email" required placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] transition" />
            <button type="submit" className="bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold px-6 py-3 rounded-full transition">
              Subscribe Free →
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-gray-600 text-sm">
          <div className="flex items-center gap-2"><span>🏯</span><span>CheapAkiya.com</span></div>
          <div>© 2026 CheapAkiya. All rights reserved.</div>
        </div>
      </footer>
    </main>
  );
}
