"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Coins, MapPin, Radar, ShieldHalf } from "lucide-react";
import {
  buildDestinationMeta,
  isKnownCity,
  estimateSafety,
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

function isValidNumber(value) {
  if (value == null || value === "—" || value === "") return false;
  const num = Number(value);
  return !isNaN(num) && isFinite(num);
}

// Fallback lookup map if the brief hasn't loaded yet
const COUNTRY_CODE_MAP = {
  thailand: "th", bangkok: "th", phuket: "th",
  japan: "jp", tokyo: "jp", kyoto: "jp", osaka: "jp",
  france: "fr", paris: "fr", marseille: "fr",
  italy: "it", rome: "it", milan: "it",
  spain: "es", barcelona: "es", madrid: "es",
  indonesia: "id", bali: "id", jakarta: "id",
  vietnam: "vn", hanoi: "vn", "ho chi minh": "vn",
  germany: "de", berlin: "de", munich: "de",
  india: "in", delhi: "in", mumbai: "in", jaipur: "in",
  singapore: "sg",
  "united states": "us", usa: "us", "new york": "us",
  "united kingdom": "gb", uk: "gb", london: "gb",
  cambodia: "kh", "siem reap": "kh",
  "czech republic": "cz", czechia: "cz", prague: "cz",
  nepal: "np", kathmandu: "np",
  "sri lanka": "lk", colombo: "lk",
  malaysia: "my", "kuala lumpur": "my",
};

export function DestinationHeader({ city, brief, alertCount, alerts = [], safety }) {
  const d = buildDestinationMeta(city, brief);
  const localTime = useLocalTime(d.tz);

  const liveTemp =
    brief?.weather?.temp != null ? `${brief.weather.temp}°C` : d.temp;
  const liveCurrency = brief?.code
    ? `${brief.currencyName || brief.code} (${brief.code})`
    : d.currency;

  // 1. Prevent duplicate names (e.g. "Japan, Japan" -> "Japan")
  const rawCity = brief?.city || city;
  const rawCountry = brief?.country || "";
  const isDuplicate =
    rawCountry &&
    (rawCity.toLowerCase().trim() === rawCountry.toLowerCase().trim() ||
      rawCity.toLowerCase().includes(rawCountry.toLowerCase()) ||
      rawCountry.toLowerCase().includes(rawCity.toLowerCase()));

  const liveName = isDuplicate
    ? rawCity
    : rawCountry
    ? `${rawCity}, ${rawCountry}`
    : d.name || city;

  const effectiveSafety =
    safety != null && !Number.isNaN(Number(safety))
      ? String(safety)
      : isKnownCity(city)
        ? d.safety
        : estimateSafety(alerts) ?? d.safety;

  const safetyNum = Number(effectiveSafety);
  const safetyDisplay = isValidNumber(effectiveSafety) ? effectiveSafety : "7.0";
  const safetyColor =
    safetyNum >= 8
      ? "text-[#3ecf8e]"
      : safetyNum >= 6.5
        ? "text-[#f0a63d]"
        : "text-[#e5484a]";

  // 2. Exact Circle Flag SVG URL from the circle-flags CDN
  const countryCode = (
    brief?.country_code || 
    COUNTRY_CODE_MAP[city.toLowerCase().trim()] || 
    COUNTRY_CODE_MAP[rawCountry.toLowerCase().trim()] || 
    ""
  ).toLowerCase();

  const circleFlagUrl = countryCode && /^[a-z]{2}$/.test(countryCode)
    ? `https://hatscripts.github.io/circle-flags/flags/${countryCode}.svg`
    : null;

  const stats = [
    { label: "Safety score", value: safetyDisplay, color: safetyColor, icon: ShieldHalf },
    {
      label: "Active alerts",
      value: alertCount != null ? String(alertCount) : (isValidNumber(d.alerts) ? d.alerts : "0"),
      color: "text-[#f0a63d]",
      icon: Radar,
    },
    {
      label: "Cost of living",
      value: d.cost && d.cost !== "—" ? d.cost : "Medium",
      color: "text-[#3ecf8e]",
      icon: Coins,
    },
    {
      label: "Current temp",
      value: liveTemp && liveTemp !== "—" ? liveTemp : "—",
      color: "text-[#f3f3f2]",
      icon: Clock,
    },
  ];

  const timeTag =
    localTime
      ? localTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="dashboard-hero relative overflow-hidden rounded-[1.1rem] border border-white/10 bg-white/[0.045] p-[0.3rem]"
    >
      <div className="dashboard-hero-inner relative overflow-hidden rounded-[0.8rem] bg-[#141418] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <Spotlight id="dest-header" className="-top-40 left-1/2 -translate-x-1/2 opacity-70" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_90%_at_0%_50%,rgba(229,72,74,0.14),transparent_62%)]" />

        <div className="relative flex flex-col gap-4 px-5 py-5 sm:px-7 sm:py-6 md:flex-row md:items-start">
          
          {/* CIRCULAR FLAG BADGE (Matching your image) */}
          <div className="flex min-w-0 items-center gap-3.5 sm:gap-4 md:flex-1">
            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#1c1c21] shadow-md">
              {circleFlagUrl ? (
                <img
                  src={circleFlagUrl}
                  alt={brief?.country || city}
                  className="size-full object-cover"
                  loading="eager"
                />
              ) : (
                <span className="text-xl">🌍</span>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <motion.h1
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="truncate text-xl font-bold tracking-tight text-white sm:text-[1.45rem]"
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
              </motion.p>
            </div>
          </div>

          {/* Metric cards */}
          <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-4 md:w-auto md:shrink-0">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.25 + i * 0.07, duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
                  className="min-w-0 rounded-lg border border-white/10 bg-[#101013] px-2.5 py-2 text-center sm:px-3 sm:py-2.5"
                >
                  <div className={`flex items-center justify-center gap-1 font-mono text-lg font-bold sm:text-xl ${s.color}`}>
                    {Icon && <Icon className="size-3.5 opacity-70" />}
                    <AnimatedNumber value={s.value} delay={0.25 + i * 0.07} />
                  </div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#68686f]">
                    {s.label}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Timestamp line */}
        <div className="relative flex items-center gap-1.5 px-5 pb-3 pt-2 text-[11px] text-[#68686f] sm:px-7">
          <Clock className="size-3" />
          {timeTag ? `Local time ${timeTag}` : "Local time unavailable"}
          <span className="mx-1 size-0.5 rounded-full bg-[#68686f]" />
          updated within 24 hours
        </div>
      </div>
    </motion.div>
  );
}