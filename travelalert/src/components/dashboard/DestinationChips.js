"use client";

import { useRouter } from "next/navigation";
import { cities } from "@/lib/dashboard-data";

// Destination chips are a navigation shortcut. They previously displayed a
// static safety score (e.g. "6.8") and a trend arrow next to each city that
// were hardcoded per-city values — not derived from cached intel. That score
// display has been removed. The live safety score is shown once, on the
// active city's DestinationHeader, where it is computed from real cached
// alert data by /api/briefing.
export function DestinationChips({ active }) {
  const router = useRouter();

  return (
    <div className="w-full">
      <p className="mb-2.5 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        DESTINATIONS
      </p>

      <div
        role="tablist"
        aria-label="Switch destination"
        className="no-scrollbar flex items-center gap-2.5 overflow-x-auto pb-1"
      >
        {cities.map((c) => {
          const isActive =
            c.name.toLowerCase() === String(active || "").toLowerCase();

          return (
            <button
              key={c.name}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() =>
                router.push(
                  `/dashboard?city=${encodeURIComponent(c.name)}&cached_only=1`
                )
              }
              className={`inline-flex h-9 shrink-0 select-none items-center gap-2 whitespace-nowrap rounded-full px-4 text-xs font-bold transition-all duration-150 ${
                isActive
                  ? "bg-[#e5283b] text-white shadow-sm"
                  : "border border-zinc-200/90 bg-white text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-300 dark:hover:bg-white/5"
              }`}
            >
              <span aria-hidden="true" className="text-sm leading-none">
                {c.flag}
              </span>
              <span>{c.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}