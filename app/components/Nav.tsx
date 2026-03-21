import Link from "next/link";
import { getMember } from "@/lib/member";

export default async function Nav() {
  const member = await getMember();
  return (
    <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto border-b border-white/10">
      <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
        <span className="font-black text-xl tracking-tight text-white">CheapAkiya</span>
      </Link>
      <div className="flex items-center gap-4">
        {member ? (
          <>
            <Link href="/saved" className="text-gray-400 hover:text-white text-sm transition flex items-center gap-1">
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              Saved
            </Link>
            <Link href="/members" className="text-gray-400 hover:text-white text-sm transition">
              {member.tier === "premium" ? "🔒" : "✓"} {member.email.split("@")[0]}
            </Link>
          </>
        ) : (
          <Link href="/listings" className="bg-[#e85d2f] hover:bg-[#d44f23] text-white text-sm font-semibold px-4 py-2 rounded-full transition">
            Get Free Listings
          </Link>
        )}
      </div>
    </nav>
  );
}
