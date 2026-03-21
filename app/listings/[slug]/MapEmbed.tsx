"use client";

export default function MapEmbed({ city, prefecture }: { city: string; prefecture: string }) {
  const query = encodeURIComponent(`${city}, ${prefecture}, Japan`);
  const src = `https://maps.google.com/maps?q=${query}&output=embed&z=12`;

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-3">Location</h2>
      <div className="rounded-2xl overflow-hidden border border-white/10 h-64 relative">
        <iframe
          title={`Map of ${city}, ${prefecture}`}
          src={src}
          className="w-full h-full grayscale opacity-80 hover:opacity-100 hover:grayscale-0 transition duration-500"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <p className="text-xs text-gray-600 mt-2">📍 {city}, {prefecture} Prefecture, Japan</p>
    </div>
  );
}
