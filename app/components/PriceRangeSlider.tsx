"use client";

import { useRef } from "react";

export default function PriceRangeSlider({
  min,
  max,
  minVal,
  maxVal,
  onChange,
}: {
  min: number;
  max: number;
  minVal: number;
  maxVal: number;
  onChange: (min: number, max: number) => void;
}) {
  const rangeRef = useRef<HTMLDivElement>(null);

  const minPercent = Math.round(((minVal - min) / (max - min)) * 100);
  const maxPercent = Math.round(((maxVal - min) / (max - min)) * 100);

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-2">
        <span className="text-white font-medium">${minVal.toLocaleString()}</span>
        <span className="text-white font-medium">${maxVal.toLocaleString()}</span>
      </div>
      <div ref={rangeRef} className="relative h-1 w-full">
        {/* Track background */}
        <div className="absolute inset-0 rounded-full bg-white/10" />
        {/* Active range fill */}
        <div
          className="absolute h-full rounded-full bg-[#e85d2f]"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* Min thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={minVal}
          onChange={e => {
            const v = Math.min(Number(e.target.value), maxVal - 500);
            onChange(v, maxVal);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minVal > max - 100 ? 5 : 3 }}
        />

        {/* Max thumb */}
        <input
          type="range"
          min={min}
          max={max}
          step={500}
          value={maxVal}
          onChange={e => {
            const v = Math.max(Number(e.target.value), minVal + 500);
            onChange(minVal, v);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: 4 }}
        />

        {/* Min thumb dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#e85d2f] border-2 border-white shadow pointer-events-none"
          style={{ left: `calc(${minPercent}% - 8px)` }}
        />
        {/* Max thumb dot */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#e85d2f] border-2 border-white shadow pointer-events-none"
          style={{ left: `calc(${maxPercent}% - 8px)` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-600 mt-2">
        <span>${min.toLocaleString()}</span>
        <span>${max.toLocaleString()}</span>
      </div>
    </div>
  );
}
