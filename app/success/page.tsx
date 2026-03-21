import Link from "next/link";

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-lg text-center">
        {/* Animated checkmark */}
        <div className="w-24 h-24 bg-green-500/10 border-2 border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-8">
          <span className="text-5xl">✓</span>
        </div>

        <h1 className="text-4xl font-black mb-4">You're a Premium Member!</h1>
        <p className="text-gray-400 text-lg mb-8 leading-relaxed">
          Welcome to CheapAkiya Premium. You now have full access to contact info, the move-in ready filter, and early listings.
        </p>

        {/* What's unlocked */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
          {[
            "Direct contact info for every listing",
            "Full listing details & condition notes",
            "Move-in ready filter",
            "New listings 48 hours before public",
            "Weekly premium newsletter",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm">
              <span className="text-[#e85d2f]">✓</span>
              <span className="text-gray-200">{item}</span>
            </div>
          ))}
        </div>

        {/* Next steps */}
        <div className="bg-[#e85d2f]/5 border border-[#e85d2f]/20 rounded-2xl p-6 mb-8 text-left">
          <h3 className="font-bold mb-3 text-[#e85d2f]">What happens next</h3>
          <ol className="space-y-2 text-sm text-gray-300 list-decimal list-inside">
            <li>Check your inbox for a confirmation email</li>
            <li>Your first premium newsletter drops this week</li>
            <li>Browse all listings — contact info is now visible</li>
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/listings"
            className="bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold px-8 py-4 rounded-full transition">
            Browse All Listings →
          </Link>
          <Link href="/"
            className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-full transition">
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
