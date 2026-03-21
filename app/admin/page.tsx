"use client";

import { useState } from "react";
import Link from "next/link";

const TIERS = [
  { value: "free", label: "Free subscribers (Beehiiv)", desc: "Everyone on your free list", color: "white" },
  { value: "premium", label: "Premium members (Stripe)", desc: "Paying $12/mo subscribers only", color: "#e85d2f" },
];

export default function AdminPage() {
  const [secret, setSecret] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tier, setTier] = useState("premium");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [result, setResult] = useState<{ sent?: number; total?: number; errors?: string[] } | null>(null);
  const [preview, setPreview] = useState(false);

  const send = async () => {
    setStatus("sending");
    try {
      const res = await fetch("/api/send-newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
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

  // Auth gate
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
        <span className="text-gray-600 text-sm">Newsletter Sender</span>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black mb-8">Send Newsletter</h1>

        {/* Tier selector */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-400 mb-3">Audience</label>
          <div className="grid grid-cols-2 gap-3">
            {TIERS.map((t) => (
              <button
                key={t.value}
                onClick={() => setTier(t.value)}
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

        {/* Subject */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-400 mb-2">Subject line</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="🏯 This week's akiya picks — from $7"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] transition"
          />
        </div>

        {/* Body */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-bold text-gray-400">Email body (HTML or plain text)</label>
            <button onClick={() => setPreview(!preview)} className="text-xs text-[#e85d2f] hover:underline">
              {preview ? "Edit" : "Preview"}
            </button>
          </div>
          {preview ? (
            <div
              className="w-full min-h-64 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: body }}
            />
          ) : (
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={12}
              placeholder={`<p>Here are this week's top picks:</p>
<ul>
  <li><strong>$7 — Joetsu, Niigata</strong> — 10-room wooden house. Land value exceeds asking price.</li>
  <li><strong>$640 — Hokkaido</strong> — Nearly 2,000 sq ft on a large lot near Sunagawa City.</li>
</ul>
<p><a href="https://cheapakiya.com/listings">Browse all listings →</a></p>`}
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#e85d2f] transition font-mono text-sm resize-y"
            />
          )}
        </div>

        {/* Send button */}
        {status === "idle" && (
          <button
            onClick={send}
            disabled={!subject || !body}
            className="w-full bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-40 text-white font-bold py-4 rounded-full transition text-lg"
          >
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
            <button onClick={() => { setStatus("idle"); setSubject(""); setBody(""); }} className="mt-4 text-gray-500 hover:text-white text-sm transition">
              Send another →
            </button>
          </div>
        )}

        {status === "error" && result && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center">
            <p className="text-red-400 font-bold">Failed to send</p>
            <p className="text-gray-500 text-sm mt-1">{result.errors?.[0]}</p>
            <button onClick={() => setStatus("idle")} className="mt-4 text-gray-500 hover:text-white text-sm">Try again</button>
          </div>
        )}
      </div>
    </main>
  );
}
