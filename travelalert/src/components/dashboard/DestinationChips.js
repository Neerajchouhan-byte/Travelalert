"use client";

import { useRouter } from "next/navigation";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { cities } from "@/lib/dashboard-data";

export function DestinationChips({ active }) {
  const router = useRouter();

  const defaultCities = [
    { flag: "🇮🇩", name: "Bali", score: "7.1", arrow: "up" },
    { flag: "🇸🇬", name: "Singapore", score: "9.4", arrow: "right" },
    { flag: "🇯🇵", name: "Tokyo", score: "9.1", arrow: "down" },
    { flag: "🇹🇭", name: "Bangkok", score: "6.8", arrow: "up" },
    { flag: "🇻🇳", name: "Hanoi", score: "6.2", arrow: "right" },
    { flag: "🇵🇭", name: "Manila", score: "5.9", arrow: "down" },
  ];

  const cityList = cities.length > 0 ? cities : defaultCities;

  const renderArrow = (direction) => {
    if (direction === "up") return <ArrowUpRight className="size-3.5" />;
    if (direction === "down") return <ArrowDownRight className="size-3.5" />;
    return <ArrowRight className="size-3.5" />;
  };

  return (
    <div className="w-full">
      <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        Destinations
      </p>

      <div
        role="tablist"
        aria-label="Switch destination"
        className="no-scrollbar flex items-center gap-2.5 overflow-x-auto pb-1"
      >
        {cityList.map((c) => {
          const isActive =
            c.name.toLowerCase() === String(active || "").toLowerCase();
          const arrowDir =
            c.arrow ||
            (parseFloat(c.score) >= 7.5
              ? "up"
              : parseFloat(c.score) >= 6.5
                ? "right"
                : "down");

          return (
            <button
              key={c.name}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() =>
                router.push(`/dashboard?city=${encodeURIComponent(c.name)}`)
              }
              className={`inline-flex h-9 shrink-0 select-none items-center gap-2 whitespace-nowrap rounded-full px-4 text-xs font-bold transition-all duration-150 ${
                isActive
                  ? "bg-[#e5283b] text-white shadow-sm dark:bg-[#c0262d]"
                  : "border border-zinc-200/90 bg-white text-zinc-800 shadow-2xs hover:bg-zinc-50 dark:border-white/10 dark:bg-[#16161b] dark:text-zinc-300 dark:hover:bg-white/5"
              }`}
            >
              <span aria-hidden="true" className="text-sm leading-none">
                {c.flag}
              </span>
              <span>{c.name}</span>
              <span className="font-mono text-xs font-semibold">{c.score}</span>
              <span className="opacity-80">{renderArrow(arrowDir)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}