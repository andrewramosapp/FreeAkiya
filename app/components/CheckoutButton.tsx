"use client";

import { useState } from "react";

export default function CheckoutButton({ className = "" }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "ready">("ready");

  const startCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch {
      alert("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  if (step === "email") {
    return (
      <div className={`space-y-3 ${className}`}>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] transition"
          autoFocus
        />
        <button
          onClick={startCheckout}
          disabled={loading || !email.includes("@")}
          className="w-full bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-60 text-white font-bold py-4 rounded-full transition text-lg"
        >
          {loading ? "Redirecting to checkout..." : "Continue to Payment →"}
        </button>
        <button onClick={() => setStep("ready")} className="w-full text-gray-600 hover:text-gray-400 text-sm py-1 transition">
          ← Back
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setStep("email")}
      disabled={loading}
      className={`w-full bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-60 text-white font-bold text-center py-4 rounded-full transition text-lg ${className}`}
    >
      Start Premium — $12/mo →
    </button>
  );
}
