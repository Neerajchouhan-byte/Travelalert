"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { TriangleAlert } from "lucide-react";

export function UsdConversionCard({ brief }) {
  const code = brief?.code || "IDR";
  const usd = brief?.usd != null ? Number(brief.usd).toLocaleString() : "15,420";

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <p className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
        USD → {code}
      </p>

      <p className="mt-1 font-mono text-xl font-black tracking-tight text-zinc-900 sm:text-2xl dark:text-white">
        1 USD = {usd} {code}
      </p>

      {/* Mobile & Desktop: Wavy red line sparkline (Image 1 & Image 2) */}
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

      {/* Tablet: Vertical red bars sparkline (Image 3) */}
      <div className="mt-3 hidden h-9 w-full items-end gap-1.5 md:flex xl:hidden">
        {[25, 38, 30, 48, 62, 78, 92].map((h, idx) => (
          <div
            key={idx}
            style={{ height: `${h}%` }}
            className="w-2.5 rounded-full bg-[#e5283b]"
          />
        ))}
      </div>

      {/* DCC warning pill */}
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
  const code = brief?.code || "IDR";

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

  return (
    <div className="rounded-[28px] border border-zinc-200/90 bg-white p-5 shadow-sm sm:p-6 dark:border-white/10 dark:bg-[#16161b]">
      <div className="flex items-center justify-between">
        <h4 className="text-base font-black tracking-tight text-zinc-900 dark:text-white">
          Live Exchange Rate
        </h4>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/70 px-2.5 py-0.5 font-mono text-[11px] font-extrabold text-[#059669] dark:bg-emerald-950/60 dark:text-[#34d399]">
          <span className="size-1.5 rounded-full bg-[#10b981]" />
          LIVE
        </span>
      </div>

      <p className="mt-0.5 font-mono text-xs text-zinc-400 dark:text-zinc-500">
        24H · USD/{code}
      </p>

      {/* Mobile & Desktop: Area chart with gradient fill (Image 1 & Image 2) */}
      <div className="mt-3 h-24 w-full md:hidden xl:block">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e5283b" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#e5283b" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <YAxis domain={["dataMin - 10", "dataMax + 10"]} hide />
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
      </div>

      {/* Tablet: Vertical red bars matching Image 3 */}
      <div className="mt-3 hidden h-24 w-full items-end justify-between px-2 md:flex xl:hidden">
        {[30, 42, 36, 54, 48, 68, 76, 94].map((h, i) => (
          <div
            key={i}
            style={{ height: `${h}%` }}
            className="w-3 rounded-full bg-[#e5283b]"
          />
        ))}
      </div>

      {/* Time marks */}
      <div className="mt-2 flex justify-between font-mono text-[10px] text-zinc-400 dark:text-zinc-500">
        <span>12AM</span>
        <span>6AM</span>
        <span>12PM</span>
        <span>6PM</span>
        <span>NOW</span>
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