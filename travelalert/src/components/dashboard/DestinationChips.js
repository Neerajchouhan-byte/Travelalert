"use client";

import { useRouter } from "next/navigation";
import { Panel } from "./Panel";
import { cities } from "@/lib/dashboard-data";

export function DestinationChips({ active }) {
  const router = useRouter();

  return (
    <Panel>
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="size-1.5 rounded-full bg-[#5b9dee]" />
          Popular destinations
        </div>
        <span className="font-mono text-[11px] text-[#68686f]">SORTED BY TRAVELER SEARCHES</span>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {cities.map((c) => {
          const isActive = c.name === active;
          return (
            <button
              key={c.name}
              onClick={() => router.push(`/dashboard?city=${encodeURIComponent(c.name)}`)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                isActive
                  ? "border-[rgba(229,72,74,0.4)] bg-[rgba(229,72,74,0.14)] text-[#e5484a]"
                  : "border-white/10 bg-[#141418] text-[#a6a6ad] hover:text-[#f3f3f2]"
              }`}
            >
              <span>{c.flag}</span>
              {c.name}
              <span className={`font-mono text-[11px] ${c.tone === "good" ? "text-[#3ecf8e]" : "text-[#f0a63d]"}`}>
                {c.score}
              </span>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}