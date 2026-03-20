import Link from "next/link";

export default function JoinPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🏯</span>
          <span className="font-bold text-lg tracking-tight">CheapAkiya</span>
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <h1 className="text-5xl font-black mb-4">Choose your plan</h1>
          <p className="text-gray-400 text-xl">Find your Japan home — free or with full access.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* FREE PLAN */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col">
            <div className="mb-6">
              <div className="text-gray-400 text-sm font-medium uppercase tracking-widest mb-2">Free</div>
              <div className="text-5xl font-black mb-1">$0</div>
              <div className="text-gray-500 text-sm">Forever free</div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                { ok: true, text: "Weekly newsletter with new listings" },
                { ok: true, text: "Access to 6 free sample listings" },
                { ok: true, text: "Browse all listing cards (name, price, location)" },
                { ok: true, text: "Japan buying guides & prefecture deep-dives" },
                { ok: false, text: "Contact info for listings" },
                { ok: false, text: "Move-in ready filter" },
                { ok: false, text: "Early access (48hrs before public)" },
                { ok: false, text: "Full listing details & notes" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className={item.ok ? "text-green-400 mt-0.5" : "text-gray-600 mt-0.5"}>
                    {item.ok ? "✓" : "✕"}
                  </span>
                  <span className={item.ok ? "text-gray-200" : "text-gray-600"}>{item.text}</span>
                </li>
              ))}
            </ul>

            <div>
              <form action="https://andrews-newsletter-5041fe.beehiiv.com/subscribe" method="POST" className="space-y-3">
                <input type="hidden" name="publication_id" value="pub_fd0b577c-8137-4c4d-a6ee-37b6c623a015" />
                <input type="email" name="email" required placeholder="Enter your email"
                  className="w-full px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-white/50 transition" />
                <button type="submit"
                  className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-full transition">
                  Subscribe Free →
                </button>
              </form>
            </div>
          </div>

          {/* PREMIUM PLAN */}
          <div className="bg-[#e85d2f]/5 border-2 border-[#e85d2f] rounded-3xl p-8 flex flex-col relative overflow-hidden">
            {/* Badge */}
            <div className="absolute top-4 right-4 bg-[#e85d2f] text-white text-xs font-bold px-3 py-1 rounded-full">
              MOST POPULAR
            </div>

            <div className="mb-6">
              <div className="text-[#e85d2f] text-sm font-medium uppercase tracking-widest mb-2">Premium</div>
              <div className="flex items-end gap-2 mb-1">
                <span className="text-5xl font-black">$12</span>
                <span className="text-gray-400 mb-2">/month</span>
              </div>
              <div className="text-gray-500 text-sm">Cancel anytime</div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {[
                { ok: true, text: "Everything in Free" },
                { ok: true, text: "Direct contact info for every listing" },
                { ok: true, text: "Full listing details, notes & condition" },
                { ok: true, text: "Move-in ready filter" },
                { ok: true, text: "New listings 48hrs before public" },
                { ok: true, text: "Premium weekly newsletter" },
                { ok: true, text: "Prefecture buying guides" },
                { ok: true, text: "Priority email support" },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="text-[#e85d2f] mt-0.5">✓</span>
                  <span className="text-gray-200">{item.text}</span>
                </li>
              ))}
            </ul>

            <a href="https://cheapakiya.beehiiv.com/upgrade" target="_blank" rel="noopener noreferrer"
              className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold text-center py-4 rounded-full transition text-lg">
              Start Premium — $12/mo →
            </a>
            <p className="text-center text-gray-600 text-xs mt-3">Cancel anytime. No commitment.</p>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16">
          <h2 className="text-2xl font-black text-center mb-8">Common questions</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                q: "Do I need to speak Japanese?",
                a: "No. We translate all listing details into English and can help connect you with English-speaking agents.",
              },
              {
                q: "Can foreigners really buy in Japan?",
                a: "Yes. Japan has no restrictions on foreign property ownership. You can buy on a tourist visa and own freehold.",
              },
              {
                q: "Are these homes move-in ready?",
                a: "Some are, most need renovation. Premium members get a move-in ready filter to find the best condition properties.",
              },
              {
                q: "What is an akiya?",
                a: "Akiya (空き家) means 'vacant house' in Japanese. Japan has over 9 million of them due to rural depopulation and aging owners.",
              },
            ].map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h3 className="font-bold mb-2">{faq.q}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
