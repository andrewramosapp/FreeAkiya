"use client";

import { useState } from "react";
import Link from "next/link";

const TIERS = [
  { value: "free", label: "Free subscribers (Beehiiv)", desc: "Everyone on your free list", color: "white" },
  { value: "premium", label: "Premium members (Stripe)", desc: "Paying $12/mo subscribers only", color: "#e85d2f" },
];

const TABS = ["Newsletter", "Leads"] as const;
type Tab = typeof TABS[number];

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Newsletter");

  // Newsletter state
  const [tier, setTier] = useState("premium");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ sent?: number; total?: number; errors?: string[] } | null>(null);
  const [preview, setPreview] = useState(false);

  // Leads state
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsError, setLeadsError] = useState("");

  const send = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify({ subject, body, tier }),
      });
      const data = await res.json();
      setResult(data);
      setStatus(res.ok ? "done" : "error");
    } catch {
      setStatus("error");
      setResult({ errors: ["Network error"] });
    }
  };

  const exportLeads = async () => {
    setLeadsLoading(true);
    setLeadsError("");
    try {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await fetch(`/api/leads-export?${params}`, {
        headers: { "x-admin-secret": secret },
      });
      if (!res.ok) {
        const err = await res.json();
        setLeadsError(err.error || "Export failed");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const label = dateFrom || dateTo
        ? `leads_${dateFrom || "start"}_to_${dateTo || "now"}`
        : `leads_all`;
      a.href = url;
      a.download = `${label}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setLeadsError("Network error");
    } finally {
      setLeadsLoading(false);
    }
  };

  if (!authed) {
    return (
      <main className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center px-6">
        <div className="max-w-sm w-full text-center">
          <div className="text-4xl mb-6">🔐</div>
          <h1 className="text-2xl font-black mb-6">Admin Access</h1>
          <input
            type="password"
            placeholder="Enter admin secret"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setAuthed(true)}
            className="w-full px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] transition mb-3"
          />
          <button onClick={() => setAuthed(true)}
            className="w-full bg-[#e85d2f] hover:bg-[#d44f23] text-white font-bold py-3 rounded-full transition">
            Enter →
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-4xl mx-auto border-b border-white/10">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-2xl">🏯</span>
          <span className="font-bold text-lg">CheapAkiya Admin</span>
        </Link>
        {/* Tabs */}
        <div className="flex gap-1 bg-white/5 rounded-full p-1">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                activeTab === tab
                  ? "bg-[#e85d2f] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* ── NEWSLETTER TAB ── */}
        {activeTab === "Newsletter" && (
          <>
            <h1 className="text-3xl font-black mb-8">Send Newsletter</h1>
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-400 mb-3">Audience</label>
              <div className="grid grid-cols-2 gap-3">
                {TIERS.map((t) => (
                  <button key={t.value} onClick={() => setTier(t.value)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      tier === t.value
                        ? "border-[#e85d2f] bg-[#e85d2f]/10"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">{t.label}</div>
                    <div className="text-gray-500 text-xs">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-bold text-gray-400 mb-2">Subject line</label>
              <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)}
                placeholder="🏯 This week's akiya picks — from $7"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] transition"
              />
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-bold text-gray-400">Email body (HTML or plain text)</label>
                <button onClick={() => setPreview(!preview)} className="text-xs text-[#e85d2f] hover:underline">
                  {preview ? "Edit" : "Preview"}
                </button>
              </div>
              {preview ? (
                <div className="w-full min-h-64 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: body }} />
              ) : (
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={12}
                  placeholder={`<p>Here are this week's top picks:</p>\n<ul>\n  <li><strong>$7 — Joetsu, Niigata</strong> — 10-room wooden house.</li>\n</ul>\n<p><a href="https://cheapakiya.com/listings">Browse all listings →</a></p>`}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] transition font-mono text-sm resize-y"
                />
              )}
            </div>
            {status === "idle" && (
              <button onClick={send} disabled={!subject || !body}
                className="w-full bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-40 text-white font-bold py-4 rounded-full transition text-lg">
                Send to {tier === "premium" ? "Premium Members" : "Free Subscribers"} →
              </button>
            )}
            {status === "sending" && (
              <div className="text-center py-6">
                <div className="text-2xl mb-2 animate-pulse">📤</div>
                <p className="text-gray-400">Sending emails...</p>
              </div>
            )}
            {status === "done" && result && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-green-400 font-bold text-lg">Sent to {result.sent} / {result.total} recipients</p>
                {result.errors && result.errors.length > 0 && (
                  <p className="text-red-400 text-sm mt-2">{result.errors.length} errors: {result.errors[0]}</p>
                )}
                <button onClick={() => { setStatus("idle"); setSubject(""); setBody(""); }}
                  className="mt-4 text-gray-500 hover:text-white text-sm transition">Send another →</button>
              </div>
            )}
            {status === "error" && result && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
                <p className="text-red-400 font-bold">Failed to send</p>
                <p className="text-gray-500 text-sm mt-1">{result.errors?.[0]}</p>
                <button onClick={() => setStatus("idle")} className="mt-4 text-gray-500 hover:text-white text-sm">Try again</button>
              </div>
            )}
          </>
        )}

        {/* ── LEADS TAB ── */}
        {activeTab === "Leads" && (
          <>
            <h1 className="text-3xl font-black mb-2">Referral Leads Export</h1>
            <p className="text-gray-500 mb-8 text-sm">Export leads captured from the &quot;Want help buying this?&quot; button. Download as CSV.</p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-6">
              <h2 className="font-bold text-sm text-gray-400 mb-4">Date Range (optional)</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From</label>
                  <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#e85d2f] transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To</label>
                  <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#e85d2f] transition text-sm"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-6">
                Leave blank to export all leads. CSV includes: name, email, phone, property interest, message, date submitted.
              </div>
              {leadsError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 text-red-400 text-sm">
                  {leadsError}
                </div>
              )}
              <button onClick={exportLeads} disabled={leadsLoading}
                className="w-full bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-40 text-white font-bold py-3 rounded-full transition flex items-center justify-center gap-2">
                {leadsLoading ? (
                  <><span className="animate-pulse">⏳</span> Generating CSV...</>
                ) : (
                  <><span>⬇️</span> Export Leads to CSV</>
                )}
              </button>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="font-bold text-sm text-gray-400 mb-3">CSV Columns</h2>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-500">
                {["submitted_at", "name", "email", "phone", "property_slug", "property_name", "prefecture", "price_usd", "message", "source"].map(col => (
                  <div key={col} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e85d2f]"></span>
                    <code className="text-xs">{col}</code>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
