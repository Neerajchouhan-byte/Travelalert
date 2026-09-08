"use client";

import { useRouter } from "next/navigation";
import { cities } from "@/lib/dashboard-data";

const CITY_CODE_MAP = {
  Bangkok: "th",
  Bali: "id",
  Hanoi: "vn",
  Tokyo: "jp",
  "Siem Reap": "kh",
  Rome: "it",
  Barcelona: "es",
  "Kuala Lumpur": "my",
  Singapore: "sg",
  Prague: "cz",
  Kathmandu: "np",
  Colombo: "lk",
};

export function DestinationChips({ active }) {
  const router = useRouter();

  return (
    <div
      role="tablist"
      aria-label="Switch destination"
      className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
    >
      {cities.map((city) => {
        const isActive =
          city.name.toLowerCase() === String(active || "").toLowerCase();
        const code = CITY_CODE_MAP[city.name] || "un";
        const circleFlagUrl = `https://hatscripts.github.io/circle-flags/flags/${code}.svg`;

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
            className={`inline-flex h-9 min-h-9 shrink-0 select-none items-center gap-2 whitespace-nowrap rounded-full px-3 text-xs font-semibold transition-colors duration-200 ${
              isActive
                ? "border border-[#f0a63d]/60 bg-[rgba(240,166,61,0.14)] text-[#f3f3f2]"
                : "border border-white/10 bg-[#141418] text-[#a6a6ad] hover:border-white/20 hover:text-[#f3f3f2]"
            }`}
          >
            {/* Real Circular Flag Icon */}
            <img
              src={circleFlagUrl}
              alt=""
              className="size-4 shrink-0 rounded-full object-cover"
              loading="lazy"
            />
            <span>{city.name}</span>
            {isActive ? (
              <span className="flex items-center gap-1 text-[#f0a63d] font-mono text-[10px]">
                <span className="size-1.5 rounded-full bg-[#f0a63d] animate-pulse" />
                LIVE
              </span>
            ) : (
              <span className={`rounded-full px-1.5 font-mono text-[10px] ${scoreTone}`}>
                {city.score}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}