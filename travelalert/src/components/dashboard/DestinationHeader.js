"use client";

import { useEffect, useState } from "react";
import { Check, Clock, DollarSign, MapPin, Maximize2 } from "lucide-react";
import { buildDestinationMeta } from "@/lib/dashboard-data";

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

export function DestinationHeader({ city, brief, alerts = [], safety }) {
  const d = buildDestinationMeta(city, brief);
  const localTime = useLocalTime(d.tz);

  const effectiveSafety = safety ?? d.safety ?? "7.1";
  const safetyNum = parseFloat(String(effectiveSafety)) || 7.1;

  const safetyLevel =
    safetyNum >= 8.5 ? "HIGH" : safetyNum >= 6.5 ? "MODERATE" : "ELEVATED";

  const timeFormatted = localTime
    ? localTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : "06:37 PM";

  const urgentCount = alerts.filter(
    (a) => (a.severity || "").toLowerCase() === "high"
  ).length;

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#e5283b] via-[#dc2235] to-[#c7182a] p-5 text-white shadow-lg sm:p-6 lg:p-7 dark:border dark:border-red-900/40 dark:from-[#4a151b] dark:via-[#380f14] dark:to-[#240a0e]">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-white/80 dark:text-red-200/70">
          Safety Overview
        </span>
        <button
          type="button"
          aria-label="Expand overview"
          className="hidden text-white/70 transition-colors hover:text-white sm:block"
        >
          <Maximize2 className="size-4" />
        </button>
      </div>

      {/* Main content */}
      <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        {/* Destination & Solo safety */}
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="size-5 shrink-0 text-white" />
            <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
              {brief?.city
                ? `${brief.city}${brief.country ? `, ${brief.country}` : ""}`
                : d.name || `${city}, Indonesia`}
            </h2>
          </div>
          <p className="mt-1 text-xs font-medium text-white/90 sm:text-sm dark:text-white/80">
            Moderate Safety • Safe for solo travelers
          </p>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col items-center self-center sm:self-auto">
          <div className="relative flex size-24 items-center justify-center rounded-full border-4 border-white/30 dark:border-white/15">
            <span className="font-mono text-3xl font-black tracking-tight">
              {effectiveSafety}
            </span>
          </div>
          <span className="mt-1.5 rounded-full bg-white/20 px-3 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-white dark:bg-black/40 dark:text-red-200">
            {safetyLevel}
          </span>
        </div>
      </div>

      {/* Bottom info pills */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs dark:bg-black/30 dark:text-red-100">
          <Check className="size-3.5" />
          <span>Alerts: {urgentCount} Urgent</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs dark:bg-black/30 dark:text-red-100">
          <DollarSign className="size-3.5" />
          <span>Cost: Low ($)</span>
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-xs dark:bg-black/30 dark:text-red-100">
          <Clock className="size-3.5" />
          <span>Local Time: {timeFormatted}</span>
        </div>
      </div>
    </div>
  );
}