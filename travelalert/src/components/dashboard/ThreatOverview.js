"use client";

import { useMemo } from "react";
import {
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { CardGlow } from "@/components/ui/card-glow";
import {
  getDestination,
  isKnownCity,
  estimateSafety,
} from "@/lib/dashboard-data";

function severityTone(sev) {
  const s = (sev || "").toLowerCase();
  if (s === "high") return "high";
  if (s === "low" || s === "tip") return "safe";
  return "med";
}

const TONE = {
  high: { color: "#e5484a", label: "High risk" },
  med: { color: "#f0a63d", label: "Medium" },
  safe: { color: "#3ecf8e", label: "Low / tip" },
};

/**
 * Threat overview — Recharts radial gauge (safety score) plus a
 * severity distribution bar rendered with Framer Motion physics.
 */
export function ThreatOverview({ city, brief, alertCount, alerts = [], safety }) {
  const score = useMemo(() => {
    // Server-computed safety (briefing response) wins when present.
    const fromSafety = parseFloat(String(safety ?? ""));
    if (!Number.isNaN(fromSafety) && fromSafety > 0) return fromSafety;
    // Curated rating for the pre-loaded destinations.
    const fromBrief = parseFloat(brief?.safety || "");
    if (!Number.isNaN(fromBrief) && fromBrief > 0) return fromBrief;
    const meta = getDestination(city);
    const fromMeta = parseFloat(meta?.safety || "");
    if (!Number.isNaN(fromMeta) && isKnownCity(city)) return fromMeta;
    // Heuristic derived from the visible alert mix for fresh searches.
    const fromAlerts = estimateSafety(alerts);
    if (fromAlerts != null) return fromAlerts;
    return Number.isNaN(fromMeta) ? null : fromMeta;
  }, [brief, city, alerts, safety]);

  const dist = useMemo(() => {
    const d = { high: 0, med: 0, safe: 0 };
    for (const a of alerts) d[severityTone(a.severity || a.level)]++;
    return d;
  }, [alerts]);

  const total = dist.high + dist.med + dist.safe || 1;
  const gaugeData = [{ value: score ?? 0, fill: scoreColor(score) }];

  return (
    <CardGlow>
      <div className="flex h-full flex-col p-5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68686f]">
            Threat overview
          </span>
          <span className="live-dot" />
        </div>

        <div className="mt-2 flex flex-col items-center gap-4 min-[400px]:flex-row min-[400px]:items-center min-[400px]:gap-5">
          {/* Radial gauge */}
          <div className="relative size-28 shrink-0 min-[400px]:size-[124px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                data={gaugeData}
                innerRadius="74%"
                outerRadius="100%"
                startAngle={220}
                endAngle={-40}
                barSize={10}
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 10]}
                  tick={false}
                  axisLine={false}
                />
                <RadialBar
                  dataKey="value"
                  background={{ fill: "rgba(255,255,255,0.07)" }}
                  cornerRadius={8}
                  isAnimationActive
                  animationDuration={1200}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              {score != null ? (
                <AnimatedNumber
                  value={score}
                  decimals={1}
                  className="font-mono text-2xl font-bold"
                />
              ) : (
                <span className="font-mono text-2xl font-bold text-[#68686f]">
                  —
                </span>
              )}
              <span className="text-[9px] font-semibold uppercase tracking-widest text-[#68686f]">
                Safety
              </span>
            </div>
          </div>

          {/* Severity distribution */}
          <div className="min-w-0 flex-1 space-y-2.5">
            {(["high", "med", "safe"]).map((tone, idx) => (
              <div key={tone}>
                <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[#a6a6ad]">
                  <span className="flex items-center gap-1.5">
                    <span
                      className="size-1.5 rounded-full"
                      style={{ background: TONE[tone].color }}
                    />
                    {TONE[tone].label}
                  </span>
                  <span className="font-mono">{dist[tone]}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: TONE[tone].color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(dist[tone] / total) * 100}%` }}
                    transition={{
                      type: "spring",
                      stiffness: 60,
                      damping: 18,
                      delay: 0.15 + idx * 0.1,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-4 border-t border-white/10 pt-3 text-[11px] text-[#a6a6ad]">
          {alertCount > 0 ? (
            <>
              <span className="font-semibold text-[#f0a63d]">
                {alertCount} active signals
              </span>{" "}
              tracked for {city}. Tap any alert card for the full pattern.
            </>
          ) : (
            <>No active signals for {city} — check back soon.</>
          )}
        </p>
      </div>
    </CardGlow>
  );
}

function scoreColor(score) {
  if (score == null || Number.isNaN(score)) return "#68686f";
  if (score >= 8) return "#3ecf8e";
  if (score >= 6.5) return "#f0a63d";
  return "#e5484a";
}