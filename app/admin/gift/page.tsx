"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

type GiftedMember = { id: string; email: string; name: string; note: string; created_at: string; is_active: boolean };

export default function GiftPremiumPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [gifted, setGifted] = useState<GiftedMember[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const h = { "x-admin-secret": secret };

  const load = async () => {
    const r = await fetch("/api/admin/gift-premium", { headers: h });
    if (r.ok) { const d = await r.json(); setGifted(d.gifted || []); }
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const gift = async () => {
    if (!email) return;
    setLoading(true); setStatus("");
    const r = await fetch("/api/admin/gift-premium", {
      method: "POST", headers: { ...h, "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, note }),
    });
    const d = await r.json();
    if (r.ok) { setStatus("✅ Gifted! " + email + " now has premium access."); setEmail(""); setName(""); setNote(""); load(); }
    else setStatus("❌ " + (d.error || "Failed"));
    setLoading(false);
  };

  const revoke = async (em: string) => {
    await fetch("/api/admin/gift-premium", { method: "DELETE", headers: { ...h, "Content-Type": "application/json" }, body: JSON.stringify({ email: em }) });
    load();
  };

  if (!authed) return (
    <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
      <div className="max-w-sm w-full text-center">
        <div className="text-4xl mb-6">🎁</div>
        <h1 className="text-2xl font-black mb-6">Gift Premium Access</h1>
        <input type="password" placeholder="Admin password" value={secret} onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === "Enter" && setAuthed(true)}
          className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] mb-3" />
        <button onClick={() => setAuthed(true)} className="w-full bg-[#e85d2f] text-white font-bold py-3 rounded-full">Enter →</button>
      </div>
    </main>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-3xl mx-auto border-b border-white/10">
        <Link href="/admin" className="text-gray-500 hover:text-white text-sm">← Admin</Link>
        <span className="font-bold">🎁 Gift Premium</span>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Gift form */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="font-black text-lg mb-4">Gift a Premium Subscription</h2>
          <div className="grid grid-cols-1 gap-3 mb-4">
            <input placeholder="Email *" value={email} onChange={e => setEmail(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]" />
            <input placeholder="Name (optional)" value={name} onChange={e => setName(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]" />
            <input placeholder="Note e.g. 'Friend of Andrew'" value={note} onChange={e => setNote(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f]" />
          </div>
          {status && <p className={`text-sm mb-3 ${status.startsWith("✅") ? "text-green-400" : "text-red-400"}`}>{status}</p>}
          <button onClick={gift} disabled={loading || !email}
            className="bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-40 text-white font-bold px-6 py-2.5 rounded-full transition">
            {loading ? "Gifting..." : "🎁 Gift Premium Access"}
          </button>
          <p className="text-gray-600 text-xs mt-3">They can log in with their email on cheapakiya.com and get full premium access immediately. No Stripe required.</p>
        </div>

        {/* Gifted members list */}
        <h2 className="font-black text-lg mb-4">Gifted Members ({gifted.filter(g => g.is_active).length} active)</h2>
        {gifted.length === 0 ? (
          <p className="text-gray-600">No gifted members yet.</p>
        ) : (
          <div className="space-y-2">
            {gifted.map(m => (
              <div key={m.id} className={`flex items-center justify-between p-4 rounded-xl border ${m.is_active ? "border-white/10 bg-white/5" : "border-white/5 bg-white/2 opacity-40"}`}>
                <div>
                  <div className="font-semibold text-sm">{m.name || m.email} {!m.is_active && <span className="text-xs text-gray-600 ml-2">revoked</span>}</div>
                  <div className="text-gray-500 text-xs">{m.email} {m.note && "· " + m.note}</div>
                  <div className="text-gray-700 text-xs">{new Date(m.created_at).toLocaleDateString()}</div>
                </div>
                {m.is_active && (
                  <button onClick={() => revoke(m.email)} className="text-xs text-red-500 hover:text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 hover:border-red-400/40 transition">
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
