"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

export default function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const heroImg = hovered && images.length > 1 ? images[1] : (images[active] ?? images[0]);

  const prev = useCallback(() => setActive((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setActive((i) => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightbox, prev, next]);

  return (
    <>
      {/* Hero image only — full width */}
      <div
        className="relative w-full h-72 rounded-2xl overflow-hidden mb-3 cursor-pointer group"
        onClick={() => setLightbox(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Image
          src={heroImg}
          alt={name}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-[1.02]"
          unoptimized
        />
        {images.length > 1 && hovered && (
          <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
            Preview →
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
        <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition">
          🔍 View all {images.length} photos
        </div>
      </div>

      {/* Horizontal thumbnail strip — skip index 0 (same as hero), show rest */}
      {images.length > 1 && (
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActive(i)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden cursor-pointer transition-all ${
                active === i
                  ? "ring-2 ring-[#e85d2f] opacity-100"
                  : "opacity-50 hover:opacity-80"
              }`}
            >
              <Image src={img} alt={`Photo ${i + 1}`} fill className="object-cover" unoptimized />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl font-light z-10"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {active + 1} / {images.length}
          </div>
          {images.length > 1 && (
            <button
              className="absolute left-4 text-white/70 hover:text-white text-4xl p-4 z-10"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >‹</button>
          )}
          <div
            className="relative w-full max-w-4xl h-[80vh] px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={`${name} — photo ${active + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          {images.length > 1 && (
            <button
              className="absolute right-4 text-white/70 hover:text-white text-4xl p-4 z-10"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >›</button>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-lg">
            {images.map((img, i) => (
              <div
                key={i}
                onClick={(e) => { e.stopPropagation(); setActive(i); }}
                className={`relative flex-shrink-0 w-14 h-10 rounded overflow-hidden cursor-pointer transition-all ${
                  active === i ? "ring-2 ring-[#e85d2f] opacity-100" : "opacity-40 hover:opacity-70"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" unoptimized />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
