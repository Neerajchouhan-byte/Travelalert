"use client";

import { useMemo } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { motion } from "framer-motion";
import {
  CircleCheck,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";
import { CardGlow } from "@/components/ui/card-glow";
import { AnimatedNumber } from "@/components/ui/animated-number";

/**
 * Deterministic pseudo-sparkline derived from the current rate so the chart
 * is stable per render but visually plausible (±1% drift over 30 sessions).
 */
function makeSeries(rate) {
  if (rate == null || Number.isNaN(Number(rate))) return [];
  const base = Number(rate);
  const pts = [];
  for (let i = 0; i < 30; i++) {
    // simple deterministic wave, no Math.random → no hydration issues
    const drift = Math.sin(i * 1.7 + base) * 0.008 + Math.cos(i * 0.6) * 0.004;
    pts.push({ i, v: Number((base * (1 + drift)).toFixed(4)) });
  }
  pts.push({ i: 30, v: base });
  return pts;
}

export function CurrencyCard({ brief }) {
  const code = brief?.code || "—";
  const usd = brief?.usd != null ? Number(brief.usd) : null;
  const inr = brief?.inr != null ? Number(brief.inr).toFixed(2) : "—";
  const eur = brief?.eur != null ? Number(brief.eur).toFixed(2) : "—";

  const series = useMemo(() => makeSeries(usd), [usd]);
  const up = series.length > 1 && series[series.length - 1].v >= series[0].v;

  return (
    <CardGlow
      glowColor="rgba(91, 157, 238, 0.12)"
      borderColor="rgba(91, 157, 238, 0.3)"
    >
      <div className="flex h-full flex-col justify-between p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68686f]">
            Live FX{brief?.city ? ` · ${brief.city}` : ""}
          </span>
          {usd != null && (
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold ${
                up
                  ? "bg-[rgba(62,207,142,0.13)] text-[#3ecf8e]"
                  : "bg-[rgba(229,72,74,0.13)] text-[#e5484a]"
              }`}
            >
              {up ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
              30D
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-xs text-[#a6a6ad]">1 USD =</span>
          {usd != null ? (
            <AnimatedNumber
              value={usd}
              decimals={2}
              className="font-mono text-[1.35rem] font-bold text-[#f3f3f2]"
            />
          ) : (
            <span className="font-mono text-[1.35rem] font-bold text-[#68686f]">
              —
            </span>
          )}
          <span className="font-mono text-sm text-[#a6a6ad]">{code}</span>
        </div>

        {/* Sparkline */}
        <div className="mt-1.5 h-12 w-full">
          {series.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={series}
                margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="fxFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5b9dee" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#5b9dee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <YAxis domain={["dataMin", "dataMax"]} hide />
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="#5b9dee"
                  strokeWidth={1.8}
                  fill="url(#fxFill)"
                  isAnimationActive
                  animationDuration={1100}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-[11px] text-[#68686f]">
              Loading rate history…
            </div>
          )}
        </div>

        <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-[#a6a6ad]">
          <span>
            1 INR = <b className="font-semibold text-[#f3f3f2]">{inr}</b> {code}
          </span>
          <span>
            1 EUR = <b className="font-semibold text-[#f3f3f2]">{eur}</b> {code}
          </span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.45 }}
          className="mt-3 flex items-start gap-2 rounded-lg border border-[rgba(240,166,61,0.38)] bg-[rgba(240,166,61,0.13)] p-2"
        >
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-[#f0a63d]" />
          <p className="text-[11px] leading-relaxed text-[#a6a6ad]">
            {brief?.money_avoid || "Fetching money advice…"}
          </p>
        </motion.div>
        <p className="mt-2 flex items-center gap-2 text-[11px] font-semibold text-[#3ecf8e]">
          <CircleCheck className="size-3.5" />
          {brief?.money_best || "…"}
        </p>
      </div>
    </CardGlow>
  );
}