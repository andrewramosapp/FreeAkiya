import Nav from "@/app/components/Nav";
import Link from "next/link";
import CheckoutButton from "@/app/components/CheckoutButton";

export default function UpgradePage() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />
      <div className="flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full text-center">
        <div className="bg-[#e85d2f]/10 border border-[#e85d2f]/30 rounded-2xl px-4 py-2 inline-block mb-6">
          <span className="text-[#e85d2f] text-sm font-bold">🔒 Members Only Listing</span>
        </div>

        <h1 className="text-4xl font-black mb-4">Upgrade to Premium</h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          This listing is exclusive to premium members. Upgrade to get access to all listings, direct contact info, and early access to new properties.
        </p>

        {/* What you get */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 text-left space-y-3">
          {[
            "Access to all members-only listings",
            "Direct contact info for every listing",
            "New listings 48 hours before public",
            "Move-in ready filter",
            "Weekly premium newsletter",
          ].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm">
              <span className="text-[#e85d2f]">✓</span>
              <span className="text-gray-200">{item}</span>
            </div>
          ))}
        </div>

        {/* Price */}
        <div className="mb-6">
          <span className="text-5xl font-black">$12</span>
          <span className="text-gray-400 text-lg">/month</span>
          <p className="text-gray-600 text-sm mt-1">Cancel anytime</p>
        </div>

        <CheckoutButton />

        <p className="text-gray-600 text-sm mt-4">
          <Link href="/listings" className="hover:text-gray-400 transition">← Back to listings</Link>
        </p>
      </div>
      </div>
    </main>
  );
}