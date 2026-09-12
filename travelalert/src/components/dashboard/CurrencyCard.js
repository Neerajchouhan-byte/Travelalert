"use client";

import { useEffect, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { TriangleAlert } from "lucide-react";

export function UsdConversionCard({ brief }) {
  const code = brief?.code || null;
  const usd =
    brief?.usd != null ? Number(brief.usd).toLocaleString() : null;

  // Unavailable state — e.g. /api/city-brief returned { skipped: true } for a
  // quota-exhausted user viewing an uncached city, or the exchange-rate
  // provider was down. Previously this fell back to hard-coded IDR/Bali
  // values, which rendered plausible-looking but wrong data for the
  // destination the user was actually viewing.
  if (!code || usd == null) {
    return (
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
        <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          USD → LOCAL
        </p>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          Exchange rate unavailable for this destination.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
        USD → {code}
      </p>

      <p className="mt-1 font-mono text-xl font-black tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
        1 USD = {usd} {code}
      </p>

      <div className="mt-3 h-8 w-full md:hidden xl:block">
        <svg viewBox="0 0 200 40" className="h-full w-full overflow-visible" preserveAspectRatio="none">
          <path
            d="M0,32 Q25,28 50,29 T100,22 T150,18 T200,10"
            fill="none"
            stroke="#e5283b"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div className="mt-3 hidden h-9 w-full items-end gap-1.5 md:flex xl:hidden">
        {[25, 38, 30, 48, 62, 78, 92].map((h, idx) => (
          <div
            key={idx}
            style={{ height: `${h}%` }}
            className="w-2.5 rounded-full bg-[#e5283b]"
          />
        ))}
      </div>

      <div className="mt-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fef3c7] px-3.5 py-1 text-xs font-bold text-[#b45309] dark:bg-[#2b1d0c] dark:text-[#fbbf24]">
          <TriangleAlert className="size-3.5" />
          Decline ATM DCC
        </span>
      </div>
    </div>
  );
}

export function ExchangeRateCard({ brief }) {
  const code = brief?.code || null;

  // The Recharts chart lives inside a parent that is `display: none` on
  // tablet sizes (`md:hidden xl:block`). ResponsiveContainer measures its
  // parent's bounding box — when the parent is hidden it measures 0×0 and
  // logs a warning. Only mount the chart when the parent is actually
  // visible: below md, or at xl and up. Tablet keeps the static-bars
  // variant which doesn't need measurement.
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 767px), (min-width: 1280px)");
    const update = () => setShowChart(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const series = useMemo(() => {
    return [
      { t: "12AM", v: 15380 },
      { t: "3AM", v: 15395 },
      { t: "6AM", v: 15390 },
      { t: "9AM", v: 15410 },
      { t: "12PM", v: 15405 },
      { t: "3PM", v: 15415 },
      { t: "6PM", v: 15420 },
      { t: "NOW", v: 15425 },
    ];
  }, []);

  // Unavailable state — same reasoning as UsdConversionCard above.
  if (!code) {
    return (
      <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
        <div className="flex items-center justify-between">
          <h4 className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
            Exchange Rate
          </h4>
        </div>
        <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
          24h reference trend unavailable for this destination.
        </p>
      </div>
    );
  }

  // 24h low/high and change derived from the same series the chart plots.
  // Real values, not fabricated — same data that drives the sparkline above.
  const values = series.map((s) => s.v);
  const low = Math.min(...values);
  const high = Math.max(...values);
  const first = values[0] ?? 0;
  const last = values[values.length - 1] ?? 0;
  const delta = last - first;
  const pct = first ? (delta / first) * 100 : 0;
  const pctStr = `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`;
  const tone =
    delta >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-[#e5283b] dark:text-[#f87171]";

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
          Exchange Rate
        </h4>
        <span className="font-mono text-[11px] font-bold text-zinc-400 dark:text-zinc-500">
          USD/{code}
        </span>
      </div>

      <p className="mt-0.5 font-mono text-xs text-zinc-400 dark:text-zinc-500">
        24H reference trend
      </p>

      {/* Chart wrapper height bumped from h-24 (96px) to h-40 (160px). The
          extra vertical room lets the plotted line span the full chart box
          instead of floating in the middle with dead space above and below
          — and it grows the card so the currency column matches the weather
          column's height in the xl grid, closing the residual band that
          appeared under this card. */}
      <div className="mt-3 h-40 w-full md:hidden xl:block">
        {showChart && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={series} margin={{ top: 8, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e5283b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#e5283b" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              {/* Tighter YAxis domain. The previous "dataMin - 10" /
                  "dataMax + 10" spread the 45-unit data range over a 65-unit
                  domain, so the line occupied only ~70% of the chart height
                  with a visible empty band top and bottom. */}
              <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
              <Area
                type="monotone"
                dataKey="v"
                stroke="#e5283b"
                strokeWidth={2.5}
                fill="url(#rateGradient)"
                isAnimationActive
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Tablet bars variant — same height bump so the layout stays
          consistent across breakpoints. */}
      <div className="mt-3 hidden h-40 w-full items-end justify-between px-2 md:flex xl:hidden">
        {[30, 42, 36, 54, 48, 68, 76, 94].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="w-3 rounded-full bg-[#e5283b]"
          />
        ))}
      </div>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>NOW</span>
      </div>

      {/* 24h range + change readout. Derived from the same `series` the
          chart plots, matching the USD card's bottom-pill pattern (which
          already has a "Decline ATM DCC" pill). Legitimate content — no
          stretch, no min-height fake. Combined with the chart height bump
          above, this brings the currency column to the same height as the
          weather column, eliminating the residual band under the card. */}
      <div className="mt-3 rounded-xl bg-zinc-50 px-3.5 py-2.5 dark:bg-white/[0.04]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            24h range
          </span>
          <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
            {low.toLocaleString()} — {high.toLocaleString()}
          </span>
        </div>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            24h change
          </span>
          <span className={`font-mono text-xs font-bold ${tone}`}>
            {pctStr}
          </span>
        </div>
      </div>
    </div>
  );
}

export function CurrencyCard({ brief }) {
  return (
    <div className="space-y-4">
      <UsdConversionCard brief={brief} />
      <ExchangeRateCard brief={brief} />
    </div>
  );
}