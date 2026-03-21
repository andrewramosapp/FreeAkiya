"use client";

import { useState, useEffect } from "react";

export default function HeartButton({
  listingId,
  initialSaved = false,
  requiresLogin = false,
}: {
  listingId: string;
  initialSaved?: boolean;
  requiresLogin?: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  const toggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (requiresLogin) { window.location.href = "/members"; return; }
    setLoading(true);
    try {
      const res = await fetch("/api/save-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listingId, action: saved ? "unsave" : "save" }),
      });
      const data = await res.json();
      if (res.ok) setSaved(data.saved);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={saved ? "Remove from saved" : "Save listing"}
      className={`transition-all duration-200 ${loading ? "opacity-50" : "hover:scale-110"}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill={saved ? "#e85d2f" : "none"}
        stroke={saved ? "#e85d2f" : "currentColor"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
