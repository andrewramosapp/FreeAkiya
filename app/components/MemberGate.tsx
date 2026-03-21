"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MemberGate() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/verify-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        router.push("/members");
        router.refresh();
      } else {
        setErrorMsg(data.error ?? "No active subscription found.");
        setStatus("error");
      }
    } catch {
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={verify} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="w-full px-5 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:border-[#e85d2f] transition text-center"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full bg-[#e85d2f] hover:bg-[#d44f23] disabled:opacity-60 text-white font-bold py-4 rounded-full transition text-lg"
      >
        {status === "loading" ? "Checking..." : "Access My Account →"}
      </button>
      {status === "error" && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
          {errorMsg}
          {errorMsg.includes("subscription") && (
            <span className="block mt-1">
              <a href="/join" className="underline">Get premium access →</a>
            </span>
          )}
        </div>
      )}
    </form>
  );
}
