export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🏯</span>
          <span className="font-bold text-lg tracking-tight">CheapAkiya</span>
        </div>
        <a
          href="#signup"
          className="bg-[#e85d2f] hover:bg-[#d44f23] text-white text-sm font-semibold px-4 py-2 rounded-full transition"
        >
          Get Free Listings
        </a>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-[#e85d2f]/10 text-[#e85d2f] text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          🇯🇵 Japan's vacant homes, curated in English
        </div>
        <h1 className="text-5xl sm:text-6xl font-black leading-tight mb-6">
          Own a home in Japan
          <br />
          <span className="text-[#e85d2f]">for under $10,000.</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Japan has over 9 million vacant homes called <em>akiya</em>. Many sell
          for a few thousand dollars — sometimes less. We find the best ones and
          deliver them straight to your inbox.
        </p>

        {/* SIGNUP FORM */}
        <div id="signup" className="max-w-md mx-auto">
          <form
            action="https://www.beehiiv.com/subscribe"
            method="POST"
            className="flex flex-col sm:flex-row gap-3"
          >
            {/* Replace pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015 with your Beehiiv publication ID */}
            <input type="hidden" name="publication_id" value="pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015" />
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] transition"
            />
            <button
              type="submit"
              className="bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold px-6 py-3 rounded-full transition whitespace-nowrap"
            >
              Get Free Listings →
            </button>
          </form>
          <p className="text-gray-600 text-sm mt-3">
            Free weekly listings. No spam. Unsubscribe anytime.
          </p>
        </div>
      </section>

      {/* SOCIAL PROOF / NUMBERS */}
      <section className="border-t border-white/10 py-12">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-3xl font-black text-[#e85d2f]">9M+</div>
            <div className="text-gray-400 text-sm mt-1">Vacant homes in Japan</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#e85d2f]">$500</div>
            <div className="text-gray-400 text-sm mt-1">Lowest listing we've seen</div>
          </div>
          <div>
            <div className="text-3xl font-black text-[#e85d2f]">47</div>
            <div className="text-gray-400 text-sm mt-1">Prefectures covered</div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-black text-center mb-12">How it works</h2>
        <div className="grid sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "We find them",
              desc: "We scan Japanese akiya banks and listing sites daily so you don't have to navigate them in Japanese.",
            },
            {
              step: "02",
              title: "We curate them",
              desc: "We filter for the best value homes — price, condition, location — and translate all the key details into English.",
            },
            {
              step: "03",
              title: "We send them to you",
              desc: "Free subscribers get weekly roundups. Premium members get the best listings first, with contact info included.",
            },
          ].map((item) => (
            <div key={item.step} className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="text-[#e85d2f] font-black text-sm mb-3">{item.step}</div>
              <h3 className="font-bold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SAMPLE LISTING */}
      <section className="max-w-4xl mx-auto px-6 py-8 pb-16">
        <h2 className="text-3xl font-black text-center mb-4">Sample listings</h2>
        <p className="text-gray-400 text-center mb-10">Real homes. Real prices. This is what lands in your inbox.</p>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              price: "$640",
              name: "3LDK Home in Sorachi District",
              location: "Hokkaido",
              size: "1,989 sq ft",
              beds: "3 bed / 1 bath",
              note: "Near Sunagawa City. Large lot. Entry-level price.",
            },
            {
              price: "$1,921",
              name: "Wooden Home in Coastal Muroran",
              location: "Hokkaido",
              size: "811 sq ft",
              beds: "3 bed / 1 bath",
              note: "Coastal location. Diamond-in-the-rough. Renovation potential.",
            },
            {
              price: "$3,427",
              name: "7-Bedroom Home in Imizu",
              location: "Toyama",
              size: "1,275 sq ft",
              beds: "7 bed / 1 bath",
              note: "1971 build. Spacious. Classic Japanese countryside.",
            },
            {
              price: "$6,332",
              name: "5DK House in Kurayoshi",
              location: "Tottori",
              size: "1,119 sq ft",
              beds: "5 bed / 1 bath",
              note: "¥1,000,000. Storehouse included. Acquisition subsidy available.",
            },
          ].map((l) => (
            <div key={l.name} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#e85d2f]/50 transition">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-2xl font-black text-[#e85d2f]">{l.price}</div>
                  <div className="font-semibold mt-0.5">{l.name}</div>
                </div>
                <span className="bg-white/10 text-xs px-2 py-1 rounded-full text-gray-300">
                  🇯🇵 {l.location}
                </span>
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>{l.beds} · {l.size}</div>
                <div>{l.note}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-500 text-sm mt-6">
          Premium subscribers get direct contact info, hazard maps, and move-in ready filters.
        </p>
      </section>

      {/* BOTTOM CTA */}
      <section className="border-t border-white/10 py-20">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-black mb-4">
            Start finding your Japan home.
          </h2>
          <p className="text-gray-400 mb-8">
            Free weekly listings delivered to your inbox. No Japanese required.
          </p>
          <form
            action="https://www.beehiiv.com/subscribe"
            method="POST"
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input type="hidden" name="publication_id" value="pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015" />
            <input
              type="email"
              name="email"
              required
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] transition"
            />
            <button
              type="submit"
              className="bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold px-6 py-3 rounded-full transition"
            >
              Subscribe Free →
            </button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <span>🏯</span>
            <span>CheapAkiya.com</span>
          </div>
          <div>© 2026 CheapAkiya. All rights reserved.</div>
        </div>
      </footer>

    </main>
  );
}
