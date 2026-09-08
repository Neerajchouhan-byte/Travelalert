"use client";

import { useRouter } from "next/navigation";
import { cities } from "@/lib/dashboard-data";

/**
 * Horizontal city quick-switcher pills.
 * The active destination gets an amber outline + LIVE dot; inactive pills are
 * quiet dark chips with a safety score badge. The row scrolls horizontally on
 * small screens so it never wraps or breaks the layout.
 */

/** Map a regional-indicator flag emoji (🇹🇭) to its ISO 3166-1 alpha-2 code. */
function flagToCode(flag) {
  const pts = [...String(flag || "")].map((ch) => ch.codePointAt(0));
  if (
    pts.length === 2 &&
    pts[0] >= 0x1f1e6 &&
    pts[0] <= 0x1f1ff &&
    pts[1] >= 0x1f1e6 &&
    pts[1] <= 0x1f1ff
  ) {
    return String.fromCharCode(pts[0] - 0x1f1e6 + 65, pts[1] - 0x1f1e6 + 65);
  }
  return "";
}

export function DestinationChips({ active }) {
  const router = useRouter();

  return (
    <div
      role="tablist"
      aria-label="Switch destination"
      className="flex items-center gap-2 overflow-x-auto no-scrollbar"
    >
      {cities.map((city) => {
        const isActive =
          city.name.toLowerCase() === String(active || "").toLowerCase();
        const code = flagToCode(city.flag) || "—";
        const scoreTone =
          city.tone === "good"
            ? "bg-[rgba(62,207,142,0.16)] text-[#3ecf8e]"
            : "bg-[rgba(240,166,61,0.16)] text-[#f0a63d]";

        return (
          <button
            key={city.name}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() =>
              router.push(`/dashboard?city=${encodeURIComponent(city.name)}`)
            }
            className={`inline-flex h-9 min-h-9 shrink-0 select-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors duration-200 ${
              isActive
                ? "border border-[#f0a63d]/60 bg-[rgba(240,166,61,0.14)] text-[#f3f3f2]"
                : "border border-white/10 bg-[#141418] text-[#a6a6ad] hover:border-white/20 hover:text-[#f3f3f2]"
            }`}
          >
            <span aria-hidden="true" className="text-sm leading-none">
              {city.flag}
            </span>
            <span className="font-mono text-[10px] text-[#68686f]">{code}</span>
            <span>{city.name}</span>
            {isActive ? (
              <span className="flex items-center gap-1 text-[#f0a63d]">
                <span className="size-1.5 rounded-full bg-[#f0a63d]" />
                LIVE
              </span>
            ) : (
              <span
                className={`rounded-full px-1.5 font-mono text-[10px] ${scoreTone}`}
              >
                {city.score}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}