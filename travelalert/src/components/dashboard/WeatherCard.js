"use client";

import { motion } from "framer-motion";
import { CloudRain, CloudSun, Sun } from "lucide-react";
import { CardGlow } from "@/components/ui/card-glow";
import { AnimatedNumber } from "@/components/ui/animated-number";

const RAINY = [
  51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99,
];

function Metric({ label, value, max = 100, suffix = "", color = "#f0a63d", delay = 0 }) {
  const pct = Math.min(100, (Number(value || 0) / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-[#a6a6ad]">
        <span>{label}</span>
        <span className="font-mono">
          {value ?? "—"}
          {suffix}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 55, damping: 16, delay }}
        />
      </div>
    </div>
  );
}

export function WeatherCard({ brief }) {
  const w = brief?.weather;
  const rainy = w && RAINY.includes(w.code);
  const Icon = rainy ? CloudRain : w ? CloudSun : Sun;

  return (
    <CardGlow
      glowColor="rgba(240, 166, 61, 0.12)"
      borderColor="rgba(240, 166, 61, 0.3)"
    >
      <div className="flex h-full flex-col p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-[#68686f]">
            Conditions{brief?.city ? ` · ${brief.city}` : ""}
          </span>
          <motion.span
            animate={
              rainy
                ? { y: [0, 2, 0] }
                : { rotate: [0, 8, -8, 0], scale: [1, 1.06, 1] }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {rainy ? (
              <CloudRain className="size-5 text-[#5b9dee]" />
            ) : (
              <Icon className="size-5 text-[#f0a63d]" />
            )}
          </motion.span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[2rem] font-bold leading-none text-[#f3f3f2]">
            {w?.temp != null ? (
              <AnimatedNumber value={w.temp} suffix="°C" />
            ) : (
              "—"
            )}
          </span>
          <span className="text-[11px] text-[#a6a6ad]">
            feels {w?.feels ?? "—"}°C
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
          <Metric
            label="Humidity"
            value={w?.humidity ?? null}
            suffix="%"
            color="#5b9dee"
            delay={0.15}
          />
          <Metric
            label="UV index"
            value={w?.uv ?? null}
            max={11}
            color="#e5484a"
            delay={0.25}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.45 }}
          className="mt-4 flex-1 rounded-lg border border-[rgba(240,166,61,0.38)] bg-[rgba(240,166,61,0.13)] p-2.5"
        >
          <div className="mb-1 flex items-center gap-2 text-[11px] font-bold text-[#f0a63d]">
            {rainy ? <CloudRain className="size-3.5" /> : <Sun className="size-3.5" />}
            {brief?.weather_headline || "…"}
          </div>
          <p className="text-[11px] leading-relaxed text-[#a6a6ad]">
            {brief?.weather_note || "AI will describe what to wear and watch for."}
          </p>
        </motion.div>
      </div>
    </CardGlow>
  );
}