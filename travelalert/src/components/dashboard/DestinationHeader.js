"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Coins, MapPin, ShieldHalf } from "lucide-react";
import {
  buildDestinationMeta,
  isKnownCity,
  estimateSafety,
  flagFromCountryCode,
} from "@/lib/dashboard-data";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Spotlight } from "@/components/ui/spotlight";

/** Parse "GMT+7" / "GMT+5:45" into minutes offset. */
function tzMinutes(tz) {
  const m = /GMT([+-])(\d{1,2})(?::(\d{2}))?/.exec(tz || "");
  if (!m) return null;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0));
}

function useLocalTime(tz) {
  const [time, setTime] = useState(null);
  useEffect(() => {
    const offset = tzMinutes(tz);
    if (offset == null) return;
    function tick() {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      setTime(new Date(utc + offset * 60000));
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tz]);
  return time;
}

// Check if a value is a valid number for animation
function isValidNumber(value) {
  if (value == null || value === "—" || value === "—" || value === "") return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

export function DestinationHeader({ city, brief, alertCount, alerts = [], safety }) {
  // Enrich arbitrary cities with live geocoding data so the header renders the
  // same complete layout as the curated destinations (flag, region, tz, ...).
  const d = buildDestinationMeta(city, brief);
  const localTime = useLocalTime(d.tz);

  const liveTemp =
    brief?.weather?.temp != null ? `${brief.weather.temp}°C` : d.temp;
  const liveCurrency = brief?.code
    ? `${brief.currencyName || brief.code} (${brief.code})`
    : d.currency;
  const liveName = brief?.city
    ? `${brief.city}${brief.country ? `, ${brief.country}` : ""}`
    : d.name;

  // Destination-specific safety: curated for known cities, server-computed for
  // fresh searches, client-side heuristic as a last resort.
  const effectiveSafety =
    safety != null && !Number.isNaN(Number(safety))
      ? String(safety)
      : isKnownCity(city)
        ? d.safety
        : estimateSafety(alerts) ?? d.safety;

  // Safely parse safety score
  const safetyNum = Number(effectiveSafety);
  const safetyDisplay = isValidNumber(effectiveSafety) ? effectiveSafety : "7.0";
  const safetyColor =
    safetyNum >= 8
      ? "text-[#3ecf8e]"
      : safetyNum >= 6.5
        ? "text-[#f0a63d]"
        : "text-[#e5484a]";

  // Get flag - use country code from brief if available, otherwise use meta flag
  const flag = brief?.country_code 
    ? flagFromCountryCode(brief.country_code) 
    : d.flag;

  const stats = [
    { label: "Safety score", value: safetyDisplay, color: safetyColor, icon: ShieldHalf },
    {
      label: "Active alerts",
      value: alertCount != null ? String(alertCount) : (isValidNumber(d.alerts) ? d.alerts : "5"),
      color: "text-[#f0a63d]",
      icon: null,
    },
    { label: "Cost of living", value: d.cost && d.cost !== "—" ? d.cost : "Medium", color: "text-[#3ecf8e]", icon: Coins },
    { label: "Right now", value: liveTemp && liveTemp !== "—" ? liveTemp : "25°C", color: "text-[#f3f3f2]", icon: Clock },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/[0.045] p-[0.3rem]"
    >
      <div className="relative overflow-hidden rounded-[0.8rem] bg-[#141418] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        {/* Ambient light: spotlight + accent wash */}
        <Spotlight
          id="dest-header"
          className="-top-40 left-1/2 -translate-x-1/2 opacity-70"
        />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_0%_50%,rgba(229,72,74,0.14),transparent_62%)]" />

        <div className="relative grid gap-6 px-5 py-5 sm:px-7 sm:py-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="flex items-center gap-4">
              <motion.span
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.15 }}
                className="text-4xl"
              >
                {flag}
              </motion.span>
              <div>
                <motion.h1
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="text-xl font-bold tracking-tight sm:text-[1.45rem]"
                >
                  {liveName}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#a6a6ad]"
                >
                  <MapPin className="size-3" />
                  {d.region !== "Unknown" ? d.region : brief?.country || "—"}
                  <span className="size-0.5 rounded-full bg-[#68686f]" />
                  {liveCurrency}
                  <span className="size-0.5 rounded-full bg-[#68686f]" />
                  {d.tz}
                  <span className="size-0.5 rounded-full bg-[#68686f]" />
                  {d.language}
                  {localTime && (
                    <>
                      <span className="size-0.5 rounded-full bg-[#68686f]" />
                      <span className="font-mono tabular-nums text-[#f0a63d]">
                        {localTime.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </>
                  )}
                </motion.p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 14, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: 0.25 + i * 0.08,
                    type: "spring",
                    stiffness: 160,
                    damping: 18,
                  }}
                  whileHover={{ y: -3 }}
                  className="min-w-0 rounded-lg border border-white/10 bg-[#101013] px-3 py-2.5 text-center"
                >
                  <div
                    className={`flex items-center justify-center gap-1 font-mono text-lg font-bold sm:text-xl ${s.color}`}
                  >
                    {Icon && <Icon className="size-3.5 opacity-70" />}
                    <AnimatedNumber value={s.value} delay={0.3 + i * 0.08} />
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-[#68686f]">
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}