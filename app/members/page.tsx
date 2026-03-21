import Nav from "@/app/components/Nav";
import Link from "next/link";
import { getMember } from "@/lib/member";
import MemberGate from "@/app/components/MemberGate";

export default async function MembersPage() {
  const member = await getMember();

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <Nav />
      <div className="flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full text-center">

          {member ? (
            <>
              <h1 className="text-3xl font-black mb-2">Welcome back!</h1>
              <p className="text-gray-400 mb-1 text-sm">{member.email}</p>
              <p className="text-gray-400 mb-2">
                {member.tier === "premium" ? "🔒 Premium member" : "✓ Free subscriber"}
              </p>
              {member.tier === "free" && (
                <a href="/join" className="text-[#e85d2f] text-sm hover:underline mb-6 block">
                  Upgrade to Premium for contact info →
                </a>
              )}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6 text-left space-y-3">
                {[
                  "Direct contact info on every listing",
                  "Move-in ready filter",
                  "New listings 48 hours early",
                  "Weekly premium newsletter",
                  "Buying guides & prefecture deep-dives",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <span className="text-[#e85d2f]">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link href="/listings"
                className="block w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold py-4 rounded-full transition text-lg mb-3">
                Browse Listings →
              </Link>
              <Link href="/saved" className="block text-gray-400 hover:text-white text-sm transition mb-2">
                🤍 View saved listings
              </Link>
              <Link href="/api/logout" className="text-gray-600 hover:text-gray-400 text-sm transition">
                Sign out
              </Link>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black mb-4">Members Area</h1>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Enter the email you used to subscribe. We'll verify your membership instantly.
              </p>
              <MemberGate />
              <p className="text-gray-600 text-sm mt-6">
                Not a member yet?{" "}
                <Link href="/join" className="text-[#e85d2f] hover:underline">
                  Join for $12/mo →
                </Link>
              </p>
            </>
          )}

        </div>
      </div>
    </main>
  );
}
