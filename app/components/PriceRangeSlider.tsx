"use client";

import { useRef, useCallback } from "react";

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

  const minPercent = ((minVal - min) / (max - min)) * 100;
  const maxPercent = ((maxVal - min) / (max - min)) * 100;

  // Which thumb is closer to a given value? That one gets higher z-index
  const minIsOnTop = useCallback((val: number) => {
    const midpoint = (minVal + maxVal) / 2;
    return val < midpoint;
  }, [minVal, maxVal]);

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-400 mb-3">
        <span className="font-medium text-white">${minVal.toLocaleString()}</span>
        <span className="text-gray-500">—</span>
        <span className="font-medium text-white">${maxVal.toLocaleString()}</span>
      </div>

      <div ref={rangeRef} className="relative h-5 w-full flex items-center">
        {/* Track */}
        <div className="absolute h-1 w-full rounded-full bg-white/10" />
        {/* Active fill */}
        <div
          className="absolute h-1 rounded-full bg-[#e85d2f]"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />

        {/* MIN thumb input — sits on top when minVal is near the left */}
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
          className="absolute w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minVal > max * 0.9 ? 5 : 3 }}
        />

        {/* MAX thumb input */}
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
          className="absolute w-full h-full opacity-0 cursor-pointer"
          style={{ zIndex: minVal > max * 0.9 ? 4 : 4 }}
        />

        {/* Visual thumb — MIN */}
        <div
          className="absolute w-5 h-5 rounded-full bg-[#e85d2f] border-2 border-white shadow-lg pointer-events-none transition-transform"
          style={{ left: `calc(${minPercent}% - 10px)`, zIndex: 6 }}
        />
        {/* Visual thumb — MAX */}
        <div
          className="absolute w-5 h-5 rounded-full bg-[#e85d2f] border-2 border-white shadow-lg pointer-events-none transition-transform"
          style={{ left: `calc(${maxPercent}% - 10px)`, zIndex: 6 }}
        />
      </div>

      <div className="flex justify-between text-xs text-gray-600 mt-2">
        <span>${min.toLocaleString()}</span>
        <span>${max.toLocaleString()}</span>
      </div>
    </div>
  );
}
