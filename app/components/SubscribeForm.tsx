"use client";

import { useState } from "react";

export default function SubscribeForm({
  placeholder = "Enter your email",
  buttonText = "Get Free Listings →",
  className = "",
  layout = "row",
}: {
  placeholder?: string;
  buttonText?: string;
  className?: string;
  layout?: "row" | "column";
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={`text-center ${className}`}>
        <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-full">
          <span>✓</span>
          <span className="font-semibold">You're on the list! First listings drop weekly.</span>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className={`flex ${layout === "column" ? "flex-col" : "flex-col sm:flex-row"} gap-3 ${className}`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] transition"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-60 text-white font-bold px-6 py-3 rounded-full transition whitespace-nowrap"
      >
        {status === "loading" ? "Subscribing..." : buttonText}
      </button>
      {status === "error" && (
        <p className="text-red-400 text-sm text-center">Something went wrong. Try again?</p>
      )}
    </form>
  );
}
