"use client";

import { useMemo } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { cities } from "@/lib/dashboard-data";

/**
 * Live intel ticker — seamless CSS marquee of safety scores.
 * Pauses on hover (works because it's a real CSS animation),
 * duplicate track is hidden from assistive tech.
 */
export function LiveTicker({ city }) {
  const items = useMemo(() => {
    const sorted = [...cities].sort((a, b) => b.score - a.score);
    // Active city first for relevance
    return [
      ...sorted.filter((c) => c.name === city),
      ...sorted.filter((c) => c.name !== city),
    ];
  }, [city]);

  return (
    <div
      className="group/ticker relative overflow-hidden rounded-xl border border-white/10 bg-[#101013]"
      role="marquee"
      aria-label="Live destination safety scores"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-[#101013] to-transparent sm:w-16" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-[#101013] to-transparent sm:w-16" />

      <div className="flex items-center gap-3 py-2 pl-4">
        <span className="live-dot z-20 shrink-0" />
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="animate-ticker flex w-max cursor-default group-hover/ticker:[animation-play-state:paused]">
            {/* Track is rendered twice for the seamless -50% loop; the
                second copy is aria-hidden so screen readers hear it once. */}
            {[0, 1].map((copy) => (
              <div
                key={copy}
                aria-hidden={copy === 1}
                className="flex"
              >
                {items.map((c) => (
                  <span
                    key={`${copy}-${c.name}`}
                    className="flex items-center gap-2 whitespace-nowrap border-r border-white/10 px-4 font-mono text-[11px] text-[#a6a6ad]"
                  >
                    <span aria-hidden="true">{c.flag}</span>
                    <span className="text-[#f3f3f2]">{c.name}</span>
                    {c.name === city ? (
                      <span className="flex items-center gap-1 text-[#e5484a]">
                        <span className="size-1 rounded-full bg-[#e5484a]" />
                        VIEWING
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        {c.tone === "good" ? (
                          <TrendingUp
                            aria-label="safe"
                            className="size-3 text-[#3ecf8e]"
                          />
                        ) : (
                          <TrendingDown
                            aria-label="elevated risk"
                            className="size-3 rotate-180 text-[#f0a63d]"
                          />
                        )}
                        <span
                          className={
                            c.tone === "good"
                              ? "text-[#3ecf8e]"
                              : "text-[#f0a63d]"
                          }
                        >
                          {c.score}
                        </span>
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}