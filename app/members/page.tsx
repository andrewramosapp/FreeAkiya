export default function MembersPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-6">🔒</div>
        <h1 className="text-3xl font-black mb-4">Members Area</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          Premium members get direct contact info for every listing, move-in ready filters, and new listings before they go public.
        </p>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-left space-y-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#e85d2f]">✓</span>
            <span>Direct contact info for every listing</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#e85d2f]">✓</span>
            <span>Move-in ready filter</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#e85d2f]">✓</span>
            <span>New listings 48 hours before public</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#e85d2f]">✓</span>
            <span>Weekly curated newsletter</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[#e85d2f]">✓</span>
            <span>Buying guides & prefecture deep-dives</span>
          </div>
        </div>
        <a href="/join"
          className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold py-4 rounded-full transition text-lg mb-3">
          Become a Member →
        </a>
        <a href="/listings" className="text-gray-500 hover:text-white text-sm transition">← Back to listings</a>
      </div>
    </main>
  );
}
